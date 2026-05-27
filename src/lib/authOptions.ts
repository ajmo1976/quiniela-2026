import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Emergency Superadmin",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Emergency admin credentials must be provided via environment variables.
        if (!process.env.EMERGENCY_ADMIN_EMAIL) {
          throw new Error("EMERGENCY_ADMIN_EMAIL environment variable is required for emergency admin access.");
        }
        if (!process.env.EMERGENCY_ADMIN_PASSWORD) {
          throw new Error("EMERGENCY_ADMIN_PASSWORD environment variable is required for emergency admin access.");
        }
        const emergencyEmail = process.env.EMERGENCY_ADMIN_EMAIL;
        const emergencyPassword = process.env.EMERGENCY_ADMIN_PASSWORD;

        if (credentials?.email === emergencyEmail && credentials?.password === emergencyPassword) {
          // Ensure this user exists in the DB with ADMIN role and ACTIVO status
          let dbUser = await prisma.user.findUnique({
            where: { email: emergencyEmail },
          });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: emergencyEmail,
                name: "Super Admin (Soporte)",
                role: "ADMIN",
                status: "ACTIVO"
              }
            });
          } else if (dbUser.role !== "ADMIN" || dbUser.status !== "ACTIVO") {
            dbUser = await prisma.user.update({
              where: { email: emergencyEmail },
              data: { role: "ADMIN", status: "ACTIVO" }
            });
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: null
          };
        }
        return null;
      }
    })
  ],

  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? `__Secure-next-auth.session-token` : `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "strict",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;
      try {
        // If login is with credentials, we already created/verified the user in authorize()
        if (account?.provider === "credentials") {
          return true;
        }

        const isDefaultAdmin = user.email === "arnaldo.martinez@gmail.com";
        const defaultRole = isDefaultAdmin ? "ADMIN" : "USER";

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { email: user.email },
            data: {
              name: user.name ?? undefined,
              // Only overwrite image if the database image is currently null or empty
              image: existingUser.image ? undefined : (user.image ?? undefined),
              role: isDefaultAdmin ? "ADMIN" : undefined,
            },
          });
        } else {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name ?? "Usuario",
              image: user.image ?? null,
              role: defaultRole,
            },
          });
        }
        return true;
      } catch (err) {
        console.error("Error upserting user on sign-in:", err);
        return false;
      }
    },

    async jwt({ token, user: googleUser }) {
      const email = googleUser?.email || token.email;
      if (email) {
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });
        if (dbUser) {
          token.userId = dbUser.id;
          token.dbName = dbUser.name;
          // Only put the image in the token if it's a short URL (not a base64 data URL)
          token.dbImage = dbUser.image && !dbUser.image.startsWith("data:") ? dbUser.image : null;
          token.role = dbUser.role;
          token.rulesAccepted = dbUser.rulesAccepted;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).role = (token.role as string) ?? "USER";
        (session.user as any).rulesAccepted = (token.rulesAccepted as boolean) ?? false;
        session.user.name = (token.dbName as string) ?? session.user.name;
        session.user.image = (token.dbImage as string) ?? session.user.image;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

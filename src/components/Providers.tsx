"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TournamentProvider } from "@/lib/TournamentContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TournamentProvider>{children}</TournamentProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

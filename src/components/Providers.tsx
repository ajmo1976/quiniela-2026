"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TournamentProvider } from "@/lib/TournamentContext";
import RulesAcceptanceOverlay from "@/components/RulesAcceptanceOverlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TournamentProvider>
          <RulesAcceptanceOverlay />
          {children}
        </TournamentProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}

"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * React 19 / Next 16: client-created <script> tags warn and never run.
 * Keep the server script executable; mark any client remount as a data block.
 */
const themeScriptProps =
  typeof window === "undefined" ? undefined : { type: "application/json" };

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      scriptProps={themeScriptProps}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster richColors position="top-center" closeButton />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

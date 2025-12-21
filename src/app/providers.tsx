"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/lib/query/provider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </SessionProvider>
  );
}

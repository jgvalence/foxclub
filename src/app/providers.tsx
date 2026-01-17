"use client";

import { SessionProvider } from "next-auth/react";
import { QueryProvider } from "@/lib/query/provider";
import { Toaster } from "sonner";
import { ConfigProvider, App } from "antd";
import frFR from "antd/locale/fr_FR";
import { AppLayout } from "@/components/layout";

// Thème Ant Design personnalisé avec les couleurs Fox Club
const antdTheme = {
  token: {
    colorPrimary: "#ff6b35",
    colorLink: "#ff6b35",
    colorLinkHover: "#e55a2b",
    borderRadius: 8,
    fontFamily: "inherit",
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <ConfigProvider theme={antdTheme} locale={frFR}>
          <App>
            <AppLayout>{children}</AppLayout>
          </App>
        </ConfigProvider>
        <Toaster position="top-right" richColors />
      </QueryProvider>
    </SessionProvider>
  );
}

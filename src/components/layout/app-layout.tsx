"use client";

import { Layout } from "antd";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { AppFooter } from "./app-footer";

const { Content } = Layout;

// Pages qui ne doivent pas afficher le layout (login, etc.)
const noLayoutPaths = ["/auth/signin", "/auth/signup", "/auth/error"];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { status } = useSession();
  const pathname = usePathname();

  // Ne pas afficher le layout sur les pages d'auth ou si pas connecté
  const shouldHideLayout =
    noLayoutPaths.some((path) => pathname.startsWith(path)) ||
    status === "unauthenticated" ||
    status === "loading";

  if (shouldHideLayout) {
    return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppSidebar />
      <Layout>
        <Content
          style={{
            background: "#f5f5f5",
            minHeight: "calc(100vh - 70px)",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
        </Content>
        <AppFooter />
      </Layout>
    </Layout>
  );
}

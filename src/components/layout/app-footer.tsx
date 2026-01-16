"use client";

import { Layout } from "antd";
import Link from "next/link";
import { useSession } from "next-auth/react";

const { Footer } = Layout;

export function AppFooter() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <Footer
      style={{
        textAlign: "center",
        background: "#fff",
        borderTop: "1px solid #f0f0f0",
        padding: "16px 24px",
      }}
    >
      <div className="flex flex-col items-center justify-between gap-2 text-sm text-gray-500 md:flex-row">
        <span>Fox Club · Gestion des contenus et utilisateurs</span>
        <div className="flex items-center gap-4">
          <Link href="/form" className="hover:text-gray-700">
            Mon formulaire
          </Link>
          {isAdmin && (
            <>
              <Link href="/admin/users" className="hover:text-gray-700">
                Utilisateurs
              </Link>
              <Link
                href="/admin/question-families"
                className="hover:text-gray-700"
              >
                Questions
              </Link>
            </>
          )}
          <Link href="/account/password" className="hover:text-gray-700">
            Mon compte
          </Link>
        </div>
      </div>
    </Footer>
  );
}

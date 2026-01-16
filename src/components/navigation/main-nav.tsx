"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "antd";
import {
  LogoutOutlined,
  HomeOutlined,
  FormOutlined,
  TeamOutlined,
  QuestionCircleOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import { fr } from "@/lib/i18n";

/**
 * Main Navigation Component
 * Displays navigation menu with role-based links and logout button
 */
export function MainNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return null;
  }

  if (!session) {
    return null;
  }

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MODERATOR";
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🦊</span>
              <span className="text-xl font-bold text-primary-600">
                Fox Club
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {/* Home */}
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <HomeOutlined />
              {fr.nav.home}
            </Link>

            {/* User Form (only for approved users) */}
            {session.user.approved && (
              <Link
                href="/form"
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive("/form")
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <FormOutlined />
                {fr.nav.myForm}
              </Link>
            )}

            {/* Admin Menu */}
            {isAdmin && (
              <>
                <Link
                  href="/admin/users"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/admin/users")
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <TeamOutlined />
                  Utilisateurs
                </Link>

                <Link
                  href="/admin/question-families"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/admin/question-families")
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <AppstoreOutlined />
                  Familles
                </Link>

                <Link
                  href="/admin/questions"
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive("/admin/questions")
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <QuestionCircleOutlined />
                  Questions
                </Link>
              </>
            )}

            {/* User Info & Logout */}
            <div className="ml-4 flex items-center gap-3 border-l border-gray-300 pl-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900">
                  {session.user.name || session.user.email}
                </div>
                <div className="text-xs text-gray-500">
                  {session.user.role}
                  {!session.user.approved && " (En attente)"}
                </div>
              </div>

              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                {fr.nav.logout}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

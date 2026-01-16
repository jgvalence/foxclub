"use client";

import { signOut } from "next-auth/react";
import { LogoutOutlined } from "@ant-design/icons";

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/auth/signin" })}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
    >
      <LogoutOutlined className="text-base" />
      <span>Déconnexion</span>
    </button>
  );
}

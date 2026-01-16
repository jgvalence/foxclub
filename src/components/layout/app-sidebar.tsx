"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  AppstoreOutlined,
  FormOutlined,
  UserOutlined,
  SettingOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import { LogoutButton } from "@/components/auth/logout-button";

const { Sider } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const adminMenuItems: MenuItem[] = [
  {
    key: "/admin/question-families",
    icon: <AppstoreOutlined />,
    label: <Link href="/admin/question-families">Familles de questions</Link>,
  },
  {
    key: "/admin/questions",
    icon: <FormOutlined />,
    label: <Link href="/admin/questions">Questions</Link>,
  },
  {
    key: "/admin/users",
    icon: <UserOutlined />,
    label: <Link href="/admin/users">Utilisateurs</Link>,
  },
];

const userMenuItems: MenuItem[] = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: <Link href="/">Accueil</Link>,
  },
  {
    key: "/form",
    icon: <FormOutlined />,
    label: <Link href="/form">Mon formulaire</Link>,
  },
  {
    key: "/account/password",
    icon: <SettingOutlined />,
    label: <Link href="/account/password">Mon compte</Link>,
  },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAdmin = session?.user?.role === "ADMIN";

  const menuItems: MenuItem[] = [
    ...(isAdmin
      ? [
          {
            key: "admin-group",
            label: "Administration",
            type: "group" as const,
            children: adminMenuItems,
          },
        ]
      : []),
    {
      key: "user-group",
      label: "Mon espace",
      type: "group" as const,
      children: userMenuItems,
    },
  ];

  // Determine selected key based on current path
  const selectedKey = pathname;

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      theme="light"
      style={{
        overflow: "auto",
        height: "100vh",
        position: "sticky",
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <Link
          href="/"
          style={{
            color: "#ff6b35",
            fontWeight: 700,
            fontSize: collapsed ? 16 : 20,
          }}
        >
          {collapsed ? "🦊" : "Fox Club"}
        </Link>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{ borderRight: 0, flex: 1 }}
      />

      <div
        style={{
          padding: collapsed ? "12px 8px" : "12px 16px",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <LogoutButton collapsed={collapsed} />
      </div>
    </Sider>
  );
}

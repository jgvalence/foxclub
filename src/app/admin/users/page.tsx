"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Tag,
  message,
  Space,
  Select,
  Popconfirm,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { fr } from "@/lib/i18n";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  approved: boolean;
  createdAt: string;
  _count: {
    adminNotes: number;
  };
  userForm: {
    id: string;
    submitted: boolean;
    updatedAt: string;
  } | null;
}

/**
 * User Management Page
 * Admin-only page for managing users, approvals, and roles
 */
export default function UsersPage() {
  const [filterApproved, setFilterApproved] = useState<string | undefined>();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", filterApproved],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterApproved !== undefined) params.append("approved", filterApproved);
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(fr.toast.updateSuccess);
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(fr.toast.deleteSuccess);
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  const handleApprove = (id: string) => {
    updateUserMutation.mutate({ id, data: { approved: true } });
  };

  const handleReject = (id: string) => {
    updateUserMutation.mutate({ id, data: { approved: false } });
  };

  const handleRoleChange = (id: string, role: string) => {
    updateUserMutation.mutate({ id, data: { role } });
  };

  const handleViewProfile = (id: string) => {
    router.push(`/admin/users/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteUserMutation.mutate(id);
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Nom",
      dataIndex: "name",
      key: "name",
      render: (name: string | null) => name || "-",
    },
    {
      title: fr.users.status,
      key: "approved",
      render: (record: User) =>
        record.approved ? (
          <Tag color="green">{fr.users.approved}</Tag>
        ) : (
          <Tag color="orange">{fr.users.pending}</Tag>
        ),
      filters: [
        { text: fr.users.approved, value: "true" },
        { text: fr.users.pending, value: "false" },
      ],
      onFilter: (value: any, record: User) =>
        String(record.approved) === value,
    },
    {
      title: fr.users.role,
      key: "role",
      render: (record: User) => (
        <Select
          value={record.role}
          style={{ width: 120 }}
          onChange={(value) => handleRoleChange(record.id, value)}
          options={[
            { label: "User", value: "USER" },
            { label: "Admin", value: "ADMIN" },
            { label: "Moderator", value: "MODERATOR" },
          ]}
        />
      ),
    },
    {
      title: "Formulaire",
      key: "form",
      render: (record: User) => {
        if (!record.userForm) return <Tag>Aucun</Tag>;
        return record.userForm.submitted ? (
          <Tag color="green">Soumis</Tag>
        ) : (
          <Tag color="blue">Brouillon</Tag>
        );
      },
    },
    {
      title: "Notes",
      key: "notes",
      render: (record: User) => record._count.adminNotes,
    },
    {
      title: fr.common.actions,
      key: "actions",
      render: (record: User) => (
        <Space>
          {!record.approved && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              {fr.users.approve}
            </Button>
          )}
          {record.approved && (
            <Button
              type="link"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleReject(record.id)}
            >
              {fr.users.reject}
            </Button>
          )}
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewProfile(record.id)}
          >
            {fr.users.viewProfile}
          </Button>
          <Popconfirm
            title="Supprimer l'utilisateur"
            description="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            onConfirm={() => handleDelete(record.id)}
            okText={fr.common.confirm}
            cancelText={fr.common.cancel}
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              {fr.common.delete}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = data?.data?.reduce(
    (acc: any, user: User) => {
      acc.total++;
      if (user.approved) acc.approved++;
      else acc.pending++;
      return acc;
    },
    { total: 0, approved: 0, pending: 0 }
  ) || { total: 0, approved: 0, pending: 0 };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {fr.users.title}
        </h1>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="text-sm text-gray-500">{fr.users.totalUsers}</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-lg bg-green-50 p-4 shadow">
          <div className="text-sm text-green-600">{fr.users.approvedUsers}</div>
          <div className="text-2xl font-bold text-green-700">
            {stats.approved}
          </div>
        </div>
        <div className="rounded-lg bg-orange-50 p-4 shadow">
          <div className="text-sm text-orange-600">{fr.users.pendingUsers}</div>
          <div className="text-2xl font-bold text-orange-700">
            {stats.pending}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <Select
          placeholder="Filtrer par statut"
          style={{ width: 200 }}
          allowClear
          onChange={(value) => setFilterApproved(value)}
          options={[
            { label: fr.users.approved, value: "true" },
            { label: fr.users.pending, value: "false" },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total}`,
        }}
      />
    </div>
  );
}

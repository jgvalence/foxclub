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
  Tooltip,
  Modal,
  Form,
  Input,
  Switch,
} from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { fr } from "@/lib/i18n";

interface User {
  id: string;
  pseudo: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  types: string[];
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch users
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", filterApproved],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterApproved !== undefined)
        params.append("approved", filterApproved);
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
      setIsEditModalOpen(false);
      setEditingUser(null);
      editForm.resetFields();
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      pseudo: user.pseudo,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      types: user.types || [],
      role: user.role,
      approved: user.approved,
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      if (editingUser) {
        updateUserMutation.mutate({ id: editingUser.id, data: values });
      }
    } catch {
      // validation handled by antd
    }
  };

  const createUserMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      message.success(fr.toast.createSuccess);
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      createUserMutation.mutate(values);
    } catch {
      // validation handled by antd
    }
  };

  const columns = [
    {
      title: "Pseudo",
      dataIndex: "pseudo",
      key: "pseudo",
    },
    {
      title: "Nom complet",
      key: "fullName",
      render: (record: User) => {
        const parts = [record.firstName, record.lastName].filter(Boolean);
        return parts.length > 0 ? parts.join(" ") : "-";
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string | null) => email || "-",
    },
    {
      title: "Types",
      key: "types",
      render: (record: User) =>
        record.types?.length > 0
          ? record.types.map((t) => (
              <Tag key={t} color={t === "ETUDIANT" ? "blue" : "purple"}>
                {t === "ETUDIANT" ? "Étudiant" : "Soumis"}
              </Tag>
            ))
          : "-",
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
      onFilter: (value: any, record: User) => String(record.approved) === value,
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
            <Tooltip title={fr.users.approve}>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              />
            </Tooltip>
          )}
          {record.approved && (
            <Tooltip title={fr.users.reject}>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              />
            </Tooltip>
          )}
          <Tooltip title={fr.users.viewProfile}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewProfile(record.id)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Supprimer l'utilisateur"
            description="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
            onConfirm={() => handleDelete(record.id)}
            okText={fr.common.confirm}
            cancelText={fr.common.cancel}
          >
            <Tooltip title={fr.common.delete}>
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{fr.users.title}</h1>
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Créer un utilisateur
        </Button>
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

      <Modal
        title="Créer un utilisateur"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="Créer"
        cancelText={fr.common.cancel}
        confirmLoading={createUserMutation.isPending}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="pseudo"
            label="Pseudo"
            rules={[
              { required: true, message: "Pseudo requis" },
              { min: 3, message: "3 caractères minimum" },
            ]}
          >
            <Input placeholder="pseudo_utilisateur" />
          </Form.Item>
          <Form.Item name="firstName" label="Prénom">
            <Input placeholder="Prénom (optionnel)" />
          </Form.Item>
          <Form.Item name="lastName" label="Nom">
            <Input placeholder="Nom (optionnel)" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="email@example.com (optionnel)" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: "Mot de passe requis" },
              { min: 8, message: "8 caractères minimum" },
            ]}
          >
            <Input.Password placeholder="********" />
          </Form.Item>
          <Form.Item name="types" label="Types" initialValue={[]}>
            <Select
              mode="multiple"
              placeholder="Sélectionner les types"
              options={[
                { label: "Étudiant", value: "ETUDIANT" },
                { label: "Soumis", value: "SOUMIS" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label={fr.users.role}
            initialValue="USER"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "User", value: "USER" },
                { label: "Admin", value: "ADMIN" },
                { label: "Moderator", value: "MODERATOR" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="approved"
            label="Approuvé"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Modifier l'utilisateur"
        open={isEditModalOpen}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        okText="Enregistrer"
        cancelText={fr.common.cancel}
        confirmLoading={updateUserMutation.isPending}
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item
            name="pseudo"
            label="Pseudo"
            rules={[
              { required: true, message: "Pseudo requis" },
              { min: 3, message: "3 caractères minimum" },
            ]}
          >
            <Input placeholder="pseudo_utilisateur" />
          </Form.Item>
          <Form.Item name="firstName" label="Prénom">
            <Input placeholder="Prénom (optionnel)" />
          </Form.Item>
          <Form.Item name="lastName" label="Nom">
            <Input placeholder="Nom (optionnel)" />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input placeholder="email@example.com (optionnel)" />
          </Form.Item>
          <Form.Item name="types" label="Types">
            <Select
              mode="multiple"
              placeholder="Sélectionner les types"
              options={[
                { label: "Étudiant", value: "ETUDIANT" },
                { label: "Soumis", value: "SOUMIS" },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="role"
            label={fr.users.role}
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { label: "User", value: "USER" },
                { label: "Admin", value: "ADMIN" },
                { label: "Moderator", value: "MODERATOR" },
              ]}
            />
          </Form.Item>
          <Form.Item name="approved" label="Approuvé" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

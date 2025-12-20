"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { fr } from "@/lib/i18n";
import type { QuestionType } from "@/lib/validations/fox-club";

interface QuestionFamily {
  id: string;
  label: string;
  type: QuestionType;
  order: number;
  _count: {
    questions: number;
  };
}

/**
 * Question Families Management Page
 * Admin-only page for managing question families
 */
export default function QuestionFamiliesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFamily, setEditingFamily] = useState<QuestionFamily | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch question families
  const { data, isLoading } = useQuery({
    queryKey: ["question-families"],
    queryFn: async () => {
      const res = await fetch("/api/admin/question-families");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch("/api/admin/question-families", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-families"] });
      message.success(fr.toast.createSuccess);
      handleCancel();
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const res = await fetch(`/api/admin/question-families/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-families"] });
      message.success(fr.toast.updateSuccess);
      handleCancel();
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/question-families/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-families"] });
      message.success(fr.toast.deleteSuccess);
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  const handleCreate = () => {
    setEditingFamily(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (family: QuestionFamily) => {
    setEditingFamily(family);
    form.setFieldsValue(family);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingFamily) {
        updateMutation.mutate({ id: editingFamily.id, values });
      } else {
        createMutation.mutate(values);
      }
    } catch (_error) {
      // Validation error
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingFamily(null);
    form.resetFields();
  };

  const columns = [
    {
      title: fr.questionFamilies.label,
      dataIndex: "label",
      key: "label",
      sorter: (a: QuestionFamily, b: QuestionFamily) => a.label.localeCompare(b.label),
    },
    {
      title: fr.questionFamilies.type,
      dataIndex: "type",
      key: "type",
      render: (type: QuestionType) =>
        type === "TYPE_1" ? fr.questionFamilies.type1 : fr.questionFamilies.type2,
      filters: [
        { text: fr.questionFamilies.type1, value: "TYPE_1" },
        { text: fr.questionFamilies.type2, value: "TYPE_2" },
      ],
      onFilter: (value: any, record: QuestionFamily) => record.type === value,
    },
    {
      title: fr.questions.title,
      key: "questionCount",
      render: (record: QuestionFamily) => record._count.questions,
      sorter: (a: QuestionFamily, b: QuestionFamily) =>
        a._count.questions - b._count.questions,
    },
    {
      title: fr.questionFamilies.order,
      dataIndex: "order",
      key: "order",
      sorter: (a: QuestionFamily, b: QuestionFamily) => a.order - b.order,
    },
    {
      title: fr.common.actions,
      key: "actions",
      render: (record: QuestionFamily) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {fr.common.edit}
          </Button>
          <Popconfirm
            title={fr.questionFamilies.delete}
            description={fr.questionFamilies.confirmDelete}
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

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {fr.questionFamilies.title}
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          {fr.questionFamilies.create}
        </Button>
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
        title={
          editingFamily
            ? fr.questionFamilies.edit
            : fr.questionFamilies.create
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={fr.common.save}
        cancelText={fr.common.cancel}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="label"
            label={fr.questionFamilies.label}
            rules={[
              { required: true, message: fr.errors.required },
              { max: 100, message: "Maximum 100 caractères" },
            ]}
          >
            <Input placeholder="Ex: Bougies / cire chaude" />
          </Form.Item>

          <Form.Item
            name="type"
            label={fr.questionFamilies.type}
            rules={[{ required: true, message: fr.errors.required }]}
          >
            <Select>
              <Select.Option value="TYPE_1">
                {fr.questionFamilies.type1}
              </Select.Option>
              <Select.Option value="TYPE_2">
                {fr.questionFamilies.type2}
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="order"
            label={fr.questionFamilies.order}
            initialValue={0}
          >
            <Input type="number" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

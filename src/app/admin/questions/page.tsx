"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Space,
  Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { fr } from "@/lib/i18n";
import type { QuestionType } from "@/lib/validations/fox-club";

interface Question {
  id: string;
  text: string;
  order: number;
  questionFamilyId: string;
  questionFamily: {
    id: string;
    label: string;
    type: QuestionType;
  };
  _count: {
    answers: number;
  };
}

interface QuestionFamily {
  id: string;
  label: string;
  type: QuestionType;
}

/**
 * Questions Management Page
 * Admin-only page for managing individual questions
 */
export default function QuestionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch question families for select dropdown
  const { data: familiesData } = useQuery({
    queryKey: ["question-families"],
    queryFn: async () => {
      const res = await fetch("/api/admin/question-families");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Fetch questions
  const { data, isLoading } = useQuery({
    queryKey: ["questions", selectedFamily],
    queryFn: async () => {
      const url = selectedFamily
        ? `/api/admin/questions?familyId=${selectedFamily}`
        : "/api/admin/questions";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to create");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
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
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
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
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      message.success(fr.toast.deleteSuccess);
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  const handleCreate = () => {
    setEditingQuestion(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    form.setFieldsValue({
      text: question.text,
      questionFamilyId: question.questionFamilyId,
      order: question.order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingQuestion) {
        updateMutation.mutate({ id: editingQuestion.id, values });
      } else {
        createMutation.mutate(values);
      }
    } catch (_error) {
      // Validation error
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
    form.resetFields();
  };

  const columns = [
    {
      title: fr.questionFamilies.label,
      key: "family",
      render: (record: Question) => (
        <Tag color="blue">{record.questionFamily.label}</Tag>
      ),
      filters: familiesData?.data?.map((family: QuestionFamily) => ({
        text: family.label,
        value: family.id,
      })),
      onFilter: (value: any, record: Question) =>
        record.questionFamilyId === value,
    },
    {
      title: fr.questions.text,
      dataIndex: "text",
      key: "text",
      ellipsis: true,
    },
    {
      title: fr.questionFamilies.type,
      key: "type",
      render: (record: Question) =>
        record.questionFamily.type === "TYPE_1"
          ? fr.questionFamilies.type1
          : fr.questionFamilies.type2,
    },
    {
      title: "Réponses",
      key: "answerCount",
      render: (record: Question) => record._count.answers,
      sorter: (a: Question, b: Question) => a._count.answers - b._count.answers,
    },
    {
      title: fr.questions.order,
      dataIndex: "order",
      key: "order",
      sorter: (a: Question, b: Question) => a.order - b.order,
    },
    {
      title: fr.common.actions,
      key: "actions",
      render: (record: Question) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {fr.common.edit}
          </Button>
          <Popconfirm
            title={fr.questions.delete}
            description={fr.questions.confirmDelete}
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
          {fr.questions.title}
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          size="large"
        >
          {fr.questions.create}
        </Button>
      </div>

      <div className="mb-4">
        <Select
          placeholder="Filtrer par famille"
          style={{ width: 300 }}
          allowClear
          onChange={(value) => setSelectedFamily(value)}
          options={familiesData?.data?.map((family: QuestionFamily) => ({
            label: family.label,
            value: family.id,
          }))}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        pagination={{
          pageSize: 50,
          showSizeChanger: true,
          showTotal: (total) => `Total: ${total}`,
        }}
      />

      <Modal
        title={
          editingQuestion ? fr.questions.edit : fr.questions.create
        }
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={fr.common.save}
        cancelText={fr.common.cancel}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="questionFamilyId"
            label={fr.questions.family}
            rules={[{ required: true, message: fr.errors.required }]}
          >
            <Select placeholder="Sélectionner une famille">
              {familiesData?.data?.map((family: QuestionFamily) => (
                <Select.Option key={family.id} value={family.id}>
                  {family.label} (
                  {family.type === "TYPE_1"
                    ? fr.questionFamilies.type1
                    : fr.questionFamilies.type2}
                  )
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="text"
            label={fr.questions.text}
            rules={[
              { required: true, message: fr.errors.required },
              { max: 1000, message: "Maximum 1000 caractères" },
            ]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Ex: Aimez-vous les massages ?"
            />
          </Form.Item>

          <Form.Item
            name="order"
            label={fr.questions.order}
            initialValue={0}
          >
            <Input type="number" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

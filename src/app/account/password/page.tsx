"use client";

import { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { SaveOutlined, LockOutlined } from "@ant-design/icons";

export default function PasswordPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("Les mots de passe ne correspondent pas");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la mise a jour");
      }
      message.success("Mot de passe mis a jour");
      form.resetFields();
    } catch (err: any) {
      message.error(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center p-6">
      <Card className="w-full shadow-md" title="Changer mon mot de passe">
        <Form layout="vertical" form={form} onFinish={onFinish}>
          <Form.Item
            name="oldPassword"
            label="Ancien mot de passe"
            rules={[{ required: true, message: "Requis" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Ancien mot de passe" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Nouveau mot de passe"
            rules={[{ required: true, min: 8, message: "8 caracteres minimum" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Nouveau mot de passe" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirmer le mot de passe"
            rules={[{ required: true, message: "Requis" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirmer" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Mettre a jour
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

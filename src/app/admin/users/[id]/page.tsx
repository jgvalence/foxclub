"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Input,
  List,
  Space,
  message,
  Popconfirm,
  Spin,
  Modal,
  Typography,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PushpinOutlined,
  PushpinFilled,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fr } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { fr as frLocale } from "date-fns/locale/fr";

const { TextArea } = Input;

interface AdminNote {
  id: string;
  content: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormAnswer {
  id: string;
  score: number;
  notes: string | null;
  top: boolean | null;
  bot: boolean | null;
  talk: boolean | null;
  include: boolean | null;
  question: {
    id: string;
    text: string;
    questionFamily: {
      label: string;
      type: string;
    };
  };
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  approved: boolean;
  createdAt: string;
  userForm: {
    id: string;
    submitted: boolean;
    updatedAt: string;
    answers: FormAnswer[];
  } | null;
  adminNotes: AdminNote[];
}

/**
 * User Detail Page
 * Admin view of user profile with form answers and notes
 */
export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [noteContent, setNoteContent] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Fetch user details
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["admin-user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const isAdmin = session?.user?.role === "ADMIN";
  const isSelf = session?.user?.id === userId;

  useEffect(() => {
    if (error && !isAdmin && !isSelf) {
      message.error("Accès refusé");
      router.push("/");
    }
  }, [error, isAdmin, isSelf, router]);

  // Create note mutation (admin only)
  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, content }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      message.success("Note ajoutée");
      setNoteContent("");
    },
  });

  // Toggle pin mutation (admin only)
  const togglePinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: !pinned }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
    },
  });

  // Delete note mutation (admin only)
  const deleteNoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/notes/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      message.success(fr.toast.deleteSuccess);
    },
  });

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      message.error("Le contenu est requis");
      return;
    }
    createNoteMutation.mutate(noteContent);
  };

  const handleAdminResetPassword = async () => {
    setResetLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erreur lors de la reinitialisation");
      }
      const data = await res.json();
      setTempPassword(data.password);
      message.success("Mot de passe temporaire genere");
    } catch (err: any) {
      message.error(err.message || "Erreur");
    } finally {
      setResetLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <div className="p-6">Utilisateur non trouvé</div>;
  }

  // Group answers by family
  const answersByFamily =
    user.userForm?.answers.reduce((acc, answer) => {
      const familyLabel = answer.question.questionFamily.label;
      if (!acc[familyLabel]) acc[familyLabel] = [];
      acc[familyLabel].push(answer);
      return acc;
    }, {} as Record<string, FormAnswer[]>) || {};

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Profil utilisateur</h1>
        {isAdmin && (
          <Button onClick={() => setResetModalOpen(true)}>
            Generer un mot de passe temporaire
          </Button>
        )}
      </div>

      {/* User Info */}
      <Card title="Informations" className="mb-6">
        <Descriptions column={2}>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Nom">
            {user.name || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Rôle">
            <Tag color="blue">{user.role}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Statut">
            {user.approved ? (
              <Tag color="green">{fr.users.approved}</Tag>
            ) : (
              <Tag color="orange">{fr.users.pending}</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Formulaire">
            {user.userForm ? (
              user.userForm.submitted ? (
                <Tag color="green">Soumis</Tag>
              ) : (
                <Tag color="blue">Brouillon</Tag>
              )
            ) : (
              <Tag>Aucun</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Membre depuis">
            {formatDistanceToNow(new Date(user.createdAt), {
              addSuffix: true,
              locale: frLocale,
            })}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Form Answers */}
      {user.userForm && user.userForm.answers.length > 0 && (
        <Card title="Réponses au formulaire" className="mb-6">
          {Object.entries(answersByFamily).map(([family, answers]) => (
            <div key={family} className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-primary-600">
                {family}
              </h3>
              <div className="space-y-3">
                {answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="rounded-lg border border-gray-200 p-4"
                  >
                    <div className="mb-2 font-medium">{answer.question.text}</div>
                    <div className="flex flex-wrap gap-2">
                      <Tag color="blue">Score: {answer.score}</Tag>
                      {answer.top !== null && answer.top && (
                        <Tag color="pink">Top</Tag>
                      )}
                      {answer.bot !== null && answer.bot && (
                        <Tag color="purple">Bot</Tag>
                      )}
                      {answer.talk !== null && answer.talk && (
                        <Tag color="orange">À discuter</Tag>
                      )}
                      {answer.include !== null && answer.include && (
                        <Tag color="green">Inclure</Tag>
                      )}
                    </div>
                    {answer.notes && (
                      <div className="mt-2 text-sm text-gray-600">
                        ✦ {answer.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Admin Notes (admin only) */}
      {isAdmin && (
        <Card
          title={fr.adminNotes.title}
          extra={
            <span className="text-sm text-gray-500">
              {fr.adminNotes.privateNote}
            </span>
          }
        >
          {/* Add Note */}
          <div className="mb-4">
            <TextArea
              rows={3}
              placeholder="Ajouter une note..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="mt-2"
              onClick={handleAddNote}
              loading={createNoteMutation.isPending}
            >
              {fr.adminNotes.add}
            </Button>
          </div>

          {/* Notes List */}
          {user.adminNotes.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              {fr.adminNotes.noNotes}
            </div>
          ) : (
            <List
              dataSource={user.adminNotes}
              renderItem={(note) => (
                <List.Item
                  className={note.pinned ? "bg-yellow-50" : ""}
                  actions={[
                    <Button
                      key="pin"
                      type="text"
                      icon={note.pinned ? <PushpinFilled /> : <PushpinOutlined />}
                      onClick={() =>
                        togglePinMutation.mutate({
                          id: note.id,
                          pinned: note.pinned,
                        })
                      }
                    />,
                    <Popconfirm
                      key="delete"
                      title={fr.adminNotes.delete}
                      onConfirm={() => deleteNoteMutation.mutate(note.id)}
                      okText={fr.common.confirm}
                      cancelText={fr.common.cancel}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        {note.pinned && (
                          <Tag color="gold">
                            <PushpinFilled /> Épinglée
                          </Tag>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(note.createdAt), {
                            addSuffix: true,
                            locale: frLocale,
                          })}
                        </span>
                      </Space>
                    }
                    description={note.content}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      )}

      {isAdmin && (
        <Modal
          title="Mot de passe temporaire"
          open={resetModalOpen}
          onOk={handleAdminResetPassword}
          onCancel={() => {
            setResetModalOpen(false);
            setTempPassword(null);
          }}
          okText="Generer"
          cancelText="Fermer"
          confirmLoading={resetLoading}
        >
          <Typography.Paragraph className="text-sm text-gray-600">
            Un mot de passe temporaire sera cree et devra etre communique a
            l'utilisateur. Il sera force a le changer a la prochaine connexion.
          </Typography.Paragraph>
          {tempPassword && (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 font-mono text-sm">
              {tempPassword}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

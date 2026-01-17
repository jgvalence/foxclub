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
  DownloadOutlined,
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { fr } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { generateFormPDF } from "@/lib/utils/pdf";
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
  pseudo: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  types: string[];
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
  const {
    data: user,
    isLoading,
    error,
  } = useQuery<User>({
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

  const handleDownloadPDF = () => {
    if (!user?.userForm?.answers) return;

    // Transform answers into questionFamilies format expected by PDF generator
    const familyMap = new Map<
      string,
      {
        id: string;
        label: string;
        type: "TYPE_1" | "TYPE_2";
        order: number;
        questions: { id: string; text: string; order: number }[];
      }
    >();

    user.userForm.answers.forEach((answer, index) => {
      const familyLabel = answer.question.questionFamily.label;
      const familyType = answer.question.questionFamily.type as
        | "TYPE_1"
        | "TYPE_2";

      if (!familyMap.has(familyLabel)) {
        familyMap.set(familyLabel, {
          id: familyLabel,
          label: familyLabel,
          type: familyType,
          order: familyMap.size,
          questions: [],
        });
      }

      const family = familyMap.get(familyLabel)!;
      family.questions.push({
        id: answer.question.id,
        text: answer.question.text,
        order: index,
      });
    });

    const questionFamilies = Array.from(familyMap.values());

    // Transform answers into Record<string, FormAnswer> format
    const answersRecord: Record<
      string,
      {
        questionId: string;
        score: number;
        notes?: string;
        top?: boolean;
        bot?: boolean;
        talk?: boolean;
        include?: boolean;
      }
    > = {};

    user.userForm.answers.forEach((answer) => {
      answersRecord[answer.question.id] = {
        questionId: answer.question.id,
        score: answer.score,
        notes: answer.notes || undefined,
        top: answer.top ?? undefined,
        bot: answer.bot ?? undefined,
        talk: answer.talk ?? undefined,
        include: answer.include ?? undefined,
      };
    });

    const userName = user.pseudo;
    generateFormPDF(questionFamilies, answersRecord, userName);
    message.success("PDF téléchargé avec succès");
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
    user.userForm?.answers.reduce(
      (acc, answer) => {
        const familyLabel = answer.question.questionFamily.label;
        if (!acc[familyLabel]) acc[familyLabel] = [];
        acc[familyLabel].push(answer);
        return acc;
      },
      {} as Record<string, FormAnswer[]>
    ) || {};

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
          <Descriptions.Item label="Pseudo">{user.pseudo}</Descriptions.Item>
          <Descriptions.Item label="Nom complet">
            {[user.firstName, user.lastName].filter(Boolean).join(" ") || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {user.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Types">
            {user.types?.length > 0
              ? user.types.map((t) => (
                  <Tag key={t} color={t === "ETUDIANT" ? "blue" : "purple"}>
                    {t === "ETUDIANT" ? "Étudiant" : "Soumis"}
                  </Tag>
                ))
              : "-"}
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
        <Card
          title="Réponses au formulaire"
          className="mb-6"
          extra={
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
            >
              Télécharger PDF
            </Button>
          }
        >
          {/* Score Legend */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-lg bg-gray-50 p-3 text-sm">
            <span className="font-medium text-gray-700">Légende :</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-red-700">
              ❤️ Fantasme
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-green-700">
              🟢 Ok
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-amber-700">
              🟠 Curieux
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-3 py-1 text-gray-700">
              ⚫ Non
            </span>
          </div>

          {Object.entries(answersByFamily).map(([family, answers]) => {
            const familyType = answers[0]?.question.questionFamily.type;
            return (
              <div key={family} className="mb-6 last:mb-0">
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {family}
                  </h3>
                  <Tag color={familyType === "TYPE_1" ? "blue" : "purple"}>
                    {familyType === "TYPE_1" ? "Type 1" : "Type 2"}
                  </Tag>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-orange-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                          Question
                        </th>
                        <th className="w-24 px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                          Score
                        </th>
                        {familyType === "TYPE_1" && (
                          <>
                            <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                              Top
                            </th>
                            <th className="w-16 px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                              Bot
                            </th>
                          </>
                        )}
                        <th className="w-20 px-4 py-3 text-center text-xs font-semibold uppercase text-gray-600">
                          {familyType === "TYPE_2" ? "Inclure" : "Discuter"}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-600">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {answers.map((answer) => {
                        const scoreEmoji =
                          answer.score === 4
                            ? "❤️"
                            : answer.score === 3
                              ? "🟢"
                              : answer.score === 2
                                ? "🟠"
                                : "⚫";
                        const scoreBg =
                          answer.score === 4
                            ? "bg-red-50 text-red-700"
                            : answer.score === 3
                              ? "bg-green-50 text-green-700"
                              : answer.score === 2
                                ? "bg-amber-50 text-amber-700"
                                : "bg-gray-100 text-gray-700";

                        return (
                          <tr key={answer.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {answer.question.text}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${scoreBg}`}
                              >
                                {scoreEmoji} {answer.score}
                              </span>
                            </td>
                            {familyType === "TYPE_1" && (
                              <>
                                <td className="px-4 py-3 text-center">
                                  {answer.top ? (
                                    <span className="text-lg text-pink-500">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">–</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {answer.bot ? (
                                    <span className="text-lg text-purple-500">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-gray-300">–</span>
                                  )}
                                </td>
                              </>
                            )}
                            <td className="px-4 py-3 text-center">
                              {familyType === "TYPE_2" ? (
                                answer.include ? (
                                  <span className="text-lg text-green-500">
                                    ✓
                                  </span>
                                ) : (
                                  <span className="text-gray-300">–</span>
                                )
                              ) : answer.talk ? (
                                <span className="text-lg text-orange-500">
                                  ✓
                                </span>
                              ) : (
                                <span className="text-gray-300">–</span>
                              )}
                            </td>
                            <td className="max-w-xs px-4 py-3 text-sm text-gray-600">
                              {answer.notes ? (
                                <span className="italic">{answer.notes}</span>
                              ) : (
                                <span className="text-gray-300">–</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
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
                      icon={
                        note.pinned ? <PushpinFilled /> : <PushpinOutlined />
                      }
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
            Un mot de passe temporaire sera créé et devra être communiqué à
            l&apos;utilisateur. Il sera forcé à le changer à la prochaine
            connexion.
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

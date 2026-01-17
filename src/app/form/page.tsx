"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, Button, Alert, Spin, App } from "antd";
import {
  SaveOutlined,
  SendOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useSession } from "next-auth/react";
import { fr } from "@/lib/i18n";
import { generateFormPDF } from "@/lib/utils/pdf";
import { ScoreSelector } from "@/components/ui/score-selector";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface Question {
  id: string;
  text: string;
  order: number;
}

interface QuestionFamily {
  id: string;
  label: string;
  type: "TYPE_1" | "TYPE_2";
  order: number;
  questions: Question[];
}

interface FormAnswer {
  questionId: string;
  score: number;
  notes?: string;
  top?: boolean;
  bot?: boolean;
  talk?: boolean;
  include?: boolean;
}

interface FormData {
  form: {
    id: string;
    submitted: boolean;
    answers: any[];
  };
  questionFamilies: QuestionFamily[];
}

export default function FormPage() {
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { data: session } = useSession();
  const { modal, message } = App.useApp();

  const { data, isLoading, error } = useQuery<FormData>({
    queryKey: ["user-form"],
    queryFn: async () => {
      const res = await fetch("/api/form");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch form");
      }
      return res.json();
    },
    retry: 1,
  });

  useEffect(() => {
    if (data?.form?.answers) {
      const existingAnswers: Record<string, FormAnswer> = {};
      data.form.answers.forEach((answer: any) => {
        existingAnswers[answer.questionId] = {
          questionId: answer.questionId,
          score: answer.score,
          notes: answer.notes || undefined,
          top: answer.top ?? undefined,
          bot: answer.bot ?? undefined,
          talk: answer.talk ?? undefined,
          include: answer.include ?? undefined,
        };
      });
      setAnswers(existingAnswers);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async (submit: boolean) => {
      const answersArray = Object.values(answers).map((answer) => ({
        questionId: answer.questionId,
        answer: {
          score: answer.score,
          notes: answer.notes,
          top: answer.top,
          bot: answer.bot,
          talk: answer.talk,
          include: answer.include,
        },
      }));

      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: answersArray,
          submitted: submit,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (_, submit) => {
      if (submit) {
        message.success(fr.form.submitSuccess);
      } else {
        message.success(fr.form.saveSuccess);
      }
    },
    onError: () => {
      message.error(fr.common.error);
    },
  });

  const handleAnswerChange = (
    questionId: string,
    field: keyof FormAnswer,
    value: any
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        score: prev[questionId]?.score ?? 1,
        ...prev[questionId],
        [field]: value,
      } as FormAnswer,
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(false);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleSubmit = () => {
    modal.confirm({
      title: fr.form.submit,
      content: fr.form.confirmSubmit,
      okText: fr.common.confirm,
      cancelText: fr.common.cancel,
      onOk: () => {
        saveMutation.mutate(true);
      },
    });
  };

  const handleDownloadPDF = () => {
    if (!data) return;
    const userName = session?.user?.name || undefined;
    generateFormPDF(data.questionFamilies, answers, userName);
    message.success("PDF telecharge avec succes");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert
          message={fr.form.notApproved}
          description="Veuillez contacter un administrateur pour obtenir l'accès."
          type="warning"
          showIcon
        />
      </div>
    );
  }

  if (!data) return null;

  const isSubmitted = data.form.submitted;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{fr.form.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sélectionnez un score et cochez les colonnes correspondantes. Les
          légendes indiquent le niveau d’appétence.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-red-700">
            ❤️ Fantasme
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-green-700">
            🟢 Ok de le pratiquer
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-amber-700">
            🟠 Curieux / doucement
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-gray-700">
            ⚫ Non / Limite
          </span>
        </div>
        {isSubmitted && (
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Alert
              message="Formulaire soumis"
              description="Votre formulaire a été soumis et ne peut plus être modifié."
              type="success"
              showIcon
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadPDF}
              size="large"
            >
              Telecharger PDF
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {data.questionFamilies.map((family) => (
          <Card key={family.id} className="shadow-sm">
            <div className="flex flex-col gap-2 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {family.label}
                </h2>
                <p className="text-sm text-gray-500">
                  {family.type === "TYPE_1"
                    ? fr.questionFamilies.type1
                    : fr.questionFamilies.type2}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-700">
                <thead className="bg-orange-50 text-xs uppercase text-gray-700">
                  <tr>
                    <th className="px-4 py-3">Question</th>
                    <th className="px-4 py-3">Score</th>
                    {family.type === "TYPE_1" && (
                      <>
                        <th className="px-4 py-3 text-center">Top</th>
                        <th className="px-4 py-3 text-center">Bot</th>
                      </>
                    )}
                    <th className="px-4 py-3 text-center">
                      {family.type === "TYPE_2" ? "Inclure" : fr.form.talk}
                    </th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {family.questions.map((question) => {
                    const answer: Partial<FormAnswer> = answers[
                      question.id
                    ] || { score: 1 };

                    return (
                      <tr
                        key={question.id}
                        className="border-b border-gray-100 align-top"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {question.text}
                        </td>
                        <td className="px-4 py-3">
                          <ScoreSelector
                            value={answer.score ?? 1}
                            onChange={(value) =>
                              handleAnswerChange(question.id, "score", value)
                            }
                            disabled={isSubmitted}
                          />
                        </td>

                        {family.type === "TYPE_1" && (
                          <>
                            <td className="px-4 py-3 text-center">
                              <Checkbox
                                label=""
                                checked={answer.top || false}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    question.id,
                                    "top",
                                    e.target.checked
                                  )
                                }
                                disabled={isSubmitted}
                              />
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Checkbox
                                label=""
                                checked={answer.bot || false}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    question.id,
                                    "bot",
                                    e.target.checked
                                  )
                                }
                                disabled={isSubmitted}
                              />
                            </td>
                          </>
                        )}

                        <td className="px-4 py-3 text-center">
                          <Checkbox
                            label=""
                            checked={
                              family.type === "TYPE_2"
                                ? answer.include || false
                                : answer.talk || false
                            }
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id,
                                family.type === "TYPE_2" ? "include" : "talk",
                                e.target.checked
                              )
                            }
                            disabled={isSubmitted}
                          />
                        </td>

                        <td className="px-4 py-3">
                          <Textarea
                            label=""
                            value={answer.notes || ""}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id,
                                "notes",
                                e.target.value
                              )
                            }
                            placeholder="Commentaires ou précisions..."
                            maxLength={2000}
                            showCount
                            disabled={isSubmitted}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))}
      </div>

      {!isSubmitted && (
        <div className="sticky bottom-0 mt-6 flex justify-end gap-4 bg-white p-4 shadow-lg">
          <Button
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={isSaving}
          >
            {fr.form.save}
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={saveMutation.isPending}
          >
            {fr.form.submit}
          </Button>
        </div>
      )}
    </div>
  );
}

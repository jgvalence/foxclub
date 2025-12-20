"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tantml:invoke name="queryClient"];
import {
  Card,
  Button,
  message,
  Alert,
  Modal,
  Spin,
  Collapse,
} from "antd";
import { SaveOutlined, SendOutlined } from "@ant-design/icons";
import { fr } from "@/lib/i18n";
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

/**
 * User Form Page
 * Main form for users to fill out their preferences
 * Dynamically renders questions based on family type
 */
export default function FormPage() {
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Fetch form data
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

  // Initialize answers from existing form data
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

  // Save form mutation
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
        ...prev[questionId],
        questionId,
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(false);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const handleSubmit = () => {
    Modal.confirm({
      title: fr.form.submit,
      content: fr.form.confirmSubmit,
      okText: fr.common.confirm,
      cancelText: fr.common.cancel,
      onOk: () => {
        saveMutation.mutate(true);
      },
    });
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
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {fr.form.title}
        </h1>
        {isSubmitted && (
          <Alert
            message="Formulaire soumis"
            description="Votre formulaire a été soumis et ne peut plus être modifié."
            type="success"
            showIcon
            className="mt-4"
          />
        )}
      </div>

      {/* Questions by Family */}
      <Collapse
        accordion
        defaultActiveKey={data.questionFamilies[0]?.id}
        className="mb-6"
      >
        {data.questionFamilies.map((family) => (
          <Collapse.Panel
            key={family.id}
            header={
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{family.label}</span>
                <span className="text-sm text-gray-500">
                  {family.type === "TYPE_1"
                    ? fr.questionFamilies.type1
                    : fr.questionFamilies.type2}
                </span>
              </div>
            }
          >
            <div className="space-y-6">
              {family.questions.map((question) => {
                const answer = answers[question.id] || {};

                return (
                  <Card
                    key={question.id}
                    className="shadow-sm"
                    size="small"
                  >
                    <div className="mb-4 font-medium text-gray-900">
                      {question.text}
                    </div>

                    {/* Score Selector */}
                    <div className="mb-4">
                      <ScoreSelector
                        value={answer.score}
                        onChange={(value) =>
                          handleAnswerChange(question.id, "score", value)
                        }
                        disabled={isSubmitted}
                      />
                    </div>

                    {/* Type-specific fields */}
                    <div className="mb-4 flex flex-wrap gap-4">
                      {family.type === "TYPE_1" && (
                        <>
                          <Checkbox
                            label={fr.form.top}
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
                          <Checkbox
                            label={fr.form.bot}
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
                          <Checkbox
                            label={fr.form.talk}
                            checked={answer.talk || false}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id,
                                "talk",
                                e.target.checked
                              )
                            }
                            disabled={isSubmitted}
                          />
                        </>
                      )}

                      {family.type === "TYPE_2" && (
                        <>
                          <Checkbox
                            label={fr.form.talk}
                            checked={answer.talk || false}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id,
                                "talk",
                                e.target.checked
                              )
                            }
                            disabled={isSubmitted}
                          />
                          <Checkbox
                            label={fr.form.include}
                            checked={answer.include || false}
                            onChange={(e) =>
                              handleAnswerChange(
                                question.id,
                                "include",
                                e.target.checked
                              )
                            }
                            disabled={isSubmitted}
                          />
                        </>
                      )}
                    </div>

                    {/* Notes */}
                    <Textarea
                      label={fr.form.notes}
                      value={answer.notes || ""}
                      onChange={(e) =>
                        handleAnswerChange(question.id, "notes", e.target.value)
                      }
                      placeholder="Commentaires ou précisions..."
                      maxLength={2000}
                      showCount
                      disabled={isSubmitted}
                    />
                  </Card>
                );
              })}
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>

      {/* Actions */}
      {!isSubmitted && (
        <div className="sticky bottom-0 flex justify-end gap-4 bg-white p-4 shadow-lg">
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

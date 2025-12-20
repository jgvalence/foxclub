import { describe, it, expect } from "vitest";
import {
  createQuestionFamilySchema,
  updateQuestionFamilySchema,
  createQuestionSchema,
  type1AnswerSchema,
  type2AnswerSchema,
  createAdminNoteSchema,
  updateUserApprovalSchema,
  updateUserRoleSchema,
} from "../fox-club";

describe("Fox Club Validation Schemas", () => {
  describe("QuestionFamily Schemas", () => {
    it("should validate correct question family creation", () => {
      const valid = {
        label: "Massages",
        type: "TYPE_1" as const,
        order: 0,
      };

      const result = createQuestionFamilySchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject empty label", () => {
      const invalid = {
        label: "",
        type: "TYPE_1" as const,
      };

      const result = createQuestionFamilySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject invalid type", () => {
      const invalid = {
        label: "Test",
        type: "INVALID",
      };

      const result = createQuestionFamilySchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should accept optional order", () => {
      const valid = {
        label: "Test Family",
        type: "TYPE_2" as const,
      };

      const result = createQuestionFamilySchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.order).toBe(0); // Default value
      }
    });
  });

  describe("Question Schemas", () => {
    it("should validate correct question creation", () => {
      const valid = {
        questionFamilyId: "cm0abc123def456",
        text: "Aimez-vous les massages ?",
        order: 1,
      };

      const result = createQuestionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject empty text", () => {
      const invalid = {
        questionFamilyId: "cm0abc123def456",
        text: "",
      };

      const result = createQuestionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject text exceeding max length", () => {
      const invalid = {
        questionFamilyId: "cm0abc123def456",
        text: "a".repeat(1001),
      };

      const result = createQuestionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Form Answer Schemas", () => {
    describe("TYPE_1 Answers", () => {
      it("should validate correct TYPE_1 answer", () => {
        const valid = {
          score: 2,
          top: true,
          bot: false,
          talk: true,
          notes: "Test note",
        };

        const result = type1AnswerSchema.safeParse(valid);
        expect(result.success).toBe(true);
      });

      it("should reject score out of range", () => {
        const invalid = {
          score: 5, // Max is 4
          top: true,
        };

        const result = type1AnswerSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });

      it("should reject score below minimum", () => {
        const invalid = {
          score: 0, // Min is 1
        };

        const result = type1AnswerSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });

      it("should accept missing optional fields", () => {
        const valid = {
          score: 3,
        };

        const result = type1AnswerSchema.safeParse(valid);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.top).toBe(false); // Default value
          expect(result.data.bot).toBe(false);
          expect(result.data.talk).toBe(false);
        }
      });

      it("should reject include field (TYPE_2 only)", () => {
        const invalid = {
          score: 2,
          include: true, // Not allowed in TYPE_1
        };

        const result = type1AnswerSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    });

    describe("TYPE_2 Answers", () => {
      it("should validate correct TYPE_2 answer", () => {
        const valid = {
          score: 3,
          talk: true,
          include: false,
          notes: "Some notes",
        };

        const result = type2AnswerSchema.safeParse(valid);
        expect(result.success).toBe(true);
      });

      it("should reject top field (TYPE_1 only)", () => {
        const invalid = {
          score: 2,
          top: true, // Not allowed in TYPE_2
        };

        const result = type2AnswerSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });

      it("should reject bot field (TYPE_1 only)", () => {
        const invalid = {
          score: 2,
          bot: true, // Not allowed in TYPE_2
        };

        const result = type2AnswerSchema.safeParse(invalid);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Admin Note Schemas", () => {
    it("should validate correct admin note creation", () => {
      const valid = {
        userId: "cm0abc123def456",
        content: "Important note about this user",
        pinned: true,
      };

      const result = createAdminNoteSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject empty content", () => {
      const invalid = {
        userId: "cm0abc123def456",
        content: "",
      };

      const result = createAdminNoteSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject content exceeding max length", () => {
      const invalid = {
        userId: "cm0abc123def456",
        content: "a".repeat(5001),
      };

      const result = createAdminNoteSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("User Management Schemas", () => {
    it("should validate user approval update", () => {
      const valid = { approved: true };
      const result = updateUserApprovalSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should validate user role update", () => {
      const valid = { role: "ADMIN" };
      const result = updateUserRoleSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("should reject invalid role", () => {
      const invalid = { role: "SUPERADMIN" };
      const result = updateUserRoleSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

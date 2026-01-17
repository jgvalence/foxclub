import { z } from "zod";

// ==============================================================================
// ENUMS
// ==============================================================================

/**
 * Question type enum matching Prisma schema
 * TYPE_1: Score (1-4), Top, Bot, Talk, Notes
 * TYPE_2: Score (1-4), Talk, Include, Notes
 */
export const QuestionTypeSchema = z.enum(["TYPE_1", "TYPE_2"]);
export type QuestionType = z.infer<typeof QuestionTypeSchema>;

/**
 * User type enum matching Prisma schema
 * ETUDIANT, SOUMIS
 */
export const UserTypeSchema = z.enum(["ETUDIANT", "SOUMIS"]);
export type UserType = z.infer<typeof UserTypeSchema>;

// ==============================================================================
// QUESTION FAMILY SCHEMAS
// ==============================================================================

/**
 * Schema for creating a new question family
 */
export const createQuestionFamilySchema = z.object({
  label: z
    .string()
    .min(1, "Le nom de la famille est requis")
    .max(100, "Le nom ne peut pas depasser 100 caracteres"),
  type: QuestionTypeSchema,
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Schema for updating an existing question family
 */
export const updateQuestionFamilySchema = z.object({
  label: z
    .string()
    .min(1, "Le nom de la famille est requis")
    .max(100, "Le nom ne peut pas depasser 100 caracteres")
    .optional(),
  type: QuestionTypeSchema.optional(),
  order: z.number().int().min(0).optional(),
});

export type CreateQuestionFamilyInput = z.infer<
  typeof createQuestionFamilySchema
>;
export type UpdateQuestionFamilyInput = z.infer<
  typeof updateQuestionFamilySchema
>;

// ==============================================================================
// QUESTION SCHEMAS
// ==============================================================================

/**
 * Schema for creating a new question
 */
export const createQuestionSchema = z.object({
  questionFamilyId: z.string().cuid("ID de famille invalide"),
  text: z
    .string()
    .min(1, "Le texte de la question est requis")
    .max(1000, "Le texte ne peut pas depasser 1000 caracteres"),
  order: z.number().int().min(0).optional().default(0),
});

/**
 * Schema for updating an existing question
 */
export const updateQuestionSchema = z.object({
  text: z
    .string()
    .min(1, "Le texte de la question est requis")
    .max(1000, "Le texte ne peut pas depasser 1000 caracteres")
    .optional(),
  order: z.number().int().min(0).optional(),
  questionFamilyId: z.string().cuid("ID de famille invalide").optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

// ==============================================================================
// FORM ANSWER SCHEMAS
// ==============================================================================

/**
 * Base schema for common answer fields
 */
const baseAnswerSchema = z.object({
  score: z.number().int().min(1).max(4, "Le score doit etre entre 1 et 4"),
  notes: z
    .string()
    .max(2000, "Les notes ne peuvent pas depasser 2000 caracteres")
    .optional(),
});

/**
 * Schema for form answers (accepts all fields, optional booleans)
 * Both TYPE_1 and TYPE_2 questions use the same schema for flexibility
 */
export const formAnswerSchema = baseAnswerSchema.extend({
  top: z.boolean().optional(),
  bot: z.boolean().optional(),
  talk: z.boolean().optional(),
  include: z.boolean().optional(),
});

/**
 * Schema for creating/updating a single answer
 */
export const createFormAnswerSchema = z.object({
  questionId: z.string().cuid("ID de question invalide"),
  answer: formAnswerSchema,
});

/**
 * Schema for submitting an entire form
 */
export const submitFormSchema = z.object({
  answers: z
    .array(createFormAnswerSchema)
    .min(1, "Au moins une reponse est requise"),
  submitted: z.boolean().optional().default(false),
});

export type FormAnswer = z.infer<typeof formAnswerSchema>;
export type CreateFormAnswerInput = z.infer<typeof createFormAnswerSchema>;
export type SubmitFormInput = z.infer<typeof submitFormSchema>;

// ==============================================================================
// ADMIN NOTE SCHEMAS
// ==============================================================================

/**
 * Schema for creating an admin note
 */
export const createAdminNoteSchema = z.object({
  userId: z.string().cuid("ID utilisateur invalide"),
  content: z
    .string()
    .min(1, "Le contenu de la note est requis")
    .max(5000, "Le contenu ne peut pas depasser 5000 caracteres"),
  pinned: z.boolean().optional().default(false),
});

/**
 * Schema for updating an admin note
 */
export const updateAdminNoteSchema = z.object({
  content: z
    .string()
    .min(1, "Le contenu de la note est requis")
    .max(5000, "Le contenu ne peut pas depasser 5000 caracteres")
    .optional(),
  pinned: z.boolean().optional(),
});

export type CreateAdminNoteInput = z.infer<typeof createAdminNoteSchema>;
export type UpdateAdminNoteInput = z.infer<typeof updateAdminNoteSchema>;

// ==============================================================================
// USER MANAGEMENT SCHEMAS
// ==============================================================================

/**
 * Schema for updating user approval status
 */
export const updateUserApprovalSchema = z.object({
  approved: z.boolean(),
});

/**
 * Schema for updating user role
 */
export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN", "MODERATOR"]),
});

/**
 * Schema for bulk user actions
 */
export const bulkUserActionSchema = z.object({
  userIds: z
    .array(z.string().cuid())
    .min(1, "Au moins un utilisateur est requis"),
  action: z.enum(["approve", "reject", "delete"]),
});

/**
 * Schema for creating a user from admin
 */
export const createUserSchema = z.object({
  pseudo: z
    .string()
    .min(3, "Le pseudo doit contenir au moins 3 caracteres")
    .max(50, "Le pseudo ne peut pas depasser 50 caracteres"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]).optional().default("USER"),
  types: z.array(UserTypeSchema).optional().default([]),
  approved: z.boolean().optional().default(true),
});

/**
 * Schema for updating a user from admin (all fields optional)
 */
export const updateUserSchema = z.object({
  pseudo: z
    .string()
    .min(3, "Le pseudo doit contenir au moins 3 caracteres")
    .max(50, "Le pseudo ne peut pas depasser 50 caracteres")
    .optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  firstName: z.string().max(100).optional().or(z.literal("")),
  lastName: z.string().max(100).optional().or(z.literal("")),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]).optional(),
  types: z.array(UserTypeSchema).optional(),
  approved: z.boolean().optional(),
});

/**
 * Schema for user self-service password change
 */
export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Ancien mot de passe requis"),
  newPassword: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caracteres"),
});

/**
 * Schema for admin temporary password reset
 */
export const adminResetPasswordSchema = z.object({
  password: z.string().min(8).optional(),
  mustChangePassword: z.boolean().optional().default(true),
});

export type UpdateUserApprovalInput = z.infer<typeof updateUserApprovalSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type BulkUserActionInput = z.infer<typeof bulkUserActionSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>;

// ==============================================================================
// PAGINATION & FILTERING
// ==============================================================================

/**
 * Generic pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

/**
 * Question families filter schema
 */
export const questionFamiliesFilterSchema = paginationSchema.extend({
  type: QuestionTypeSchema.optional(),
  search: z.string().optional(),
});

/**
 * Questions filter schema
 */
export const questionsFilterSchema = paginationSchema.extend({
  familyId: z.string().cuid().optional(),
  search: z.string().optional(),
});

/**
 * Users filter schema
 */
export const usersFilterSchema = paginationSchema.extend({
  approved: z.boolean().optional(),
  role: z.enum(["USER", "ADMIN", "MODERATOR"]).optional(),
  types: z.array(UserTypeSchema).optional(),
  search: z.string().optional(),
});

export type PaginationInput = z.infer<typeof paginationSchema>;
export type QuestionFamiliesFilterInput = z.infer<
  typeof questionFamiliesFilterSchema
>;
export type QuestionsFilterInput = z.infer<typeof questionsFilterSchema>;
export type UsersFilterInput = z.infer<typeof usersFilterSchema>;

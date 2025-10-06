import { z } from "zod";

/**
 * Todoのステータス
 */
export const TODO_STATUSES = ["open", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

/**
 * Todoの優先度
 */
export const TODO_PRIORITIES = ["low", "mid", "high"] as const;
export type TodoPriority = (typeof TODO_PRIORITIES)[number];

/**
 * Todo作成用スキーマ
 */
export const createTodoSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(120, "タイトルは120文字以内で入力してください"),
  description: z.string().optional().default(""),
  status: z.enum(TODO_STATUSES).optional().default("open"),
  priority: z.enum(TODO_PRIORITIES).optional().default("mid"),
  due: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .transform((val) => {
      // YYYY-MM-DD形式の場合はUTC 00:00に正規化
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(`${val}T00:00:00.000Z`);
      }
      return new Date(val);
    })
    .optional(),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

/**
 * Todo更新用スキーマ（全フィールドオプショナル）
 */
export const updateTodoSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルは必須です")
    .max(120, "タイトルは120文字以内で入力してください")
    .optional(),
  description: z.string().optional(),
  status: z.enum(TODO_STATUSES).optional(),
  priority: z.enum(TODO_PRIORITIES).optional(),
  due: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .transform((val) => {
      // YYYY-MM-DD形式の場合はUTC 00:00に正規化
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(`${val}T00:00:00.000Z`);
      }
      return new Date(val);
    })
    .optional()
    .nullable(),
});

export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;

/**
 * Todo検索クエリ用スキーマ
 */
export const todoQuerySchema = z.object({
  status: z.enum(TODO_STATUSES).optional(),
  priority: z.enum(TODO_PRIORITIES).optional(),
  dueFrom: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .transform((val) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(`${val}T00:00:00.000Z`);
      }
      return new Date(val);
    })
    .optional(),
  dueTo: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .transform((val) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return new Date(`${val}T23:59:59.999Z`);
      }
      return new Date(val);
    })
    .optional(),
  q: z.string().optional(),
  sortBy: z
    .enum(["updatedAt", "createdAt", "due", "priority"])
    .optional()
    .default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type TodoQueryInput = z.infer<typeof todoQuerySchema>;

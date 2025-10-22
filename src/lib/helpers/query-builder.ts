import { Prisma } from "@prisma/client";
import type { TodoQueryInput } from "@/lib/validations/todo";

/**
 * TODO検索用のPrismaクエリを構築する
 *
 * @param userId - ユーザーID
 * @param params - バリデーション済みのクエリパラメータ
 * @returns Prisma検索用のwhereとorderByオブジェクト
 *
 * @example
 * ```typescript
 * const { where, orderBy } = buildTodoSearchQuery(userId, validatedParams);
 * const todos = await prisma.todo.findMany({ where, orderBy });
 * ```
 */
export function buildTodoSearchQuery(
  userId: string,
  params: TodoQueryInput
): {
  where: Prisma.TodoWhereInput;
  orderBy: Prisma.TodoOrderByWithRelationInput;
} {
  // WHERE条件の構築
  const where: Prisma.TodoWhereInput = {
    userId,
  };

  // ステータスフィルタ
  if (params.status) {
    where.status = params.status;
  }

  // 優先度フィルタ
  if (params.priority) {
    where.priority = params.priority;
  }

  // 期限範囲フィルタ
  if (params.dueFrom || params.dueTo) {
    where.due = {};
    if (params.dueFrom) {
      where.due.gte = params.dueFrom;
    }
    if (params.dueTo) {
      where.due.lte = params.dueTo;
    }
  }

  // キーワード検索（title/descriptionの部分一致）
  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }

  // ORDER BY条件の構築
  const orderBy: Prisma.TodoOrderByWithRelationInput = {
    [params.sortBy]: params.sortOrder,
  };

  return { where, orderBy };
}

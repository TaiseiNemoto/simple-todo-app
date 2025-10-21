import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError } from "@/lib/errors/custom-errors";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import type { Todo } from "@prisma/client";

/**
 * TODOを取得し、所有者チェックを実行
 *
 * @param todoId - TODO ID
 * @param userId - ユーザー ID
 * @returns TODO オブジェクト
 * @throws {NotFoundError} TODOが見つからない場合
 * @throws {ForbiddenError} 所有者が一致しない場合
 */
export async function getTodoWithOwnershipCheck(
  todoId: string,
  userId: string
): Promise<Todo> {
  // Prisma findUnique
  const todo = await prisma.todo.findUnique({
    where: {
      todoId,
    },
  });

  // 存在チェック
  if (!todo) {
    throw new NotFoundError(ERROR_MESSAGES.TODO.NOT_FOUND);
  }

  // 所有者チェック
  if (todo.userId !== userId) {
    throw new ForbiddenError(ERROR_MESSAGES.TODO.FORBIDDEN);
  }

  return todo;
}

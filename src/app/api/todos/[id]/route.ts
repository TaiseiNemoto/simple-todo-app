import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  unauthorizedError,
  forbiddenError,
  notFoundError,
  internalError,
} from "@/lib/errors";

/**
 * GET /api/todos/[id]
 * TODO単体取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // Prisma findUnique
    const todo = await prisma.todo.findUnique({
      where: {
        todoId: params.id,
      },
    });

    // 存在チェック
    if (!todo) {
      return notFoundError("TODOが見つかりません");
    }

    // 所有者チェック
    if (todo.userId !== userId) {
      return forbiddenError("このTODOへのアクセス権限がありません");
    }

    return NextResponse.json(todo);
  } catch (error) {
    // 認証エラー
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedError();
    }

    // その他のエラー
    console.error("TODO取得エラー:", error);
    return internalError();
  }
}

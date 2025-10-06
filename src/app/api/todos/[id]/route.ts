import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTodoSchema } from "@/lib/validations/todo";
import {
  unauthorizedError,
  forbiddenError,
  notFoundError,
  invalidBodyError,
  internalError,
} from "@/lib/errors";
import { ZodError } from "zod";

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

/**
 * PATCH /api/todos/[id]
 * TODO更新
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // Prisma findUnique（存在確認）
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

    // リクエストボディ取得
    const body = await request.json();

    // リクエストボディバリデーション
    const validatedData = updateTodoSchema.parse(body);

    // Prisma update
    const updatedTodo = await prisma.todo.update({
      where: {
        todoId: params.id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    // 認証エラー
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedError();
    }

    // バリデーションエラー
    if (error instanceof ZodError) {
      return invalidBodyError("リクエストボディが不正です", {
        issues: error.issues,
      });
    }

    // その他のエラー
    console.error("TODO更新エラー:", error);
    return internalError();
  }
}

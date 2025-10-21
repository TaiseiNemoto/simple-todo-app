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
import {
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "@/lib/errors/custom-errors";
import { ERROR_MESSAGES } from "@/lib/constants/messages";
import { ZodError } from "zod";
import { getTodoWithOwnershipCheck } from "@/lib/helpers/todo-helpers";

/**
 * GET /api/todos/[id]
 * TODO単体取得
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // paramsを解決
    const { id } = await params;

    // TODO取得＋所有者チェック
    const todo = await getTodoWithOwnershipCheck(id, userId);

    return NextResponse.json(todo);
  } catch (error) {
    // 認証エラー
    if (error instanceof UnauthorizedError) {
      return unauthorizedError(error.message);
    }

    // TODOが見つからない
    if (error instanceof NotFoundError) {
      return notFoundError(error.message);
    }

    // 所有者不一致
    if (error instanceof ForbiddenError) {
      return forbiddenError(error.message);
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // paramsを解決
    const { id } = await params;

    // TODO取得＋所有者チェック
    await getTodoWithOwnershipCheck(id, userId);

    // リクエストボディ取得
    const body = await request.json();

    // リクエストボディバリデーション
    const validatedData = updateTodoSchema.parse(body);

    // Prisma update
    const updatedTodo = await prisma.todo.update({
      where: {
        todoId: id,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    // 認証エラー
    if (error instanceof UnauthorizedError) {
      return unauthorizedError(error.message);
    }

    // TODOが見つからない
    if (error instanceof NotFoundError) {
      return notFoundError(error.message);
    }

    // 所有者不一致
    if (error instanceof ForbiddenError) {
      return forbiddenError(error.message);
    }

    // バリデーションエラー
    if (error instanceof ZodError) {
      return invalidBodyError(ERROR_MESSAGES.VALIDATION.INVALID_BODY, {
        issues: error.issues,
      });
    }

    // その他のエラー
    console.error("TODO更新エラー:", error);
    return internalError();
  }
}

/**
 * DELETE /api/todos/[id]
 * TODO削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // paramsを解決
    const { id } = await params;

    // TODO取得＋所有者チェック
    await getTodoWithOwnershipCheck(id, userId);

    // Prisma delete
    await prisma.todo.delete({
      where: {
        todoId: id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // 認証エラー
    if (error instanceof UnauthorizedError) {
      return unauthorizedError(error.message);
    }

    // TODOが見つからない
    if (error instanceof NotFoundError) {
      return notFoundError(error.message);
    }

    // 所有者不一致
    if (error instanceof ForbiddenError) {
      return forbiddenError(error.message);
    }

    // その他のエラー
    console.error("TODO削除エラー:", error);
    return internalError();
  }
}

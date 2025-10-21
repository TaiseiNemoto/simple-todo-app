import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTodoSchema } from "@/lib/validations/todo";
import { withErrorHandling, withBodyValidation } from "@/lib/api/route-handler";
import { getTodoWithOwnershipCheck } from "@/lib/helpers/todo-helpers";

/**
 * GET /api/todos/[id]
 * TODO単体取得
 */
export const GET = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // paramsを解決
    const { id } = await params;

    // TODO取得＋所有者チェック
    const todo = await getTodoWithOwnershipCheck(id, userId);

    return NextResponse.json(todo);
  }
);

/**
 * PATCH /api/todos/[id]
 * TODO更新
 */
export const PATCH = withBodyValidation(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
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
  }
);

/**
 * DELETE /api/todos/[id]
 * TODO削除
 */
export const DELETE = withErrorHandling(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
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
  }
);

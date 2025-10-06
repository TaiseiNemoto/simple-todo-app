import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todoQuerySchema, createTodoSchema } from "@/lib/validations/todo";
import {
  unauthorizedError,
  invalidParameterError,
  invalidBodyError,
  internalError,
} from "@/lib/errors";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * GET /api/todos
 * TODO一覧取得
 */
export async function GET(request: NextRequest) {
  try {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // クエリパラメータ取得
    const { searchParams } = request.nextUrl;
    const queryParams = {
      status: searchParams.get("status") || undefined,
      priority: searchParams.get("priority") || undefined,
      dueFrom: searchParams.get("dueFrom") || undefined,
      dueTo: searchParams.get("dueTo") || undefined,
      q: searchParams.get("q") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: searchParams.get("sortOrder") || undefined,
    };

    // クエリパラメータバリデーション
    const validatedParams = todoQuerySchema.parse(queryParams);

    // Prisma検索クエリ構築
    const where: Prisma.TodoWhereInput = {
      userId,
    };

    // ステータスフィルタ
    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    // 優先度フィルタ
    if (validatedParams.priority) {
      where.priority = validatedParams.priority;
    }

    // 期限範囲フィルタ
    if (validatedParams.dueFrom || validatedParams.dueTo) {
      where.due = {};
      if (validatedParams.dueFrom) {
        where.due.gte = validatedParams.dueFrom;
      }
      if (validatedParams.dueTo) {
        where.due.lte = validatedParams.dueTo;
      }
    }

    // キーワード検索（title/descriptionの部分一致）
    if (validatedParams.q) {
      where.OR = [
        { title: { contains: validatedParams.q } },
        { description: { contains: validatedParams.q } },
      ];
    }

    // ソート設定
    const orderBy: Prisma.TodoOrderByWithRelationInput = {
      [validatedParams.sortBy]: validatedParams.sortOrder,
    };

    // Prismaクエリ実行
    const todos = await prisma.todo.findMany({
      where,
      orderBy,
    });

    return NextResponse.json(todos);
  } catch (error) {
    // 認証エラー
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return unauthorizedError();
    }

    // バリデーションエラー
    if (error instanceof ZodError) {
      return invalidParameterError("クエリパラメータが不正です", {
        issues: error.issues,
      });
    }

    // その他のエラー
    console.error("TODO一覧取得エラー:", error);
    return internalError();
  }
}

/**
 * POST /api/todos
 * TODO新規作成
 */
export async function POST(request: NextRequest) {
  try {
    // セッション認証チェック
    const session = await requireAuth();
    const userId = session.user.id;

    // リクエストボディ取得
    const body = await request.json();

    // リクエストボディバリデーション
    const validatedData = createTodoSchema.parse(body);

    // Prisma create
    const newTodo = await prisma.todo.create({
      data: {
        userId,
        title: validatedData.title,
        description: validatedData.description,
        status: validatedData.status,
        priority: validatedData.priority,
        due: validatedData.due,
      },
    });

    return NextResponse.json(newTodo, { status: 201 });
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
    console.error("TODO作成エラー:", error);
    return internalError();
  }
}

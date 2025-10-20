import { auth } from "@/auth";
import { UnauthorizedError } from "@/lib/errors/custom-errors";

/**
 * サーバーサイドでセッションを取得
 */
export async function getServerSession() {
  return await auth();
}

/**
 * 認証必須チェック
 * 未認証の場合は401エラーをスロー
 */
export async function requireAuth() {
  const session = await getServerSession();

  if (!session || !session.user?.id) {
    throw new UnauthorizedError("認証が必要です");
  }

  return session;
}

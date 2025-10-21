import { auth } from "@/auth";
import { UnauthorizedError } from "@/lib/errors/custom-errors";
import { ERROR_MESSAGES } from "@/lib/constants/messages";

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
    throw new UnauthorizedError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  }

  return session;
}

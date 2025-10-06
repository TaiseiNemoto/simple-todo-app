import { auth } from "@/auth";

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
    throw new Error("UNAUTHORIZED");
  }

  return session;
}

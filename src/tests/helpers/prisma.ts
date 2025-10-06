import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const prisma = new PrismaClient();

/**
 * テスト用データベースのセットアップ
 * マイグレーションを実行してスキーマを最新化
 */
export async function setupTestDatabase() {
  try {
    // DATABASE_URLが.env.testのものを使用していることを確認
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, NODE_ENV: "test" },
      stdio: "inherit",
    });
  } catch (error) {
    console.error("Failed to setup test database:", error);
    throw error;
  }
}

/**
 * テスト用データベースのクリーンアップ
 * すべてのテーブルのデータを削除（外部キー制約を考慮した順序）
 */
export async function cleanupTestDatabase() {
  try {
    // 外部キー制約を考慮して、子テーブルから削除
    await prisma.todo.deleteMany({});
    await prisma.user.deleteMany({});
  } catch (error) {
    console.error("Failed to cleanup test database:", error);
    throw error;
  }
}

/**
 * テスト用データベース接続を切断
 */
export async function disconnectTestDatabase() {
  await prisma.$disconnect();
}

/**
 * テスト用Prismaクライアントのインスタンスを取得
 */
export function getTestPrismaClient() {
  return prisma;
}

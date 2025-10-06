import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * MSWサーバーインスタンス
 * Node.js環境（Vitest）で使用するモックサーバー
 */
export const server = setupServer(...handlers);

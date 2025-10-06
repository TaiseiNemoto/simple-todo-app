import "@testing-library/jest-dom";
import { server } from "./src/tests/mocks/server";
import { beforeAll, afterEach, afterAll } from "vitest";

// MSWサーバーのセットアップ
beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

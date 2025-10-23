import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient, ApiError } from "./client";

describe("apiClient", () => {
  // fetchのモック
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    // fetchをモック
    originalFetch = global.fetch;
  });

  afterEach(() => {
    // fetchを元に戻す
    global.fetch = originalFetch;
  });

  describe("正常系", () => {
    it("GETリクエストが成功する", async () => {
      const mockData = { id: "1", title: "Test Todo" };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
          headers: new Headers({ "content-type": "application/json" }),
        } as Response)
      );

      const result = await apiClient<typeof mockData>("/api/test");

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/test",
        expect.objectContaining({
          credentials: "include",
        })
      );
    });

    it("POSTリクエストが成功する", async () => {
      const mockRequest = { title: "New Todo" };
      const mockResponse = { id: "1", ...mockRequest };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve(mockResponse),
          headers: new Headers({ "content-type": "application/json" }),
        } as Response)
      );

      const result = await apiClient<typeof mockResponse>("/api/test", {
        method: "POST",
        body: JSON.stringify(mockRequest),
      });

      expect(result).toEqual(mockResponse);
    });

    it("クエリパラメータが正しく付与される", async () => {
      const mockData = { results: [] };

      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockData),
          headers: new Headers({ "content-type": "application/json" }),
        } as Response)
      );

      await apiClient("/api/test", {
        params: {
          status: "open",
          priority: "high",
          page: 1,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/test?status=open&priority=high&page=1",
        expect.any(Object)
      );
    });

    it("クエリパラメータのundefined/null値は除外される", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: [] }),
          headers: new Headers({ "content-type": "application/json" }),
        } as Response)
      );

      await apiClient("/api/test", {
        params: {
          status: "open",
          undefined_value: undefined,
          null_value: null,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/test?status=open",
        expect.any(Object)
      );
    });

    it("Content-Typeヘッダーが自動設定される（bodyあり）", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ success: true }),
          headers: new Headers({ "content-type": "application/json" }),
        } as Response)
      );

      await apiClient("/api/test", {
        method: "POST",
        body: JSON.stringify({ data: "test" }),
      });

      const call = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
      const headers = call[1].headers as Headers;
      expect(headers.get("content-type")).toBe("application/json");
    });

    it("レスポンスボディがnullの場合でも正常処理される", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 204,
          json: () => Promise.resolve(null),
          headers: new Headers(),
        } as Response)
      );

      const result = await apiClient("/api/test/1", { method: "DELETE" });
      expect(result).toBeNull();
    });
  });

  describe("エラーハンドリング", () => {
    describe("401 Unauthorized", () => {
      it("401エラーがApiErrorとしてthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 401,
            statusText: "Unauthorized",
            json: () =>
              Promise.resolve({
                code: "UNAUTHORIZED",
                message: "認証が必要です",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        await expect(apiClient("/api/test")).rejects.toThrow(ApiError);

        try {
          await apiClient("/api/test");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(401);
          expect(apiError.code).toBe("UNAUTHORIZED");
          expect(apiError.message).toBe("認証が必要です");
        }
      });
    });

    describe("403 Forbidden", () => {
      it("403エラーがApiErrorとしてthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 403,
            statusText: "Forbidden",
            json: () =>
              Promise.resolve({
                code: "FORBIDDEN",
                message: "このリソースにアクセスする権限がありません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await apiClient("/api/test/1");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(403);
          expect(apiError.code).toBe("FORBIDDEN");
          expect(apiError.message).toBe(
            "このリソースにアクセスする権限がありません"
          );
        }
      });
    });

    describe("404 Not Found", () => {
      it("404エラーがApiErrorとしてthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 404,
            statusText: "Not Found",
            json: () =>
              Promise.resolve({
                code: "NOT_FOUND",
                message: "リソースが見つかりません",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await apiClient("/api/test/999");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(404);
          expect(apiError.code).toBe("NOT_FOUND");
          expect(apiError.message).toBe("リソースが見つかりません");
        }
      });
    });

    describe("500 Internal Server Error", () => {
      it("500エラーがApiErrorとしてthrowされる", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: () =>
              Promise.resolve({
                code: "INTERNAL_ERROR",
                message: "サーバーエラーが発生しました",
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await apiClient("/api/test");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(500);
          expect(apiError.code).toBe("INTERNAL_ERROR");
          expect(apiError.message).toBe("サーバーエラーが発生しました");
        }
      });
    });

    describe("エラーレスポンスの詳細情報", () => {
      it("detailsフィールドが含まれる場合、それを保持する", async () => {
        const errorDetails = [
          { field: "title", message: "タイトルは必須です" },
        ];

        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 400,
            statusText: "Bad Request",
            json: () =>
              Promise.resolve({
                code: "INVALID_BODY",
                message: "リクエストボディが不正です",
                details: errorDetails,
              }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await apiClient("/api/test", {
            method: "POST",
            body: JSON.stringify({}),
          });
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(400);
          expect(apiError.details).toEqual(errorDetails);
        }
      });
    });

    describe("エラーレスポンスが標準形式でない場合", () => {
      it("codeがない場合、UNKNOWN_ERRORを設定", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: () => Promise.resolve({ error: "Something went wrong" }),
            headers: new Headers({ "content-type": "application/json" }),
          } as Response)
        );

        try {
          await apiClient("/api/test");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.code).toBe("UNKNOWN_ERROR");
        }
      });

      it("messageがない場合、デフォルトメッセージを設定", async () => {
        global.fetch = vi.fn(() =>
          Promise.resolve({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: () => Promise.resolve(null),
            headers: new Headers(),
          } as Response)
        );

        try {
          await apiClient("/api/test");
        } catch (error) {
          const apiError = error as ApiError;
          expect(apiError.message).toBe("HTTP 500: Internal Server Error");
        }
      });
    });

    describe("ネットワークエラー", () => {
      it("fetch失敗時にNETWORK_ERRORを返す", async () => {
        global.fetch = vi.fn(() =>
          Promise.reject(new TypeError("Failed to fetch"))
        );

        try {
          await apiClient("/api/test");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(0);
          expect(apiError.code).toBe("NETWORK_ERROR");
          expect(apiError.message).toBe(
            "ネットワークエラーが発生しました。インターネット接続を確認してください。"
          );
        }
      });
    });

    describe("予期しないエラー", () => {
      it("不明なエラーはUNKNOWN_ERRORとして処理", async () => {
        global.fetch = vi.fn(() => Promise.reject(new Error("Unknown error")));

        try {
          await apiClient("/api/test");
        } catch (error) {
          expect(error).toBeInstanceOf(ApiError);
          const apiError = error as ApiError;
          expect(apiError.status).toBe(0);
          expect(apiError.code).toBe("UNKNOWN_ERROR");
          expect(apiError.message).toBe("Unknown error");
        }
      });
    });
  });
});

/**
 * APIクライアント - fetch APIのラッパー
 *
 * 機能:
 * - JSONレスポンス自動パース
 * - HTTPステータスコードチェック
 * - エラーハンドリング（401/403/404/500/ネットワークエラー）
 */

/**
 * APIリクエストオプション
 */
interface ApiClientOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * クエリパラメータをURLSearchParamsに変換
 */
function buildQueryParams(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

/**
 * APIクライアント - fetchラッパー関数
 *
 * @param path - APIパス（例: "/api/todos"）
 * @param options - リクエストオプション
 * @returns レスポンスJSON
 * @throws {ApiError} HTTPエラーまたはネットワークエラー
 *
 * @example
 * ```ts
 * // GET リクエスト
 * const todos = await apiClient<Todo[]>("/api/todos");
 *
 * // クエリパラメータ付きGET
 * const todos = await apiClient<Todo[]>("/api/todos", {
 *   params: { status: "open", priority: "high" }
 * });
 *
 * // POST リクエスト
 * const newTodo = await apiClient<Todo>("/api/todos", {
 *   method: "POST",
 *   body: JSON.stringify({ title: "New Todo" })
 * });
 * ```
 */
export async function apiClient<T = unknown>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // クエリパラメータ付与
  const queryString = params ? buildQueryParams(params) : "";
  const url = `${path}${queryString}`;

  // デフォルトヘッダー設定
  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: "include", // Cookie送信を有効化（認証用）
    });

    // レスポンスボディをパース（空の場合はnull）
    const contentType = response.headers.get("content-type");
    const hasJsonContent = contentType?.includes("application/json");
    const data = hasJsonContent ? await response.json() : null;

    // HTTPステータスコードチェック
    if (!response.ok) {
      // エラーレスポンスの形式: { code: string, message: string, details?: any }
      const errorCode = data?.code || "UNKNOWN_ERROR";
      const errorMessage =
        data?.message || `HTTP ${response.status}: ${response.statusText}`;
      const errorDetails = data?.details;

      // 401エラー: 認証切れ -> サインインページへリダイレクト
      if (response.status === 401) {
        // クライアントサイドでのみリダイレクト実行
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          window.location.href = `/signin?callbackUrl=${encodeURIComponent(currentPath)}`;
        }
      }

      throw new ApiError(
        response.status,
        errorCode,
        errorMessage,
        errorDetails
      );
    }

    return data as T;
  } catch (error) {
    // ApiErrorはそのままthrow
    if (error instanceof ApiError) {
      throw error;
    }

    // ネットワークエラー（fetch自体の失敗）
    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        "ネットワークエラーが発生しました。インターネット接続を確認してください。"
      );
    }

    // その他の予期しないエラー
    throw new ApiError(
      0,
      "UNKNOWN_ERROR",
      error instanceof Error ? error.message : "予期しないエラーが発生しました"
    );
  }
}

"use client";

import { useEffect, useState } from "react";
import { ErrorCode } from "@/types/error";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// エラーコード別メッセージマッピング
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  [ErrorCode.UNAUTHORIZED]: {
    title: "認証が必要です",
    description: "サインインしてから再度お試しください。",
  },
  [ErrorCode.FORBIDDEN]: {
    title: "アクセスが拒否されました",
    description: "このリソースにアクセスする権限がありません。",
  },
  [ErrorCode.NOT_FOUND]: {
    title: "ページが見つかりません",
    description: "お探しのページは存在しないか、移動した可能性があります。",
  },
  [ErrorCode.INVALID_PARAMETER]: {
    title: "無効なパラメータです",
    description: "リクエストパラメータに問題があります。",
  },
  [ErrorCode.INVALID_BODY]: {
    title: "無効なリクエストです",
    description: "送信されたデータに問題があります。",
  },
  [ErrorCode.INVALID_INPUT]: {
    title: "入力エラー",
    description: "入力内容を確認してください。",
  },
  [ErrorCode.INTERNAL_ERROR]: {
    title: "サーバーエラー",
    description:
      "サーバーで問題が発生しました。しばらくしてから再度お試しください。",
  },
};

const DEFAULT_ERROR_MESSAGE = {
  title: "エラーが発生しました",
  description: "予期しないエラーが発生しました。もう一度お試しください。",
};

export default function Error({ error, reset }: ErrorProps) {
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // エラーオブジェクトからエラーコードを抽出
    const message = error.message;

    // エラーメッセージからエラーコードを検出
    const codeMatch = Object.keys(ErrorCode).find((key) =>
      message.includes(ErrorCode[key as keyof typeof ErrorCode])
    );

    if (codeMatch) {
      setErrorCode(ErrorCode[codeMatch as keyof typeof ErrorCode]);
    }

    // エラー詳細を抽出
    setErrorDetails(error.message);

    // エラーをコンソールに出力
    console.error("Error boundary caught:", error);
  }, [error]);

  const errorMessage = errorCode
    ? ERROR_MESSAGES[errorCode] || DEFAULT_ERROR_MESSAGE
    : DEFAULT_ERROR_MESSAGE;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <div className="text-center max-w-lg">
        {/* エラーアイコン */}
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* エラータイトル */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {errorMessage.title}
        </h1>

        {/* エラー説明 */}
        <p className="text-lg text-gray-600 mb-6">{errorMessage.description}</p>

        {/* エラーコード表示 */}
        {errorCode && (
          <div className="mb-6 p-3 bg-gray-100 rounded-lg inline-block">
            <p className="text-sm text-gray-700">
              エラーコード:{" "}
              <code className="font-mono font-semibold">{errorCode}</code>
            </p>
          </div>
        )}

        {/* エラー詳細 */}
        {errorDetails && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <p className="text-xs font-semibold text-yellow-800 mb-2">
              詳細情報:
            </p>
            <pre className="text-xs text-yellow-700 whitespace-pre-wrap break-words">
              {errorDetails}
            </pre>
            {error.digest && (
              <p className="text-xs text-yellow-700 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            もう一度試す
          </button>
          <a
            href="/todos"
            className="px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            TODOページへ戻る
          </a>
        </div>
      </div>
    </main>
  );
}

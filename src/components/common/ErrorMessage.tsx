import { ErrorCode } from "@/types/error";

interface ErrorMessageProps {
  /** エラーコード */
  code?: string;
  /** エラーメッセージ */
  message: string;
  /** エラー詳細（オプション） */
  details?: string;
  /** 閉じるボタンのコールバック（オプション） */
  onClose?: () => void;
  /** エラーの深刻度 */
  severity?: "error" | "warning" | "info";
}

// エラーコード別のアイコンと色
const ERROR_STYLES = {
  [ErrorCode.UNAUTHORIZED]: { color: "red", icon: "lock" },
  [ErrorCode.FORBIDDEN]: { color: "red", icon: "shield" },
  [ErrorCode.NOT_FOUND]: { color: "yellow", icon: "search" },
  [ErrorCode.INVALID_PARAMETER]: { color: "yellow", icon: "alert" },
  [ErrorCode.INVALID_BODY]: { color: "yellow", icon: "alert" },
  [ErrorCode.INVALID_INPUT]: { color: "yellow", icon: "alert" },
  [ErrorCode.INTERNAL_ERROR]: { color: "red", icon: "error" },
};

// デフォルトスタイル
const DEFAULT_STYLE = { color: "red", icon: "error" };

// 深刻度別のスタイル
const SEVERITY_STYLES = {
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    icon: "text-red-500",
    title: "text-red-900",
    text: "text-red-700",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: "text-yellow-500",
    title: "text-yellow-900",
    text: "text-yellow-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: "text-blue-500",
    title: "text-blue-900",
    text: "text-blue-700",
  },
};

/**
 * エラーメッセージ表示コンポーネント
 *
 * APIエラーやバリデーションエラーを統一的に表示する
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   code="INVALID_INPUT"
 *   message="入力内容に誤りがあります"
 *   details="タイトルは1文字以上必要です"
 *   onClose={() => setError(null)}
 * />
 * ```
 */
export function ErrorMessage({
  code,
  message,
  details,
  onClose,
  severity = "error",
}: ErrorMessageProps) {
  const style = SEVERITY_STYLES[severity];

  // エラーコードに基づいてアイコンを決定
  const getIcon = () => {
    if (!code) return "error";
    const errorStyle =
      ERROR_STYLES[code as keyof typeof ERROR_STYLES] || DEFAULT_STYLE;
    return errorStyle.icon;
  };

  const icon = getIcon();

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-4`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* アイコン */}
        <div className="flex-shrink-0">
          {icon === "lock" && (
            <svg
              className={`h-5 w-5 ${style.icon}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          )}
          {icon === "shield" && (
            <svg
              className={`h-5 w-5 ${style.icon}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          )}
          {icon === "search" && (
            <svg
              className={`h-5 w-5 ${style.icon}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
          {icon === "alert" && (
            <svg
              className={`h-5 w-5 ${style.icon}`}
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
          )}
          {icon === "error" && (
            <svg
              className={`h-5 w-5 ${style.icon}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>

        {/* コンテンツ */}
        <div className="flex-1 min-w-0">
          {/* エラーコード（オプション） */}
          {code && (
            <p
              className={`text-xs font-mono font-semibold ${style.title} mb-1`}
            >
              {code}
            </p>
          )}

          {/* エラーメッセージ */}
          <p className={`text-sm font-medium ${style.title}`}>{message}</p>

          {/* エラー詳細（オプション） */}
          {details && (
            <p className={`text-sm ${style.text} mt-1 whitespace-pre-wrap`}>
              {details}
            </p>
          )}
        </div>

        {/* 閉じるボタン（オプション） */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className={`flex-shrink-0 ${style.icon} hover:opacity-70 transition-opacity`}
            aria-label="エラーを閉じる"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

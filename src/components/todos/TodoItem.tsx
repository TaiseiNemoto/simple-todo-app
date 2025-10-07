import type { Todo, Priority, Status } from "@/types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggleStatus: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

const priorityLabels: Record<Priority, string> = {
  low: "低",
  mid: "中",
  high: "高",
};

const statusLabels: Record<Status, string> = {
  open: "未完了",
  done: "完了",
};

export default function TodoItem({
  todo,
  onToggleStatus,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const formatDate = (dateStr: string) => {
    return dateStr.replace(/-/g, "/");
  };

  return (
    <div className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow border border-gray-100">
      <div className="flex items-start gap-4">
        <input
          type="checkbox"
          checked={todo.status === "done"}
          onChange={() => onToggleStatus(todo.todoId)}
          className="mt-1 w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
        />

        <div className="flex-1 min-w-0">
          <h2
            className={`text-base font-medium mb-1 ${
              todo.status === "done"
                ? "line-through text-gray-400"
                : "text-gray-900"
            }`}
          >
            {todo.title}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            {todo.due && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {formatDate(todo.due.toString())}
              </span>
            )}

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                todo.priority === "high"
                  ? "bg-red-50 text-red-700"
                  : todo.priority === "mid"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-blue-50 text-blue-700"
              }`}
            >
              {priorityLabels[todo.priority]}
            </span>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                todo.status === "done"
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              {statusLabels[todo.status]}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(todo)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            title="編集"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(todo)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="削除"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

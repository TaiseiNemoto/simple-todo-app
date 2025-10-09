"use client";

import { useState, useEffect } from "react";
import type { Todo, Priority, Status } from "@/types/todo";
import Dialog from "@/components/common/Dialog";
import { useTodoMutations } from "@/hooks/useTodoMutations";

interface EditTodoModalProps {
  isOpen: boolean;
  todo: Todo;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EditTodoModal({
  isOpen,
  todo,
  onClose,
  onSuccess,
}: EditTodoModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [dueDate, setDueDate] = useState(
    todo.due ? todo.due.toISOString().split("T")[0] : ""
  );
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [status, setStatus] = useState<Status>(todo.status);
  const [error, setError] = useState<string | null>(null);

  const { updateTodo, mutationState } = useTodoMutations();

  useEffect(() => {
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.due ? todo.due.toISOString().split("T")[0] : "");
    setPriority(todo.priority);
    setStatus(todo.status);
    setError(null);
  }, [todo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);

    await updateTodo(
      todo.todoId,
      {
        title: title.trim(),
        description: description.trim(),
        due: dueDate || undefined,
        priority,
        status,
      },
      {
        onSuccess: () => {
          // モーダルを閉じる
          onClose();
          // 一覧再取得のコールバック
          onSuccess?.();
        },
        onError: (err) => {
          setError(err.message);
        },
      }
    );
  };

  const handleClose = () => {
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.due ? todo.due.toISOString().split("T")[0] : "");
    setPriority(todo.priority);
    setStatus(todo.status);
    setError(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="TODO編集">
      <form onSubmit={handleSave}>
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="edit-title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="TODOのタイトルを入力"
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              autoFocus
              required
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              説明
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細な説明を入力（任意）"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="edit-dueDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              期限
            </label>
            <input
              id="edit-dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="edit-priority"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              優先度
            </label>
            <select
              id="edit-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            >
              <option value="low">低</option>
              <option value="mid">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              ステータス
            </label>
            <select
              id="edit-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            >
              <option value="open">未完了</option>
              <option value="done">完了</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={mutationState.isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!title.trim() || mutationState.isLoading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
          >
            {mutationState.isLoading ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

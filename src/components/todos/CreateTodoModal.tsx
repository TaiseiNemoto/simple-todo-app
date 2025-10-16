"use client";

import { useState } from "react";
import type { Priority } from "@/types/todo";
import Dialog from "@/components/common/Dialog";
import { useTodoMutations } from "@/hooks/useTodoMutations";

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTodoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("mid");
  const [error, setError] = useState<string | null>(null);

  const { createTodo, mutationState } = useTodoMutations();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setError(null);

    await createTodo(
      {
        title: title.trim(),
        description: description.trim(),
        due: dueDate || undefined,
        priority,
      },
      {
        onSuccess: () => {
          // フォームをリセット
          setTitle("");
          setDescription("");
          setDueDate("");
          setPriority("mid");
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
    setTitle("");
    setDescription("");
    setDueDate("");
    setPriority("mid");
    setError(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="新規TODO作成">
      <form onSubmit={handleSave}>
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <div className="p-6 space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
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
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              説明
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="詳細な説明を入力（任意）"
              rows={3}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
            />
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              期限
            </label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              優先度
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
            >
              <option value="low">低</option>
              <option value="mid">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-100">
          <button
            type="button"
            onClick={handleClose}
            disabled={mutationState.isLoading}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!title.trim() || mutationState.isLoading}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 cursor-pointer"
          >
            {mutationState.isLoading ? "保存中..." : "保存"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";

type Priority = "low" | "medium" | "high";
type Status = "incomplete" | "complete";

interface Todo {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  priority: Priority;
  status: Status;
}

interface EditTodoModalProps {
  isOpen: boolean;
  todo: Todo;
  onClose: () => void;
  onSave: (todo: Todo) => void;
}

export default function EditTodoModal({
  isOpen,
  todo,
  onClose,
  onSave,
}: EditTodoModalProps) {
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description);
  const [dueDate, setDueDate] = useState(todo.dueDate || "");
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [status, setStatus] = useState<Status>(todo.status);

  // Update form when todo changes
  useEffect(() => {
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.dueDate || "");
    setPriority(todo.priority);
    setStatus(todo.status);
  }, [todo]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim()) {
      onSave({
        ...todo,
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
        priority,
        status,
      });
    }
  };

  const handleClose = () => {
    // Reset form to original values
    setTitle(todo.title);
    setDescription(todo.description);
    setDueDate(todo.dueDate || "");
    setPriority(todo.priority);
    setStatus(todo.status);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">TODO編集</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Title (Required) */}
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
            />
          </div>

          {/* Description (Optional) */}
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

          {/* Due Date (Optional) */}
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

          {/* Priority (Optional) */}
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
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          {/* Status (Optional) */}
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
              <option value="incomplete">未完了</option>
              <option value="complete">完了</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

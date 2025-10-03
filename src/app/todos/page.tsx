"use client";

import { useState } from "react";
import CreateTodoModal from "@/components/CreateTodoModal";

// Mock data types
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

// Mock data
const initialTodos: Todo[] = [
  {
    id: "1",
    title: "プロジェクト仕様書を作成",
    description: "新規プロジェクトの仕様書を作成する",
    dueDate: "2025-10-05",
    priority: "high",
    status: "incomplete",
  },
  {
    id: "2",
    title: "デザインレビュー",
    description: "UIデザインのレビューを実施",
    dueDate: "2025-10-08",
    priority: "medium",
    status: "incomplete",
  },
  {
    id: "3",
    title: "データベース設計",
    description: "データベーススキーマを設計",
    dueDate: null,
    priority: "low",
    status: "complete",
  },
  {
    id: "4",
    title: "API実装",
    description: "RESTful APIを実装する",
    dueDate: "2025-10-10",
    priority: "high",
    status: "incomplete",
  },
  {
    id: "5",
    title: "テストコード作成",
    description: "ユニットテストを作成",
    dueDate: "2025-10-12",
    priority: "medium",
    status: "complete",
  },
];

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  // Filter todos based on search and filters
  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      searchText === "" ||
      todo.title.toLowerCase().includes(searchText.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || todo.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || todo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Toggle todo completion
  const toggleTodoStatus = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              status: todo.status === "complete" ? "incomplete" : "complete",
            }
          : todo
      )
    );
  };

  // Handle delete
  const handleDelete = () => {
    if (selectedTodo) {
      setTodos(todos.filter((todo) => todo.id !== selectedTodo.id));
      setShowDeleteDialog(false);
      setSelectedTodo(null);
    }
  };

  // Priority label mapping
  const priorityLabels: Record<Priority, string> = {
    low: "低",
    medium: "中",
    high: "高",
  };

  // Status label mapping
  const statusLabels: Record<Status, string> = {
    incomplete: "未完了",
    complete: "完了",
  };

  // Priority color mapping
  const priorityColors: Record<Priority, string> = {
    low: "text-blue-600",
    medium: "text-yellow-600",
    high: "text-red-600",
  };

  // Handler for creating new todo
  const handleCreateTodo = (newTodo: {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    status: Status;
  }) => {
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      dueDate: newTodo.dueDate || null,
      priority: newTodo.priority,
      status: newTodo.status,
    };
    setTodos([todo, ...todos]);
    setShowCreateModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">TODOs</h1>
          <button
            onClick={() => {
              alert("サインアウトしました");
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            サインアウト
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <input
            type="text"
            placeholder="検索..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | Status)}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          >
            <option value="all">すべて</option>
            <option value="incomplete">未完了</option>
            <option value="complete">完了</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as "all" | Priority)
            }
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
          >
            <option value="all">すべて</option>
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap text-sm"
          >
            新規作成
          </button>
        </div>

        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-400 text-sm">TODOが見つかりません</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="bg-white rounded-xl p-5 hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={todo.status === "complete"}
                    onChange={() => toggleTodoStatus(todo.id)}
                    className="mt-1 w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-base font-medium mb-1 ${
                        todo.status === "complete"
                          ? "line-through text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {todo.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      {todo.dueDate && (
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
                          {todo.dueDate}
                        </span>
                      )}

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          todo.priority === "high"
                            ? "bg-red-50 text-red-700"
                            : todo.priority === "medium"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {priorityLabels[todo.priority]}
                      </span>

                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                          todo.status === "complete"
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
                      onClick={() => {
                        setSelectedTodo(todo);
                        setShowEditModal(true);
                      }}
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
                      onClick={() => {
                        setSelectedTodo(todo);
                        setShowDeleteDialog(true);
                      }}
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
            ))
          )}
        </div>
      </main>

      {showCreateModal && (
        <CreateTodoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateTodo}
        />
      )}

      {showEditModal && selectedTodo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              TODO編集
            </h2>
            <p className="text-gray-500 text-sm mb-2">
              編集対象:{" "}
              <strong className="text-gray-900">{selectedTodo.title}</strong>
            </p>
            <p className="text-gray-500 text-sm mb-6">
              ここに編集フォームが表示されます（モック）
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedTodo(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  alert("TODOを更新しました（モック）");
                  setShowEditModal(false);
                  setSelectedTodo(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && selectedTodo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              削除確認
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              「<strong className="text-gray-900">{selectedTodo.title}</strong>
              」を削除してもよろしいですか？
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setSelectedTodo(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

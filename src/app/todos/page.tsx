"use client";

import { useState, useMemo } from "react";
import { signOut } from "next-auth/react";
import CreateTodoModal from "@/components/todos/CreateTodoModal";
import EditTodoModal from "@/components/todos/EditTodoModal";
import TodoHeader from "@/components/todos/TodoHeader";
import TodoFilterBar from "@/components/todos/TodoFilterBar";
import TodoItem from "@/components/todos/TodoItem";
import DeleteConfirmDialog from "@/components/todos/DeleteConfirmDialog";
import { useTodos } from "@/hooks/useTodos";
import { useModalState } from "@/hooks/useModalState";
import type { Priority, Status } from "@/types/todo";
import type { TodoQueryParams } from "@/lib/api/types";

export default function TodosPage() {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>("all");

  // モーダル状態管理
  const {
    modalState,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
  } = useModalState();

  // APIクエリパラメータを作成
  const queryParams = useMemo<TodoQueryParams | undefined>(() => {
    const params: TodoQueryParams = {};

    // 検索テキスト
    if (searchText.trim()) {
      params.q = searchText.trim();
    }

    // ステータスフィルタ
    if (statusFilter !== "all") {
      params.status = statusFilter;
    }

    // 優先度フィルタ
    if (priorityFilter !== "all") {
      params.priority = priorityFilter;
    }

    // デフォルトのソート: 更新日時降順
    params.sortBy = "updatedAt";
    params.sortOrder = "desc";

    return Object.keys(params).length > 0 ? params : undefined;
  }, [searchText, statusFilter, priorityFilter]);

  // TODO一覧取得
  const { todos, isLoading, error, refetch } = useTodos(queryParams);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/signin" });
  };

  const handleToggleSuccess = () => {
    refetch();
  };

  const handleEditSuccess = () => {
    closeModal();
    refetch();
  };

  const handleDeleteSuccess = () => {
    closeModal();
    refetch();
  };

  const handleCreateSuccess = () => {
    closeModal();
    refetch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <TodoHeader onSignOut={handleSignOut} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <TodoFilterBar
          searchText={searchText}
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          onSearchChange={setSearchText}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onCreateClick={openCreateModal}
        />

        {/* ローディング状態 */}
        {isLoading && (
          <div className="bg-white rounded-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="text-gray-600 text-sm mt-4">読み込み中...</p>
          </div>
        )}

        {/* エラー状態 */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 font-medium mb-2">
              エラーが発生しました
            </p>
            <p className="text-red-600 text-sm mb-4">{error.message}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              再試行
            </button>
          </div>
        )}

        {/* TODO一覧 */}
        {!isLoading && !error && (
          <div className="space-y-3">
            {todos.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-400 text-sm">TODOが見つかりません</p>
              </div>
            ) : (
              todos.map((todo) => (
                <TodoItem
                  key={todo.todoId}
                  todo={todo}
                  onEdit={openEditModal}
                  onDelete={openDeleteModal}
                  onToggleSuccess={handleToggleSuccess}
                />
              ))
            )}
          </div>
        )}
      </main>

      <CreateTodoModal
        isOpen={modalState.type === "create"}
        onClose={closeModal}
        onSuccess={handleCreateSuccess}
      />

      {modalState.type === "edit" && modalState.todo && (
        <EditTodoModal
          isOpen={true}
          todo={modalState.todo}
          onClose={closeModal}
          onSuccess={handleEditSuccess}
        />
      )}

      {modalState.type === "delete" && modalState.todo && (
        <DeleteConfirmDialog
          isOpen={true}
          todoId={modalState.todo.todoId}
          todoTitle={modalState.todo.title}
          onClose={closeModal}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}

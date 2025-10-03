"use client";

import { useState } from "react";
import CreateTodoModal from "@/components/todos/CreateTodoModal";
import EditTodoModal from "@/components/todos/EditTodoModal";
import TodoHeader from "@/components/todos/TodoHeader";
import TodoFilterBar from "@/components/todos/TodoFilterBar";
import TodoItem from "@/components/todos/TodoItem";
import DeleteConfirmDialog from "@/components/todos/DeleteConfirmDialog";
import type { Todo, Priority, Status } from "@/types/todo";

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
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);

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

  // Handle sign out
  const handleSignOut = () => {
    alert("サインアウトしました");
  };

  // Handle edit
  const handleEditTodo = (updatedTodo: Todo) => {
    setTodos(
      todos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    );
    setEditingTodo(null);
  };

  // Handle delete
  const handleDeleteConfirm = () => {
    if (deletingTodo) {
      setTodos(todos.filter((todo) => todo.id !== deletingTodo.id));
      setDeletingTodo(null);
    }
  };

  // Handler for creating new todo
  const handleCreateTodo = (newTodo: {
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
  }) => {
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.title,
      description: newTodo.description,
      dueDate: newTodo.dueDate || null,
      priority: newTodo.priority,
      status: "incomplete",
    };
    setTodos([todo, ...todos]);
    setShowCreateModal(false);
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
          onCreateClick={() => setShowCreateModal(true)}
        />

        <div className="space-y-3">
          {filteredTodos.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center">
              <p className="text-gray-400 text-sm">TODOが見つかりません</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggleStatus={toggleTodoStatus}
                onEdit={setEditingTodo}
                onDelete={setDeletingTodo}
              />
            ))
          )}
        </div>
      </main>

      <CreateTodoModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateTodo}
      />

      {editingTodo && (
        <EditTodoModal
          isOpen={!!editingTodo}
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
          onSave={handleEditTodo}
        />
      )}

      {deletingTodo && (
        <DeleteConfirmDialog
          isOpen={!!deletingTodo}
          todoTitle={deletingTodo.title}
          onClose={() => setDeletingTodo(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}

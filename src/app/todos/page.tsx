"use client";

import { useState } from "react";
import CreateTodoModal from "@/components/todos/CreateTodoModal";
import EditTodoModal from "@/components/todos/EditTodoModal";
import TodoHeader from "@/components/todos/TodoHeader";
import TodoFilterBar from "@/components/todos/TodoFilterBar";
import TodoItem from "@/components/todos/TodoItem";
import DeleteConfirmDialog from "@/components/todos/DeleteConfirmDialog";
import type { Todo, Priority, Status } from "@/types/todo";

const initialTodos: Todo[] = [
  {
    todoId: "1",
    userId: "mock-user",
    title: "プロジェクト仕様書を作成",
    description: "新規プロジェクトの仕様書を作成する",
    due: new Date("2025-10-05"),
    priority: "high",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    todoId: "2",
    userId: "mock-user",
    title: "デザインレビュー",
    description: "UIデザインのレビューを実施",
    due: new Date("2025-10-08"),
    priority: "mid",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    todoId: "3",
    userId: "mock-user",
    title: "データベース設計",
    description: "データベーススキーマを設計",
    due: null,
    priority: "low",
    status: "done",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    todoId: "4",
    userId: "mock-user",
    title: "API実装",
    description: "RESTful APIを実装する",
    due: new Date("2025-10-10"),
    priority: "high",
    status: "open",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    todoId: "5",
    userId: "mock-user",
    title: "テストコード作成",
    description: "ユニットテストを作成",
    due: new Date("2025-10-12"),
    priority: "mid",
    status: "done",
    createdAt: new Date(),
    updatedAt: new Date(),
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

  const toggleTodoStatus = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.todoId === id
          ? {
              ...todo,
              status: todo.status === "done" ? "open" : "done",
            }
          : todo
      )
    );
  };

  const handleSignOut = () => {
    alert("サインアウトしました");
  };

  const handleEditTodo = (updatedTodo: Todo) => {
    setTodos(
      todos.map((todo) =>
        todo.todoId === updatedTodo.todoId ? updatedTodo : todo
      )
    );
    setEditingTodo(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingTodo) {
      setTodos(todos.filter((todo) => todo.todoId !== deletingTodo.todoId));
      setDeletingTodo(null);
    }
  };

  const handleCreateTodo = (newTodo: {
    title: string;
    description: string;
    due: Date | null;
    priority: Priority;
  }) => {
    const todo: Todo = {
      todoId: Date.now().toString(),
      userId: "mock-user",
      title: newTodo.title,
      description: newTodo.description,
      due: newTodo.due,
      priority: newTodo.priority,
      status: "open",
      createdAt: new Date(),
      updatedAt: new Date(),
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
                key={todo.todoId}
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

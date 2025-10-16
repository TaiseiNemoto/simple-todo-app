import type { Priority, Status } from "@/types/todo";

interface TodoFilterBarProps {
  searchText: string;
  statusFilter: "all" | Status;
  priorityFilter: "all" | Priority;
  onSearchChange: (text: string) => void;
  onStatusChange: (status: "all" | Status) => void;
  onPriorityChange: (priority: "all" | Priority) => void;
  onCreateClick: () => void;
}

export default function TodoFilterBar({
  searchText,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusChange,
  onPriorityChange,
  onCreateClick,
}: TodoFilterBarProps) {
  return (
    <form
      className="flex flex-col sm:flex-row gap-3 mb-8"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="text"
        placeholder="検索..."
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
      />

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as "all" | Status)}
        className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
      >
        <option value="all">すべて</option>
        <option value="open">未完了</option>
        <option value="done">完了</option>
      </select>

      <select
        value={priorityFilter}
        onChange={(e) => onPriorityChange(e.target.value as "all" | Priority)}
        className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm text-gray-900"
      >
        <option value="all">すべて</option>
        <option value="low">低</option>
        <option value="mid">中</option>
        <option value="high">高</option>
      </select>

      <button
        onClick={onCreateClick}
        className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors whitespace-nowrap text-sm cursor-pointer"
      >
        新規作成
      </button>
    </form>
  );
}

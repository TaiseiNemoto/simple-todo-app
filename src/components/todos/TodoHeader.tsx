interface TodoHeaderProps {
  onSignOut: () => void;
}

export default function TodoHeader({ onSignOut }: TodoHeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">TODOs</h1>
        <button
          onClick={onSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          サインアウト
        </button>
      </div>
    </header>
  );
}

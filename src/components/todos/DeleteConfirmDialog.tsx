"use client";

import { useState } from "react";
import Dialog from "@/components/common/Dialog";
import { useTodoMutations } from "@/hooks/useTodoMutations";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  todoId: string;
  todoTitle: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  todoId,
  todoTitle,
  onClose,
  onSuccess,
}: DeleteConfirmDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const { deleteTodo, mutationState } = useTodoMutations();

  const handleConfirm = async () => {
    setError(null);

    await deleteTodo(todoId, {
      onSuccess: () => {
        // ダイアログを閉じる
        onClose();
        // 一覧再取得のコールバック
        onSuccess?.();
      },
      onError: (err) => {
        setError(err.message);
      },
    });
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="削除確認">
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <p className="text-gray-500 text-sm mb-6">
          「<strong className="text-gray-900">{todoTitle}</strong>
          」を削除してもよろしいですか?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={handleClose}
            disabled={mutationState.isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={mutationState.isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {mutationState.isLoading ? "削除中..." : "削除"}
          </button>
        </div>
      </div>
    </Dialog>
  );
}

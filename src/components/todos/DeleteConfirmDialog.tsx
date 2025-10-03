import Dialog from "@/components/common/Dialog";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  todoTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  todoTitle,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="削除確認">
      <div className="p-6">
        <p className="text-gray-500 text-sm mb-6">
          「<strong className="text-gray-900">{todoTitle}</strong>
          」を削除してもよろしいですか?
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            削除
          </button>
        </div>
      </div>
    </Dialog>
  );
}

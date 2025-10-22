/**
 * モーダル状態管理カスタムフック
 *
 * 複数のモーダル（作成、編集、削除）の状態を一元管理し、
 * 複数モーダルの同時表示を防止する
 */

import { useReducer } from "react";
import type { Todo } from "@/types/todo";

/**
 * モーダルタイプ定義
 */
export type ModalType = "create" | "edit" | "delete" | null;

/**
 * モーダル状態
 */
export interface ModalState {
  /** 現在開いているモーダルのタイプ */
  type: ModalType;
  /** 編集または削除対象のTODO（createの場合はnull） */
  todo: Todo | null;
}

/**
 * モーダル操作のアクション
 */
type ModalAction =
  | { type: "OPEN_CREATE" }
  | { type: "OPEN_EDIT"; payload: Todo }
  | { type: "OPEN_DELETE"; payload: Todo }
  | { type: "CLOSE" };

/**
 * モーダル状態の初期値
 */
const initialState: ModalState = {
  type: null,
  todo: null,
};

/**
 * モーダル状態のリデューサー
 */
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN_CREATE":
      return { type: "create", todo: null };
    case "OPEN_EDIT":
      return { type: "edit", todo: action.payload };
    case "OPEN_DELETE":
      return { type: "delete", todo: action.payload };
    case "CLOSE":
      return initialState;
    default:
      return state;
  }
}

/**
 * モーダル状態管理フックの返り値型
 */
export interface UseModalStateResult {
  /** 現在のモーダル状態 */
  modalState: ModalState;
  /** 作成モーダルを開く */
  openCreateModal: () => void;
  /** 編集モーダルを開く */
  openEditModal: (todo: Todo) => void;
  /** 削除確認ダイアログを開く */
  openDeleteModal: (todo: Todo) => void;
  /** モーダルを閉じる */
  closeModal: () => void;
}

/**
 * モーダル状態管理カスタムフック
 *
 * @returns モーダル状態と操作関数
 *
 * @example
 * ```tsx
 * function TodosPage() {
 *   const { modalState, openCreateModal, openEditModal, openDeleteModal, closeModal } = useModalState();
 *
 *   return (
 *     <div>
 *       <button onClick={openCreateModal}>新規作成</button>
 *       <CreateTodoModal
 *         isOpen={modalState.type === "create"}
 *         onClose={closeModal}
 *       />
 *       <EditTodoModal
 *         isOpen={modalState.type === "edit"}
 *         todo={modalState.todo}
 *         onClose={closeModal}
 *       />
 *       <DeleteConfirmDialog
 *         isOpen={modalState.type === "delete"}
 *         todo={modalState.todo}
 *         onClose={closeModal}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
export function useModalState(): UseModalStateResult {
  const [modalState, dispatch] = useReducer(modalReducer, initialState);

  const openCreateModal = () => {
    dispatch({ type: "OPEN_CREATE" });
  };

  const openEditModal = (todo: Todo) => {
    dispatch({ type: "OPEN_EDIT", payload: todo });
  };

  const openDeleteModal = (todo: Todo) => {
    dispatch({ type: "OPEN_DELETE", payload: todo });
  };

  const closeModal = () => {
    dispatch({ type: "CLOSE" });
  };

  return {
    modalState,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
  };
}

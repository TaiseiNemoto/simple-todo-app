# TODO編集エラー修正計画

## 問題の概要

- TODO編集ボタンクリック時に `todo.due.toISOString is not a function` エラー発生
- 原因: APIレスポンスの日付フィールドは文字列だが、型定義は `Date` 型

## タスクチェックリスト

### 型定義の修正

- [x] `src/types/todo.ts` 修正
  - [x] `due: Date | null` → `due: string | null`
  - [x] `createdAt: Date` → `createdAt: string`
  - [x] `updatedAt: Date` → `updatedAt: string`

### EditTodoModalの修正

- [x] `src/components/todos/EditTodoModal.tsx` 修正
  - [x] 24行目: `todo.due.toISOString().split("T")[0]` → `todo.due.split("T")[0]`
  - [x] 35行目: `todo.due.toISOString().split("T")[0]` → `todo.due.split("T")[0]`
  - [x] 73行目: `todo.due.toISOString().split("T")[0]` → `todo.due.split("T")[0]`

### 動作確認

- [x] TODO編集ボタンクリックでモーダルが開く
- [x] 期限フィールドが正しく表示される
- [x] 編集保存が正常に動作する

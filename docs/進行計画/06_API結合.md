# 6. 開発（API結合）実装計画

## タスクチェックリスト

### 6.1 型整合性の確認・修正

#### 6.1.1 Prismaスキーマとフロントエンド型の整合

- [x] `src/types/todo.ts` 修正
  - [x] `status` 型修正: `"incomplete" | "complete"` → `"open" | "done"`（Prismaと一致）
  - [x] `priority` 型修正: `"low" | "medium" | "high"` → `"low" | "mid" | "high"`（Prismaと一致）
  - [x] フィールド名の確認
    - `todoId`, `userId`, `title`, `description`, `status`, `priority`, `due`, `createdAt`, `updatedAt`

#### 6.1.2 コンポーネントの型修正

- [x] すべてのコンポーネントで型定義を更新
  - [x] `src/app/todos/page.tsx`
  - [x] `src/components/todos/CreateTodoModal.tsx`
  - [x] `src/components/todos/EditTodoModal.tsx`
  - [x] `src/components/todos/TodoItem.tsx`
  - [x] `src/components/todos/TodoFilterBar.tsx`

### 6.2 APIクライアント基盤構築

#### 6.2.1 fetchラッパー作成

- [x] `src/lib/api/client.ts` 作成
  - [x] `apiClient()` 関数実装
    - [x] JSONレスポンス自動パース
    - [x] HTTPステータスコードチェック
    - [x] クエリパラメータ自動付与
  - [x] エラーハンドリング
    - [x] 401: 未認証エラー → サインイン画面へリダイレクト
    - [x] 403: 権限エラー → エラーメッセージ表示
    - [x] 404: Not Found → エラーメッセージ表示
    - [x] 500: サーバーエラー → エラー画面へ遷移
    - [x] ネットワークエラー → エラーメッセージ表示

#### 6.2.2 API型定義

- [x] `src/lib/api/types.ts` 作成
  - [x] APIレスポンス型定義
    - `ApiResponse<T>`: 成功レスポンス
    - `ApiError`: エラーレスポンス（code, message, details）
  - [x] APIリクエスト型定義
    - `CreateTodoRequest`
    - `UpdateTodoRequest`
    - `TodoQueryParams`

#### 6.2.3 TODO API関数

- [x] `src/lib/api/todos.ts` 作成
  - [x] `getTodos(params?: TodoQueryParams): Promise<Todo[]>`
    - GET `/api/todos` 呼び出し
    - クエリパラメータ変換
  - [x] `getTodo(id: string): Promise<Todo>`
    - GET `/api/todos/[id]` 呼び出し
  - [x] `createTodo(data: CreateTodoRequest): Promise<Todo>`
    - POST `/api/todos` 呼び出し
  - [x] `updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo>`
    - PATCH `/api/todos/[id]` 呼び出し
  - [x] `deleteTodo(id: string): Promise<void>`
    - DELETE `/api/todos/[id]` 呼び出し

### 6.3 カスタムフック実装

#### 6.3.1 TODO一覧取得フック

- [x] `src/hooks/useTodos.ts` 作成
  - [x] `useTodos(params?: TodoQueryParams)` 実装
    - 一覧データ取得
    - ローディング状態管理
    - エラー状態管理
    - 自動再取得機能（オプショナル）
    - 返り値: `{ todos, isLoading, error, refetch }`

#### 6.3.2 TODO操作フック

- [x] `src/hooks/useTodoMutations.ts` 作成
  - [x] `useTodoMutations()` 実装
    - `createTodo`: 新規作成処理
    - `updateTodo`: 更新処理
    - `deleteTodo`: 削除処理
    - `toggleStatus`: ステータス切替処理
    - 楽観的UI更新（オプショナル）
    - エラーハンドリング
    - 成功時のコールバック

### 6.4 認証連携実装

#### 6.4.1 認証ガード

- [x] ミドルウェア作成・拡張（`src/middleware.ts`）
  - [x] 未認証時の `/todos` アクセス → `/signin` リダイレクト
  - [x] 認証済み時の `/signin` アクセス → `/todos` リダイレクト
  - [x] パブリックパス設定（`/api/auth/*`）

#### 6.4.2 サインアウト実装

- [x] `src/app/todos/page.tsx` 修正
  - [x] サインアウトボタンのハンドラー実装
  - [x] `signOut()` 関数呼び出し（next-auth）
  - [x] サインアウト後 `/signin` へリダイレクト

#### 6.4.3 401エラーハンドリング

- [x] APIクライアントで401エラー検出時
  - [x] セッション無効化（リダイレクトにより自動処理）
  - [x] `/signin` へリダイレクト
  - [x] エラーメッセージ表示（オプショナル）

### 6.5 画面とAPIの結合

#### 6.5.1 TODO一覧画面結合

- [x] `src/app/todos/page.tsx` 修正
  - [x] モックデータ削除
  - [x] `useTodos()` フック使用
  - [x] ローディング状態表示
  - [x] エラー状態表示
  - [x] フィルタパラメータ連携
    - 検索テキスト → `q` パラメータ
    - ステータス → `status` パラメータ
    - 優先度 → `priority` パラメータ

#### 6.5.2 TODO新規作成結合

- [ ] `src/components/todos/CreateTodoModal.tsx` 修正
  - [ ] `useTodoMutations()` フック使用
  - [ ] `createTodo()` 関数呼び出し
  - [ ] 成功時の処理
    - モーダルクローズ
    - 一覧再取得（`refetch()`）
    - 成功メッセージ表示（オプショナル）
  - [ ] エラー時の処理
    - エラーメッセージ表示
    - モーダルは開いたまま

#### 6.5.3 TODO編集結合

- [ ] `src/components/todos/EditTodoModal.tsx` 修正
  - [ ] `useTodoMutations()` フック使用
  - [ ] `updateTodo()` 関数呼び出し
  - [ ] 成功時の処理
    - モーダルクローズ
    - 一覧再取得
    - 成功メッセージ表示（オプショナル）
  - [ ] エラー時の処理
    - エラーメッセージ表示
    - モーダルは開いたまま

#### 6.5.4 TODO削除結合

- [ ] `src/components/todos/DeleteConfirmDialog.tsx` 修正
  - [ ] `useTodoMutations()` フック使用
  - [ ] `deleteTodo()` 関数呼び出し
  - [ ] 成功時の処理
    - ダイアログクローズ
    - 一覧再取得
    - 成功メッセージ表示（オプショナル）
  - [ ] エラー時の処理
    - エラーメッセージ表示

#### 6.5.5 ステータス切替結合

- [ ] `src/components/todos/TodoItem.tsx` 修正
  - [ ] `useTodoMutations()` フック使用
  - [ ] `toggleStatus()` 関数呼び出し
  - [ ] 楽観的UI更新（即座にチェック状態変更）
  - [ ] エラー時はロールバック

### 6.6 エラーハンドリング統合

#### 6.6.1 グローバルエラーハンドラー

- [ ] `src/app/error.tsx` 確認・拡張
  - [ ] APIエラー情報の表示
  - [ ] エラーコード別メッセージ
  - [ ] リトライボタン追加（オプショナル）

#### 6.6.2 エラー表示コンポーネント

- [ ] `src/components/common/ErrorMessage.tsx` 作成
  - [ ] エラーメッセージ表示UI
  - [ ] エラーコード別スタイリング
  - [ ] 閉じるボタン

### 6.7 テスト実装

#### 6.7.1 APIクライアント単体テスト

- [ ] `src/lib/api/client.test.ts` 作成
  - [ ] fetchラッパーのテスト
  - [ ] エラーハンドリングのテスト
  - [ ] MSWでモックレスポンス設定

#### 6.7.2 TODO API関数テスト

- [ ] `src/lib/api/todos.test.ts` 作成
  - [ ] 各API関数の正常系テスト
  - [ ] エラー系テスト
  - [ ] MSWでモックレスポンス設定

#### 6.7.3 カスタムフックテスト

- [ ] `src/hooks/useTodos.test.ts` 作成
  - [ ] データ取得テスト
  - [ ] ローディング状態テスト
  - [ ] エラー状態テスト
- [ ] `src/hooks/useTodoMutations.test.ts` 作成
  - [ ] 各操作関数のテスト
  - [ ] 成功時コールバックテスト
  - [ ] エラーハンドリングテスト

#### 6.7.4 結合テスト（手動）

- [ ] サインイン → TODO一覧表示
- [ ] TODO新規作成 → 一覧に反映
- [ ] TODO編集 → 一覧に反映
- [ ] TODO削除 → 一覧から削除
- [ ] ステータス切替 → 即座に反映
- [ ] フィルタ動作確認
  - [ ] 検索テキスト
  - [ ] ステータスフィルタ
  - [ ] 優先度フィルタ
- [ ] エラーケース確認
  - [ ] 未認証アクセス → サインイン画面へ
  - [ ] 他人のTODO編集 → 403エラー
  - [ ] 存在しないTODO → 404エラー
  - [ ] ネットワークエラー → エラーメッセージ
- [ ] サインアウト → サインイン画面へ

### 6.8 ドキュメント更新

- [ ] `CLAUDE.md` 更新
  - [ ] API結合完了セクション追加
  - [ ] カスタムフック使用方法追加
  - [ ] エラーハンドリング方針追加
  - [ ] 実装状況更新
- [ ] `README.md` 更新
  - [ ] 実装状況更新（フロントエンド完了）
  - [ ] 動作確認手順追加

---

## 実装順序の推奨

1. **型整合性確認・修正**（6.1）
   - Prismaスキーマとフロントエンド型の整合
   - 先に型を統一しておくことで後続作業がスムーズ

2. **APIクライアント基盤構築**（6.2）
   - fetchラッパー → API型定義 → TODO API関数
   - 基盤ができれば並行作業可能

3. **カスタムフック実装**（6.3）
   - 一覧取得フック → 操作フック
   - APIクライアントに依存

4. **認証連携実装**（6.4）
   - ミドルウェア → サインアウト → 401エラーハンドリング
   - 画面結合前に完了させる

5. **画面とAPIの結合**（6.5）
   - 一覧画面 → 新規作成 → 編集 → 削除 → ステータス切替
   - 1つずつ動作確認しながら進める

6. **エラーハンドリング統合**（6.6）
   - 各画面結合後に実施
   - グローバルエラーハンドラー → エラー表示コンポーネント

7. **テスト**（6.7）
   - APIクライアント → TODO API関数 → カスタムフック → 結合テスト（手動）
   - 自動テストを実装し、手動テストで総合確認

8. **ドキュメント更新**（6.8）
   - 実装完了後に更新

---

## 技術方針

### 状態管理

- **useStateのみを使用**
  - シンプルな実装
  - プロジェクト規模に適切
  - 必要に応じて後から移行可能

### エラー表示

- **インラインエラーメッセージ**
  - 各コンポーネント内で表示
  - シンプル実装
  - 共通ErrorMessageコンポーネント使用

### テスト

- **自動テスト実施**（E2Eを除く）
  - APIクライアント単体テスト
  - TODO API関数テスト
  - カスタムフックテスト
  - 結合テスト（手動）

---

## 完了条件

- [ ] すべての必須チェックリスト項目が完了
- [ ] 型整合性が確保されている（Prismaスキーマと一致）
- [ ] すべてのCRUD操作が実際のAPIと連携
- [ ] 認証フローが正しく機能（未認証 → サインイン画面）
- [ ] エラーハンドリングが機能（401/403/404/500）
- [ ] 自動テストがすべてパス
- [ ] 手動結合テストがすべてパス
- [ ] ドキュメントが最新化

---

## 備考

- **段階的実装**: 一度にすべて実装せず、1機能ずつ動作確認しながら進める
- **エラーハンドリング**: 401エラー時のリダイレクトは最優先で実装
- **型安全性**: TypeScriptの型チェックを活用し、実行時エラーを最小化
- **ユーザー体験**: ローディング状態、エラーメッセージを適切に表示

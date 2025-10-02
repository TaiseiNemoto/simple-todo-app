# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

GitHub OAuth認証を使用したシンプルなTODOアプリケーション。技術検証を目的とし、ローカル環境で動作する。

### 技術スタック

- フレームワーク: Next.js 15（App Router）
- UI: Tailwind CSS v4
- 認証: Auth.js（GitHub OAuth）
- データベース: MySQL（Prisma経由）
- テスト: Vitest、React Testing Library、MSW
- 開発環境: Docker（予定）

## 開発コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# Lint実行
npm run lint
```

## アーキテクチャ

### ディレクトリ構成

- `src/app/`: Next.js App Router（ページ、レイアウト、APIルート）
- `docs/`: 要件定義、画面設計、API設計、DB設計などのドキュメント
- パスエイリアス: `@/*` → `src/*`

### 認証フロー

- **認証方式**: GitHub OAuth（Auth.js使用）
- **セッション**: Cookieベース（`getServerSession`で検証）
- **認可**: すべてのTODO APIで認証必須。`todo.userId === session.user.id`を必須チェック
- **未認証時**: UI→サインイン画面へリダイレクト、API→`401 UNAUTHORIZED`

### データモデル

#### User

- `userId` (PK): UUID
- `githubId` (UNIQUE): GitHub数値ID
- `name`: 表示名
- `createdAt`, `updatedAt`

#### Todo

- `todoId` (PK): UUID
- `userId` (FK): User.userId（CASCADE削除）
- `title` (必須): 120文字まで
- `description`: TEXT、空文字可
- `status`: `"open"` | `"done"`（デフォルト: `"open"`）
- `priority`: `"low"` | `"mid"` | `"high"`（デフォルト: `"mid"`）
- `due`: datetime（任意）
- `createdAt`, `updatedAt`

**リレーション**: User (1) — (N) Todo

### API エンドポイント

| ID     | パス             | メソッド | 説明                                                                                         |
| ------ | ---------------- | -------- | -------------------------------------------------------------------------------------------- |
| API-01 | `/api/todos`     | GET      | TODO一覧取得（クエリ: `status`, `priority`, `dueFrom`, `dueTo`, `q`, `sortBy`, `sortOrder`） |
| API-02 | `/api/todos`     | POST     | TODO新規作成                                                                                 |
| API-03 | `/api/todos/:id` | GET      | TODO単体取得                                                                                 |
| API-04 | `/api/todos/:id` | PATCH    | TODO更新                                                                                     |
| API-05 | `/api/todos/:id` | DELETE   | TODO削除                                                                                     |

**共通**: すべてのAPIで認証必須、本人のTODOのみ操作可能

### エラーハンドリング

- `401 UNAUTHORIZED`: 未認証（`code: UNAUTHORIZED`）
- `403 FORBIDDEN`: 所有者不一致（`code: FORBIDDEN`）
- `404 NOT_FOUND`: リソース不存在（`code: NOT_FOUND`）
- `400 BAD_REQUEST`: バリデーションエラー（`code: INVALID_*`）

共通エラーレスポンス形式: `{ code: string, message: string, details?: any }`

### インデックス設計

- すべての検索は`userId`を先頭とする複合インデックス使用
- `(userId, updatedAt)`: デフォルト一覧並び
- `(userId, status)`, `(userId, priority)`, `(userId, due)`: フィルタ用
- FULLTEXT `(title, description)`: キーワード検索用

## 重要な設計方針

### バリデーション

- タイトル: 必須、1〜120文字
- ステータス: `"open"` | `"done"`のみ
- 優先度: `"low"` | `"mid"` | `"high"`のみ
- 期限: `YYYY-MM-DD`形式でUTC 00:00に正規化、またはISO8601形式

### セキュリティ

- Cookie: `Secure`, `HttpOnly`, `SameSite=Lax/Strict`
- OAuth スコープ: 最小限（`read:user`程度）
- 環境変数: GitHub Client ID/Secret は `.env` で管理（`.env.example` にテンプレート）

## Context7の使用

コード生成、セットアップ・設定手順、ライブラリ/APIドキュメントが必要な場合は、常にContext7を使用すること。明示的に依頼されなくても、Context7 MCPツール（`resolve-library-id`と`get-library-docs`）を自動的に使用する。

## ドキュメント参照

詳細な設計は `docs/` ディレクトリを参照:

- [要件定義.md](docs/要件定義.md)
- [DB設計.md](docs/DB設計.md)
- [認証設計.md](docs/認証設計.md)
- [API設計/](docs/API設計/)
- [画面設計/](docs/画面設計/)

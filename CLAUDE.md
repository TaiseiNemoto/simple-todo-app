# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

GitHub OAuth認証を使用したシンプルなTODOアプリケーション。技術検証を目的とし、ローカル環境で動作する。

### 技術スタック

- **フレームワーク**: Next.js 15（App Router）
- **UI**: Tailwind CSS v4
- **認証**: Auth.js v5（next-auth beta、GitHub OAuth）
- **データベース**: MySQL（Prisma ORM経由）
- **バリデーション**: Zod
- **テスト**: Vitest、React Testing Library、MSW
- **開発環境**: Docker（予定）

### 実装状況

- ✅ データベースモデル（User、Todo）
- ✅ 認証基盤（GitHub OAuth、セッション管理）
- ✅ バックエンドAPI（全5エンドポイント）
- ✅ バリデーション（Zodスキーマ）
- ✅ エラーハンドリング（共通エラーレスポンス）
- ✅ 単体テスト（バリデーション、認証）
- ⚠️ フロントエンド（未実装）

## 開発コマンド

### 基本コマンド

```bash
# 開発サーバー起動（Turbopack使用、http://localhost:3000）
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start
```

### コード品質チェック

```bash
# Lint実行
npm run lint

# 型チェック
npm run type-check

# 型チェック（監視モード）
npm run type-check:watch

# 型チェック + Lint
npm run validate

# コードフォーマット
npm run format

# フォーマットチェック（CI用）
npm run format:check
```

### テスト

```bash
# 全テスト実行（監視モード）
npm run test

# 特定のテストファイルのみ実行
npm run test src/lib/validations/todo.test.ts
npm run test src/lib/auth.test.ts

# テストUI起動（ブラウザで結果確認）
npm run test:ui

# カバレッジ付きテスト
npm run test:coverage
```

### データベース操作

```bash
# Prisma Studio起動（データベースGUI）
npx prisma studio

# Prismaクライアント生成（schema変更後に必須）
npx prisma generate

# マイグレーション実行（開発環境）
npx prisma migrate dev

# マイグレーション作成のみ（実行なし）
npx prisma migrate dev --create-only

# マイグレーションリセット（全データ削除）
npx prisma migrate reset
```

## アーキテクチャ

### ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # APIルート
│   │   ├── auth/          # Auth.js認証エンドポイント
│   │   └── todos/         # TODO CRUD API
│   ├── page.tsx           # トップページ
│   └── layout.tsx         # ルートレイアウト
├── lib/                   # 共通ユーティリティ
│   ├── auth.ts            # 認証ヘルパー（requireAuth等）
│   ├── prisma.ts          # Prismaクライアントシングルトン
│   ├── errors.ts          # エラーレスポンス生成関数
│   └── validations/       # Zodバリデーションスキーマ
│       └── todo.ts        # TODO関連のスキーマ
├── types/                 # 型定義
│   └── error.ts           # エラー型、エラーコード定数
├── auth.ts                # Auth.js設定（callbacks、session等）
└── components/            # Reactコンポーネント（予定）

prisma/
└── schema.prisma          # データベーススキーマ定義

docs/                      # 設計ドキュメント
├── 要件定義.md
├── DB設計.md
├── 認証設計.md
├── API設計/
└── 画面設計/
```

**重要なパターン**:

- **パスエイリアス**: `@/*` → `src/*`
- **認証チェック**: 全API冒頭で`requireAuth()`を呼び出し
- **エラーレスポンス**: `src/lib/errors.ts`の関数を使用（`NextResponse.json(errorResponse(...), { status })`）
- **Prismaクライアント**: `src/lib/prisma.ts`からインポート（シングルトンパターン）

### 認証フロー

**実装の仕組み**:

1. **Auth.js設定**（`src/auth.ts`）:
   - GitHub OAuthプロバイダー設定
   - `callbacks.signIn`: GitHub認証成功時にUserレコードをupsert（`githubId`でユーザー特定）
   - `callbacks.jwt`: JWTトークンに`userId`（内部UUID）を追加
   - `callbacks.session`: セッションオブジェクトに`user.id`を含める

2. **認証チェック**（`src/lib/auth.ts`の`requireAuth()`）:
   - `auth()`でセッション取得
   - セッションがない、または`user.id`がない場合は`401 UNAUTHORIZED`エラーをthrow
   - 成功時は`{ userId: string }`を返す

3. **所有者チェック**（各APIで実施）:
   - TODOを取得後、`todo.userId === session.user.id`を検証
   - 不一致の場合は`403 FORBIDDEN`エラー

**セッション詳細**:

- **ストレージ**: Cookieベース（JWTトークン）
- **Cookie名**: `next-auth.session-token`（または`__Secure-next-auth.session-token`）
- **Cookie設定**: `httpOnly: true`, `secure: true`, `sameSite: "lax"`
- **セッション取得**: `auth()`関数（RSC/Route Handler両対応）

**未認証時の動作**:

- **API**: `401 UNAUTHORIZED`（`requireAuth()`がエラーをthrow）
- **UI**: サインイン画面へリダイレクト（予定）

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

**エラーレスポンス形式**: `{ code: string, message: string, details?: any }`

**実装済みエラーコード**（`src/types/error.ts`で定義）:

- `UNAUTHORIZED`: 未認証（401）
- `FORBIDDEN`: 所有者不一致・権限なし（403）
- `NOT_FOUND`: リソース不存在（404）
- `INVALID_PARAMETER`: クエリパラメータバリデーションエラー（400）
- `INVALID_BODY`: リクエストボディバリデーションエラー（400）
- `INVALID_INPUT`: 汎用バリデーションエラー（400）
- `INTERNAL_ERROR`: 内部サーバーエラー（500）

**エラー生成関数**（`src/lib/errors.ts`）:

```typescript
// 使用例
return NextResponse.json(unauthorizedError("認証が必要です"), { status: 401 });

return NextResponse.json(notFoundError("TODOが見つかりません"), {
  status: 404,
});

// Zodエラー付き
return NextResponse.json(
  invalidParameterError("無効なクエリパラメータです", error.issues),
  { status: 400 }
);
```

### インデックス設計

- すべての検索は`userId`を先頭とする複合インデックス使用
- `(userId, updatedAt)`: デフォルト一覧並び
- `(userId, status)`, `(userId, priority)`, `(userId, due)`: フィルタ用
- FULLTEXT `(title, description)`: キーワード検索用

## 重要な設計方針

### バリデーション（Zodスキーマ: `src/lib/validations/todo.ts`）

**TODO作成・更新**:

- `title`: 必須、1〜120文字（トリム後）
- `description`: 0〜2000文字、省略時は空文字
- `status`: `"open"` | `"done"`のみ（デフォルト: `"open"`）
- `priority`: `"low"` | `"mid"` | `"high"`のみ（デフォルト: `"mid"`）
- `due`: `YYYY-MM-DD`またはISO8601形式、日付のみの場合はUTC 00:00に正規化

**TODO一覧クエリ**:

- `sortBy`: `"updatedAt"` | `"createdAt"` | `"due"` | `"priority"`（デフォルト: `"updatedAt"`）
- `sortOrder`: `"asc"` | `"desc"`（デフォルト: `"desc"`）
- `dueFrom`: `YYYY-MM-DD`またはISO8601形式、UTC 00:00に正規化
- `dueTo`: `YYYY-MM-DD`またはISO8601形式、UTC 23:59:59.999に正規化

**バリデーションエラー処理**:

```typescript
const result = todoQuerySchema.safeParse(params);
if (!result.success) {
  return NextResponse.json(
    invalidParameterError("無効なクエリパラメータです", result.error.issues),
    { status: 400 }
  );
}
```

### セキュリティ

- **Cookie設定**: `Secure`, `HttpOnly`, `SameSite=Lax`
- **OAuth スコープ**: 最小限（GitHub: `read:user`程度）
- **環境変数管理**: `.env.local`で管理、`.env.example`にテンプレート
- **認可チェック**: すべてのTODO操作で所有者確認必須
- **SQL Injection対策**: Prisma ORM使用により自動対応

## API実装パターン

### 典型的なRoute Handlerの構造

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { todoSchema } from "@/lib/validations/todo";
import { unauthorizedError, notFoundError, forbiddenError } from "@/lib/errors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 認証チェック
    const { userId } = await requireAuth();

    // 2. パラメータ取得
    const { id } = await params;

    // 3. データ取得
    const todo = await prisma.todo.findUnique({
      where: { todoId: id },
    });

    // 4. 存在チェック
    if (!todo) {
      return NextResponse.json(notFoundError("TODOが見つかりません"), {
        status: 404,
      });
    }

    // 5. 所有者チェック
    if (todo.userId !== userId) {
      return NextResponse.json(
        forbiddenError("このTODOにアクセスする権限がありません"),
        { status: 403 }
      );
    }

    // 6. レスポンス返却
    return NextResponse.json(todo);
  } catch (error) {
    // requireAuth()がthrowしたエラーをキャッチ
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(unauthorizedError("認証が必要です"), {
        status: 401,
      });
    }
    throw error;
  }
}
```

### バリデーション付きPOST/PATCHの例

```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await requireAuth();

    const body = await request.json();
    const result = createTodoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        invalidBodyError("無効なリクエストボディです", result.error.issues),
        { status: 400 }
      );
    }

    const todo = await prisma.todo.create({
      data: {
        ...result.data,
        userId,
      },
    });

    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    // エラーハンドリング
  }
}
```

## 環境変数

必須の環境変数（`.env.local`に設定）:

- `DATABASE_URL`: MySQL接続URL（例: `mysql://user:password@localhost:3306/todo_db`）
- `AUTH_SECRET`: Auth.jsセッション暗号化キー（`openssl rand -base64 32`で生成）
- `AUTH_GITHUB_ID`: GitHub OAuth AppのClient ID
- `AUTH_GITHUB_SECRET`: GitHub OAuth AppのClient Secret

## Context7の使用

コード生成、セットアップ・設定手順、ライブラリ/APIドキュメントが必要な場合は、Context7 MCPツール（`resolve-library-id`と`get-library-docs`）を積極的に使用する。

## ドキュメント参照

詳細な設計は`docs/`ディレクトリを参照:

- [要件定義.md](docs/要件定義.md) - プロジェクト全体の要件
- [DB設計.md](docs/DB設計.md) - データモデル、ER図、インデックス設計
- [認証設計.md](docs/認証設計.md) - Auth.js実装詳細
- [API設計/](docs/API設計/) - 各APIエンドポイントの詳細仕様
  - [エンドポイント一覧.md](docs/API設計/エンドポイント一覧.md)
  - [共通エラーレスポンス.md](docs/API設計/共通エラーレスポンス.md)
  - [API-01.md](docs/API設計/API-01.md) 〜 [API-05.md](docs/API設計/API-05.md)
- [画面設計/](docs/画面設計/) - UI設計（予定）
- [進行計画/](docs/進行計画/) - 開発フェーズごとのタスク管理

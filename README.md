# Simple TODO App

GitHub OAuth認証を使用したシンプルなTODOアプリケーション。技術検証を目的とし、ローカル環境で動作します。

## 技術スタック

- **フレームワーク**: Next.js 15（App Router）
- **UI**: Tailwind CSS v4
- **認証**: Auth.js（GitHub OAuth）
- **データベース**: MySQL（Prisma経由）
- **テスト**: Vitest、React Testing Library、MSW
- **開発環境**: Docker（予定）

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd simple-todo-app
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.example`をコピーして`.env.local`を作成し、必要な値を設定します。

```bash
cp .env.example .env.local
```

#### 環境変数の説明

| 変数名               | 説明                             | 例                                             |
| -------------------- | -------------------------------- | ---------------------------------------------- |
| `DATABASE_URL`       | MySQL接続URL                     | `mysql://user:password@localhost:3306/todo_db` |
| `AUTH_SECRET`        | Auth.jsのセッション暗号化キー    | `openssl rand -base64 32`で生成                |
| `AUTH_GITHUB_ID`     | GitHub OAuth App のClient ID     | GitHubで取得                                   |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App のClient Secret | GitHubで取得                                   |

#### AUTH_SECRETの生成

```bash
openssl rand -base64 32
```

#### GitHub OAuth Appの設定

1. [GitHub Developer Settings](https://github.com/settings/developers)にアクセス
2. "New OAuth App"をクリック
3. 以下の情報を入力:
   - **Application name**: Simple TODO App (Local)
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Client IDとClient Secretを`.env.local`に設定

### 4. データベースのセットアップ

MySQLサーバーを起動し、Prismaでマイグレーションを実行します。

```bash
# Prismaクライアントの生成
npx prisma generate

# マイグレーションの実行
npx prisma migrate dev
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

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

# コードフォーマット
npm run format

# フォーマットチェック
npm run format:check

# 型チェック
npm run type-check

# テスト実行
npm run test

# テストUI起動
npm run test:ui

# カバレッジ付きテスト
npm run test:coverage

# Prisma Studio起動（データベースGUI）
npx prisma studio
```

## プロジェクト構成

```
simple-todo-app/
├── src/
│   ├── app/           # Next.js App Router（ページ、レイアウト、APIルート）
│   └── auth.ts        # Auth.js設定
├── prisma/
│   └── schema.prisma  # データベーススキーマ
├── docs/              # 設計ドキュメント
│   ├── 要件定義.md
│   ├── DB設計.md
│   ├── 認証設計.md
│   ├── API設計/
│   └── 画面設計/
└── tests/             # テストファイル
```

## ドキュメント

詳細な設計は[docs/](docs/)ディレクトリを参照してください。

- [要件定義.md](docs/要件定義.md)
- [DB設計.md](docs/DB設計.md)
- [認証設計.md](docs/認証設計.md)
- [API設計/](docs/API設計/)
- [画面設計/](docs/画面設計/)

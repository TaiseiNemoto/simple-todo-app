## 概要

ログインユーザー本人のTODO一覧を取得する。デフォルト並び順は`updatedAt desc`。

## リクエスト

- **メソッド / パス**：`GET /api/todos`
- **認証**：必須

### クエリパラメータ

| パラメータ  | 型     | 必須 | 説明                                                                                     | 例                   |
| ----------- | ------ | ---- | ---------------------------------------------------------------------------------------- | -------------------- |
| `status`    | string | 任意 | TODOの状態。`"open"` または `"done"`                                                     | `status=open`        |
| `priority`  | string | 任意 | 優先度。`"low"`, `"mid"`, `"high"`                                                       | `priority=high`      |
| `dueFrom`   | string | 任意 | 期限の下限。形式は `YYYY-MM-DD`（内部的にUTC 00:00:00に正規化）                          | `dueFrom=2025-10-01` |
| `dueTo`     | string | 任意 | 期限の上限。形式は `YYYY-MM-DD`（内部的にUTC 23:59:59に正規化）                          | `dueTo=2025-12-31`   |
| `q`         | string | 任意 | タイトル・説明の部分一致キーワード（最大100文字想定）                                    | `q=レポート`         |
| `sortBy`    | string | 任意 | 並び順キー。`"updatedAt"`, `"createdAt"`, `"due"`, `"priority"`（デフォルト`updatedAt`） | `sortBy=due`         |
| `sortOrder` | string | 任意 | 並び順方向。`"asc"` または `"desc"`（デフォルト`desc`）                                  | `sortOrder=asc`      |

### リクエスト例

```
GET /api/todos?status=open&priority=high&dueTo=2025-12-31&q=レポート&sortBy=due&sortOrder=asc
Cookie: authjs.session-token=<session-token>
```

## レスポンス

- **ステータス**：200 OK
- **ボディ**：`Todo[]`（0件可）

```json
[
  {
    "todoId": "c5a2b5f8-0a2e-4c0f-9a20-2f9b2a3f6bde",
    "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "月次レポート提出",
    "description": "経営会議向けに集計を反映",
    "status": "open",
    "priority": "high",
    "due": "2025-10-10T00:00:00.000Z",
    "createdAt": "2025-09-20T02:31:12.000Z",
    "updatedAt": "2025-09-28T14:01:03.000Z"
  }
]
```

## バリデーション設計

- `status ∈ {"open","done"}`
- `priority ∈ {"low","mid","high"}`
- `sortBy ∈ {"updatedAt","createdAt","due","priority"}`, `sortOrder ∈ {"asc","desc"}`
- `q` はトリム後 0–100 文字。空なら無視
- `dueFrom`/`dueTo` は `YYYY-MM-DD` または ISO 8601形式を受理
  - `dueFrom` は UTC 00:00:00 に正規化
  - `dueTo` は UTC 23:59:59.999 に正規化
  - 両方指定時は **`dueFrom <= dueTo`**
- いずれか不正なら **400**（`code: INVALID_PARAMETER`）

## エラーレスポンス例

### 401 未認証

```json
{
  "code": "UNAUTHORIZED",
  "message": "認証が必要です"
}
```

### 400 バリデーションエラー

```json
{
  "code": "INVALID_PARAMETER",
  "message": "無効なクエリパラメータです",
  "details": [
    {
      "path": ["status"],
      "message": "Invalid enum value. Expected 'open' | 'done', received 'invalid'"
    }
  ]
}
```

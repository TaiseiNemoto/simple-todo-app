## 概要

ログインユーザー本人のTODO一覧を取得する。デフォルト並び順は`updatedAt desc`。

## リクエスト

- **メソッド / パス**：`GET /api/todos`
- **認証**：必須

### クエリパラメータ

| パラメータ | 型     | 必須 | 説明                                                                       | 例                   |
| ---------- | ------ | ---- | -------------------------------------------------------------------------- | -------------------- |
| `status`   | string | 任意 | TODOの状態。`"open"` または `"done"`                                       | `status=open`        |
| `priority` | string | 任意 | 優先度。`"low"`, `"mid"`, `"high"`                                         | `priority=high`      |
| `dueFrom`  | string | 任意 | 期限の下限。形式は `YYYY-MM-DD`（内部的にUTC 00:00:00に正規化）            | `dueFrom=2025-10-01` |
| `dueTo`    | string | 任意 | 期限の上限。形式は `YYYY-MM-DD`（内部的にUTC 23:59:59に正規化）            | `dueTo=2025-12-31`   |
| `q`        | string | 任意 | タイトル・説明の部分一致キーワード（最大100文字想定）                      | `q=レポート`         |
| `sort`     | string | 任意 | 並び順キー。`"updatedAt"`, `"createdAt"`, `"due"`（デフォルト`updatedAt`） | `sort=due`           |
| `order`    | string | 任意 | 並び順方向。`"asc"` または `"desc"`（デフォルト`desc`）                    | `order=asc`          |

### リクエスト例

```
GET /api/todos?status=open&priority=high&dueTo=2025-12-31&q=レポート&sort=due&order=asc
Authorization: Bearer <token>
```

## レスポンス

- **ステータス**：200 OK
- **ボディ**：`Todo[]`（0件可）

```json
[
  {
    "id": "c5a2b5f8-0a2e-4c0f-9a20-2f9b2a3f6bde",
    "title": "月次レポート提出",
    "description": "経営会議向けに集計を反映",
    "status": "open",
    "priority": "high",
    "due": "2025-10-10T09:00:00Z",
    "completedAt": null,
    "createdAt": "2025-09-20T02:31:12Z",
    "updatedAt": "2025-09-28T14:01:03Z"
  }
]
```

## バリデーション設計

- `status ∈ {"open","done"}`
- `priority ∈ {"low","mid","high"}`
- `sort ∈ {"updatedAt","createdAt","due"}`, `order ∈ {"asc","desc"}`
- `q` はトリム後 0–100 文字。空なら無視
- `dueFrom`/`dueTo` は `YYYY-MM-DD`を受理
  - 両方指定時は **`dueFrom <= dueTo`**
- いずれか不正なら **400**（`code: INVALID_QUERY`）

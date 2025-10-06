## 概要

指定IDのTODOを部分更新する。

## リクエスト

- **メソッド / パス**：`PATCH /api/todos/:id`
- **認証**：必須

### パスパラメータ

| パラメータ | 型     | 必須 | 説明         | 例                                     |
| ---------- | ------ | ---- | ------------ | -------------------------------------- |
| `id`       | string | 必須 | TODOの識別子 | `c5a2b5f8-0a2e-4c0f-9a20-2f9b2a3f6bde` |

### Body（JSON）※任意項目のみ送ればOK

| フィールド    | 型     | 必須 | 説明                                                | 例                   |
| ------------- | ------ | ---- | --------------------------------------------------- | -------------------- |
| `title`       | string | 任意 | タイトル。空文字は不可。                            | `"月次レポート提出"` |
| `description` | string | 任意 | 詳細説明。空文字可。                                | `""`                 |
| `status`      | string | 任意 | `"open"` \| `"done"`。完了/未完の切替はここで実施。 | `"done"`             |
| `priority`    | string | 任意 | `"low"` \| `"mid"` \| `"high"`。                    | `"mid"`              |
| `due`         | string | 任意 | 期限。`YYYY-MM-DD`                                  | `"2025-10-10"`       |

### リクエスト例

```json
{
  "status": "done",
  "due": "2025-10-10"
}
```

## レスポンス

- **ステータス**：`200 OK`
- **ボディ**：更新後のTODO（日時は **ISO 8601 UTC**）

### レスポンス例

```json
{
  "todoId": "c5a2b5f8-0a2e-4c0f-9a20-2f9b2a3f6bde",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "月次レポート提出",
  "description": "経営会議向けに集計を反映",
  "status": "done",
  "priority": "mid",
  "due": "2025-10-10T00:00:00.000Z",
  "createdAt": "2025-10-01T02:11:45.000Z",
  "updatedAt": "2025-10-01T05:21:03.000Z"
}
```

## バリデーション設計

- Bodyは**最低1フィールド以上**必須。空オブジェクト `{}` は **400**（`INVALID_BODY`）
- 各フィールド制約：
  - `title`：トリム後 1–120
  - `description`：0–2000
  - `status ∈ {"open","done"}`
  - `priority ∈ {"low","mid","high"}`
  - `due`：`YYYY-MM-DD` または ISO 8601形式。日付のみの場合はUTC 00:00:00に正規化

## エラーレスポンス例

### 401 未認証

```json
{
  "code": "UNAUTHORIZED",
  "message": "認証が必要です"
}
```

### 404 リソース不存在

```json
{
  "code": "NOT_FOUND",
  "message": "TODOが見つかりません"
}
```

### 403 所有者不一致

```json
{
  "code": "FORBIDDEN",
  "message": "このTODOにアクセスする権限がありません"
}
```

### 400 バリデーションエラー

```json
{
  "code": "INVALID_BODY",
  "message": "無効なリクエストボディです",
  "details": [
    {
      "path": ["title"],
      "message": "タイトルは120文字以内で入力してください"
    }
  ]
}
```

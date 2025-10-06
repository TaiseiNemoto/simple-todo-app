## 概要

指定IDのTODOを削除する。

## リクエスト

- **メソッド / パス**：`DELETE /api/todos/:id`
- **認証**：必須

### パスパラメータ

| パラメータ | 型     | 必須 | 説明         | 例                                     |
| ---------- | ------ | ---- | ------------ | -------------------------------------- |
| `id`       | string | 必須 | TODOの識別子 | `c5a2b5f8-0a2e-4c0f-9a20-2f9b2a3f6bde` |

### リクエスト例

```
DELETE /api/todos/c5a2b5f8-0a2e-4c0f-9a20-2f9b2a3f6bde
Cookie: authjs.session-token=<session-token>
```

## レスポンス

- **ステータス**：`204 No Content`
- **ボディ**：なし

## バリデーション設計

リソース不存在 → **404**、他人の資源 → **403**

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

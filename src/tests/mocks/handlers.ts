import { http, HttpResponse } from "msw";

/**
 * MSWハンドラー定義
 * テストで使用するAPIモックのハンドラーをここに定義
 */
export const handlers = [
  // 例: GitHub OAuth用のモックハンドラー（必要に応じて追加）
  // http.post('https://github.com/login/oauth/access_token', () => {
  //   return HttpResponse.json({ access_token: 'test-token' });
  // }),
];

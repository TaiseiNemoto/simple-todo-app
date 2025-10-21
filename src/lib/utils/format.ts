/**
 * 日付を yyyy/mm/dd 形式でフォーマットする
 * @param date - Date オブジェクトまたは ISO8601 形式の日付文字列
 * @returns yyyy/mm/dd 形式の文字列
 * @throws {Error} 無効な日付が渡された場合にエラーをスロー
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;

  // Invalid Dateのチェック
  if (isNaN(d.getTime())) {
    throw new Error(
      `無効な日付です: ${typeof date === "string" ? date : date.toString()}`
    );
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

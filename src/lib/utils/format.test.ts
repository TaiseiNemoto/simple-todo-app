import { describe, it, expect } from "vitest";
import { formatDate } from "./format";

describe("formatDate", () => {
  describe("正常系", () => {
    it("Dateオブジェクトを yyyy/mm/dd 形式にフォーマットする", () => {
      const date = new Date("2024-01-15T12:00:00Z");
      expect(formatDate(date)).toBe("2024/01/15");
    });

    it("ISO8601形式の文字列を yyyy/mm/dd 形式にフォーマットする", () => {
      expect(formatDate("2024-01-15T12:00:00Z")).toBe("2024/01/15");
    });

    it("日付のみの文字列を yyyy/mm/dd 形式にフォーマットする", () => {
      expect(formatDate("2024-01-15")).toBe("2024/01/15");
    });

    it("月と日が1桁の場合、0埋めする", () => {
      const date = new Date("2024-03-05T12:00:00Z");
      expect(formatDate(date)).toBe("2024/03/05");
    });

    it("年末の日付を正しくフォーマットする", () => {
      const date = new Date("2024-12-31T12:00:00Z");
      expect(formatDate(date)).toBe("2024/12/31");
    });

    it("年始の日付を正しくフォーマットする", () => {
      const date = new Date("2024-01-01T12:00:00Z");
      expect(formatDate(date)).toBe("2024/01/01");
    });

    it("閏年の2月29日を正しくフォーマットする", () => {
      const date = new Date("2024-02-29T12:00:00Z");
      expect(formatDate(date)).toBe("2024/02/29");
    });
  });

  describe("異常系", () => {
    it("無効な日付文字列の場合、エラーをスローする", () => {
      expect(() => formatDate("invalid-date")).toThrow("無効な日付です:");
      expect(() => formatDate("invalid-date")).toThrow("invalid-date");
    });

    it("空文字列の場合、エラーをスローする", () => {
      expect(() => formatDate("")).toThrow("無効な日付です:");
    });

    it("Invalid Dateオブジェクトの場合、エラーをスローする", () => {
      const invalidDate = new Date("invalid");
      expect(() => formatDate(invalidDate)).toThrow("無効な日付です:");
    });

    it("数値のみの不正な文字列の場合、エラーをスローする", () => {
      expect(() => formatDate("99999999")).toThrow("無効な日付です:");
    });

    it("フォーマットが不正な文字列の場合、エラーをスローする", () => {
      expect(() => formatDate("2024/13/01")).toThrow("無効な日付です:");
    });
  });

  describe("エッジケース", () => {
    it("1970年1月1日（UNIX epoch）を正しくフォーマットする", () => {
      const date = new Date("1970-01-01T00:00:00Z");
      expect(formatDate(date)).toBe("1970/01/01");
    });

    it("未来の日付を正しくフォーマットする", () => {
      const date = new Date("2099-12-31T00:00:00Z");
      expect(formatDate(date)).toBe("2099/12/31");
    });

    it("過去の日付を正しくフォーマットする", () => {
      const date = new Date("1900-01-01T00:00:00Z");
      expect(formatDate(date)).toBe("1900/01/01");
    });
  });
});

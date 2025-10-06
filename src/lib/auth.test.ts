import { describe, it, expect, vi, beforeEach } from "vitest";
import { requireAuth, getServerSession } from "./auth";
import type { Session } from "next-auth";

// auth モジュールのモック
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

describe("getServerSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("セッションを取得できる", async () => {
    const mockSession: Session = {
      user: {
        id: "user-123",
        name: "Test User",
      },
      expires: new Date(Date.now() + 86400000).toISOString(), // 24時間後
    };

    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(mockSession);

    const session = await getServerSession();

    expect(session).toEqual(mockSession);
    expect(auth).toHaveBeenCalledOnce();
  });

  it("セッションがない場合はnullを返す", async () => {
    const { auth } = await import("@/auth");
    vi.mocked(auth).mockResolvedValue(null);

    const session = await getServerSession();

    expect(session).toBeNull();
    expect(auth).toHaveBeenCalledOnce();
  });
});

describe("requireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("正常系", () => {
    it("認証済みの場合、セッションを返す", async () => {
      const mockSession: Session = {
        user: {
          id: "user-123",
          name: "Test User",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession);

      const session = await requireAuth();

      expect(session).toEqual(mockSession);
      expect(session.user.id).toBe("user-123");
    });

    it("userIdが存在する場合、セッションを返す", async () => {
      const mockSession: Session = {
        user: {
          id: "user-456",
          name: "Another User",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession);

      const session = await requireAuth();

      expect(session.user.id).toBe("user-456");
    });
  });

  describe("異常系", () => {
    it("セッションがnullの場合、UNAUTHORIZEDエラーをスロー", async () => {
      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(null);

      await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
    });

    it("userが存在しない場合、UNAUTHORIZEDエラーをスロー", async () => {
      const mockSession = {
        expires: new Date(Date.now() + 86400000).toISOString(),
      } as Session;

      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession);

      await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
    });

    it("user.idが存在しない場合、UNAUTHORIZEDエラーをスロー", async () => {
      const mockSession: Session = {
        user: {
          name: "User Without ID",
        } as Session["user"],
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession);

      await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
    });

    it("user.idが空文字の場合、UNAUTHORIZEDエラーをスロー", async () => {
      const mockSession: Session = {
        user: {
          id: "",
          name: "User With Empty ID",
        },
        expires: new Date(Date.now() + 86400000).toISOString(),
      };

      const { auth } = await import("@/auth");
      vi.mocked(auth).mockResolvedValue(mockSession);

      await expect(requireAuth()).rejects.toThrow("UNAUTHORIZED");
    });
  });
});

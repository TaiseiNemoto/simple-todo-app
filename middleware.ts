import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isAuthenticated = !!session?.user?.id;

  // 認証APIエンドポイントは常にアクセス可能
  if (nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 未認証時: /todos へのアクセスを /signin にリダイレクト
  if (!isAuthenticated && nextUrl.pathname.startsWith("/todos")) {
    const signInUrl = new URL("/signin", nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 認証済み時: /signin へのアクセスを /todos にリダイレクト
  if (isAuthenticated && nextUrl.pathname === "/signin") {
    const todosUrl = new URL("/todos", nextUrl.origin);
    return NextResponse.redirect(todosUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * 以下を除くすべてのパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化ファイル)
     * - favicon.ico, sitemap.xml, robots.txt (メタデータファイル)
     * - public配下の静的ファイル
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*$).*)",
  ],
};

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function RootPage() {
  const session = await auth();

  // 認証済みの場合はTODO一覧へ
  if (session?.user) {
    redirect("/todos");
  }

  // 未認証の場合はサインインページへ
  redirect("/signin");
}

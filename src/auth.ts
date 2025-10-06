import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      },
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || account.provider !== "github") {
        return false;
      }

      const githubId = account.providerAccountId;
      if (!githubId) {
        return false;
      }

      // GitHub IDをBigIntに変換
      const githubIdBigInt = BigInt(githubId);

      // Userレコードを作成または更新
      await prisma.user.upsert({
        where: { githubId: githubIdBigInt },
        update: {
          name: user.name || null,
        },
        create: {
          githubId: githubIdBigInt,
          name: user.name || null,
        },
      });

      return true;
    },
    async jwt({ token, account }) {
      if (account?.providerAccountId) {
        const githubIdBigInt = BigInt(account.providerAccountId);
        const dbUser = await prisma.user.findUnique({
          where: { githubId: githubIdBigInt },
        });

        if (dbUser) {
          token.id = dbUser.userId;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.id && typeof token.id === "string") {
        session.user.id = token.id;
      }

      return session;
    },
  },
});

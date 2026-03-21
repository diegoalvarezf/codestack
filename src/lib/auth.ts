import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { prisma } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      if (!profile?.id) return false;
      await prisma.user.upsert({
        where: { githubId: String(profile.id) },
        update: {
          name: (profile.name as string) ?? (profile.login as string),
          avatarUrl: profile.avatar_url as string,
        },
        create: {
          githubId: String(profile.id),
          githubLogin: profile.login as string,
          name: (profile.name as string) ?? (profile.login as string),
          email: profile.email as string | undefined,
          avatarUrl: profile.avatar_url as string,
        },
      });
      return true;
    },
    async session({ session, token }) {
      if (token.sub) {
        const user = await prisma.user.findUnique({
          where: { githubId: token.sub },
          select: { githubLogin: true, role: true, avatarUrl: true },
        });
        if (user) {
          session.user.githubLogin = user.githubLogin;
          session.user.role = user.role;
          session.user.image = user.avatarUrl ?? session.user.image;
        }
      }
      return session;
    },
    async jwt({ token, profile }) {
      if (profile?.id) token.sub = String(profile.id);
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubLogin?: string;
      role?: string;
    };
  }
}

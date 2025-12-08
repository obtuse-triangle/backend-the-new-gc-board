import { NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { login } from "./api/auth";
import { User as StrapiUser } from "../types/user";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Strapi",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          throw new Error("Missing credentials");
        }

        const result = await login(credentials.identifier, credentials.password);
        if (!result?.jwt || !result?.user) return null;

        const user: NextAuthUser = {
          ...result.user,
          jwt: result.jwt,
        } satisfies StrapiUser & { jwt: string };

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && "jwt" in user) {
        const typed = user as unknown as StrapiUser & { jwt?: string };
        token.id = typed.id;
        token.username = typed.username;
        token.email = typed.email;
        token.jwt = typed.jwt;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.username = token.username as string;
        session.user.email = token.email as string;
      }
      (session as typeof session & { jwt?: string }).jwt = token.jwt as string | undefined;
      return session;
    },
  },
};

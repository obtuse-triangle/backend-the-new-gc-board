import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: number;
    username: string;
    email: string;
    jwt?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: number;
      username: string;
      email: string;
    } & DefaultSession["user"];
    jwt?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: number;
    username?: string;
    email?: string;
    jwt?: string;
  }
}

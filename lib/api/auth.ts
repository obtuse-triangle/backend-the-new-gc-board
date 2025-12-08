import { apiFetch } from "./client";
import { User } from "../../types/user";

export interface LoginResult {
  jwt: string;
  user: User;
}

export interface RegisterResult {
  jwt: string;
  user: User;
}

export async function login(identifier: string, password: string) {
  return apiFetch<LoginResult>(`/api/auth/local`, {
    method: "POST",
    body: { identifier, password },
  });
}

export async function register(username: string, email: string, password: string) {
  return apiFetch<RegisterResult>(`/api/auth/local/register`, {
    method: "POST",
    body: { username, email, password },
  });
}

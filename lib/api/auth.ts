import { apiFetch } from "./client";

export interface LoginResult {
  jwt: string;
}

export async function login(identifier: string, password: string) {
  return apiFetch<LoginResult>(`/api/auth/local`, {
    method: "POST",
    body: { identifier, password },
  });
}

export async function register(username: string, email: string, password: string) {
  return apiFetch(`/api/auth/local/register`, {
    method: "POST",
    body: { username, email, password },
  });
}

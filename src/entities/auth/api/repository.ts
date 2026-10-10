import { httpClient } from "@/shared/api/httpClient";
import type { LoginUserResponse } from "@/shared/auth/session";

export interface LoginRequest {
  loginId: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  loginId: string;
  password: string;
}

export interface LoginIdCheckResponse {
  available: boolean;
}

export function checkLoginId(loginId: string) {
  return httpClient.request<LoginIdCheckResponse>({
    path: `/api/auth/check-login-id?loginId=${encodeURIComponent(loginId)}`,
  });
}

export function login(request: LoginRequest) {
  return httpClient.request<LoginUserResponse>({
    path: "/api/auth/login",
    init: { method: "POST" },
    json: request,
  });
}

export function signup(request: SignupRequest) {
  return httpClient.request<LoginUserResponse | void>({
    path: "/api/auth/signup",
    init: { method: "POST" },
    json: request,
  });
}

export function createAcademy(name: string) {
  return httpClient.request<LoginUserResponse>({
    path: "/api/academies",
    init: { method: "POST" },
    json: { name },
  });
}

export function joinAcademy(code: string) {
  return httpClient.request<LoginUserResponse>({
    path: "/api/academies/join",
    init: { method: "POST" },
    json: { code },
  });
}

import { API_BASE_URL } from "./config";
import type { ApiResponse } from "./config";

// 공통 fetch 헬퍼 함수 (인증용)
const authRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // 세션 쿠키 포함
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `API 요청 실패: ${response.status}`
    ) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  return response.json();
};


export interface User {
  id: string;
  username: string;
  createdAt: string;
}

// 로그인 API
export interface LoginRequest {
  username: string;
  password: string;
}
export const loginUser = async (
  data: LoginRequest
): Promise<ApiResponse<{ user: User; token: string }>> => {
  return authRequest<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 회원가입 API
export interface SignUpRequest {
  username: string;
  password: string;
}
export const signUpUser = async (
  data: SignUpRequest
): Promise<ApiResponse<{ user: User; token: string }>> => {
  return authRequest<{ user: User; token: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// 로그인 여부 확인 API
export const meUser = async (): Promise<ApiResponse<{ user: User }>> => {
  return authRequest<{ user: User }>("/auth/me", {
    method: "GET",
  });
};

// 로그아웃 API
export const logoutUser = async (): Promise<ApiResponse<null>> => {
  return authRequest<null>("/auth/logout", {
    method: "POST",
  });
};

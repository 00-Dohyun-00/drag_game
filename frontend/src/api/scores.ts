import { API_BASE_URL } from "./config";
import type { ApiResponse } from "./config";
import { useMutation } from "@tanstack/react-query";

// 점수 API용 공통 fetch 헬퍼 함수
const scoresRequest = async <T>(
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

// 점수 저장 요청 인터페이스
export interface SaveScoreRequest {
  user_id: string;
  score: number;
}

// 점수 저장 훅
export const useSaveScoreAPI = () => {
  return useMutation({
    // 점수 저장 API
    mutationFn: async (data: SaveScoreRequest): Promise<ApiResponse<any>> => {
      return scoresRequest<any>("/scores/save_score", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      console.log("점수 저장 성공:", response);
    },
    onError: (error) => {
      console.error("점수 저장 실패:", error);
    },
  });
};

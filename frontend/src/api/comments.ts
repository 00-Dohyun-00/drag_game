import { API_BASE_URL } from "./config";
import type { ApiResponse } from "./config";
import { useMutation, useQuery } from "@tanstack/react-query";

// 한마디 API용 공통 fetch 헬퍼 함수
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

// 한마디 저장 훅
export interface SaveScoreRequest {
  user_id: string;
  text: string;
}
export const useSaveCommentAPI = () => {
  return useMutation({
    // 한마디 저장 API
    mutationFn: async (data: SaveScoreRequest): Promise<ApiResponse<any>> => {
      return scoresRequest<any>("/comments/save_comment", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      console.log("한마디 저장 성공:", response);
    },
    onError: (error) => {
      console.error("한마디 저장 실패:", error);
    },
  });
};

// 한마디 조회 훅
export const useGetCommentsAPI = () => {
  return useQuery({
    queryKey: ["comments"],
    queryFn: async (): Promise<ApiResponse<any>> => {
      return scoresRequest<any>("/comments/get_comment", {
        method: "GET",
      });
    },
    select: (response) => response.data.comments,
  });
};

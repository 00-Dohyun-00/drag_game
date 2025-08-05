import { API_BASE_URL } from "./config";
import type { ApiResponse } from "./config";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

// 점수 저장 훅
export interface SaveScoreRequest {
  user_id: string;
  score: number;
}
export const useSaveScoreAPI = () => {
  const queryClient = useQueryClient();

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
      // 점수 저장 후 랭킹 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["ranking"] });
    },
    onError: (error) => {
      console.error("점수 저장 실패:", error);
    },
  });
};

// 랭킹 조회 훅
export const useGetRankingAPI = () => {
  return useQuery({
    queryKey: ["ranking"],
    queryFn: async (): Promise<ApiResponse<any>> => {
      return scoresRequest<any>("/scores/get_ranking", {
        method: "GET",
      });
    },
    select: (response) => response.data.ranking,
  });
};

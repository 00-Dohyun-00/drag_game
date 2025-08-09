import { useMutation, useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./config";
import type { ApiResponse } from "./config";

// 공통 fetch 헬퍼 함수 (사용자용)
const userRequest = async <T>(
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

// 게임 기록 인터페이스
export interface GameRecord {
  id: number;
  user_id: string;
  score: number;
  created_at: string;
  username: string;
}

// 통계 인터페이스
export interface GameStatistics {
  best_score: number;
  average_score: number;
  total_games: number;
}

// 게임 기록 응답 인터페이스
export interface GameHistoryResponse {
  game_history: GameRecord[];
  statistics: GameStatistics;
}

// 게임 기록 조회 hook
export const useGetUserGameHistoryAPI = () => {
  return useQuery({
    queryKey: ["user", "game-history"],
    queryFn: () =>
      userRequest<GameHistoryResponse>("/user/game-history", {
        method: "GET",
      }),
    staleTime: 2 * 60 * 1000, // 2분간 캐시 유지
    retry: 1,
  });
};

// 닉네임 업데이트 hook
export interface SaveNicknameRequest {
  user_id: string;
  nickname: string;
}
export const useSaveNicknameAPI = () => {
  return useMutation({
    // 닉네임 저장 API
    mutationFn: async (
      data: SaveNicknameRequest
    ): Promise<ApiResponse<any>> => {
      return userRequest<any>("/user/nickname", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      console.log("닉네임 저장 성공:", response);
    },
    onError: (error) => {
      console.error("닉네임 저장 실패:", error);
    },
  });
};

// API 설정
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// 공통 API 응답 인터페이스
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

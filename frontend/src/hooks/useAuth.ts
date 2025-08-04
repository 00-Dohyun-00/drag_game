import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginUser, signUpUser, logoutUser, meUser } from "../api/auth.ts";

// 로그인 mutation hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      if (response.success && response.data?.token) {
        // 관련된 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["scores"] });
      }
    },
    onError: (error) => {
      console.error("로그인 실패:", error);
    },
  });
};

// 회원가입 mutation hook
export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signUpUser,
    onSuccess: (response) => {
      if (response.success && response.data?.token) {
        // 관련된 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["scores"] });
      }
    },
    onError: (error) => {
      console.error("회원가입 실패:", error);
    },
  });
};

// 현재 사용자 정보 조회 query hook
export const useMe = () => {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: meUser,
    retry: false, // 인증 실패 시 재시도하지 않음
    staleTime: 5 * 60 * 1000, // 5분간 캐시 유지
    enabled: false,
  });
};

// 로그아웃 함수
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (response) => {
      if (response.success) {
        // 모든 쿼리 클리어
        queryClient.clear();
      }
    },
    onError: (error) => {
      console.error("로그아웃 실패:", error);
    },
  });
};

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginUser, signUpUser, logoutUser } from "../api/auth.ts";

// 로그인 mutation hook
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      if (response.success && response.data?.token) {
        // 토큰을 localStorage에 저장
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));

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
        // 토큰을 localStorage에 저장
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("currentUser", JSON.stringify(response.data.user));

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

// 로그아웃 함수
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: (response) => {
      if (response.success) {
        // localStorage에서 토큰과 사용자 정보 제거
        localStorage.removeItem("authToken");
        localStorage.removeItem("currentUser");

        // 모든 쿼리 클리어
        queryClient.clear();
      }
    },
    onError: (error) => {
      console.error("로그아웃 실패:", error);
    },
  });
};

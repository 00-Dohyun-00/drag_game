import React from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  isLoggedIn: boolean;
  isInitializing?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  isLoggedIn,
  isInitializing,
}) => {
  // 초기화 중일 때는 로딩 표시
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // 초기화 완료 후 로그인 상태 확인
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

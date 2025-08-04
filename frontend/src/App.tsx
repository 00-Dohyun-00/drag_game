import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMe } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import GamePage from "./pages/GamePage";
import ProtectedRoute from "./components/ProtectedRoute";

// QueryClient 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

// 메인 앱 컴포넌트 (QueryClient와 Router 내부에서 실행)
function AppContent() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [currentUser, setCurrentUser] = useState<string | null>(null); // 현재 로그인된 사용자의 이름
  const [isInitializing, setIsInitializing] = useState(true); // 앱 초기화 중인지 여부 - 세션 확인이 완료될 때까지 true

  // 세션 확인
  const { data: meData, refetch: meRefetch, isLoading: meLoading } = useMe();

  // 보호된 페이지에 접근할 때만 세션 확인
  useEffect(() => {
    const checkInitialSession = async () => {
      const isProtectedRoute = location.pathname === "/drag-game";

      if (isProtectedRoute) {
        await meRefetch();
      }
      setIsInitializing(false);
    };

    checkInitialSession();
  }, [location.pathname, meRefetch]);

  // 세션 확인 결과 처리
  useEffect(() => {
    if (!isInitializing && !meLoading) {
      if (meData?.success && meData.data?.user) {
        setIsLoggedIn(true);
        setCurrentUser(meData.data.user.username);
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
      }
    }
  }, [meData, meLoading, isInitializing]);

  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
  };

  // 초기화 중인 경우 로딩 표시
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* 기본 경로 로그인으로 리다이렉트 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 로그인 페이지 */}
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/drag-game" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        }
      />

      {/* 회원가입 페이지 */}
      <Route
        path="/signin"
        element={
          isLoggedIn ? (
            <Navigate to="/drag-game" replace />
          ) : (
            <SignUpPage onSignUp={handleLogin} />
          )
        }
      />

      {/* 게임 페이지 */}
      <Route
        path="/drag-game"
        element={
          <ProtectedRoute isAuthenticated={isLoggedIn}>
            <GamePage currentUser={currentUser || ""} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      />

      {/* 404 페이지 - 존재하지 않는 경로는 로그인으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// 메인 App 컴포넌트 (QueryClient Provider)
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

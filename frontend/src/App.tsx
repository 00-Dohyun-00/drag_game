import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMe } from "./hooks/useAuth";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import GamePage from "./pages/GamePage";
import ProtectedRoute from "./components/ProtectedRoute";
import RankingPage from "./pages/RankingPage";

// QueryClient 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5분
    },
  },
});

// 상수로 정의 (컴포넌트 외부)
const PROTECTED_ROUTES = ["/drag-game", "/ranking"];
const AUTH_PAGES = ["/login", "/signin"];

// 메인 앱 컴포넌트 (QueryClient와 Router 내부에서 실행)
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 여부
  const [currentUser, setCurrentUser] = useState<string | null>(null); // 현재 로그인된 사용자의 이름
  const [isInitializing, setIsInitializing] = useState(true); // 앱 초기화 중인지 여부 - 세션 확인이 완료될 때까지 true

  // 세션 확인
  const { data: meData, refetch: meRefetch, isLoading: meLoading } = useMe();

  // 보호된 페이지, 로그인/회원가입 페이지에 접근할 때만 세션 확인
  useEffect(() => {
    const checkInitialSession = async () => {
      const isProtectedRoute = PROTECTED_ROUTES.includes(location.pathname);

      if (isProtectedRoute) {
        await meRefetch();
      } else {
        // 로그인/회원가입 페이지의 경우 - 로그인 상태 확인 후 리다이렉트
        const isAuthPage = AUTH_PAGES.includes(location.pathname);
        if (isAuthPage) {
          await meRefetch();
        } else {
          // 기타 페이지는 즉시 초기화 완료
          setIsInitializing(false);
        }
      }
    };

    checkInitialSession();
  }, [location.pathname, meRefetch, navigate]);

  // 세션 확인 결과 처리
  useEffect(() => {
    const isProtectedRoute = PROTECTED_ROUTES.includes(location.pathname);
    const isAuthPage = AUTH_PAGES.includes(location.pathname);

    if (
      (isProtectedRoute || isAuthPage) &&
      !meLoading &&
      meData !== undefined
    ) {
      if (meData?.success && meData.data?.user) {
        // 로그인된 상태
        setIsLoggedIn(true);
        setCurrentUser(meData.data.user.username);

        // 로그인된 상태로 로그인/회원가입 페이지 접근 시 리다이렉트
        if (isAuthPage) {
          alert("이미 로그인되어 있습니다.");
          navigate("/ranking", { replace: true });
        }
      } else {
        // 로그인되지 않은 상태
        const wasLoggedIn = isLoggedIn;
        setIsLoggedIn(false);
        setCurrentUser(null);

        // 보호된 페이지에서 세션 만료된 경우에만 알림
        if (isProtectedRoute && wasLoggedIn) {
          alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/login");
        }
      }

      setIsInitializing(false);
    }
  }, [meData, meLoading, location.pathname, isLoggedIn, navigate]);

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
            <Navigate to="/ranking" replace />
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
            <Navigate to="/ranking" replace />
          ) : (
            <SignUpPage onSignUp={handleLogin} />
          )
        }
      />

      {/* 게임 페이지 */}
      <Route
        path="/drag-game"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            isInitializing={isInitializing}
          >
            <GamePage currentUser={currentUser || ""} />
          </ProtectedRoute>
        }
      />

      {/* 랭킹 페이지 */}
      <Route
        path="/ranking"
        element={
          <ProtectedRoute
            isLoggedIn={isLoggedIn}
            isInitializing={isInitializing}
          >
            <RankingPage
              currentUser={currentUser || ""}
              onLogout={handleLogout}
            />
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

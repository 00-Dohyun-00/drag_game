import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  const handleLogin = (username: string) => {
    setIsAuthenticated(true);
    setCurrentUser(username);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* 기본 경로 로그인으로 리다이렉트 */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 로그인 페이지 */}
          <Route
            path="/login"
            element={
              isAuthenticated ? (
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
              isAuthenticated ? (
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
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <GamePage
                  currentUser={currentUser || ""}
                  onLogout={handleLogout}
                />
              </ProtectedRoute>
            }
          />

          {/* 404 페이지 - 존재하지 않는 경로는 로그인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;

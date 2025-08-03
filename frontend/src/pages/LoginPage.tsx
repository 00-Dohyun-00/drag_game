import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();

  const handleLogin = (username: string, password: string) => {
    console.log("로그인:", { username, password });
    // 임시로 바로 로그인 성공 처리
    onLogin(username);
    navigate("/drag-game");
  };

  const handleSwitchToSignUp = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
            Drag Game
          </h1>
          <p className="text-white/80 text-lg">
            숫자를 드래그해 10을 만드세요!
          </p>
        </div>

        <LoginForm
          onLogin={handleLogin}
          onSwitchToSignUp={handleSwitchToSignUp}
        />
      </div>
    </div>
  );
};

export default LoginPage;

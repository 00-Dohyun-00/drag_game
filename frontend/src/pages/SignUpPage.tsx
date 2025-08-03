import React from "react";
import { useNavigate } from "react-router-dom";
import SignUpForm from "../components/SignUpForm";

interface SignUpPageProps {
  onSignUp: (username: string) => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
  const navigate = useNavigate();

  const handleSignUp = (
    username: string,
    password: string,
    confirmPassword: string
  ) => {
    console.log("회원가입:", { username, password, confirmPassword });
    // 임시로 회원가입 후 바로 로그인 처리
    onSignUp(username);
    navigate("/drag-game");
  };

  const handleSwitchToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
            Drag Game
          </h1>
          <p className="text-white/80 text-lg">
            새로운 계정을 만들어 게임을 시작하세요!
          </p>
        </div>

        <SignUpForm
          onSignUp={handleSignUp}
          onSwitchToLogin={handleSwitchToLogin}
        />
      </div>
    </div>
  );
};

export default SignUpPage;

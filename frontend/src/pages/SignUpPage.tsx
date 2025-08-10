import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignUp } from "../hooks/useAuth";

interface SignUpPageProps {
  onSignUp: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { mutateAsync, isPending } = useSignUp();

  const validateUsername = (username: string) => {
    const ENG_NUM_REGEX = /^[a-zA-Z0-9]+$/;
    return username.length >= 2 && username.length <= 20 && ENG_NUM_REGEX.test(username);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8 && /(?=.*[a-zA-Z])(?=.*\d)/.test(password);
  };

  const isFormValid =
    username.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword &&
    validateUsername(username) &&
    validatePassword(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUsername(username)) {
      alert("아이디는 영문과 숫자만을 사용하여 2자 이상 20자 이하로 입력해주세요.");
      return;
    }

    if (!validatePassword(password)) {
      alert("비밀번호는 8자 이상이며, 영문자와 숫자를 포함해야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    mutateAsync(
      { username, password },
      {
        onSuccess: (response) => {
          if (response.success && !!response.data?.user) {
            alert("회원가입에 성공했습니다!");
            onSignUp();
            navigate("/ranking");
          }
        },
        onError: (error: Error & { status?: number }) => {
          console.error("회원가입 에러:", error);
          if (error?.status === 409) {
            alert("이미 존재하는 계정입니다. 다른 아이디를 사용해주세요.");
          } else {
            alert("회원가입에 실패했습니다.");
          }
        },
      }
    );
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

        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">✨</div>
              <h2 className="text-3xl font-bold text-[#594A3C] mb-2">
                회원가입
              </h2>
              <p className="text-[#8C7764] text-sm">
                새로운 계정을 만들어보세요!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="signup-username"
                  className="block text-[#594A3C] text-sm font-semibold mb-2"
                >
                  아이디
                </label>
                <input
                  type="text"
                  id="signup-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border 
                         bg-white/80 text-[#594A3C] placeholder-[#8C7764]/60
                         focus:outline-none focus:ring-2 transition-all duration-300
                         ${
                           username && !validateUsername(username)
                             ? "border-red-300 focus:ring-red-400/50"
                             : "border-[#D9C6BA]/50 focus:ring-[#8C7764]/50 focus:border-transparent"
                         }`}
                  placeholder="사용할 아이디를 입력하세요 (영문과 숫자, 2-20자)"
                  required
                />
                {username && !validateUsername(username) && (
                  <p className="text-red-500 text-xs mt-1">
                    아이디는 영문과 숫자만을 사용하여 2자 이상 20자 이하로
                    입력해주세요.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-[#594A3C] text-sm font-semibold mb-2"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="signup-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border 
                         bg-white/80 text-[#594A3C] placeholder-[#8C7764]/60
                         focus:outline-none focus:ring-2 transition-all duration-300
                         ${
                           password && !validatePassword(password)
                             ? "border-red-300 focus:ring-red-400/50"
                             : "border-[#D9C6BA]/50 focus:ring-[#8C7764]/50 focus:border-transparent"
                         }`}
                  placeholder="비밀번호를 입력하세요 (8자 이상, 영문+숫자)"
                  required
                />
                {password && !validatePassword(password) && (
                  <p className="text-red-500 text-xs mt-1">
                    비밀번호는 8자 이상이며, 영문자와 숫자를 포함해야 합니다.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-[#594A3C] text-sm font-semibold mb-2"
                >
                  비밀번호 확인
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border border-[#D9C6BA]/50 
                         bg-white/80 text-[#594A3C] placeholder-[#8C7764]/60
                         focus:outline-none focus:ring-2 transition-all duration-300
                         ${
                           password &&
                           confirmPassword &&
                           password !== confirmPassword
                             ? "focus:ring-red-400/50 border-red-300"
                             : "focus:ring-[#8C7764]/50 focus:border-transparent"
                         }`}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                />
                {password &&
                  confirmPassword &&
                  password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white py-3 rounded-xl font-semibold
                       hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={!isFormValid}
              >
                {isPending ? "회원가입 중..." : "회원가입"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#8C7764] text-sm">
                이미 계정이 있으신가요?{" "}
                <button
                  onClick={handleSwitchToLogin}
                  className="text-[#594A3C] font-semibold hover:text-[#3d3329] transition-colors duration-200"
                >
                  로그인
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

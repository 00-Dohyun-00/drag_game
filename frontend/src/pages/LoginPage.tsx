import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useAuth";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutateAsync, isPending } = useLogin();

  const handleSwitchToSignUp = () => {
    navigate("/signin");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      mutateAsync(
        { username, password },
        {
          onSuccess: (response) => {
            if (response.success && response.data?.user) {
              navigate("/drag-game");
            }
          },
          onError: (error) => {
            console.error("로그인 에러:", error);
            alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
          },
        }
      );
    }
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

        {/* Login Form */}
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">🎮</div>
              <h2 className="text-3xl font-bold text-[#594A3C] mb-2">로그인</h2>
              <p className="text-[#8C7764] text-sm">게임을 시작해보세요!</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-[#594A3C] text-sm font-semibold mb-2"
                >
                  아이디
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D9C6BA]/50 
                         bg-white/80 text-[#594A3C] placeholder-[#8C7764]/60
                         focus:outline-none focus:ring-2 focus:ring-[#8C7764]/50 focus:border-transparent
                         transition-all duration-300"
                  placeholder="아이디를 입력하세요"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[#594A3C] text-sm font-semibold mb-2"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#D9C6BA]/50 
                         bg-white/80 text-[#594A3C] placeholder-[#8C7764]/60
                         focus:outline-none focus:ring-2 focus:ring-[#8C7764]/50 focus:border-transparent
                         transition-all duration-300"
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white py-3 rounded-xl font-semibold
                       hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                disabled={!username.trim() || !password.trim() || isPending}
              >
                {isPending ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#8C7764] text-sm">
                계정이 없으신가요?{" "}
                <button
                  onClick={handleSwitchToSignUp}
                  className="text-[#594A3C] font-semibold hover:text-[#3d3329] transition-colors duration-200"
                >
                  회원가입
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

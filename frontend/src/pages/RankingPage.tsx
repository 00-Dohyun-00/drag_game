import React from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useAuth";
import { useGetRankingAPI } from "../api/scores";

interface RankingPageProps {
  currentUserInfo: {
    username: string;
    id: string;
  } | null;
  onLogout: () => void;
}

const RankingPage: React.FC<RankingPageProps> = ({
  currentUserInfo,
  onLogout,
}) => {
  const navigate = useNavigate();

  const { mutateAsync } = useLogout();
  const { data: rankingData } = useGetRankingAPI();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg";
      case 3:
        return "bg-gradient-to-r from-amber-600 to-amber-800 text-white shadow-lg";
      default:
        return "bg-white/80 border border-[#D9C6BA]/30";
    }
  };

  const getTextStyle = (rank: number) => {
    if (rank <= 3) {
      return {
        username: "font-bold text-lg",
        streak: `text-sm ${
          rank === 1
            ? "text-yellow-100"
            : rank === 2
            ? "text-gray-100"
            : "text-amber-100"
        }`,
        score: "text-xl font-bold",
        scoreLabel: `text-sm ${
          rank === 1
            ? "text-yellow-100"
            : rank === 2
            ? "text-gray-100"
            : "text-amber-100"
        }`,
      };
    }
    return {
      username: "font-semibold text-[#594A3C]",
      streak: "text-xs text-[#8C7764]",
      score: "text-[#594A3C] font-bold",
      scoreLabel: "",
    };
  };

  const handleLogout = () => {
    mutateAsync(undefined, {
      onSuccess: (response) => {
        if (response.success) {
          onLogout();
          navigate("/login");
        }
      },
      onError: (error) => {
        console.error("로그아웃 에러:", error);
        alert("로그아웃에 실패했습니다.");
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
            Drag Game
          </h1>
          <p className="text-white/80 text-lg">랭킹 순위를 확인하세요!</p>

          <span className="flex items-center justify-center gap-4 text-white/80">
            안녕하세요, {currentUserInfo?.username}님!
          </span>
        </div>

        {/* Ranking Form */}
        <div className="w-full max-w-md">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#594A3C] mb-6">
                🏆 Top Rankings
              </h2>

              {/* 랭킹 리스트 */}
              <div className="space-y-2">
                {rankingData?.map(
                  (player: {
                    rank: number;
                    username: string;
                    best_score: string;
                    achieved_at: string;
                  }) => {
                    const textStyles = getTextStyle(player.rank);
                    return (
                      <div
                        key={player.rank}
                        className={`flex items-center justify-between ${
                          player.rank <= 3 ? "p-4" : "p-3"
                        } rounded-xl ${getRankStyle(player.rank)}`}
                      >
                        <div className="flex items-center space-x-3">
                          <span
                            className={`${
                              player.rank <= 3
                                ? "text-2xl"
                                : "text-lg font-bold min-w-[30px]"
                            }`}
                          >
                            {getRankIcon(player.rank)}
                          </span>
                          <div className="text-left">
                            <h3 className={textStyles.username}>
                              {player.username}
                            </h3>
                            <p className={textStyles.streak}>
                              {player.achieved_at.split("T")[0]}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={textStyles.score}>
                            {player.best_score?.toLocaleString()}
                          </div>
                          {textStyles.scoreLabel && (
                            <div className={textStyles.scoreLabel}>점수</div>
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="flex mt-5 gap-2">
                <button
                  className="shrink w-full bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white py-3 rounded-xl font-semibold
                       hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                  onClick={() => navigate("/drag-game")}
                >
                  게임시작
                </button>
                <button
                  onClick={handleLogout}
                  className="shrink-3 w-full bg-gradient-to-r from-[#c4c3c2] to-[#bcb6b3] text-white py-3 rounded-xl font-semibold
                       hover:from-[#d6d6d6] hover:to-[#d1cbc5] transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                >
                  로그아웃
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "정말로 회원탈퇴를 하시겠습니까? 게임 기록은 전부 삭제되며 이 작업은 되돌릴 수 없습니다."
                      )
                    ) {
                      // TODO: 회원탈퇴 API 호출
                      alert("회원탈퇴 기능은 준비 중입니다.");
                    }
                  }}
                  className="text-[#8C7764]/60 text-xs hover:text-[#594A3C] hover:underline transition-colors duration-200"
                >
                  회원탈퇴
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;

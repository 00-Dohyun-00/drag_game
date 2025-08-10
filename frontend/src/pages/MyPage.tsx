import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetUserGameHistoryAPI, useSaveNicknameAPI } from "../api/user";
import { useMe } from "../hooks/useAuth";
import { debounce } from "lodash-es";

interface MyPageProps {
  currentUserInfo: {
    username: string;
    nickname: string | null;
    id: string;
  } | null;
}

const KO_EN_NUM_REGEX = /^[가-힣a-zA-Z0-9]+$/;

const MyPage: React.FC<MyPageProps> = ({ currentUserInfo }) => {
  const navigate = useNavigate();
  const { refetch: meRefetch } = useMe();

  const [newNickname, setNewNickname] = useState(
    currentUserInfo?.nickname || ""
  );
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  const {
    data: gameHistoryData,
    isLoading,
    error,
  } = useGetUserGameHistoryAPI();
  const { mutateAsync: saveNickname, isPending: isPendingNickname } =
    useSaveNicknameAPI();

  // API 데이터에서 게임 기록과 통계 추출
  const gameHistory = gameHistoryData?.data?.game_history || [];
  const statistics = gameHistoryData?.data?.statistics || {
    best_score: 0,
    average_score: 0,
    total_games: 0,
  };

  const handleUsernameSubmit = debounce(async () => {
    if (isPendingNickname) return;

    if (!newNickname?.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (newNickname?.trim().length > 10) {
      alert("닉네임은 10자 이내로 입력해주세요.");
      return;
    }

    // 특수문자 검증 (한글, 영어, 숫자만 허용)
    if (!KO_EN_NUM_REGEX.test(newNickname.trim())) {
      alert("닉네임은 한글, 영어, 숫자만 사용할 수 있습니다.");
      return;
    }

    if (!confirm("닉네임을 변경하시겠습니까?")) return;

    try {
      const params = {
        nickname: newNickname.trim(),
        user_id: currentUserInfo?.id || "",
      };

      const response = await saveNickname(params);

      if (response.success) {
        alert("닉네임이 성공적으로 변경되었습니다.");
        setIsEditingUsername(false);

        // 사용자 정보 강제 업데이트
        await meRefetch();
      } else {
        alert(response.message || "닉네임 변경에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("닉네임 변경 오류:", error);
      alert(error?.message || "닉네임 변경 중 오류가 발생했습니다.");
    }
  }, 3000);

  // 로딩 상태 처리
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-white text-xl">게임 기록을 불러오는 중...</div>
      </div>
    );
  }

  // 에러 상태 처리
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-white text-xl">
          게임 기록을 불러오는데 실패했습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative">
      {/* 뒤로가기 버튼 - 왼쪽 상단 */}
      <button
        onClick={() => navigate("/ranking")}
        className="absolute top-4 left-4 md:top-8 md:left-8 bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold text-sm md:text-base
         hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
         shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer z-10"
      >
        ← 랭킹으로
      </button>

      <div className="w-full max-w-6xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
            My Page
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            {`${currentUserInfo?.nickname || ""}(${currentUserInfo?.username})`}
            님의 게임 기록
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 왼쪽: 프로필 및 닉네임 변경 */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
            <h2 className="text-2xl font-bold text-[#594A3C] mb-6">
              👤 프로필
            </h2>

            <div className="space-y-4">
              {/* 통계 */}
              <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-[#F5F0EA] rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#594A3C]">
                    {statistics.best_score.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#8C7764]">최고점수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#594A3C]">
                    {statistics.average_score.toLocaleString()}
                  </div>
                  <div className="text-sm text-[#8C7764]">평균점수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#594A3C]">
                    {statistics.total_games}
                  </div>
                  <div className="text-sm text-[#8C7764]">총 게임수</div>
                </div>
              </div>

              {/* ID 섹션 */}
              <div>
                <label className="block text-[#594A3C] font-semibold mb-2">
                  ID (변경 불가)
                </label>
                <div className="px-3 py-2 bg-[#F5F0EA] border border-gray-300 rounded-lg text-[#594A3C] font-medium cursor-not-allowed">
                  {currentUserInfo?.username}
                </div>
              </div>

              {/* 닉네임 섹션 */}
              <div>
                <label className="block text-[#594A3C] font-semibold mb-2">
                  닉네임
                </label>
                {isEditingUsername ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newNickname}
                      onChange={(e) => setNewNickname(e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#D9C6BA]/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8C7764]/50"
                      maxLength={20}
                      placeholder="닉네임을 입력하세요"
                    />
                    <button
                      onClick={handleUsernameSubmit}
                      disabled={
                        !newNickname.trim() ||
                        newNickname === currentUserInfo?.nickname
                      }
                      className="px-4 py-2 bg-[#8C7764] text-white rounded-lg font-medium hover:bg-[#594A3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => {
                        setNewNickname(currentUserInfo?.nickname || "");
                        setIsEditingUsername(false);
                      }}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors cursor-pointer"
                    >
                      취소
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2 bg-[#F5F0EA] border border-gray-300 rounded-lg text-[#594A3C] font-medium">
                      {currentUserInfo?.nickname || "-"}
                    </div>
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="px-4 py-2 bg-[#8C7764] text-white rounded-lg font-medium hover:bg-[#594A3C] transition-colors cursor-pointer"
                    >
                      {currentUserInfo?.nickname ? "변경" : "생성"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽: 게임 기록 (그래프형) */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
            <h3 className="text-2xl font-bold text-[#594A3C] mb-6">
              📊 게임 기록
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-3">
              {gameHistory.length > 0 ? (
                gameHistory.map((game, index) => {
                  const percentage =
                    statistics.best_score > 0
                      ? (game.score / statistics.best_score) * 100
                      : 0;
                  const gameDate = new Date(
                    game.created_at
                  ).toLocaleDateString();
                  return (
                    <div key={game.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-[#594A3C]">
                          게임 #{gameHistory.length - index}
                        </span>
                        <span className="text-sm text-[#8C7764]">
                          {gameDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-[#F5F0EA] rounded-full h-6 relative overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#8C7764] to-[#594A3C] rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                            {game.score.toLocaleString()} 점
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-[#8C7764] min-w-[60px] text-right">
                          {percentage.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-[#8C7764] py-8">
                  아직 게임 기록이 없습니다.
                  <br />
                  게임을 플레이해서 기록을 만들어보세요!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPage;

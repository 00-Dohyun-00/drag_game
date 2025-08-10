import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useAuth";
import { useGetRankingAPI } from "../api/scores";
import { useGetCommentsAPI, useSaveCommentAPI } from "../api/comments";
import { debounce } from "lodash-es";

interface RankingPageProps {
  currentUserInfo: {
    username: string;
    id: string;
    nickname: string | null;
  } | null;
  onLogout: () => void;
}

const RankingPage: React.FC<RankingPageProps> = ({
  currentUserInfo,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const isLoggedIn = !!currentUserInfo;

  const { mutateAsync } = useLogout();
  const { data: rankingData } = useGetRankingAPI();
  const { mutateAsync: saveComment, isPending: isPendingComment } =
    useSaveCommentAPI();
  const { data: commentsData, refetch: refetchComments } = useGetCommentsAPI();

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

  const handleCommentSubmit = debounce(async () => {
    if (isPendingComment || !comment.trim() || !currentUserInfo) {
      return;
    }

    try {
      const params = {
        user_id: currentUserInfo.id,
        text: comment.trim(),
      };

      const res = await saveComment(params);

      if (res.success) {
        setComment("");
        await refetchComments();
      } else {
        alert(res.message || "코멘트 저장에 실패했습니다.");
      }
    } catch (err) {
      console.error("코멘트 저장 오류:", err);
      alert("코멘트 저장 중 오류가 발생했습니다.");
    }
  }, 300);

  // const handleCommentDelete = (commentId: number) => {
  //   const res = confirm("정말 삭제하시겠습니까?");
  //   if (!res) return;
  //   console.log(commentId);
  //   alert("준비중인 기능입니다.");
  // };

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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 relative">
      {/* 마이페이지 버튼 - 오른쪽 상단 */}
      {isLoggedIn && (
        <button
          onClick={() => navigate("/mypage")}
          className="absolute top-4 right-4 md:top-8 md:right-8 bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white px-3 py-2 md:px-4 md:py-2 rounded-xl font-semibold text-sm md:text-base
           hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
           shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer z-10"
        >
          마이페이지
        </button>
      )}
      <div className="w-full max-w-5xl">
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4">
            Drag Game
          </h1>
          <p className="text-white/80 text-base md:text-lg">
            안녕하세요,{" "}
            {currentUserInfo
              ? `${currentUserInfo.nickname || ""}(${currentUserInfo.username})`
              : "게스트"}
            님!
          </p>

          <span className="flex items-center justify-center gap-4 text-white/80 text-sm md:text-base">
            {isLoggedIn
              ? "랭킹 순위를 확인하세요!"
              : "로그인 후 랭킹에 도전해보세요!"}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 min-h-[500px] md:h-[600px]">
          {/* Ranking Form */}
          <section className="w-full lg:w-3/5">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 h-full flex flex-col">
              <div className="text-center mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#594A3C] mb-4">
                  🏆 Top Rankings
                </h2>

                {/* 랭킹 리스트 */}
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {rankingData?.map(
                    (player: {
                      rank: number;
                      username: string;
                      nickname: string;
                      best_score: string;
                      achieved_at: string;
                    }) => {
                      const textStyles = getTextStyle(player.rank);
                      return (
                        <div
                          key={player.rank}
                          className={`flex items-center justify-between ${
                            player.rank <= 3 ? "p-3 md:p-4" : "p-2 md:p-3"
                          } rounded-xl ${getRankStyle(player.rank)}`}
                        >
                          <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
                            <span
                              className={`${
                                player.rank <= 3
                                  ? "text-xl md:text-2xl"
                                  : "text-sm md:text-lg font-bold min-w-[25px] md:min-w-[30px]"
                              } flex-shrink-0`}
                            >
                              {getRankIcon(player.rank)}
                            </span>
                            <div className="text-left min-w-0 flex-1">
                              <h3 className={`${textStyles.username} text-sm md:text-base lg:text-lg truncate`}>
                                {`${player.nickname || ""}(${player.username})`}
                              </h3>
                              <p className={`${textStyles.streak} text-xs md:text-sm`}>
                                {player.achieved_at.split("T")[0]}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className={`${textStyles.score} text-sm md:text-lg lg:text-xl`}>
                              {player.best_score?.toLocaleString()}
                            </div>
                            {textStyles.scoreLabel && (
                              <div className={`${textStyles.scoreLabel} text-xs md:text-sm`}>점수</div>
                            )}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* 버튼들을 컨테이너 하단에 고정 */}
              {!isLoggedIn && (
                <div className="mt-auto pt-4">
                  <div className="flex gap-2">
                    <button
                      className="shrink w-full bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base
                       hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                      onClick={() => navigate("/login")}
                    >
                      로그인/회원가입 하고 게임 시작하기
                    </button>
                  </div>
                </div>
              )}
              {isLoggedIn && (
                <div className="mt-auto pt-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      className="shrink w-full bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base
                       hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                       shadow-lg hover:shadow-xl hover:-translate-y-1
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                      onClick={() => navigate("/drag-game")}
                    >
                      게임시작
                    </button>
                    <button
                      onClick={handleLogout}
                      className="shrink-3 w-full bg-gradient-to-r from-[#c4c3c2] to-[#bcb6b3] text-white py-2 md:py-3 rounded-xl font-semibold text-sm md:text-base
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
              )}
            </div>
          </section>
          {/* 코멘트 섹션 */}
          <section className="w-full lg:w-2/5">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 md:p-6 shadow-2xl border border-white/20 h-full flex flex-col">
              <h3 className="text-xl md:text-2xl font-bold text-[#594A3C] mb-4">
                💬 User Comments
              </h3>

              {/* 코멘트 입력 */}
              {isLoggedIn && (
                <div className="mb-4">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="간단한 메시지를 남겨보세요!"
                      className="flex-1 px-3 py-2 border border-[#D9C6BA]/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8C7764]/50"
                      maxLength={50}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCommentSubmit();
                        }
                      }}
                    />
                    <button
                      onClick={handleCommentSubmit}
                      disabled={!comment.trim() || isPendingComment}
                      className="px-4 py-2 bg-[#8C7764] text-white rounded-lg text-sm font-medium hover:bg-[#594A3C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer w-full sm:w-auto"
                    >
                      등록
                    </button>
                  </div>
                </div>
              )}

              {/* 코멘트 목록 */}
              <div className="space-y-2 flex-1 overflow-y-auto">
                {commentsData?.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-[#F5F0EA] p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-[#594A3C] text-xs md:text-sm truncate">
                            {`${item.nickname || ""}(${item.username})`}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-[#8C7764]/60">
                              {/* TODO: 시간대 수정 */}
                              {/* {new Date(item.created_at).toLocaleString(
                                "ko-KR",
                                {
                                  year: "numeric",
                                  month: "numeric",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: "Asia/Seoul",
                                }
                              )} */}
                            </span>
                            {/* TODO: API 연결 */}
                            {/* <button
                              onClick={() => handleCommentDelete(item.id)}
                              className="text-[#8C7764]/40 hover:text-red-500 transition-colors text-xs w-4 h-4 flex items-center justify-center"
                              title="삭제"
                            >
                              X
                            </button> */}
                          </div>
                        </div>
                        <p className="text-[#594A3C] text-xs md:text-sm break-words">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;

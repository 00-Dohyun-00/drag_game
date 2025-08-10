import React, { useState, useEffect, useRef, useCallback } from "react";
import GameOverModal from "../components/GameOverModal";
import { useSaveScoreAPI } from "../api/scores";
import { useNavigate } from "react-router-dom";

const ROWS = 10;
const COLS = 17;
const GAME_TIME = 60; // seconds

function getRandomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

interface GamePageProps {
  currentUserInfo: {
    username: string;
    nickname: string | null;
    id: string;
  } | null;
}

const GamePage: React.FC<GamePageProps> = ({ currentUserInfo }) => {
  const navigate = useNavigate();

  const [board, setBoard] = useState<(number | null)[][]>([]);
  const [dragStart, setDragStart] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [dragEnd, setDragEnd] = useState<{ row: number; col: number } | null>(
    null
  );
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [isPortrait, setIsPortrait] = useState(false); // 화면 가로모드인지 확인
  const [isMobile, setIsMobile] = useState(
    "ontouchstart" in window ||
      window.innerWidth < 1024 ||
      window.innerHeight < 600
  );
  const [orientationKey, setOrientationKey] = useState(0); // 강제 리렌더링을 위한 키
  const timerRef = useRef<number | null>(null);

  const { mutateAsync: saveScore } = useSaveScoreAPI();

  // 화면 방향 감지
  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode =
        window.innerHeight > window.innerWidth && window.innerWidth < 768;
      // 모바일 감지: 터치 기능이 있거나 작은 화면
      const isMobileDevice =
        "ontouchstart" in window ||
        window.innerWidth < 1024 ||
        window.innerHeight < 600;

      // 모바일 디버깅을 위한 정보 (잠시만 표시)
      // console.log('Orientation check:', {
      //   innerWidth: window.innerWidth,
      //   innerHeight: window.innerHeight,
      //   isPortraitMode,
      //   isMobileDevice,
      //   currentIsPortrait: isPortrait,
      //   currentIsMobile: isMobile
      // });

      setIsPortrait(isPortraitMode);
      setIsMobile(isMobileDevice);
      setOrientationKey((prev) => prev + 1); // 강제 리렌더링
    };

    // 초기 체크
    checkOrientation();

    // 화면 회전 이벤트 리스너
    const handleOrientationChange = () => {
      // orientationchange 이벤트는 여러 번의 지연을 통해 안정적으로 감지
      setTimeout(checkOrientation, 100);
      setTimeout(checkOrientation, 300);
      setTimeout(checkOrientation, 500);
    };

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", handleOrientationChange);

    // 추가적으로 screen orientation API도 사용
    if (screen && screen.orientation) {
      screen.orientation.addEventListener("change", handleOrientationChange);
    }

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", handleOrientationChange);
      if (screen && screen.orientation) {
        screen.orientation.removeEventListener(
          "change",
          handleOrientationChange
        );
      }
    };
  }, []);

  const generateBoard = () => {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => getRandomNumber())
    );
  };

  const resetGame = useCallback(() => {
    setBoard(generateBoard());
    setScore(0);
    setTimeLeft(GAME_TIME);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  useEffect(() => {
    if (timeLeft <= 0) {
      // 사용자 정보가 있을 때만 점수 저장
      if (currentUserInfo?.id) {
        const params = {
          user_id: currentUserInfo.id,
          score: score,
        };
        saveScore(params);
      }
      return;
    }

    // 모바일에서 게임 시작하기 전 세로 모드일 때는 타이머 일시정지
    if (timeLeft === 60 && isMobile && isPortrait) {
      return;
    }

    timerRef.current = window.setTimeout(
      () => setTimeLeft((prev) => prev - 1),
      1000
    );
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeLeft, currentUserInfo?.id, saveScore, score, isMobile, isPortrait]);

  const handleMouseDown = (row: number, col: number) => {
    if (board[row][col] === null || timeLeft <= 0) return;
    setDragStart({ row, col });
    setDragEnd({ row, col });
  };

  const handleMouseUp = () => {
    if (!dragStart || !dragEnd || timeLeft <= 0) return;

    const minRow = Math.min(dragStart.row, dragEnd.row);
    const maxRow = Math.max(dragStart.row, dragEnd.row);
    const minCol = Math.min(dragStart.col, dragEnd.col);
    const maxCol = Math.max(dragStart.col, dragEnd.col);

    const selected: { row: number; col: number }[] = [];

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (board[r][c] !== null) {
          selected.push({ row: r, col: c });
        }
      }
    }

    const sum = selected.reduce(
      (acc, pos) => acc + (board[pos.row][pos.col] || 0),
      0
    );

    if (sum === 10) {
      const newBoard = board.map((row) => [...row]);
      selected.forEach((pos) => {
        newBoard[pos.row][pos.col] = null;
      });
      setBoard(newBoard);
      setScore((prev) => prev + selected.length);
    }

    setDragStart(null);
    setDragEnd(null);
  };

  const isInSelection = (row: number, col: number) => {
    if (!dragStart || !dragEnd) return false;
    const minRow = Math.min(dragStart.row, dragEnd.row);
    const maxRow = Math.max(dragStart.row, dragEnd.row);
    const minCol = Math.min(dragStart.col, dragEnd.col);
    const maxCol = Math.max(dragStart.col, dragEnd.col);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  // 모바일 세로 모드일 때 회전 안내 화면 - 실시간 체크
  const isCurrentlyPortrait =
    isMobile &&
    window.innerHeight > window.innerWidth &&
    window.innerWidth < 768;
  if (isCurrentlyPortrait) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center text-white">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="flex justify-center items-center mb-6">
            <div className="text-6xl">📱</div>
            <div className="text-4xl">🔄</div>
          </div>

          <h2 className="text-2xl font-bold text-[#594A3C] mb-4">
            기기의 가로 모드를 <br /> 허용해주세요
          </h2>
          <p className="text-[#8C7764] mb-6">
            더 나은 게임 경험을 위해
            <br />
            화면을 가로로 돌려주세요.
          </p>
        </div>
      </div>
    );
  }

  const isLandscapeMobile = isMobile && window.innerWidth > window.innerHeight;

  return (
    <div
      className={`text-center text-white relative ${
        isLandscapeMobile
          ? "h-screen flex flex-row p-2 gap-4"
          : `flex flex-col items-center ${
              isMobile
                ? "h-screen justify-between py-1 px-1"
                : "min-h-screen justify-center p-4 md:p-8"
            }`
      }`}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      {/* 왼쪽 사이드바 (모바일 가로모드) 또는 상단 정보 (일반) */}
      <div
        className={
          isLandscapeMobile
            ? "flex flex-col justify-between h-full w-48 text-left"
            : `text-center ${isMobile ? "mb-1" : "mb-4 md:mb-6"}`
        }
      >
        {/* 게임 타이틀과 사용자 정보 */}
        <div className={isLandscapeMobile ? "space-y-2" : ""}>
          <h1
            className={`font-bold text-white drop-shadow-lg ${
              isLandscapeMobile
                ? "text-base"
                : isMobile
                ? "text-lg mb-1"
                : "text-3xl md:text-5xl mb-4 text-center"
            }`}
          >
            Drag Game
          </h1>

          <span
            className={`flex gap-2 text-white/80 ${
              isLandscapeMobile
                ? "flex-col text-xs"
                : `items-center ${isMobile ? "justify-center text-xs" : "justify-center text-sm md:text-base gap-4"}`
            }`}
          >
            <span>이용자:</span>
            <span>{`${
              currentUserInfo?.nickname || ""
            }(${currentUserInfo?.username})`}</span>
          </span>
        </div>

        {/* 점수와 시간 정보 */}
        {isLandscapeMobile ? (
          <div className="flex flex-col gap-2 text-sm text-white drop-shadow-md">
            <div className="flex flex-col gap-1">
              <p className="text-sm">점수: {score}</p>
              <p className="text-sm">
                남은 시간:{" "}
                <span className="text-base font-bold">{timeLeft}</span>s
              </p>
            </div>
            {/* 버튼들 */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                onClick={resetGame}
                className="bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white rounded-lg font-semibold
                         hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg hover:-translate-y-0.5
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer
                         px-3 py-2 text-xs w-full"
              >
                다시 시작
              </button>
              <button
                onClick={() => navigate("/ranking")}
                className="bg-gradient-to-r from-[#c4c3c2] to-[#bcb6b3] text-white rounded-lg font-semibold
                         hover:from-[#d6d6d6] hover:to-[#d1cbc5] transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg hover:-translate-y-0.5
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer
                         px-3 py-2 text-xs w-full"
              >
                나가기
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`flex items-center justify-between text-white drop-shadow-md ${
              isMobile
                ? "w-full flex-row text-sm mb-1 gap-2"
                : "flex-row text-lg md:text-xl mb-2 gap-2 md:gap-4"
            }`}
            style={!isMobile ? { width: 'calc(17 * (2.5rem + 0.25rem) - 0.25rem + 3rem)' } : {}}
          >
            <div
              className={`flex ${
                isMobile
                  ? "flex-row gap-4 text-xs"
                  : "flex-col items-start"
              }`}
            >
              <p className={isMobile ? "text-xs" : "text-sm md:text-base"}>
                점수: {score}
              </p>
              <p className={isMobile ? "text-xs" : "text-sm md:text-base"}>
                남은 시간:{" "}
                <span className={isMobile ? "text-sm" : "text-lg md:text-xl"}>
                  {timeLeft}
                </span>
                &nbsp;s
              </p>
            </div>

            <div className="flex gap-1">
              <button
                onClick={resetGame}
                className={`bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white rounded-lg font-semibold
                         hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg hover:-translate-y-0.5
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer
                         ${
                           isMobile
                             ? "px-2 py-1 text-xs"
                             : "px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm"
                         }`}
              >
                다시 시작
              </button>
              <button
                onClick={() => navigate("/ranking")}
                className={`bg-gradient-to-r from-[#c4c3c2] to-[#bcb6b3] text-white rounded-lg font-semibold
                         hover:from-[#d6d6d6] hover:to-[#d1cbc5] transition-all duration-300 ease-in-out
                         shadow-md hover:shadow-lg hover:-translate-y-0.5
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer
                         ${
                           isMobile
                             ? "px-2 py-1 text-xs"
                             : "px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm"
                         }`}
              >
                나가기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 게임 보드 */}
      <div
        className={`${
          isLandscapeMobile
            ? "flex-1 h-full flex items-center justify-center"
            : `w-full ${isMobile ? "flex-1 flex flex-col" : "max-w-fit mx-auto"}`
        }`}
      >
        <div
          className={`grid grid-cols-17 justify-center
                      bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 
                      ${
                        isLandscapeMobile
                          ? "gap-px p-1 h-full max-h-full aspect-[17/10]"
                          : isMobile
                          ? "gap-px p-1 flex-1 max-w-full h-full"
                          : "gap-1 p-3 md:p-6 mt-4"
                      }`}
          style={isMobile ? { gridTemplateRows: "repeat(10, 1fr)" } : {}}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const selected = isInSelection(rowIndex, colIndex);
              const isEmpty = cell === null;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                  ${
                    isMobile
                      ? "w-full h-full text-xs min-w-0 min-h-0"
                      : "w-8 h-8 md:w-10 md:h-10 text-sm md:text-base"
                  } 
                  rounded-lg flex items-center justify-center 
                  select-none font-semibold transition-all duration-500 ease-in-out shadow-sm
                  ${
                    timeLeft <= 0
                      ? isEmpty
                        ? "bg-white/20 border border-dashed border-white/30 cursor-default opacity-50"
                        : "bg-gradient-to-br from-[#f8f1ec] to-[#F2E4DC] border border-black/20 text-[#594A3C] cursor-default opacity-50"
                      : isEmpty
                      ? "bg-white/30 border border-dashed border-white/50 cursor-default"
                      : selected
                      ? "bg-gradient-to-br from-[#8C7764] to-[#594A3C] text-white scale-105 shadow-lg shadow-red-400/40 cursor-pointer"
                      : "bg-gradient-to-br from-[#f8f1ec] to-[#F2E4DC] border border-black/10 text-[#594A3C] hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
                  }
                `}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onTouchStart={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() =>
                    dragStart && setDragEnd({ row: rowIndex, col: colIndex })
                  }
                  onTouchMove={(e) => {
                    e.preventDefault();
                    if (!dragStart) return;
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(
                      touch.clientX,
                      touch.clientY
                    );
                    if (element) {
                      const cellData = element.getAttribute("data-cell");
                      if (cellData) {
                        const [r, c] = cellData.split("-").map(Number);
                        setDragEnd({ row: r, col: c });
                      }
                    }
                  }}
                  data-cell={`${rowIndex}-${colIndex}`}
                >
                  {cell ?? ""}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 게임 종료 모달 */}
      <GameOverModal
        isVisible={timeLeft <= 0}
        score={score}
        onRestart={resetGame}
      />
    </div>
  );
};

export default GamePage;

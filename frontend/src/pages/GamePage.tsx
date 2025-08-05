import React, { useState, useEffect, useRef, useCallback } from "react";
import GameOverModal from "../components/GameOverModal";
import { useSaveScoreAPI } from "../api/scores";
import { useNavigate } from "react-router-dom";

const ROWS = 10;
const COLS = 17;
const GAME_TIME = 10; // seconds

function getRandomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

interface GamePageProps {
  currentUserInfo: {
    username: string;
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
  const timerRef = useRef<number | null>(null);

  const { mutateAsync: saveScore } = useSaveScoreAPI();

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
    timerRef.current = window.setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeLeft, currentUserInfo?.id, saveScore, score]);

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

  return (
    <div
      className="min-h-screen p-8 text-center text-white flex flex-col items-center justify-center relative"
      onMouseUp={handleMouseUp}
    >
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-4">
          Drag Game
        </h1>

        <span className="flex items-center justify-center gap-4 text-white/80">
          이용자: {currentUserInfo?.username}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between w-full text-xl mb-4 text-white drop-shadow-md gap-4">
          <div className="flex flex-col items-start">
            <p>점수: {score}</p>

            <p>
              남은 시간 :&nbsp;
              <span className="text-xl">{timeLeft}</span>
              &nbsp;s
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white rounded-lg font-semibold text-sm
                       hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-300 ease-in-out
                       shadow-md hover:shadow-lg hover:-translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            >
              다시 시작하기
            </button>
            <button
              onClick={() => navigate("/ranking")}
              className="px-4 py-2 bg-gradient-to-r from-[#c4c3c2] to-[#bcb6b3] text-white rounded-lg font-semibold text-sm
                       hover:from-[#d6d6d6] hover:to-[#d1cbc5] transition-all duration-300 ease-in-out
                       shadow-md hover:shadow-lg hover:-translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
            >
              나가기
            </button>
          </div>
        </div>

        <div
          className="grid grid-cols-17 gap-1 justify-center mt-4 p-6 
                      bg-white/15 backdrop-blur-md rounded-2xl border border-white/20"
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const selected = isInSelection(rowIndex, colIndex);
              const isEmpty = cell === null;

              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                  w-10 h-10 rounded-lg flex items-center justify-center 
                  select-none text-base font-semibold transition-all duration-500 ease-in-out shadow-sm
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
                  onMouseEnter={() =>
                    dragStart && setDragEnd({ row: rowIndex, col: colIndex })
                  }
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

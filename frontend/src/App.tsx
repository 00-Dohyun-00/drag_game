import React, { useState, useEffect, useRef } from "react";

const ROWS = 10;
const COLS = 17;
const GAME_TIME = 10; // seconds

function getRandomNumber() {
  return Math.floor(Math.random() * 9) + 1;
}

function App() {
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateBoard = () => {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => getRandomNumber())
    );
  };

  const resetGame = () => {
    setBoard(generateBoard());
    setScore(0);
    setTimeLeft(GAME_TIME);
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft]);

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
      setScore((prev) => prev + 1);
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
      className="min-h-screen p-8 text-center text-white flex flex-col items-center justify-center"
      onMouseUp={handleMouseUp}
    >
      <h1 className="text-4xl mb-6 text-white drop-shadow-lg font-bold">
        Drag Game
      </h1>

      <p>남은 시간: {timeLeft}s</p>

      <div>
        <div className="flex items-center justify-between w-full text-xl mb-4 text-white drop-shadow-md gap-4">
          <p>점수: {score}</p>

          <button
            onClick={resetGame}
            className="bg-[#F2E4DC] to-red-500 hover:from-red-500 hover:to-red-600 
                   disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed
                   border-none px-3 py-2 rounded-2xl text-[#594A3C] text-base font-semibold 
                   cursor-pointer my-4 transition-all duration-300 ease-in-out
                   shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:hover:translate-y-0"
          >
            다시 시작하기
          </button>
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
                  select-none text-base font-semibold transition-all duration-200 ease-in-out shadow-sm
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
    </div>
  );
}

export default App;

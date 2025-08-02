import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const ROWS = 10;
const COLS = 17;
const GAME_TIME = 60; // seconds

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
    <div className="app" onMouseUp={handleMouseUp}>
      <h1>🧩 Drag Game</h1>
      <p>점수: {score}</p>
      <p>남은 시간: {timeLeft}s</p>
      <button onClick={resetGame} disabled={timeLeft === 0}>
        🔄 게임 리셋
      </button>
      <div className="board">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const selected = isInSelection(rowIndex, colIndex);
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`cell ${selected ? "selected" : ""} ${
                  cell === null ? "empty" : ""
                }`}
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
  );
}

export default App;

import React, { useState, useEffect, useRef, useCallback } from "react";
import GameOverModal from "../../components/GameOverModal";
import { useSaveScoreAPI } from "../../api/scores";
import { useNavigate } from "react-router-dom";
import * as S from "./styles";

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
  const mobileSizeBase = 768;

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
  const [isPortrait, setIsPortrait] = useState(false); // 가로모드, 세로모드 판단
  const [isMobile, setIsMobile] = useState(
    "ontouchstart" in window || window.innerWidth < mobileSizeBase
  );
  const [_orientationKey, setOrientationKey] = useState(0); // 강제 리랜더링 위한 함수(모바일 세로모드 모달 문제)
  const timerRef = useRef<number | null>(null);
  const hasSavedRef = useRef(false);

  const { mutateAsync: saveScore } = useSaveScoreAPI();

  // 화면 방향 감지
  useEffect(() => {
    const checkOrientation = () => {
      const isPortraitMode =
        window.innerHeight > window.innerWidth &&
        window.innerWidth < mobileSizeBase;
      const isMobileDevice =
        "ontouchstart" in window || window.innerWidth < mobileSizeBase;

      setIsPortrait(isPortraitMode);
      setIsMobile(isMobileDevice);
      setOrientationKey((prev) => prev + 1);
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation); // 화면사이즈 변경시
    window.addEventListener("orientationchange", checkOrientation); // 화면 회전시

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  // 렌덤 숫자
  const generateBoard = () => {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => getRandomNumber())
    );
  };

  // 리셋 게임
  const resetGame = useCallback(() => {
    setBoard(generateBoard());
    setScore(0);
    setTimeLeft(GAME_TIME);
    hasSavedRef.current = false;
  }, []);

  useEffect(() => {
    resetGame();
  }, []);

  // 카운트다운 useEffect
  useEffect(() => {
    // 게임 시작시 가로모드 안내 모달 보는 동안 시간 카운트 안 함
    if (timeLeft === 60 && isMobile && isPortrait) {
      return;
    }

    // 시간 1초씩 카운트다운
    timerRef.current = window.setTimeout(
      () => setTimeLeft((prev) => prev - 1),
      1000
    );

    // cleanup
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [timeLeft, currentUserInfo?.id, isMobile, isPortrait]);

  // 점수 저장 useEffect
  useEffect(() => {
    // 시간이 0이 되면 점수 저장
    if (timeLeft <= 0 && !hasSavedRef.current) {
      hasSavedRef.current = true;
      if (currentUserInfo?.id) {
        const params = {
          user_id: currentUserInfo.id,
          score: score,
        };
        saveScore(params);
      }
      return;
    }
  }, [timeLeft, currentUserInfo?.id, score, saveScore]);

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

  // 모바일 세로 모드일 때 회전 안내 화면
  const isCurrentlyPortrait =
    isMobile &&
    window.innerHeight > window.innerWidth &&
    window.innerWidth < mobileSizeBase;
  if (isCurrentlyPortrait) {
    return (
      <S.OrientationModal>
        <S.OrientationContent>
          <S.OrientationIcons>
            <div className="phone-icon">📱</div>
            <div className="rotate-icon">🔄</div>
          </S.OrientationIcons>
          <S.OrientationTitle>
            기기의 가로 모드를 <br /> 허용해주세요
          </S.OrientationTitle>
          <S.OrientationText>
            더 나은 게임 경험을 위해
            <br />
            화면을 가로로 돌려주세요.
          </S.OrientationText>
        </S.OrientationContent>
      </S.OrientationModal>
    );
  }

  const isLandscapeMobile = isMobile && window.innerWidth > window.innerHeight;

  return (
    <S.GameContainer
      isLandscapeMobile={isLandscapeMobile}
      isMobile={isMobile}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      <S.InfoContainer
        isLandscapeMobile={isLandscapeMobile}
        isMobile={isMobile}
      >
        <div
          style={
            isLandscapeMobile
              ? { display: "flex", flexDirection: "column", gap: "0.5rem" }
              : {}
          }
        >
          <S.GameTitle
            isLandscapeMobile={isLandscapeMobile}
            isMobile={isMobile}
          >
            Drag Game
          </S.GameTitle>

          <S.UserInfo isLandscapeMobile={isLandscapeMobile} isMobile={isMobile}>
            <span>이용자:</span>
            <span>{`${
              currentUserInfo?.nickname || ""
            }(${currentUserInfo?.username})`}</span>
          </S.UserInfo>
        </div>

        {isLandscapeMobile ? (
          <div>
            <S.ScoreTimeInfo
              isLandscapeMobile={isLandscapeMobile}
              isMobile={isMobile}
            >
              <S.ScoreText
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
              >
                점수: {score}
              </S.ScoreText>
              <S.TimeText
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
              >
                남은 시간:{" "}
                <S.TimeValue
                  isLandscapeMobile={isLandscapeMobile}
                  isMobile={isMobile}
                >
                  {timeLeft}
                </S.TimeValue>
                s
              </S.TimeText>
            </S.ScoreTimeInfo>
            <S.ButtonContainer isLandscapeMobile={isLandscapeMobile}>
              <S.GameButton
                onClick={resetGame}
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
                variant="primary"
              >
                다시 시작
              </S.GameButton>
              <S.GameButton
                onClick={() => navigate("/ranking")}
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
                variant="secondary"
              >
                나가기
              </S.GameButton>
            </S.ButtonContainer>
          </div>
        ) : (
          <S.ScoreTimeContainer
            isLandscapeMobile={isLandscapeMobile}
            isMobile={isMobile}
          >
            <S.ScoreTimeInfo
              isLandscapeMobile={isLandscapeMobile}
              isMobile={isMobile}
            >
              <S.ScoreText
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
              >
                점수: {score}
              </S.ScoreText>
              <S.TimeText
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
              >
                남은 시간:
                <S.TimeValue
                  isLandscapeMobile={isLandscapeMobile}
                  isMobile={isMobile}
                >
                  {timeLeft}
                </S.TimeValue>
                &nbsp;s
              </S.TimeText>
            </S.ScoreTimeInfo>

            <S.ButtonContainer isLandscapeMobile={isLandscapeMobile}>
              <S.GameButton
                onClick={resetGame}
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
                variant="primary"
              >
                다시 시작
              </S.GameButton>
              <S.GameButton
                onClick={() => navigate("/ranking")}
                isLandscapeMobile={isLandscapeMobile}
                isMobile={isMobile}
                variant="secondary"
              >
                나가기
              </S.GameButton>
            </S.ButtonContainer>
          </S.ScoreTimeContainer>
        )}
      </S.InfoContainer>

      <S.GameBoardContainer
        isLandscapeMobile={isLandscapeMobile}
        isMobile={isMobile}
      >
        <S.GameBoard
          isLandscapeMobile={isLandscapeMobile}
          isMobile={isMobile}
          style={isMobile ? { gridTemplateRows: "repeat(10, 1fr)" } : {}}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const selected = isInSelection(rowIndex, colIndex);
              const isEmpty = cell === null;

              return (
                <S.GameCell
                  key={`${rowIndex}-${colIndex}`}
                  isEmpty={isEmpty}
                  selected={selected}
                  gameEnded={timeLeft <= 0}
                  isMobile={isMobile}
                  onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                  onTouchStart={() => handleMouseDown(rowIndex, colIndex)}
                  onMouseEnter={() =>
                    dragStart && setDragEnd({ row: rowIndex, col: colIndex })
                  }
                  onTouchMove={(e: React.TouchEvent) => {
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
                </S.GameCell>
              );
            })
          )}
        </S.GameBoard>
      </S.GameBoardContainer>

      <GameOverModal
        isVisible={timeLeft <= 0}
        score={score}
        onRestart={resetGame}
      />
    </S.GameContainer>
  );
};

export default GamePage;

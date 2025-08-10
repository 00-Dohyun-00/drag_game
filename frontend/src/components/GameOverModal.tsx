import React from "react";
import { useNavigate } from "react-router-dom";
import { isLandscapeMobile, isMobile } from "../utils/device";

interface GameOverModalProps {
  isVisible: boolean;
  score: number;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({
  isVisible,
  score,
  onRestart,
}) => {
  const navigate = useNavigate();

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2">
      <div
        className={`modal-slide-up bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 text-center mx-4 
        ${
          isLandscapeMobile()
            ? "max-w-sm p-4 max-h-[90vh] overflow-y-auto"
            : "max-w-md p-8"
        }`}
      >
        <div
          className={isLandscapeMobile() ? "text-4xl mb-2" : "text-6xl mb-4"}
        >
          🎉
        </div>
        <h2
          className={`font-bold text-[#594A3C] ${
            isLandscapeMobile() ? "text-2xl mb-2" : "text-3xl mb-4"
          }`}
        >
          게임 종료!
        </h2>
        <div
          className={`text-[#8C7764] ${
            isLandscapeMobile() ? "text-base mb-4" : "text-lg mb-6"
          }`}
        >
          <p className={isLandscapeMobile() ? "mb-1" : "mb-2"}>최종 점수</p>
          <div
            className={`font-bold text-[#594A3C] ${
              isLandscapeMobile() ? "text-3xl mb-2" : "text-5xl mb-4"
            }`}
          >
            {score}
          </div>
          <p className="text-sm opacity-75">잘했어요!</p>
        </div>
        <div
          className={`flex ${
            isLandscapeMobile() ? "flex-row gap-2" : "flex-col gap-2"
          }`}
        >
          <button
            onClick={onRestart}
            className={`bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white rounded-2xl font-semibold
                     hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-700 ease-in-out
                     shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer
                     ${
                       isLandscapeMobile()
                         ? "px-4 py-2 text-sm flex-1"
                         : "px-8 py-3"
                     }`}
          >
            다시 도전하기
          </button>
          <button
            onClick={() => navigate("/ranking")}
            className={`bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white rounded-2xl font-semibold
                     hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-700 ease-in-out
                     shadow-lg hover:shadow-xl hover:-translate-y-1 cursor-pointer
                     ${
                       isLandscapeMobile()
                         ? "px-4 py-2 text-sm flex-1"
                         : "px-8 py-3"
                     }`}
          >
            랭킹 페이지로
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;

import React from "react";

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
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="modal-slide-up bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-md mx-4">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-bold text-[#594A3C] mb-4">게임 종료!</h2>
        <div className="text-[#8C7764] text-lg mb-6">
          <p className="mb-2">최종 점수</p>
          <div className="text-5xl font-bold text-[#594A3C] mb-4">{score}</div>
          <p className="text-sm opacity-75">잘했어요!</p>
        </div>
        <button
          onClick={onRestart}
          className="bg-gradient-to-r from-[#8C7764] to-[#594A3C] text-white px-8 py-3 rounded-2xl font-semibold
                     hover:from-[#594A3C] hover:to-[#3d3329] transition-all duration-700 ease-in-out
                     shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          다시 도전하기
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;

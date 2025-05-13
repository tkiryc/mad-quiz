import React from 'react';
import { Quiz } from '../types';

type Props = {
  quiz: Quiz;
  onSelectAnswer: (idx: number) => void;
  onClose: () => void;
};

const QuizModal: React.FC<Props> = ({ quiz, onSelectAnswer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-gradient-to-br from-blue-100 via-white to-blue-200 shadow-2xl rounded-3xl p-8 w-full max-w-lg animate-fade-in">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-blue-400 text-white rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-lg animate-bounce">
            <svg xmlns='http://www.w3.org/2000/svg' className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h.01M12 4a8 8 0 018 8c0 3.87-3.13 7-7 7s-7-3.13-7-7a8 8 0 018-8z" /></svg>
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-wide mb-1">クイズ</h3>
          <div className="text-base text-gray-700 font-semibold text-center px-2 mb-2 drop-shadow-sm" style={{wordBreak: 'break-word'}}>{quiz.question}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {quiz.options.map((opt, idx) => (
            <button
              key={idx}
              className="transition-all duration-150 bg-white/80 border-2 border-blue-300 shadow hover:shadow-xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-200 hover:to-purple-200 text-blue-700 font-bold py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
              onClick={() => onSelectAnswer(idx)}
            >
              {opt}
            </button>
          ))}
        </div>
        <button className="mt-2 text-sm text-gray-500 hover:text-blue-700 transition" onClick={onClose}>
          閉じる
        </button>
        <span className="absolute top-2 right-4 text-xs text-gray-400 select-none">Quiz & Bingo</span>
      </div>
    </div>
  );
};

export default QuizModal;

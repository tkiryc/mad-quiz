import React from 'react';
import { Quiz } from '../types';

type Props = {
  quiz: Quiz;
  quizNo: number;
  onSelectAnswer: (idx: number) => void;
  onClose: () => void;
};

const QuizModal: React.FC<Props> = ({ quiz, quizNo, onSelectAnswer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="relative bg-gradient-to-br from-blue-100 via-white to-blue-200 shadow-2xl rounded-3xl p-8 w-full max-w-lg animate-fade-in">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-blue-400 text-white rounded-full w-16 h-16 flex items-center justify-center mb-2 shadow-lg animate-bounce">
            <svg xmlns='http://www.w3.org/2000/svg' className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20h.01M12 4a8 8 0 018 8c0 3.87-3.13 7-7 7s-7-3.13-7-7a8 8 0 018-8z" /></svg>
          </div>
          <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent tracking-wide mb-1">問題{quiz.question}</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {['チームA', 'チームB', 'チームC', 'チームD', '不正解'].map((label, idx) => (
            <button
              key={idx}
              className="transition-all duration-150 bg-white/80 border-2 border-blue-300 shadow hover:shadow-xl hover:-translate-y-1 hover:bg-gradient-to-r hover:from-blue-200 hover:to-purple-200 text-blue-700 font-bold py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
              onClick={() => onSelectAnswer(idx)}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="absolute top-3 left-4 text-gray-400 hover:text-blue-600 transition focus:outline-none"
          onClick={onClose}
          aria-label="閉じる"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span className="absolute top-2 right-4 text-xs text-gray-400 select-none">Quiz & Bingo</span>
      </div>
    </div>
  );
};

export default QuizModal;

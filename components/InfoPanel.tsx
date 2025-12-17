import React from 'react';

interface InfoPanelProps {
  message: string;
  score: number;
  isAiLoading: boolean;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({ message, score, isAiLoading }) => {
  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-6 mb-6 border-l-8 border-emerald-400">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex-1">
          <h2 className="text-slate-500 text-lg font-medium mb-1">溫馨提醒</h2>
          <p className={`text-2xl text-slate-800 font-bold leading-relaxed min-h-[4rem] flex items-center ${isAiLoading ? 'animate-pulse opacity-70' : ''}`}>
            {message}
          </p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-4 min-w-[120px] text-center border-2 border-orange-100">
          <div className="text-orange-600 text-sm font-bold uppercase tracking-wide">已整理</div>
          <div className="text-4xl font-black text-orange-500 mt-1">{score}</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { GridCell } from '../types';
import { ITEMS_MAP } from '../constants';

interface CellProps {
  cell: GridCell;
  onClick: (id: number) => void;
}

export const Cell: React.FC<CellProps> = ({ cell, onClick }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick(cell.id);
    }
  };

  return (
    <button
      onClick={() => onClick(cell.id)}
      onKeyDown={handleKeyDown}
      aria-label={cell.isActive ? `點擊收集 ${cell.item ? ITEMS_MAP[cell.item] : '物品'}` : '空格'}
      disabled={!cell.isActive}
      className={`
        relative w-full h-32 sm:h-40 rounded-2xl transition-all duration-300 ease-in-out
        flex items-center justify-center text-6xl sm:text-7xl shadow-md
        focus:outline-none focus:ring-4 focus:ring-orange-400
        ${cell.isActive 
          ? 'bg-amber-100 border-4 border-amber-400 scale-105 shadow-xl cursor-pointer hover:bg-amber-200' 
          : 'bg-slate-100 border-2 border-slate-200 text-transparent scale-100 cursor-default'}
      `}
    >
      <span className={`transition-opacity duration-300 ${cell.isActive ? 'opacity-100' : 'opacity-0'}`}>
        {cell.item ? ITEMS_MAP[cell.item] : ''}
      </span>
      
      {/* High contrast ripple effect hint for seniors */}
      {cell.isActive && (
        <span className="absolute inset-0 rounded-2xl animate-pulse border-4 border-amber-300 opacity-50"></span>
      )}
    </button>
  );
};
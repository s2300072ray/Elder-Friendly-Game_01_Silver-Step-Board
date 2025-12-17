import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, GridCell, ItemType } from './types';
import { GRID_SIZE, TOTAL_CELLS, TICK_INTERVAL_MS, ITEMS_ARRAY } from './constants';
import { Cell } from './components/Cell';
import { InfoPanel } from './components/InfoPanel';
import { getEncouragement, getWelcomeMessage } from './services/geminiService';

const App: React.FC = () => {
  // -- State --
  const [gameState, setGameState] = useState<GameState>(GameState.IDLE);
  const [cells, setCells] = useState<GridCell[]>([]);
  const [activeCellId, setActiveCellId] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [aiMessage, setAiMessage] = useState<string>("點擊「開始整理」來活動一下吧！");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Ref to track interval for cleanup
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ref to store the latest tick function to avoid effect dependencies triggering loops
  const tickRef = useRef<() => void>(() => {});

  // -- Initialization --
  useEffect(() => {
    // Initialize Grid
    const initialCells: GridCell[] = Array.from({ length: TOTAL_CELLS }, (_, i) => ({
      id: i,
      isActive: false,
      item: null
    }));
    setCells(initialCells);
    
    // Initial greeting
    fetchWelcomeMessage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchWelcomeMessage = async () => {
    setIsAiLoading(true);
    const msg = await getWelcomeMessage();
    setAiMessage(msg);
    setIsAiLoading(false);
  };

  // -- Game Logic: The "Event Dispatcher" (Heartbeat) --
  const tick = useCallback(() => {
    // Pick a random cell different from the current one
    setCells(prevCells => {
      const availableIds = prevCells.map(c => c.id).filter(id => id !== activeCellId);
      if (availableIds.length === 0) return prevCells;
      
      const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
      const randomItem = ITEMS_ARRAY[Math.floor(Math.random() * ITEMS_ARRAY.length)];
      
      // Update State
      setActiveCellId(randomId);
      return prevCells.map(cell => ({
        ...cell,
        isActive: cell.id === randomId,
        item: cell.id === randomId ? randomItem : null
      }));
    });
  }, [activeCellId]);

  // Keep tickRef updated with the latest tick closure
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  // -- Game Loop Effect --
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      // Immediate first tick using ref to avoid dependency cycle
      tickRef.current();
      
      // Set interval for subsequent ticks
      timerRef.current = setInterval(() => {
        tickRef.current();
      }, TICK_INTERVAL_MS);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]); // Only run when GameState changes

  // -- Interaction Handlers --
  const handleCellClick = async (id: number) => {
    if (gameState !== GameState.PLAYING) return;
    if (id !== activeCellId) return;

    // Logic: User clicked the correct cell
    setScore(prev => prev + 1);
    
    // Visual feedback: Clear immediately to show "Tidied"
    setCells(prev => prev.map(c => c.id === id ? { ...c, isActive: false, item: null } : c));
    setActiveCellId(null); 
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Small delay before next item appears (Reduced to 300ms for better responsiveness)
    setTimeout(() => {
       tick(); // Call immediate tick
       // Restart the heartbeat using tickRef
       timerRef.current = setInterval(() => tickRef.current(), TICK_INTERVAL_MS);
    }, 300);

    // AI Encouragement every 5 items
    if ((score + 1) % 5 === 0) {
      setIsAiLoading(true);
      // Do not await here to prevent UI lag
      getEncouragement(score + 1).then(msg => {
        setAiMessage(msg);
        setIsAiLoading(false);
      });
    }
  };

  const startGame = () => {
    setScore(0);
    setGameState(GameState.PLAYING);
    setAiMessage("開始囉！看到亮起的格子，輕輕點一下。");
  };

  const stopGame = () => {
    setGameState(GameState.IDLE);
    setCells(prev => prev.map(c => ({ ...c, isActive: false, item: null })));
    setAiMessage("休息時間。您今天整理得真好！");
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="min-h-screen bg-[#FEF9E7] text-slate-800 p-4 md:p-8 font-sans flex flex-col items-center">
      
      {/* Header Section */}
      <header className="w-full max-w-2xl flex flex-col items-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-2 tracking-wide">
          銀髮慢步棋 🐢
        </h1>
        <p className="text-lg text-slate-600">
          生活動作認知訓練 • 輕鬆整理 • 享受慢活
        </p>
      </header>

      {/* Game Container */}
      <main className="w-full max-w-2xl flex flex-col items-center">
        
        <InfoPanel message={aiMessage} score={score} isAiLoading={isAiLoading} />

        {/* The Board */}
        <div 
          className="grid grid-cols-3 gap-4 sm:gap-6 p-6 bg-white rounded-3xl shadow-xl border-b-8 border-slate-200 w-full aspect-square max-w-[500px]"
          role="grid"
          aria-label="遊戲棋盤"
        >
          {cells.map(cell => (
            <Cell key={cell.id} cell={cell} onClick={handleCellClick} />
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 flex gap-6 w-full max-w-md justify-center">
          {gameState === GameState.IDLE || gameState === GameState.FINISHED ? (
            <button 
              onClick={startGame}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-2xl font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 active:scale-95"
            >
              開始整理
            </button>
          ) : (
            <button 
              onClick={stopGame}
              className="flex-1 bg-orange-400 hover:bg-orange-500 text-white text-2xl font-bold py-4 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              休息一下
            </button>
          )}
        </div>

        {/* Instructional / Safe Text */}
        <div className="mt-8 text-center text-slate-500 max-w-md">
          <p className="mb-2">💡 玩法提示：</p>
          <p className="text-lg">
            不用急，看到物品出現時，<br/>
            用滑鼠點擊它，把它收起來。
          </p>
        </div>

      </main>
    </div>
  );
};

export default App;
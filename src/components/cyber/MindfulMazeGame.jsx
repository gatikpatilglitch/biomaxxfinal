import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Pause, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  Heart, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Smile,
  Meh,
  Frown
} from 'lucide-react';
import { soundFx } from '../../utils/audioSynthesizer';

// Predefined, verified, 100% solvable serene mazes
// 0 = Walkable Path, 1 = Wall
const MAZE_LEVELS = [
  {
    level: 1,
    title: "Gentle Flow",
    rows: 6,
    cols: 6,
    start: { r: 0, c: 0 },
    end: { r: 5, c: 5 },
    grid: [
      [0, 0, 0, 1, 1, 1],
      [1, 1, 0, 0, 0, 1],
      [1, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0],
      [1, 0, 0, 0, 1, 0],
      [1, 1, 1, 0, 0, 0]
    ]
  },
  {
    level: 2,
    title: "Tranquil Spiral",
    rows: 7,
    cols: 7,
    start: { r: 0, c: 0 },
    end: { r: 6, c: 6 },
    grid: [
      [0, 0, 0, 0, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1, 0, 1],
      [1, 0, 1, 1, 1, 0, 0],
      [1, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0]
    ]
  },
  {
    level: 3,
    title: "Serene Matrix",
    rows: 8,
    cols: 8,
    start: { r: 0, c: 0 },
    end: { r: 7, c: 7 },
    grid: [
      [0, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 1, 1, 0, 0, 1],
      [1, 0, 1, 1, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 1, 0, 0],
      [1, 1, 1, 0, 1, 1, 1, 0],
      [1, 0, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 0, 0, 0]
    ]
  }
];

export default function MindfulMazeGame({ onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const currentMaze = MAZE_LEVELS[levelIdx];

  // Player position in grid coordinates { r, c }
  const [playerPos, setPlayerPos] = useState(currentMaze.start);
  const [visitedTrail, setVisitedTrail] = useState([currentMaze.start]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'better' | 'same' | 'stressed'
  const [breathText, setBreathText] = useState('Inhale gently...');
  const mazeContainerRef = useRef(null);

  // Subtle breathing guide rhythm
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathText(prev => prev.startsWith('Inhale') ? 'Exhale slowly...' : 'Inhale gently...');
    }, 4000);
    return () => clearInterval(breathInterval);
  }, []);

  // Reset state when switching levels
  const resetLevel = useCallback((idx = levelIdx) => {
    const targetMaze = MAZE_LEVELS[idx];
    setPlayerPos(targetMaze.start);
    setVisitedTrail([targetMaze.start]);
    setIsCompleted(false);
    setIsPaused(false);
    setFeedback(null);
  }, [levelIdx]);

  // Movement validator
  const canMoveTo = useCallback((r, c) => {
    if (r < 0 || r >= currentMaze.rows || c < 0 || c >= currentMaze.cols) return false;
    return currentMaze.grid[r][c] === 0;
  }, [currentMaze]);

  // Smooth step handler
  const movePlayer = useCallback((newR, newC) => {
    if (isCompleted || isPaused) return;
    if (!canMoveTo(newR, newC)) return;

    soundFx?.playPopSound?.(1.4);
    setPlayerPos({ r: newR, c: newC });
    setVisitedTrail(prev => {
      // Append only if not the exact same point
      const last = prev[prev.length - 1];
      if (last && last.r === newR && last.c === newC) return prev;
      return [...prev, { r: newR, c: newC }];
    });

    // Check completion
    if (newR === currentMaze.end.r && newC === currentMaze.end.c) {
      soundFx?.playPopSound?.(1.8);
      setTimeout(() => {
        setIsCompleted(true);
      }, 250);
    }
  }, [canMoveTo, currentMaze, isCompleted, isPaused]);

  // Directional actions
  const moveUp = () => movePlayer(playerPos.r - 1, playerPos.c);
  const moveDown = () => movePlayer(playerPos.r + 1, playerPos.c);
  const moveLeft = () => movePlayer(playerPos.r, playerPos.c - 1);
  const moveRight = () => movePlayer(playerPos.r, playerPos.c + 1);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        moveUp();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        moveDown();
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        moveLeft();
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        moveRight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveUp, moveDown, moveLeft, moveRight]);

  // Touch/pointer drag gesture detection
  const handleTouchStartPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    handleTouchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e) => {
    if (isCompleted || isPaused) return;
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - handleTouchStartPos.current.x;
    const dy = touch.clientY - handleTouchStartPos.current.y;
    const threshold = 24;

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) moveRight();
        else moveLeft();
      } else {
        if (dy > 0) moveDown();
        else moveUp();
      }
      handleTouchStartPos.current = { x: touch.clientX, y: touch.clientY };
    }
  };

  // Next level handler
  const handleNextLevel = () => {
    soundFx?.playPopSound?.(1.3);
    if (levelIdx < MAZE_LEVELS.length - 1) {
      const nextIdx = levelIdx + 1;
      setLevelIdx(nextIdx);
      resetLevel(nextIdx);
    } else {
      // Loop or restart
      resetLevel(0);
      setLevelIdx(0);
    }
  };

  return (
    <div className="space-y-4 font-mono select-none animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER NAVIGATION BAR                                              */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <button
          onClick={() => {
            soundFx?.playPopSound?.(1.1);
            onBack();
          }}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-sm font-bold text-white font-sans tracking-wide">
            Mindful Maze
          </h2>
          <span className="text-[10px] text-cyan-400 font-bold block">
            Level {currentMaze.level} • {currentMaze.title}
          </span>
        </div>

        <button
          onClick={() => {
            soundFx?.playPopSound?.(1.2);
            setIsPaused(p => !p);
          }}
          className="text-xs text-slate-400 hover:text-white py-1 px-2.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. MINDFUL BREATHING & FOCUS GUIDANCE HUD                                */}
      {/* ========================================================================= */}
      <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE] animate-pulse" />
          <div>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase block">
              FOCUS
            </span>
            <p className="text-xs text-slate-200 font-sans">
              Follow the path. Take your time.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-cyan-300 font-bold tracking-widest uppercase">
            {breathText}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CENTER MAZE PANEL                                                      */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#090e18] border border-cyan-500/20 space-y-4 shadow-[0_0_30px_rgba(0,242,254,0.06)] relative overflow-hidden">
        
        {/* Subtle decorative glow orb in background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* The Maze Grid Container */}
        <div
          ref={mazeContainerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onMouseDown={handleTouchStart}
          onMouseMove={(e) => {
            if (e.buttons === 1) handleTouchMove(e);
          }}
          className="w-full aspect-square max-w-[340px] sm:max-w-[360px] mx-auto grid gap-1.5 p-2 rounded-2xl bg-[#070b13] border border-slate-800/80 shadow-inner relative touch-none"
          style={{
            gridTemplateRows: `repeat(${currentMaze.rows}, minmax(0, 1fr))`,
            gridTemplateColumns: `repeat(${currentMaze.cols}, minmax(0, 1fr))`
          }}
        >
          {currentMaze.grid.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const isWall = cell === 1;
              const isStart = r === currentMaze.start.r && c === currentMaze.start.c;
              const isEnd = r === currentMaze.end.r && c === currentMaze.end.c;
              const isPlayerHere = playerPos.r === r && playerPos.c === c;
              const isTrail = visitedTrail.some(t => t.r === r && t.c === c);

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => {
                    // Clicking adjacent cell moves player
                    const dr = Math.abs(playerPos.r - r);
                    const dc = Math.abs(playerPos.c - c);
                    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                      movePlayer(r, c);
                    }
                  }}
                  className={`rounded-xl transition-all duration-200 relative flex items-center justify-center ${
                    isWall
                      ? 'bg-slate-900/90 border border-slate-800/80 shadow-sm'
                      : isEnd
                        ? 'bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.3)]'
                        : isStart
                          ? 'bg-cyan-950/40 border border-cyan-500/40'
                          : isTrail
                            ? 'bg-cyan-950/20 border border-cyan-500/20'
                            : 'bg-slate-950/40 hover:bg-slate-900/40 border border-slate-800/40'
                  }`}
                >
                  {/* Start Marker */}
                  {isStart && !isPlayerHere && (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[8px] font-bold text-cyan-300 uppercase tracking-tighter">
                        START
                      </span>
                    </div>
                  )}

                  {/* End Destination Marker */}
                  {isEnd && (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter animate-pulse">
                        END ✦
                      </span>
                    </div>
                  )}

                  {/* Faint trail dot */}
                  {!isPlayerHere && isTrail && !isStart && !isEnd && (
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/30" />
                  )}

                  {/* Glowing Cyan Player Orb */}
                  {isPlayerHere && (
                    <div className="relative flex items-center justify-center">
                      {/* Breathing halo expanding and contracting gently */}
                      <div className="absolute w-8 h-8 rounded-full bg-[#00F2FE]/25 blur-[3px] animate-pulse" />
                      {/* Outer ring */}
                      <div className="w-6 h-6 rounded-full border border-cyan-300/80 shadow-[0_0_12px_#00F2FE] flex items-center justify-center bg-cyan-950/90">
                        {/* Core cyan jewel */}
                        <div className="w-3 h-3 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Minimal Soft Directional Controller for Easy Touch / Tap Accessibility */}
        <div className="pt-2 flex flex-col items-center space-y-1.5">
          <button
            onClick={moveUp}
            disabled={isCompleted || isPaused}
            className="w-11 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors active:scale-95"
            title="Move Up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={moveLeft}
              disabled={isCompleted || isPaused}
              className="w-11 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors active:scale-95"
              title="Move Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-11 h-9 flex items-center justify-center text-[10px] text-slate-500 font-sans">
              TAP / DRAG
            </div>
            <button
              onClick={moveRight}
              disabled={isCompleted || isPaused}
              className="w-11 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors active:scale-95"
              title="Move Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={moveDown}
            disabled={isCompleted || isPaused}
            className="w-11 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 flex items-center justify-center transition-colors active:scale-95"
            title="Move Down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM PROGRESS & CONTROLS HUD                                        */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-[#0c1220] border border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-slate-400">PROGRESS:</span>
          <span className="font-bold text-cyan-300">
            {currentMaze.level} / {MAZE_LEVELS.length}
          </span>
        </div>

        <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
          Stay focused • No timer • No pressure
        </span>

        <button
          onClick={() => resetLevel()}
          className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors"
          title="Restart current maze"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px]">Reset</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 5. PAUSE OVERLAY MODAL                                                    */}
      {/* ========================================================================= */}
      {isPaused && (
        <div className="p-5 rounded-3xl bg-[#0c1220]/95 border border-cyan-500/30 text-center space-y-3 shadow-2xl animate-in fade-in duration-200">
          <span className="text-xl">🍃</span>
          <h3 className="text-base font-bold text-white font-sans">
            Paused & Breathing
          </h3>
          <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-xs mx-auto">
            Rest here as long as you like. Relax your shoulders. Take one long breath before continuing.
          </p>
          <button
            onClick={() => {
              soundFx?.playPopSound?.(1.2);
              setIsPaused(false);
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs font-mono hover:opacity-90 transition-opacity"
          >
            Resume Journey
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. COMPLETION SCREEN MODAL                                                */}
      {/* ========================================================================= */}
      {isCompleted && (
        <div className="p-6 rounded-3xl bg-[#0a1120] border border-cyan-400/40 space-y-5 text-center shadow-[0_0_35px_rgba(0,242,254,0.15)] animate-in zoom-in-95 duration-300">
          
          <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-cyan-400 tracking-widest uppercase block">
              MAZE COMPLETE ✦
            </span>
            <h3 className="text-xl font-black text-white font-sans">
              You made it.
            </h3>
            <p className="text-xs text-slate-300 font-sans leading-relaxed pt-1">
              Take one slow breath before you continue. Feel the stillness.
            </p>
          </div>

          {/* Optional Post-Game Emotional Check-In */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 block font-sans">
              How do you feel now?
            </span>
            <div className="flex items-center justify-center space-x-3">
              {[
                { id: 'better', label: 'Better', icon: '🙂' },
                { id: 'same', label: 'Same', icon: '😐' },
                { id: 'stressed', label: 'Still stressed', icon: '😣' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundFx?.playPopSound?.(1.3);
                    setFeedback(opt.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans flex items-center space-x-1.5 border transition-all ${
                    feedback === opt.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            {feedback && (
              <span className="text-[10px] text-emerald-400 block pt-1 font-sans animate-in fade-in">
                Thank you for taking this moment for yourself.
              </span>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-2 pt-1 font-sans">
            {levelIdx < MAZE_LEVELS.length - 1 ? (
              <button
                onClick={handleNextLevel}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:opacity-95 transition-opacity"
              >
                Continue to Level {levelIdx + 2} →
              </button>
            ) : (
              <button
                onClick={() => resetLevel(0)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:opacity-95 transition-opacity"
              >
                Play Again ✦
              </button>
            )}

            <button
              onClick={() => {
                soundFx?.playPopSound?.(1.1);
                onBack();
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs font-mono transition-colors"
            >
              Back to Actions
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Pause, 
  Play, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { soundFx } from '../../utils/audioSynthesizer';

// Level metadata configuration
const MAZE_LEVELS = [
  {
    level: 1,
    title: "Gentle Flow",
    rows: 6,
    cols: 6,
    start: { r: 0, c: 0 },
    end: { r: 5, c: 5 }
  },
  {
    level: 2,
    title: "Tranquil Spiral",
    rows: 7,
    cols: 7,
    start: { r: 0, c: 0 },
    end: { r: 6, c: 6 }
  },
  {
    level: 3,
    title: "Serene Matrix",
    rows: 8,
    cols: 8,
    start: { r: 0, c: 0 },
    end: { r: 7, c: 7 }
  }
];

/**
 * Procedural Mindful Maze Generator
 * Guarantees a 100% solvable, calming, winding path from (0,0) to (rows-1, cols-1)
 * with organic branching every time it is called.
 */
function generateMindfulMaze(rows, cols) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(1));
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const target = { r: rows - 1, c: cols - 1 };
  const path = [];

  function findPath(r, c) {
    visited[r][c] = true;
    path.push({ r, c });
    if (r === target.r && c === target.c) return true;

    // Shuffle 4 cardinal directions
    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ].sort(() => Math.random() - 0.5);

    // Gently bias towards target while preserving organic wander
    dirs.sort((a, b) => {
      const distA = Math.hypot(target.r - (r + a.dr), target.c - (c + a.dc));
      const distB = Math.hypot(target.r - (r + b.dr), target.c - (c + b.dc));
      return (distA - distB) + (Math.random() * 2.2 - 1.1);
    });

    for (const { dr, dc } of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited[nr][nc]) {
        if (findPath(nr, nc)) return true;
      }
    }
    path.pop();
    return false;
  }

  // Find guaranteed path
  const success = findPath(0, 0);

  // Carve primary walkable route (0 = walkable)
  if (success && path.length > 0) {
    for (const p of path) {
      grid[p.r][p.c] = 0;
    }
  } else {
    // Failsafe direct stair path if deep recursion hits edge
    let cr = 0, cc = 0;
    grid[0][0] = 0;
    while (cr < target.r || cc < target.c) {
      if (cr < target.r && (cc >= target.c || Math.random() < 0.5)) cr++;
      else cc++;
      grid[cr][cc] = 0;
    }
  }

  // Carve gentle dead-end alcoves from the main path for mindful curiosity
  for (const p of path) {
    if (Math.random() < 0.42) {
      const dirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
      ].sort(() => Math.random() - 0.5);

      for (const { dr, dc } of dirs) {
        const nr = p.r + dr;
        const nc = p.c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc] === 1) {
          // Avoid creating large 2x2 open rooms
          let neighborPaths = 0;
          for (const d of dirs) {
            const adjR = nr + d.dr;
            const adjC = nc + d.dc;
            if (adjR >= 0 && adjR < rows && adjC >= 0 && adjC < cols && grid[adjR][adjC] === 0) {
              neighborPaths++;
            }
          }
          if (neighborPaths <= 2) {
            grid[nr][nc] = 0;
            // Occasional 2nd step
            if (Math.random() < 0.25) {
              const nnr = nr + dr;
              const nnc = nc + dc;
              if (nnr >= 0 && nnr < rows && nnc >= 0 && nnc < cols && grid[nnr][nnc] === 1) {
                grid[nnr][nnc] = 0;
              }
            }
            break;
          }
        }
      }
    }
  }

  // Ensure start and end are always walkable
  grid[0][0] = 0;
  grid[target.r][target.c] = 0;

  return grid;
}

export default function MindfulMazeGame({ onBack }) {
  const [levelIdx, setLevelIdx] = useState(0);
  const currentMaze = MAZE_LEVELS[levelIdx];

  // Procedural maze grid for current level (regenerates uniquely on every reset)
  const [mazeGrid, setMazeGrid] = useState(() => 
    generateMindfulMaze(currentMaze.rows, currentMaze.cols)
  );

  // Player position in grid coordinates { r, c }
  const [playerPos, setPlayerPos] = useState(currentMaze.start);
  const [visitedTrail, setVisitedTrail] = useState([currentMaze.start]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'better' | 'same' | 'stressed'
  const [breathText, setBreathText] = useState('Inhale gently...');
  const [isGenerating, setIsGenerating] = useState(false);
  const [patternFlash, setPatternFlash] = useState(false);
  const mazeContainerRef = useRef(null);

  // Subtle breathing guide rhythm
  useEffect(() => {
    const breathInterval = setInterval(() => {
      setBreathText(prev => prev.startsWith('Inhale') ? 'Exhale slowly...' : 'Inhale gently...');
    }, 4000);
    return () => clearInterval(breathInterval);
  }, []);

  // Reset maze handler: Generates a brand new, unique solvable maze layout every time
  const handleResetMaze = useCallback((targetIdx = levelIdx) => {
    const targetLevel = MAZE_LEVELS[targetIdx];
    setIsGenerating(true);
    soundFx?.playPopSound?.(1.3);

    // Procedurally generate a completely new pattern
    const newGrid = generateMindfulMaze(targetLevel.rows, targetLevel.cols);
    setMazeGrid(newGrid);
    setPlayerPos(targetLevel.start);
    setVisitedTrail([targetLevel.start]);
    setIsCompleted(false);
    setIsPaused(false);
    setFeedback(null);
    setPatternFlash(true);

    setTimeout(() => setIsGenerating(false), 350);
    setTimeout(() => setPatternFlash(false), 2000);
  }, [levelIdx]);

  // Movement validator
  const canMoveTo = useCallback((r, c) => {
    if (r < 0 || r >= currentMaze.rows || c < 0 || c >= currentMaze.cols) return false;
    if (!mazeGrid || !mazeGrid[r]) return false;
    return mazeGrid[r][c] === 0;
  }, [currentMaze, mazeGrid]);

  // Smooth step handler
  const movePlayer = useCallback((newR, newC) => {
    if (isCompleted || isPaused) return;
    if (!canMoveTo(newR, newC)) return;

    soundFx?.playPopSound?.(1.4);
    setPlayerPos({ r: newR, c: newC });
    setVisitedTrail(prev => {
      const last = prev[prev.length - 1];
      if (last && last.r === newR && last.c === newC) return prev;
      return [...prev, { r: newR, c: newC }];
    });

    // Check completion
    if (newR === currentMaze.end.r && newC === currentMaze.end.c) {
      soundFx?.playPopSound?.(1.8);
      setTimeout(() => {
        setIsCompleted(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('biomaxxx_achievement_action', { 
            detail: { action: 'relaxation_activity', payload: { game: 'mindful_maze' } } 
          }));
        }
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
      } else if (['KeyR'].includes(e.code)) {
        e.preventDefault();
        handleResetMaze();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [moveUp, moveDown, moveLeft, moveRight, handleResetMaze]);

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
    const threshold = 22;

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

  // Next level handler: advances level and generates a new procedural layout
  const handleNextLevel = () => {
    soundFx?.playPopSound?.(1.3);
    const nextIdx = levelIdx < MAZE_LEVELS.length - 1 ? levelIdx + 1 : 0;
    setLevelIdx(nextIdx);
    handleResetMaze(nextIdx);
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
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700"
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

        {/* Top Control Action Buttons (Reset Pattern & Pause) */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleResetMaze()}
            className="flex items-center space-x-1 text-xs text-cyan-300 hover:text-white py-1.5 px-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-all active:scale-95 shadow-[0_0_10px_rgba(0,242,254,0.1)]"
            title="Reset maze with a new pattern (Key: R)"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="text-[11px] font-sans font-semibold">Reset</span>
          </button>

          <button
            onClick={() => {
              soundFx?.playPopSound?.(1.2);
              setIsPaused(p => !p);
            }}
            className="text-xs text-slate-400 hover:text-white py-1.5 px-2.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
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

      {/* Notice Banner: New Pattern Generated */}
      {patternFlash && (
        <div className="py-2 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-xs text-cyan-300 font-sans font-medium flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>New maze pattern generated. Find your path.</span>
          </span>
        </div>
      )}

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
          {mazeGrid.map((rowArr, r) =>
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

        {/* Dedicated Prominent Reset Button in Game Card */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={() => handleResetMaze()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition-all active:scale-95 shadow-[0_0_15px_rgba(0,242,254,0.12)] group"
          >
            <RotateCcw className={`w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 ${isGenerating ? 'animate-spin' : ''}`} />
            <span className="font-semibold">Reset Maze (New Pattern)</span>
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
          onClick={() => handleResetMaze()}
          className="flex items-center space-x-1.5 text-slate-300 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-850"
          title="Generate fresh maze layout"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-cyan-400 ${isGenerating ? 'animate-spin' : ''}`} />
          <span className="text-[11px] font-semibold">New Layout</span>
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
          <div className="space-y-2 pt-1 font-sans">
            <button
              onClick={() => {
                soundFx?.playPopSound?.(1.2);
                setIsPaused(false);
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs font-mono hover:opacity-90 transition-opacity"
            >
              Resume Journey
            </button>
            <button
              onClick={() => handleResetMaze()}
              className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 text-xs font-mono transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset with New Pattern</span>
            </button>
          </div>
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
                onClick={() => handleResetMaze(0)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs font-mono shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:opacity-95 transition-opacity"
              >
                Play Again (New Pattern) ✦
              </button>
            )}

            <button
              onClick={() => handleResetMaze()}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs font-mono transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Another Pattern</span>
            </button>

            <button
              onClick={() => {
                soundFx?.playPopSound?.(1.1);
                onBack();
              }}
              className="w-full py-2 rounded-2xl bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs font-mono transition-colors"
            >
              Back to Actions
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

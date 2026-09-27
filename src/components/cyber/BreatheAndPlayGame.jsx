import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Wind, 
  Heart, 
  Smile, 
  Meh, 
  Frown,
  Shuffle
} from 'lucide-react';
import { soundFx } from '../../utils/audioSynthesizer';

// Calming Botanical & Cosmic Symbols
const SYMBOL_LIBRARY = [
  { id: 'leaf', symbol: '🌿', label: 'Leaf', gradient: 'from-emerald-950/40 to-teal-950/40', border: 'border-emerald-500/40', glow: 'rgba(52, 211, 153, 0.3)' },
  { id: 'moon', symbol: '🌙', label: 'Moon', gradient: 'from-cyan-950/40 to-blue-950/40', border: 'border-cyan-500/40', glow: 'rgba(56, 189, 248, 0.3)' },
  { id: 'cloud', symbol: '☁️', label: 'Cloud', gradient: 'from-sky-950/40 to-indigo-950/40', border: 'border-sky-500/40', glow: 'rgba(125, 211, 252, 0.3)' },
  { id: 'wave', symbol: '🌊', label: 'Wave', gradient: 'from-blue-950/40 to-cyan-950/40', border: 'border-blue-500/40', glow: 'rgba(59, 130, 246, 0.3)' },
  { id: 'star', symbol: '⭐', label: 'Star', gradient: 'from-amber-950/40 to-orange-950/40', border: 'border-amber-500/40', glow: 'rgba(251, 191, 36, 0.3)' },
  { id: 'bubble', symbol: '🫧', label: 'Bubble', gradient: 'from-teal-950/40 to-cyan-950/40', border: 'border-teal-500/40', glow: 'rgba(45, 212, 191, 0.3)' },
  { id: 'flower', symbol: '🌸', label: 'Lotus', gradient: 'from-pink-950/40 to-purple-950/40', border: 'border-pink-500/40', glow: 'rgba(244, 114, 182, 0.3)' },
  { id: 'breeze', symbol: '🍃', label: 'Breeze', gradient: 'from-emerald-950/40 to-green-950/40', border: 'border-emerald-500/40', glow: 'rgba(74, 222, 128, 0.3)' },
];

const DIFFICULTY_LEVELS = [
  { id: 'calm', name: 'Calm', pairs: 4, cols: 'grid-cols-4', subtitle: '4 pairs • 8 cards' },
  { id: 'focus', name: 'Focus', pairs: 6, cols: 'grid-cols-4', subtitle: '6 pairs • 12 cards' },
  { id: 'challenge', name: 'Challenge', pairs: 8, cols: 'grid-cols-4', subtitle: '8 pairs • 16 cards' }
];

/**
 * Generates and shuffles a fresh deck of paired cards
 */
function createShuffledDeck(pairCount) {
  const chosenSymbols = SYMBOL_LIBRARY.slice(0, pairCount);
  const deck = [];

  chosenSymbols.forEach((sym) => {
    // Each symbol appears exactly twice
    deck.push({
      uid: `${sym.id}-a-${Math.random().toString(36).substring(2, 7)}`,
      symbolId: sym.id,
      symbol: sym.symbol,
      label: sym.label,
      gradient: sym.gradient,
      border: sym.border,
      glow: sym.glow
    });
    deck.push({
      uid: `${sym.id}-b-${Math.random().toString(36).substring(2, 7)}`,
      symbolId: sym.id,
      symbol: sym.symbol,
      label: sym.label,
      gradient: sym.gradient,
      border: sym.border,
      glow: sym.glow
    });
  });

  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

export default function BreatheAndPlayGame({ onBack }) {
  const [levelId, setLevelId] = useState('focus');
  const currentLevel = useMemo(() => {
    return DIFFICULTY_LEVELS.find(l => l.id === levelId) || DIFFICULTY_LEVELS[1];
  }, [levelId]);

  // Game state
  const [cards, setCards] = useState(() => createShuffledDeck(currentLevel.pairs));
  const [flippedIndices, setFlippedIndices] = useState([]); // indices of currently revealed cards (up to 2)
  const [matchedUids, setMatchedUids] = useState(new Set()); // UIDs of matched cards
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [justMatchedId, setJustMatchedId] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMood, setFeedbackMood] = useState(null);
  const [resetNotice, setResetNotice] = useState(false);

  // Subtle breathing guide rhythm
  const [breathCue, setBreathCue] = useState('Match the pairs. Take your time.');
  useEffect(() => {
    const cues = [
      'Match the pairs. Take your time.',
      'Inhale softly as you reveal a card.',
      'Exhale slowly. Stay in this quiet moment.',
      'No rush. Follow your own calm rhythm.'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % cues.length;
      setBreathCue(cues[idx]);
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // Initialize or reset game deck
  const handleResetGame = useCallback((targetLevel = currentLevel) => {
    soundFx?.playPopSound?.(1.3);
    const newDeck = createShuffledDeck(targetLevel.pairs);
    setCards(newDeck);
    setFlippedIndices([]);
    setMatchedUids(new Set());
    setMoves(0);
    setIsLocked(false);
    setJustMatchedId(null);
    setIsCompleted(false);
    setFeedbackMood(null);

    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 1800);
  }, [currentLevel]);

  // Level change handler
  const handleSelectLevel = (newLevelId) => {
    if (newLevelId === levelId) return;
    const lvl = DIFFICULTY_LEVELS.find(l => l.id === newLevelId) || DIFFICULTY_LEVELS[1];
    setLevelId(newLevelId);
    handleResetGame(lvl);
  };

  // Check completion
  useEffect(() => {
    if (matchedUids.size > 0 && matchedUids.size === cards.length && !isCompleted) {
      soundFx?.playPopSound?.(1.7);
      setTimeout(() => {
        setIsCompleted(true);
      }, 500);
    }
  }, [matchedUids, cards.length, isCompleted]);

  // Card click handler
  const handleCardClick = (index) => {
    if (isLocked) return;

    const clickedCard = cards[index];
    if (matchedUids.has(clickedCard.uid)) return; // already matched
    if (flippedIndices.includes(index)) return; // already face up

    soundFx?.playPopSound?.(1.4);

    if (flippedIndices.length === 0) {
      // First card flipped
      setFlippedIndices([index]);
    } else if (flippedIndices.length === 1) {
      // Second card flipped
      const firstIndex = flippedIndices[0];
      const firstCard = cards[firstIndex];

      setFlippedIndices([firstIndex, index]);
      setMoves(m => m + 1);

      // Check match
      if (firstCard.symbolId === clickedCard.symbolId) {
        // MATCH!
        soundFx?.playPopSound?.(1.8);
        setJustMatchedId(clickedCard.symbolId);

        setTimeout(() => {
          setMatchedUids(prev => new Set([...prev, firstCard.uid, clickedCard.uid]));
          setFlippedIndices([]);
          setJustMatchedId(null);
        }, 400);
      } else {
        // NO MATCH - wait ~750ms and smoothly flip back
        setIsLocked(true);
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  const matchedPairsCount = Math.floor(matchedUids.size / 2);

  return (
    <div className="space-y-4 font-mono select-none animate-in fade-in duration-300">
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVIGATION HEADER                                                  */}
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
          <span className="text-[10px] text-slate-500 tracking-wider uppercase block font-mono">
            Actions / Games
          </span>
          <h2 className="text-sm font-bold text-white font-sans tracking-wide">
            Memory Match
          </h2>
        </div>

        {/* Reset button in header */}
        <button
          onClick={() => handleResetGame()}
          className="flex items-center space-x-1 text-xs text-cyan-300 hover:text-white py-1.5 px-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-all active:scale-95 shadow-[0_0_10px_rgba(0,242,254,0.1)]"
          title="Reset & shuffle cards"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px] font-sans font-semibold">Reset</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. MINDFUL GUIDANCE HUD & LEVEL SELECTOR                                 */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0c1526] to-[#090e18] border border-cyan-500/20 space-y-2.5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE] animate-pulse" />
            <span className="text-xs text-slate-200 font-sans">
              {breathCue}
            </span>
          </div>

          <div className="text-right flex items-center space-x-3 text-xs">
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">PAIRS</span>
              <span className="font-bold text-cyan-300">
                {matchedPairsCount} / {currentLevel.pairs}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block uppercase">MOVES</span>
              <span className="text-slate-300">
                {moves}
              </span>
            </div>
          </div>
        </div>

        {/* Level Selector Pills */}
        <div className="flex items-center space-x-2 pt-0.5">
          {DIFFICULTY_LEVELS.map(lvl => (
            <button
              key={lvl.id}
              onClick={() => handleSelectLevel(lvl.id)}
              className={`flex-1 py-1.5 rounded-xl border text-[11px] font-sans transition-all text-center ${
                levelId === lvl.id
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,242,254,0.12)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {lvl.name} ({lvl.pairs * 2})
            </button>
          ))}
        </div>
      </div>

      {/* Fresh Shuffle Toast Notification */}
      {resetNotice && (
        <div className="py-1.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-center animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-xs text-cyan-300 font-sans flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Cards shuffled. Find your rhythm.</span>
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. MAIN GAME BOARD (RESPONSIVE 4-COLUMN CARD GRID)                       */}
      {/* ========================================================================= */}
      <div className="p-3.5 sm:p-4 rounded-3xl bg-[#080d17] border border-cyan-500/20 relative shadow-[0_0_30px_rgba(0,242,254,0.06)] overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className={`grid ${currentLevel.cols} gap-2.5 max-w-[360px] mx-auto relative`}>
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx) || matchedUids.has(card.uid);
            const isMatched = matchedUids.has(card.uid);
            const isMatchCelebration = justMatchedId === card.symbolId;

            return (
              <div
                key={card.uid}
                onClick={() => handleCardClick(idx)}
                className="aspect-square relative cursor-pointer"
                style={{ perspective: '800px' }}
              >
                <div
                  className={`w-full h-full rounded-2xl transition-all duration-300 transform-gpu relative flex items-center justify-center select-none shadow-md ${
                    isFlipped ? 'rotate-y-180' : 'hover:scale-[1.02]'
                  } ${
                    isMatched
                      ? 'border border-cyan-400/70 shadow-[0_0_12px_rgba(0,242,254,0.2)] bg-[#0b1526]'
                      : isFlipped
                        ? 'border border-cyan-500/40 bg-[#0e172a]'
                        : 'border border-slate-800 bg-[#090e1a] hover:border-cyan-500/30'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* FACE DOWN (Card Back) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center bg-gradient-to-b from-[#0a101d] to-[#070c16] backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="w-6 h-6 rounded-full border border-cyan-500/30 bg-cyan-950/40 flex items-center justify-center shadow-[0_0_8px_rgba(0,242,254,0.15)]">
                      <Sparkles className="w-3 h-3 text-cyan-300" />
                    </div>
                  </div>

                  {/* FACE UP (Card Front) */}
                  <div
                    className={`absolute inset-0 w-full h-full rounded-2xl flex flex-col items-center justify-center p-1 bg-gradient-to-br ${card.gradient} backface-hidden`}
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)'
                    }}
                  >
                    <span className="text-2xl sm:text-3xl leading-none transition-transform transform hover:scale-110">
                      {card.symbol}
                    </span>
                    <span className="text-[9px] text-slate-300 font-sans tracking-tight pt-1">
                      {card.label}
                    </span>

                    {/* Celebration Match Glow Badge */}
                    {isMatchCelebration && (
                      <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-cyan-400 text-slate-950 font-bold text-[8px] animate-bounce">
                        ✦
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Dedicated prominent Reset Button inside game card */}
        <div className="pt-3 flex items-center justify-center">
          <button
            onClick={() => handleResetGame()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition-all active:scale-95 shadow-[0_0_15px_rgba(0,242,254,0.12)] group"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-semibold">Reset & Shuffle Deck</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. COMPLETION SCREEN MODAL                                                */}
      {/* ========================================================================= */}
      {isCompleted && (
        <div className="p-6 rounded-3xl bg-[#09101f] border border-cyan-400/40 space-y-5 text-center shadow-[0_0_40px_rgba(0,242,254,0.18)] animate-in zoom-in-95 duration-300 font-sans">
          
          <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-cyan-400 tracking-widest uppercase font-mono block">
              MEMORY COMPLETE ✦
            </span>
            <h3 className="text-xl font-black text-white">
              You found them all.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Nice work. Take a moment before you continue.
            </p>
          </div>

          {/* Optional Post-Game Emotional Check-In */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 block font-sans">
              How do you feel after the game?
            </span>
            <div className="flex items-center justify-center space-x-2.5">
              {[
                { id: 'better', label: 'Better', icon: '🙂' },
                { id: 'same', label: 'Same', icon: '😐' },
                { id: 'stressed', label: 'Still stressed', icon: '😣' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    soundFx?.playPopSound?.(1.3);
                    setFeedbackMood(opt.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans flex items-center space-x-1.5 border transition-all ${
                    feedbackMood === opt.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
            {feedbackMood && (
              <span className="text-[10px] text-emerald-400 block pt-1 font-sans animate-in fade-in">
                A simple mindfulness activity designed to encourage relaxation and gentle focus.
              </span>
            )}
          </div>

          {/* Action Navigation Buttons */}
          <div className="space-y-2 pt-1 font-mono">
            <button
              onClick={() => handleResetGame()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:opacity-95 transition-opacity flex items-center justify-center space-x-2"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Play Again (New Shuffle) ✦</span>
            </button>

            <button
              onClick={() => {
                soundFx?.playPopSound?.(1.1);
                onBack();
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs transition-colors"
            >
              Back to Games
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

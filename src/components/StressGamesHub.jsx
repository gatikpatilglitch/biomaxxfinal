import React, { useState, useRef, useEffect } from 'react';
import { 
  Gamepad2, 
  CircleDot, 
  Volume2, 
  Sparkles, 
  RefreshCw, 
  Heart, 
  Check, 
  Smile, 
  Wind, 
  Sun, 
  Waves,
  Zap
} from 'lucide-react';
import { soundFx } from '../utils/audioSynthesizer';

export default function StressGamesHub() {
  const [selectedGame, setSelectedGame] = useState('balloon'); // balloon, garden, bubble

  // ==========================================
  // GAME 1: BELLY BREATH BALLOON STATE
  // ==========================================
  const [isInhaling, setIsInhaling] = useState(false);
  const [balloonScale, setBalloonScale] = useState(1);
  const [breathCycles, setBreathCycles] = useState(0);
  const [breathStatusText, setBreathStatusText] = useState('Press & Hold to Inhale (2s)');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const breathAnimRef = useRef(null);
  const breathStartRef = useRef(0);

  // Inhale Start (Touch / Mouse Down)
  const handleInhaleStart = (e) => {
    if (e) e.preventDefault();
    if (isInhaling) return;

    setIsInhaling(true);
    setBreathStatusText('Inhaling gently... Expanding diaphragm (2s)');
    soundFx.playOceanWave(true);
    breathStartRef.current = Date.now();

    clearInterval(breathAnimRef.current);
    breathAnimRef.current = setInterval(() => {
      setBalloonScale(prev => {
        if (prev >= 2.3) return 2.3;
        return prev + 0.04;
      });
    }, 40);
  };

  // Exhale Start (Touch / Mouse Up)
  const handleExhaleStart = () => {
    if (!isInhaling) return;
    setIsInhaling(false);
    setBreathStatusText('Slow Pursed-Lip Exhale (4s)... Clearing trapped air');
    soundFx.playOceanWave(false);

    clearInterval(breathAnimRef.current);
    breathAnimRef.current = setInterval(() => {
      setBalloonScale(prev => {
        if (prev <= 1.0) {
          clearInterval(breathAnimRef.current);
          setBreathCycles(c => c + 1);
          setBreathStatusText('Cycle Complete! Hold to begin next breath.');
          return 1.0;
        }
        return prev - 0.02; // Slower deflation for 4s pursed-lip exhale
      });
    }, 40);
  };

  useEffect(() => {
    return () => clearInterval(breathAnimRef.current);
  }, []);

  // ==========================================
  // GAME 2: SOUNDSCAPE GARDEN STATE
  // ==========================================
  const GARDEN_SYMBOLS = ['🌸', '🌸', '🌿', '🌿', '💧', '💧', '🎋', '🎋', '🦋', '🦋', '🪷', '🪷', '🍃', '🍃', '☀️', '☀️'];
  const [gardenTiles, setGardenTiles] = useState(() => initializeGarden());
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [unlockedSounds, setUnlockedSounds] = useState(['Gentle Rain']);
  const [matchedPairsCount, setMatchedPairsCount] = useState(0);

  function initializeGarden() {
    return GARDEN_SYMBOLS
      .map(v => ({ value: v, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, idx) => ({ id: idx, symbol: item.value, matched: false }));
  }

  const handleTileClick = (index) => {
    if (selectedIndices.length === 2 || gardenTiles[index].matched || selectedIndices.includes(index)) return;

    soundFx.playPopSound(1.6);
    const newSelected = [...selectedIndices, index];
    setSelectedIndices(newSelected);

    if (newSelected.length === 2) {
      const [first, second] = newSelected;
      if (gardenTiles[first].symbol === gardenTiles[second].symbol) {
        soundFx.playZenChime();
        setGardenTiles(prev => prev.map((t, i) => i === first || i === second ? { ...t, matched: true } : t));
        setSelectedIndices([]);
        setMatchedPairsCount(c => c + 1);

        // Unlock sound layers as garden grows
        const soundList = ['Gentle Rain', 'Wind Chimes (528Hz)', 'Forest Birds', 'Mountain Stream', 'Tibetan Singing Bowl'];
        const nextSound = soundList[Math.min(soundList.length - 1, matchedPairsCount + 1)];
        if (!unlockedSounds.includes(nextSound)) {
          setUnlockedSounds(s => [...s, nextSound]);
        }
      } else {
        setTimeout(() => setSelectedIndices([]), 700);
      }
    }
  };

  const resetGarden = () => {
    setGardenTiles(initializeGarden());
    setSelectedIndices([]);
    setMatchedPairsCount(0);
    soundFx.playPopSound(1.2);
  };

  // ==========================================
  // GAME 3: HAPTIC BUBBLE POP STATE
  // ==========================================
  const TOTAL_BUBBLES = 36;
  const [bubbles, setBubbles] = useState(Array(TOTAL_BUBBLES).fill(false));
  const [popCount, setPopCount] = useState(0);

  const handlePop = (idx) => {
    if (bubbles[idx]) return;

    // Synthesize crisp pop with varied organic pitch
    soundFx.playPopSound(0.8 + Math.random() * 0.7);

    // Trigger phone vibration if supported
    if (navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch (e) {}
    }

    setBubbles(prev => prev.map((b, i) => i === idx ? true : b));
    setPopCount(c => c + 1);
  };

  const resetBubbleWrap = () => {
    setBubbles(Array(TOTAL_BUBBLES).fill(false));
    soundFx.playPopSound(1.8);
  };

  return (
    <div className="space-y-4">
      
      {/* Header & Game Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Gamepad2 className="w-5 h-5 text-cyan-400" />
            <span>Stress Busters & Biofeedback Games</span>
          </h2>
          <p className="text-xs text-slate-400">
            Clinically integrated biofeedback to lower bronchial panic and ease COPD breathing.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => { setSelectedGame('balloon'); soundFx.playPopSound(1.2); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedGame === 'balloon'
                ? 'bg-emerald-500/20 text-emerald-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Belly Breath
          </button>
          <button
            onClick={() => { setSelectedGame('garden'); soundFx.playPopSound(1.2); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedGame === 'garden'
                ? 'bg-cyan-500/20 text-cyan-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Zen Garden
          </button>
          <button
            onClick={() => { setSelectedGame('bubble'); soundFx.playPopSound(1.2); }}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedGame === 'bubble'
                ? 'bg-amber-500/20 text-amber-400 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Bubble Wrap
          </button>
        </div>
      </div>

      {/* ================= GAME 1: BELLY BREATH BALLOON ================= */}
      {selectedGame === 'balloon' && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <CircleDot className="w-4 h-4 text-emerald-400" />
                <span>"Belly Breath" Balloon (Biofeedback Game)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Pursed-Lip Breathing technique (2s Inhale / 4s Exhale) to clear trapped residual air from COPD lungs.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/80 px-3 py-1 rounded-xl block">
                {breathCycles} Completed
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Target: 5-10 Cycles</span>
            </div>
          </div>

          {/* Interactive Breathing Stage */}
          <div className="h-64 bg-slate-950/90 rounded-2xl border border-slate-800/80 relative flex flex-col items-center justify-center select-none overflow-hidden p-4">
            
            {/* Ambient Background Glow Ring */}
            <div 
              className="absolute rounded-full transition-all duration-300 pointer-events-none"
              style={{
                width: `${120 * balloonScale}px`,
                height: `${120 * balloonScale}px`,
                background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(6,182,212,0.05) 70%, transparent 100%)',
                filter: 'blur(20px)'
              }}
            />

            {/* Expanding Digital Balloon */}
            <div
              className="rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-75 relative"
              style={{
                width: `${85 * balloonScale}px`,
                height: `${85 * balloonScale}px`,
                background: isInhaling 
                  ? 'linear-gradient(135deg, #34d399 0%, #06b6d4 100%)' 
                  : 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                boxShadow: `0 0 ${20 * balloonScale}px rgba(16, 185, 129, 0.4)`
              }}
            >
              <span className="text-xs font-black font-mono text-slate-950 tracking-wider">
                {isInhaling ? 'INHALE' : 'EXHALE'}
              </span>
              <span className="text-[9px] text-slate-900 font-mono font-semibold">
                {isInhaling ? '2 sec' : '4 sec'}
              </span>
            </div>

            {/* Interactive Press/Hold Action Button */}
            <div className="mt-5 flex flex-col items-center space-y-2 z-10">
              <button
                onMouseDown={handleInhaleStart}
                onMouseUp={handleExhaleStart}
                onTouchStart={handleInhaleStart}
                onTouchEnd={handleExhaleStart}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 active:scale-95 text-slate-950 font-extrabold text-xs px-8 py-3 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all font-mono tracking-wide cursor-pointer"
              >
                {isInhaling ? 'Hold Finger... (Inhaling)' : 'Press & Hold to Inhale'}
              </button>

              <span className="text-xs font-mono text-slate-300">
                {breathStatusText}
              </span>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-mono font-bold block">1. Inhale (2 Sec)</span>
              <p className="text-slate-300">Expand your belly through your nose while balloon swells. Ocean wave sound builds.</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-cyan-400 font-mono font-bold block">2. Pursed Lips (4 Sec)</span>
              <p className="text-slate-300">Release button and exhale slowly as if gently blowing out birthday candles.</p>
            </div>
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-mono font-bold block">3. Trapped Air Relief</span>
              <p className="text-slate-300">Clinically prevents bronchial airway collapse and lowers stress-induced tachycardia.</p>
            </div>
          </div>

        </div>
      )}

      {/* ================= GAME 2: SOUNDSCAPE ZEN GARDEN ================= */}
      {selectedGame === 'garden' && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Soundscape Garden (Passive Zen Builder)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Match soothing garden elements to bloom flowers and unlock layered ambient solfeggio soundscapes. No timers, no losing states.
              </p>
            </div>

            <button
              onClick={resetGarden}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Reset Garden"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Unlocked Soundscape Layers Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Active Sound Layers:</span>
            {unlockedSounds.map((sound, i) => (
              <span key={i} className="text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full flex items-center space-x-1">
                <Waves className="w-3 h-3 text-cyan-400" />
                <span>{sound}</span>
              </span>
            ))}
          </div>

          {/* 4x4 Zen Grid */}
          <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto bg-slate-950 p-4 rounded-2xl border border-slate-800">
            {gardenTiles.map((tile, idx) => (
              <button
                key={tile.id}
                onClick={() => handleTileClick(idx)}
                className={`h-16 rounded-xl text-2xl flex items-center justify-center border transition-all duration-200 active:scale-90 ${
                  tile.matched
                    ? 'bg-emerald-950/50 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.25)] scale-95'
                    : selectedIndices.includes(idx)
                      ? 'bg-slate-800 border-cyan-400 scale-100 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {tile.matched || selectedIndices.includes(idx) ? tile.symbol : '🌱'}
              </button>
            ))}
          </div>

          <div className="bg-cyan-950/30 p-3 rounded-xl border border-cyan-500/30 text-xs text-cyan-100 text-center">
            Matched {matchedPairsCount} of 8 botanical pairs. Each match triggers a gentle 528Hz harmonic chime.
          </div>

        </div>
      )}

      {/* ================= GAME 3: HAPTIC BUBBLE POP ================= */}
      {selectedGame === 'bubble' && (
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Haptic Bubble Pop (Sensory Distraction)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Endless tactile virtual bubble wrap. Pops trigger crisp auditory cues & haptic feedback to divert attention during cough or anxiety spikes.
              </p>
            </div>

            <button
              onClick={resetBubbleWrap}
              className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:border-amber-500/40 flex items-center space-x-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>New Sheet</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Total Grounding Pops: <strong className="text-amber-400">{popCount}</strong></span>
            <span>Haptic Feedback: <strong className="text-emerald-400">Enabled</strong></span>
          </div>

          {/* 6x6 Bubble Grid */}
          <div className="grid grid-cols-6 gap-2.5 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            {bubbles.map((popped, idx) => (
              <button
                key={idx}
                onClick={() => handlePop(idx)}
                className={`h-11 rounded-full border transition-all flex items-center justify-center active:scale-75 ${
                  popped
                    ? 'bg-slate-900/60 border-slate-800/80 scale-85 opacity-30 shadow-inner'
                    : 'bg-gradient-to-br from-cyan-500/25 via-emerald-500/20 to-blue-500/30 border-cyan-400/60 hover:border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)] hover:scale-105'
                }`}
              >
                {!popped && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white/70 shadow-[0_0_6px_#fff]"></div>
                )}
              </button>
            ))}
          </div>

          <p className="text-xs text-slate-400 text-center font-mono">
            💡 Touch or click bubbles rapidly to anchor sensory perception during acute shortness-of-breath panic.
          </p>

        </div>
      )}

    </div>
  );
}

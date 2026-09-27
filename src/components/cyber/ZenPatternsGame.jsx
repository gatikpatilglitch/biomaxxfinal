import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Play, 
  Pause, 
  Shuffle, 
  CheckCircle2, 
  Compass,
  Wind
} from 'lucide-react';
import { soundFx } from '../../utils/audioSynthesizer';

const PATTERN_TYPES = [
  {
    id: 'flower',
    name: 'Flower of Life',
    subtitle: 'Concentric petals of interconnected calm',
    nodes: [
      { id: 'c', x: 200, y: 200, r: 12 },
      { id: 'n1', x: 200, y: 140, r: 10 },
      { id: 'n2', x: 252, y: 170, r: 10 },
      { id: 'n3', x: 252, y: 230, r: 10 },
      { id: 'n4', x: 200, y: 260, r: 10 },
      { id: 'n5', x: 148, y: 230, r: 10 },
      { id: 'n6', x: 148, y: 170, r: 10 },
      { id: 'o1', x: 200, y: 80, r: 9 },
      { id: 'o2', x: 304, y: 140, r: 9 },
      { id: 'o3', x: 304, y: 260, r: 9 },
      { id: 'o4', x: 200, y: 320, r: 9 },
      { id: 'o5', x: 96, y: 260, r: 9 },
      { id: 'o6', x: 96, y: 140, r: 9 },
    ]
  },
  {
    id: 'spiral',
    name: 'Golden Spiral',
    subtitle: 'Harmonic logarithmic expansion of focus',
    nodes: [
      { id: 's1', x: 200, y: 200, r: 12 },
      { id: 's2', x: 215, y: 190, r: 10 },
      { id: 's3', x: 210, y: 168, r: 10 },
      { id: 's4', x: 180, y: 165, r: 10 },
      { id: 's5', x: 160, y: 195, r: 10 },
      { id: 's6', x: 175, y: 235, r: 10 },
      { id: 's7', x: 230, y: 245, r: 9 },
      { id: 's8', x: 265, y: 190, r: 9 },
      { id: 's9', x: 235, y: 130, r: 9 },
      { id: 's10', x: 145, y: 120, r: 9 },
      { id: 's11', x: 110, y: 200, r: 9 },
      { id: 's12', x: 160, y: 285, r: 9 },
    ]
  },
  {
    id: 'mandala',
    name: 'Harmonic Mandala',
    subtitle: 'Balanced resonance of inner equilibrium',
    nodes: [
      { id: 'm0', x: 200, y: 200, r: 14 },
      { id: 'm1', x: 200, y: 130, r: 10 },
      { id: 'm2', x: 250, y: 150, r: 10 },
      { id: 'm3', x: 270, y: 200, r: 10 },
      { id: 'm4', x: 250, y: 250, r: 10 },
      { id: 'm5', x: 200, y: 270, r: 10 },
      { id: 'm6', x: 150, y: 250, r: 10 },
      { id: 'm7', x: 130, y: 200, r: 10 },
      { id: 'm8', x: 150, y: 150, r: 10 },
      { id: 'm9', x: 200, y: 70, r: 9 },
      { id: 'm10', x: 330, y: 200, r: 9 },
      { id: 'm11', x: 200, y: 330, r: 9 },
      { id: 'm12', x: 70, y: 200, r: 9 },
    ]
  }
];

export default function ZenPatternsGame({ onBack }) {
  const [patternIdx, setPatternIdx] = useState(0);
  const currentPattern = PATTERN_TYPES[patternIdx];

  const [activeNodes, setActiveNodes] = useState(new Set());
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale, Exhale
  const [calmMode, setCalmMode] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMood, setFeedbackMood] = useState(null);
  const [resetNotice, setResetNotice] = useState(false);

  // Breathing guide cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setBreathPhase(p => (p === 'Inhale' ? 'Exhale' : 'Inhale'));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Check completion when all nodes illuminated
  useEffect(() => {
    if (activeNodes.size > 0 && activeNodes.size === currentPattern.nodes.length && !isCompleted) {
      soundFx?.playPopSound?.(1.8);
      setTimeout(() => {
        setIsCompleted(true);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('biomaxxx_achievement_action', { 
            detail: { action: 'relaxation_activity', payload: { game: 'zen_patterns' } } 
          }));
        }
      }, 500);
    }
  }, [activeNodes, currentPattern.nodes.length, isCompleted]);

  // Node tap handler
  const handleNodeClick = (nodeId) => {
    soundFx?.playPopSound?.(1.4);
    setActiveNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Reset pattern
  const handleResetPattern = () => {
    soundFx?.playPopSound?.(1.2);
    setActiveNodes(new Set());
    setIsCompleted(false);
    setFeedbackMood(null);

    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 1800);
  };

  // Change to next pattern layout
  const handleChangePattern = () => {
    soundFx?.playPopSound?.(1.4);
    const nextIdx = (patternIdx + 1) % PATTERN_TYPES.length;
    setPatternIdx(nextIdx);
    setActiveNodes(new Set());
    setIsCompleted(false);
    setFeedbackMood(null);
  };

  const progressPct = Math.round((activeNodes.size / currentPattern.nodes.length) * 100);

  return (
    <div className={`space-y-4 font-mono select-none animate-in fade-in duration-300 ${calmMode ? 'opacity-95' : ''}`}>
      
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
            Zen Patterns
          </h2>
        </div>

        {/* Reset button in header */}
        <button
          onClick={handleResetPattern}
          className="flex items-center space-x-1 text-xs text-cyan-300 hover:text-white py-1.5 px-2.5 rounded-xl bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 transition-all active:scale-95 shadow-[0_0_10px_rgba(0,242,254,0.1)]"
          title="Reset pattern"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="text-[11px] font-sans font-semibold">Reset</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. MINDFUL GUIDANCE HUD                                                   */}
      {/* ========================================================================= */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0c1526] to-[#090e18] border border-cyan-500/20 space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE] animate-pulse" />
            <span className="text-xs text-slate-200 font-sans">
              Tap nodes to weave calm harmony
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block">
              {breathPhase} slowly...
            </span>
          </div>
        </div>

        {/* Pattern Pills */}
        <div className="flex items-center space-x-2 pt-0.5">
          {PATTERN_TYPES.map((pat, idx) => (
            <button
              key={pat.id}
              onClick={() => {
                soundFx?.playPopSound?.(1.3);
                setPatternIdx(idx);
                setActiveNodes(new Set());
                setIsCompleted(false);
              }}
              className={`flex-1 py-1 px-2 rounded-xl border text-[10px] font-sans transition-all text-center truncate ${
                patternIdx === idx
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,242,254,0.12)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              {pat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Notification Toast */}
      {resetNotice && (
        <div className="py-1.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-center animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-xs text-cyan-300 font-sans flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Pattern cleared. Begin anew.</span>
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE GEOMETRIC CANVAS                                           */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#080d17] border border-cyan-500/20 relative shadow-[0_0_30px_rgba(0,242,254,0.06)] overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Breathing Halo circle in background */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-500/15 transition-all duration-1000 ease-in-out pointer-events-none"
          style={{
            width: breathPhase === 'Inhale' ? '280px' : '160px',
            height: breathPhase === 'Inhale' ? '280px' : '160px',
            boxShadow: breathPhase === 'Inhale' ? '0 0 25px rgba(0,242,254,0.1)' : 'none'
          }}
        />

        <div className="w-full max-w-[340px] sm:max-w-[360px] aspect-square mx-auto rounded-2xl bg-[#060a13] border border-slate-800/80 shadow-inner relative">
          <svg viewBox="0 0 400 400" className="w-full h-full select-none cursor-pointer">
            {/* Draw Connecting Resonance Lines between active nodes */}
            {currentPattern.nodes.map((nodeA, i) =>
              currentPattern.nodes.slice(i + 1).map((nodeB) => {
                const dist = Math.hypot(nodeA.x - nodeB.x, nodeA.y - nodeB.y);
                const bothActive = activeNodes.has(nodeA.id) && activeNodes.has(nodeB.id);

                if (dist <= 130) {
                  return (
                    <line
                      key={`${nodeA.id}-${nodeB.id}`}
                      x1={nodeA.x}
                      y1={nodeA.y}
                      x2={nodeB.x}
                      y2={nodeB.y}
                      stroke={bothActive ? '#00F2FE' : '#1e293b'}
                      strokeWidth={bothActive ? '1.8' : '0.8'}
                      strokeOpacity={bothActive ? 0.8 : 0.4}
                      className="transition-all duration-500"
                    />
                  );
                }
                return null;
              })
            )}

            {/* Concentric subtle guidelines */}
            <circle cx="200" cy="200" r="60" fill="none" stroke="#10192b" strokeWidth="1" />
            <circle cx="200" cy="200" r="120" fill="none" stroke="#0e1728" strokeWidth="1" />

            {/* Interactive Nodes */}
            {currentPattern.nodes.map((node) => {
              const isActive = activeNodes.has(node.id);
              return (
                <g 
                  key={node.id} 
                  onClick={() => handleNodeClick(node.id)}
                  className="cursor-pointer transition-transform duration-200 active:scale-90"
                >
                  {/* Outer pulse when active */}
                  {isActive && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.r + 6}
                      fill="none"
                      stroke="#00F2FE"
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  {/* Core node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r}
                    fill={isActive ? '#00F2FE' : '#0e1728'}
                    stroke={isActive ? '#38BDF8' : '#334155'}
                    strokeWidth="2"
                    className="transition-all duration-300"
                    style={{
                      filter: isActive ? 'drop-shadow(0 0 8px #00F2FE)' : 'none'
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Action Controls Bar */}
        <div className="pt-2.5 flex items-center justify-between text-xs font-sans px-1">
          <button
            onClick={handleResetPattern}
            className="flex items-center space-x-1.5 text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-lg bg-slate-900/60 border border-slate-800"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[11px]">Clear Pattern</span>
          </button>

          <span className="text-[10px] text-slate-500 font-mono">
            {activeNodes.size} / {currentPattern.nodes.length} lit
          </span>

          <button
            onClick={handleChangePattern}
            className="flex items-center space-x-1.5 text-cyan-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.1)] active:scale-95"
          >
            <Shuffle className="w-3 h-3 text-cyan-400" />
            <span className="text-[11px] font-semibold">Next Pattern ✦</span>
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
              HARMONY COMPLETE ✦
            </span>
            <h3 className="text-xl font-black text-white">
              Your pattern is in full balance.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Feel the stillness of this geometry. Take one long slow breath.
            </p>
          </div>

          {/* Optional Post-Game Check-In */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 block font-sans">
              How do you feel after the pattern?
            </span>
            <div className="flex items-center justify-center space-x-2.5">
              {[
                { id: 'better', label: 'Better', icon: '🙂' },
                { id: 'same', label: 'Same', icon: '😐' },
                { id: 'tense', label: 'Still tense', icon: '😣' }
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

          {/* Completion Action Buttons */}
          <div className="space-y-2 pt-1 font-mono">
            <button
              onClick={handleChangePattern}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:opacity-95 transition-opacity flex items-center justify-center space-x-2"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Explore Another Pattern ✦</span>
            </button>

            <button
              onClick={handleResetPattern}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Weave Pattern Again</span>
            </button>

            <button
              onClick={() => {
                soundFx?.playPopSound?.(1.1);
                onBack();
              }}
              className="w-full py-2 rounded-2xl bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors"
            >
              Back to Games
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

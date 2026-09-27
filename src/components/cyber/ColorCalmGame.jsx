import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Sparkles, 
  Palette, 
  Eye, 
  EyeOff, 
  Download, 
  Share2, 
  CheckCircle2, 
  Layers, 
  Shuffle,
  ChevronRight,
  Heart,
  Droplet,
  Compass
} from 'lucide-react';
import { soundFx } from '../../utils/audioSynthesizer';

// =============================================================================
// COLOR PALETTES
// =============================================================================
const DEFAULT_PALETTE = [
  { id: 'teal', name: 'Soft Teal', hex: '#4ECDC4' },
  { id: 'ocean', name: 'Ocean Blue', hex: '#38BDF8' },
  { id: 'lavender', name: 'Lavender', hex: '#A78BFA' },
  { id: 'mist', name: 'Mist Purple', hex: '#C084FC' },
  { id: 'sage', name: 'Sage', hex: '#94D2BD' },
  { id: 'green', name: 'Soft Green', hex: '#86EFAC' },
  { id: 'peach', name: 'Warm Peach', hex: '#FDBA74' },
  { id: 'moon', name: 'Moon White', hex: '#F1F5F9' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#00F2FE' },
  { id: 'rose', name: 'Sunset Rose', hex: '#FB7185' },
];

const EXTENDED_PALETTE_CATEGORIES = [
  {
    name: 'Serenity & Ocean',
    colors: [
      { id: 'ext-1', name: 'Deep Cyan', hex: '#0891B2' },
      { id: 'ext-2', name: 'Sky Cyan', hex: '#38BDF8' },
      { id: 'ext-3', name: 'Deep Aqua', hex: '#0D9488' },
      { id: 'ext-4', name: 'Seafoam', hex: '#99F6E4' },
      { id: 'ext-5', name: 'Night Lagoon', hex: '#164E63' },
      { id: 'ext-6', name: 'Abyss Navy', hex: '#1E293B' },
    ]
  },
  {
    name: 'Twilight & Celestial',
    colors: [
      { id: 'ext-7', name: 'Lilac Cloud', hex: '#C4B5FD' },
      { id: 'ext-8', name: 'Soft Violet', hex: '#8B5CF6' },
      { id: 'ext-9', name: 'Midnight Orchid', hex: '#6366F1' },
      { id: 'ext-10', name: 'Cosmic Magenta', hex: '#E879F9' },
      { id: 'ext-11', name: 'Star Silver', hex: '#CBD5E1' },
      { id: 'ext-12', name: 'Dusk Slate', hex: '#475569' },
    ]
  },
  {
    name: 'Botanical & Earth',
    colors: [
      { id: 'ext-13', name: 'Eucalyptus', hex: '#6EE7B7' },
      { id: 'ext-14', name: 'Pine Needle', hex: '#059669' },
      { id: 'ext-15', name: 'Spring Moss', hex: '#A3E635' },
      { id: 'ext-16', name: 'Olive Whisper', hex: '#65A30D' },
      { id: 'ext-17', name: 'Desert Sand', hex: '#FED7AA' },
      { id: 'ext-18', name: 'Coral Clay', hex: '#FCA5A5' },
    ]
  }
];

// =============================================================================
// ARTWORK SCENES DEFINITIONS (SVG Vector Regions)
// =============================================================================
const ARTWORK_SCENES = [
  {
    id: 'moonlit_garden',
    title: 'Moonlit Garden',
    category: 'NATURE',
    subtitle: 'Gentle flora beneath the celestial crescent',
    icon: '🌙',
    regions: [
      { id: 'sky', label: 'Night Sky', defaultFill: '#0b1120', path: 'M 20 20 H 380 V 380 H 20 Z' },
      { id: 'moon', label: 'Crescent Moon', defaultFill: '#131e33', path: 'M 310 50 A 45 45 0 1 0 310 130 A 35 35 0 1 1 310 50 Z' },
      { id: 'star_big', label: 'Morning Star', defaultFill: '#162238', path: 'M 100 70 L 105 85 L 120 90 L 105 95 L 100 110 L 95 95 L 80 90 L 95 85 Z' },
      { id: 'star_small', label: 'Little Star', defaultFill: '#162238', path: 'M 220 60 L 223 70 L 233 73 L 223 76 L 220 86 L 217 76 L 207 73 L 217 70 Z' },
      { id: 'cloud_high', label: 'Upper Mist', defaultFill: '#101a2e', path: 'M 60 140 Q 90 120 130 140 Q 170 120 210 140 Q 230 160 190 170 H 80 Q 50 160 60 140 Z' },
      { id: 'mount_back', label: 'Distant Peak', defaultFill: '#121f36', path: 'M 30 290 L 160 160 L 270 270 L 380 180 L 380 320 L 30 320 Z' },
      { id: 'mount_mid', label: 'Quiet Ridge', defaultFill: '#0e182a', path: 'M 20 310 L 120 220 L 240 330 L 380 230 L 380 360 L 20 360 Z' },
      { id: 'pond_water', label: 'Serene Pond', defaultFill: '#142542', path: 'M 20 320 Q 150 280 260 320 Q 340 350 380 330 L 380 380 H 20 Z' },
      { id: 'lily_pad', label: 'Water Lily Leaf', defaultFill: '#172e48', path: 'M 80 340 A 30 18 0 1 0 130 350 Z' },
      { id: 'lotus_petal_1', label: 'Lotus Petal L', defaultFill: '#1a2744', path: 'M 260 340 C 250 320 270 310 280 330 Z' },
      { id: 'lotus_petal_2', label: 'Lotus Petal C', defaultFill: '#1e3052', path: 'M 275 340 C 275 310 295 310 295 340 Z' },
      { id: 'lotus_petal_3', label: 'Lotus Petal R', defaultFill: '#1a2744', path: 'M 290 340 C 300 320 320 330 305 345 Z' },
      { id: 'leaf_arch_left', label: 'Graceful Fern L', defaultFill: '#12253b', path: 'M 20 260 Q 90 240 70 320 Q 50 290 20 260 Z' },
      { id: 'leaf_arch_right', label: 'Graceful Fern R', defaultFill: '#12253b', path: 'M 380 250 Q 300 240 330 320 Q 350 290 380 250 Z' }
    ]
  },
  {
    id: 'ocean_flow',
    title: 'Ocean Flow',
    category: 'NATURE',
    subtitle: 'Rhythmic tides and coastal breathing horizon',
    icon: '🌊',
    regions: [
      { id: 'sky_ocean', label: 'Ocean Horizon Sky', defaultFill: '#0d1527', path: 'M 20 20 H 380 V 200 H 20 Z' },
      { id: 'sun_horizon', label: 'Twilight Sun', defaultFill: '#152238', path: 'M 160 180 A 40 40 0 0 1 240 180 Z' },
      { id: 'sun_rays', label: 'Solar Aura', defaultFill: '#101c33', path: 'M 140 180 A 60 60 0 0 1 260 180 Z' },
      { id: 'wave_crest_1', label: 'Distant Tide', defaultFill: '#10223d', path: 'M 20 200 Q 110 180 200 200 Q 290 220 380 200 L 380 240 Q 290 260 200 240 Q 110 220 20 240 Z' },
      { id: 'wave_crest_2', label: 'Mid Wave Swell', defaultFill: '#132845', path: 'M 20 240 Q 100 210 210 245 Q 310 270 380 240 L 380 290 Q 280 320 180 280 Q 90 260 20 290 Z' },
      { id: 'wave_curl', label: 'Rolling Crest', defaultFill: '#173459', path: 'M 60 270 Q 140 240 220 275 Q 160 300 60 270 Z' },
      { id: 'deep_water', label: 'Deep Abyss', defaultFill: '#0a162b', path: 'M 20 290 Q 140 265 240 300 Q 320 330 380 290 L 380 380 H 20 Z' },
      { id: 'foam_left', label: 'Sea Foam L', defaultFill: '#1a3a60', path: 'M 30 340 Q 80 320 120 350 Q 70 370 30 340 Z' },
      { id: 'foam_right', label: 'Sea Foam R', defaultFill: '#1a3a60', path: 'M 260 330 Q 320 310 360 340 Q 310 365 260 330 Z' },
      { id: 'ripple_center', label: 'Harmonic Ripple', defaultFill: '#1e446e', path: 'M 140 330 Q 200 315 260 330 Q 200 345 140 330 Z' }
    ]
  },
  {
    id: 'cosmic_bloom',
    title: 'Cosmic Bloom',
    category: 'COSMIC',
    subtitle: 'Sacred geometry and harmonic botanical nebula',
    icon: '✦',
    regions: [
      { id: 'cosmic_sky', label: 'Celestial Void', defaultFill: '#090d1a', path: 'M 20 20 H 380 V 380 H 20 Z' },
      { id: 'ring_outer', label: 'Orbital Ring', defaultFill: '#101a2e', path: 'M 200 50 A 150 150 0 1 0 200 350 A 150 150 0 1 0 200 50 M 200 80 A 120 120 0 1 1 200 320 A 120 120 0 1 1 200 80' },
      { id: 'petal_n', label: 'North Petal', defaultFill: '#14213d', path: 'M 200 120 C 180 150 180 170 200 190 C 220 170 220 150 200 120 Z' },
      { id: 'petal_s', label: 'South Petal', defaultFill: '#14213d', path: 'M 200 280 C 180 250 180 230 200 210 C 220 230 220 250 200 280 Z' },
      { id: 'petal_e', label: 'East Petal', defaultFill: '#14213d', path: 'M 280 200 C 250 180 230 180 210 200 C 230 220 250 220 280 200 Z' },
      { id: 'petal_w', label: 'West Petal', defaultFill: '#14213d', path: 'M 120 200 C 150 180 170 180 190 200 C 170 220 150 220 120 200 Z' },
      { id: 'petal_ne', label: 'Northeast Petal', defaultFill: '#172747', path: 'M 255 145 C 230 165 220 180 205 195 C 220 210 235 200 255 145 Z' },
      { id: 'petal_nw', label: 'Northwest Petal', defaultFill: '#172747', path: 'M 145 145 C 170 165 180 180 195 195 C 180 210 165 200 145 145 Z' },
      { id: 'petal_se', label: 'Southeast Petal', defaultFill: '#172747', path: 'M 255 255 C 230 235 220 220 205 205 C 220 190 235 200 255 255 Z' },
      { id: 'petal_sw', label: 'Southwest Petal', defaultFill: '#172747', path: 'M 145 255 C 170 235 180 220 195 205 C 180 190 165 200 145 255 Z' },
      { id: 'flower_core', label: 'Inner Singularity', defaultFill: '#1e335c', path: 'M 200 185 A 15 15 0 1 0 200 215 A 15 15 0 1 0 200 185 Z' },
      { id: 'center_star', label: 'Core Spark', defaultFill: '#243e6f', path: 'M 200 193 L 202 198 L 207 200 L 202 202 L 200 207 L 198 202 L 193 200 L 198 198 Z' }
    ]
  },
  {
    id: 'quiet_mountains',
    title: 'Quiet Mountains',
    category: 'NATURE',
    subtitle: 'Mist-shrouded summits and serene pine valley',
    icon: '⛰️',
    regions: [
      { id: 'mountain_sky', label: 'Alpine Sky', defaultFill: '#0c1322', path: 'M 20 20 H 380 V 220 H 20 Z' },
      { id: 'alpine_sun', label: 'Dawn Glow', defaultFill: '#131e33', path: 'M 280 60 A 35 35 0 1 0 350 60 A 35 35 0 1 0 280 60 Z' },
      { id: 'far_ridge', label: 'Distant Ridge', defaultFill: '#101c30', path: 'M 20 220 L 100 130 L 210 200 L 300 120 L 380 180 L 380 280 L 20 280 Z' },
      { id: 'main_peak', label: 'Grand Summit', defaultFill: '#142540', path: 'M 60 280 L 200 90 L 330 280 Z' },
      { id: 'snow_cap', label: 'Snow Crest', defaultFill: '#1c3459', path: 'M 200 90 L 225 130 L 210 140 L 195 130 L 175 140 Z' },
      { id: 'shadow_side', label: 'Summit Shadow', defaultFill: '#0e1a2e', path: 'M 200 90 L 200 280 L 330 280 Z' },
      { id: 'pine_forest', label: 'Pine Ridge', defaultFill: '#112236', path: 'M 20 270 Q 120 240 200 260 Q 280 240 380 270 L 380 320 H 20 Z' },
      { id: 'valley_stream', label: 'Glacial River', defaultFill: '#183254', path: 'M 190 280 Q 170 310 210 330 Q 180 350 200 380 L 240 380 Q 220 350 240 330 Q 200 310 210 280 Z' },
      { id: 'front_meadow_l', label: 'Valley Bank L', defaultFill: '#13283f', path: 'M 20 310 L 190 310 L 180 380 H 20 Z' },
      { id: 'front_meadow_r', label: 'Valley Bank R', defaultFill: '#13283f', path: 'M 230 310 L 380 310 L 380 380 H 220 Z' }
    ]
  }
];

export default function ColorCalmGame({ onBack }) {
  // Navigation / View State
  const [activeSceneId, setActiveSceneId] = useState(null); // null = Home Gallery, id = In-game coloring
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Active scene
  const currentScene = useMemo(() => {
    return ARTWORK_SCENES.find(s => s.id === activeSceneId) || ARTWORK_SCENES[0];
  }, [activeSceneId]);

  // Coloring State
  const [colorMap, setColorMap] = useState({}); // { [regionId]: hexColor }
  const [history, setHistory] = useState([{}]); // array of colorMap snapshots for undo/redo
  const [historyStep, setHistoryStep] = useState(0);

  // Selected Palette Color
  const [activeColor, setActiveColor] = useState(DEFAULT_PALETTE[0].hex);
  const [showExtendedPalette, setShowExtendedPalette] = useState(false);

  // Calm Mode Toggle (distraction-free minimal UI)
  const [calmMode, setCalmMode] = useState(false);

  // Animation & Ripple Feedback
  const [lastColoredRegion, setLastColoredRegion] = useState(null);
  const [resetFeedbackNotice, setResetFeedbackNotice] = useState(null);

  // Completion State
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackMood, setFeedbackMood] = useState(null); // 'better' | 'same' | 'tense'

  // Subtle Ambient Breathing HUD Text
  const [mindfulCue, setMindfulCue] = useState('Breathe gently. Paint without rush.');
  useEffect(() => {
    const cues = [
      'Breathe gently. Paint without rush.',
      'There are no mistakes. Every color belongs.',
      'Follow your instinct. Enjoy the rhythm.',
      'Create space for your thoughts to settle.'
    ];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % cues.length;
      setMindfulCue(cues[idx]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Compute completion progress
  const progressPercent = useMemo(() => {
    if (!currentScene) return 0;
    const total = currentScene.regions.length;
    let colored = 0;
    for (const r of currentScene.regions) {
      if (colorMap[r.id] && colorMap[r.id] !== r.defaultFill) {
        colored++;
      }
    }
    return Math.round((colored / total) * 100);
  }, [currentScene, colorMap]);

  // Check completion trigger
  useEffect(() => {
    if (activeSceneId && progressPercent === 100 && !isCompleted) {
      soundFx?.playPopSound?.(1.6);
      setTimeout(() => {
        setIsCompleted(true);
      }, 500);
    }
  }, [progressPercent, activeSceneId, isCompleted]);

  // Handle region tap to fill
  const handleRegionClick = (regionId) => {
    soundFx?.playPopSound?.(1.4);
    setLastColoredRegion(regionId);
    setTimeout(() => setLastColoredRegion(null), 600);

    const nextColorMap = {
      ...colorMap,
      [regionId]: activeColor
    };

    // Trim future history if we were in the middle of undo stack
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(nextColorMap);

    setColorMap(nextColorMap);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  // Undo action
  const handleUndo = () => {
    if (historyStep > 0) {
      soundFx?.playPopSound?.(1.1);
      const nextStep = historyStep - 1;
      setHistoryStep(nextStep);
      setColorMap(history[nextStep]);
    }
  };

  // Redo action
  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      soundFx?.playPopSound?.(1.2);
      const nextStep = historyStep + 1;
      setHistoryStep(nextStep);
      setColorMap(history[nextStep]);
    }
  };

  // Reset Artwork & Change Pattern
  const handleResetArtwork = () => {
    soundFx?.playPopSound?.(1.3);
    // Clear canvas colors back to calm line art
    setColorMap({});
    setHistory([{}]);
    setHistoryStep(0);
    setIsCompleted(false);
    setFeedbackMood(null);

    setResetFeedbackNotice('Canvas refreshed. Ready for new colors.');
    setTimeout(() => setResetFeedbackNotice(null), 2200);
  };

  // Reset AND switch/shuffle to a fresh scene variation
  const handleResetAndChangePattern = () => {
    soundFx?.playPopSound?.(1.5);
    const currentIndex = ARTWORK_SCENES.findIndex(s => s.id === activeSceneId);
    const nextIndex = (currentIndex + 1) % ARTWORK_SCENES.length;
    const nextScene = ARTWORK_SCENES[nextIndex];

    setActiveSceneId(nextScene.id);
    setColorMap({});
    setHistory([{}]);
    setHistoryStep(0);
    setIsCompleted(false);
    setFeedbackMood(null);

    setResetFeedbackNotice(`Switched to: ${nextScene.title} ✦`);
    setTimeout(() => setResetFeedbackNotice(null), 2200);
  };

  // Filtered artworks for the gallery
  const filteredScenes = useMemo(() => {
    if (selectedCategory === 'ALL') return ARTWORK_SCENES;
    return ARTWORK_SCENES.filter(s => s.category === selectedCategory);
  }, [selectedCategory]);

  // =============================================================================
  // RENDER VIEW 1: COLOR CALM HOME GALLERY SCREEN
  // =============================================================================
  if (!activeSceneId) {
    return (
      <div className="space-y-4 font-mono select-none animate-in fade-in duration-300">
        
        {/* Top Header */}
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
              Color Calm
            </h2>
          </div>

          <div className="w-12 flex justify-end">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE] animate-pulse" />
          </div>
        </div>

        {/* Heading & Subheading Banner */}
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#0c1526] to-[#090e18] border border-cyan-500/20 space-y-1 shadow-[0_0_20px_rgba(0,242,254,0.05)]">
          <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest block">
            COLOR CALM ✦
          </span>
          <h1 className="text-base font-bold text-white font-sans">
            Create something at your own pace.
          </h1>
          <p className="text-xs text-slate-300 font-sans leading-relaxed pt-0.5">
            A quiet, low-pressure digital coloring activity. No timers, no rules, and no wrong colors.
          </p>
        </div>

        {/* Featured Artwork Card (Large Preview) */}
        <div 
          onClick={() => {
            soundFx?.playPopSound?.(1.3);
            setActiveSceneId(ARTWORK_SCENES[0].id);
          }}
          className="p-5 rounded-3xl bg-[#090e19] border border-cyan-500/40 hover:border-cyan-400 cursor-pointer transition-all hover:scale-[1.01] space-y-3 shadow-[0_0_25px_rgba(0,242,254,0.08)] group"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider font-mono">
              FEATURED ARTWORK
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              Tap to Color →
            </span>
          </div>

          {/* Uncolored Art Minimalist Preview Box */}
          <div className="aspect-[16/10] w-full rounded-2xl bg-[#050811] border border-slate-800/80 flex flex-col items-center justify-center p-4 relative overflow-hidden group-hover:border-cyan-500/50 transition-colors">
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-purple-500/5" />
            <div className="text-4xl sm:text-5xl pb-2 tracking-widest select-none">
              🌙 ✦ 🌿 🌊
            </div>
            <span className="text-xs font-bold text-slate-200 font-sans tracking-wide">
              {ARTWORK_SCENES[0].title}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">
              {ARTWORK_SCENES[0].subtitle}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-300 font-sans">
              {ARTWORK_SCENES[0].regions.length} Calm Elements to Fill
            </span>
            <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
              <span>Start Coloring</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Category Pills & Gallery */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono uppercase text-slate-400 font-bold">
              Choose a scene
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {filteredScenes.length} scenes available
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-sans">
            {['ALL', 'NATURE', 'COSMIC'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-xl border text-xs whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Horizontal Scrolling Artwork Selection */}
          <div className="grid grid-cols-2 gap-3 pb-2 font-sans">
            {filteredScenes.map(scene => (
              <div
                key={scene.id}
                onClick={() => {
                  soundFx?.playPopSound?.(1.3);
                  setActiveSceneId(scene.id);
                  setColorMap({});
                  setHistory([{}]);
                  setHistoryStep(0);
                  setIsCompleted(false);
                }}
                className="p-3.5 rounded-3xl bg-[#0b101c] border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:scale-[1.02] space-y-2 group shadow-sm"
              >
                <div className="aspect-square w-full rounded-2xl bg-[#070b14] border border-slate-800 flex flex-col items-center justify-center p-3 relative overflow-hidden group-hover:border-cyan-500/40">
                  <div className="text-3xl pb-1">{scene.icon}</div>
                  <span className="text-[10px] text-cyan-300/80 font-mono font-semibold uppercase">
                    {scene.category}
                  </span>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {scene.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">
                    {scene.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  }

  // =============================================================================
  // RENDER VIEW 2: FULL-SCREEN COLORING INTERFACE
  // =============================================================================
  return (
    <div className={`space-y-3.5 font-mono select-none animate-in fade-in duration-300 ${calmMode ? 'opacity-95' : ''}`}>
      
      {/* ========================================================================= */}
      {/* 1. TOP COLORING SCREEN HEADER                                             */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
        <button
          onClick={() => {
            soundFx?.playPopSound?.(1.1);
            setActiveSceneId(null);
          }}
          className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-300 transition-colors py-1 px-2.5 rounded-xl bg-slate-900 border border-slate-800"
          title="Back to scenes gallery"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="font-sans">Gallery</span>
        </button>

        <div className="text-center px-1">
          <h2 className="text-xs font-bold text-white font-sans truncate max-w-[130px] sm:max-w-[180px]">
            {currentScene.title}
          </h2>
          <span className="text-[9px] text-cyan-400/90 font-mono block">
            {progressPercent}% colored
          </span>
        </div>

        {/* Undo, Redo, Reset & Calm Mode Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Undo"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
            title="Redo"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          {/* Reset / Change Pattern Button */}
          <button
            onClick={handleResetArtwork}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Reset artwork colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Calm Mode Minimalist Switch */}
          <button
            onClick={() => {
              soundFx?.playPopSound?.(1.2);
              setCalmMode(!calmMode);
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              calmMode 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title={calmMode ? "Disable Calm Mode" : "Enable Calm Mode (Minimal UI)"}
          >
            {calmMode ? <EyeOff className="w-3.5 h-3.5 text-cyan-300" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBTLE PROGRESS & BREATHING BAR                                       */}
      {/* ========================================================================= */}
      {!calmMode && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] px-1">
            <span className="text-slate-400 font-sans">{mindfulCue}</span>
            <span className="text-cyan-400 font-mono font-bold">
              {progressPercent}%
            </span>
          </div>

          <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 rounded-full transition-all duration-500 shadow-[0_0_8px_#00F2FE]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {resetFeedbackNotice && (
        <div className="py-1.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-center animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-xs text-cyan-300 font-sans flex items-center justify-center space-x-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>{resetFeedbackNotice}</span>
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CENTER COLORING CANVAS                                                 */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#080d17] border border-cyan-500/20 relative shadow-[0_0_30px_rgba(0,242,254,0.06)] overflow-hidden">
        
        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Interactive SVG Coloring Artwork */}
        <div className="w-full max-w-[340px] sm:max-w-[370px] aspect-square mx-auto rounded-2xl overflow-hidden bg-[#060a13] border border-slate-800/80 shadow-inner relative">
          <svg 
            viewBox="0 0 400 400" 
            className="w-full h-full cursor-pointer select-none"
          >
            <defs>
              <filter id="calmGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {currentScene.regions.map(region => {
              const fillColor = colorMap[region.id] || region.defaultFill;
              const isSelectedJustNow = lastColoredRegion === region.id;

              return (
                <path
                  key={region.id}
                  d={region.path}
                  fill={fillColor}
                  stroke="#1e293b"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  onClick={() => handleRegionClick(region.id)}
                  className={`transition-colors duration-300 hover:opacity-90 active:scale-[0.99] origin-center ${
                    isSelectedJustNow ? 'animate-pulse' : ''
                  }`}
                  filter={isSelectedJustNow ? 'url(#calmGlow)' : undefined}
                >
                  <title>{region.label} (Tap to color)</title>
                </path>
              );
            })}
          </svg>
        </div>

        {/* Bottom Canvas Controls: Change Pattern / Next Scene */}
        {!calmMode && (
          <div className="pt-2 flex items-center justify-between text-xs font-sans text-slate-400 px-1">
            <button
              onClick={handleResetArtwork}
              className="flex items-center space-x-1.5 hover:text-cyan-300 transition-colors py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800"
              title="Clear all colors on this artwork"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="text-[11px]">Clear Canvas</span>
            </button>

            <button
              onClick={handleResetAndChangePattern}
              className="flex items-center space-x-1.5 text-cyan-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-slate-900 border border-cyan-500/30 hover:border-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.1)] active:scale-95"
              title="Reset and switch to next artwork pattern"
            >
              <Shuffle className="w-3 h-3 text-cyan-400" />
              <span className="text-[11px] font-semibold">Change Pattern ✦</span>
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. COLOR PALETTE SWATCHES (HORIZONTAL SCROLLER)                           */}
      {/* ========================================================================= */}
      <div className="p-3 rounded-2xl bg-[#0c1220] border border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
            Palette • Tap a color, then tap artwork
          </span>
          <button
            onClick={() => {
              soundFx?.playPopSound?.(1.2);
              setShowExtendedPalette(true);
            }}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center space-x-1"
          >
            <span>+ More Colors</span>
          </button>
        </div>

        {/* Swatch row */}
        <div className="flex items-center space-x-2.5 overflow-x-auto pb-1.5 pt-0.5 px-0.5 no-scrollbar">
          {DEFAULT_PALETTE.map(color => {
            const isChosen = activeColor.toLowerCase() === color.hex.toLowerCase();
            return (
              <button
                key={color.id}
                onClick={() => {
                  soundFx?.playPopSound?.(1.5);
                  setActiveColor(color.hex);
                }}
                className={`relative flex-shrink-0 w-8 h-8 rounded-full transition-transform active:scale-90 ${
                  isChosen 
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0c1220] scale-110 shadow-[0_0_10px_#00F2FE]' 
                    : 'hover:scale-105 border border-slate-700/60'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. EXTENDED COLOR PALETTE DRAWER MODAL                                    */}
      {/* ========================================================================= */}
      {showExtendedPalette && (
        <div className="p-4 rounded-3xl bg-[#0a1120] border border-cyan-500/40 space-y-3 shadow-2xl animate-in zoom-in-95 duration-200 font-sans">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Expanded Serenity Palette
            </span>
            <button
              onClick={() => setShowExtendedPalette(false)}
              className="text-xs text-slate-400 hover:text-white py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800"
            >
              Done
            </button>
          </div>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {EXTENDED_PALETTE_CATEGORIES.map(cat => (
              <div key={cat.name} className="space-y-1.5">
                <span className="text-[10px] text-cyan-400 font-mono uppercase block">
                  {cat.name}
                </span>
                <div className="grid grid-cols-6 gap-2">
                  {cat.colors.map(c => {
                    const isSelected = activeColor.toLowerCase() === c.hex.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          soundFx?.playPopSound?.(1.5);
                          setActiveColor(c.hex);
                          setShowExtendedPalette(false);
                        }}
                        className={`w-8 h-8 rounded-full border transition-all ${
                          isSelected
                            ? 'ring-2 ring-cyan-400 scale-110 shadow-[0_0_8px_#00F2FE]'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. COMPLETION SCREEN MODAL                                                */}
      {/* ========================================================================= */}
      {isCompleted && (
        <div className="p-6 rounded-3xl bg-[#09101f] border border-cyan-400/40 space-y-5 text-center shadow-[0_0_40px_rgba(0,242,254,0.18)] animate-in zoom-in-95 duration-300 font-sans">
          
          <div className="w-14 h-14 mx-auto rounded-3xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-bold text-cyan-400 tracking-widest uppercase font-mono block">
              YOUR SCENE IS COMPLETE ✦
            </span>
            <h3 className="text-xl font-black text-white">
              You created your own moment of calm.
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed pt-1">
              Step back and take one slow, peaceful breath before you continue.
            </p>
          </div>

          {/* Optional Post-Game Check-In */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
            <span className="text-[10px] text-slate-400 block">
              How do you feel after the activity?
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
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 border transition-all ${
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
              <span className="text-[10px] text-emerald-400 block pt-1 animate-in fade-in">
                A short creative activity designed to encourage relaxation and focused attention.
              </span>
            )}
          </div>

          {/* Completion Action Buttons */}
          <div className="space-y-2 pt-1 font-mono">
            <button
              onClick={handleResetAndChangePattern}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:opacity-95 transition-opacity flex items-center justify-center space-x-2"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Color Another Scene ✦</span>
            </button>

            <button
              onClick={handleResetArtwork}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset & Repaint Scene</span>
            </button>

            <button
              onClick={() => {
                soundFx?.playPopSound?.(1.1);
                setActiveSceneId(null);
              }}
              className="w-full py-2 rounded-2xl bg-transparent hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs transition-colors"
            >
              Back to Gallery
            </button>
          </div>

        </div>
      )}

    </div>
  );
}

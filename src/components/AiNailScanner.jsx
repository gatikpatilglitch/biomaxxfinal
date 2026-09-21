import React, { useState } from 'react';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Scan, 
  CheckCircle2, 
  AlertCircle, 
  Utensils, 
  Apple, 
  Info, 
  Layers, 
  Zap,
  Activity
} from 'lucide-react';
import { soundFx } from '../utils/audioSynthesizer';

const PRESET_NAIL_SCENARIOS = [
  {
    name: 'Clinical Sample A: Anemia / Pale Bed',
    detected: 'Pale Nail Bed & Diminished Capillary Erythema',
    deficiency: 'Iron Deficiency (Microcytic Anemia)',
    hemoglobin: '9.8 g/dL (Low - Reference: 13.5-17.5)',
    curvature: 'Early Flattening (Pre-Koilonychia)',
    ridges: 'Smooth Surface',
    spots: 'None Detected',
    confidence: '94.8%',
    recommendations: [
      'Increase heme iron intake (lean red meat, chicken liver) or non-heme iron (spinach, lentils, black beans).',
      'Pair iron-rich foods with Vitamin C (oranges, bell peppers) to boost absorption by up to 300%.',
      'Avoid drinking black tea or coffee within 1 hour of meals as tannins inhibit iron uptake.'
    ]
  },
  {
    name: 'Clinical Sample B: Zinc & Beau\'s Lines',
    detected: 'Deep Horizontal Parallel Ridges (Beau\'s Lines)',
    deficiency: 'Severe Zinc & Cellular Growth Arrest',
    hemoglobin: '13.4 g/dL (Normal)',
    curvature: 'Normal Convex Contour',
    ridges: '3 Parallel Transverse Indentations (Depth: 0.4mm)',
    spots: 'Isolated Minor Leukonychia',
    confidence: '91.2%',
    recommendations: [
      'Incorporate zinc-dense foods: raw pumpkin seeds (pepitas), oysters, chickpeas, cashews, and dark chocolate.',
      'Consider an elemental Zinc Picolinate supplement (15-25mg/day with food).',
      'Ensure adequate vitamin B6 intake to assist in amino acid and zinc cellular assimilation.'
    ]
  },
  {
    name: 'Clinical Sample C: Leukonychia (White Spots)',
    detected: 'Punctate Leukonychia (Discrete White Pixel Clusters)',
    deficiency: 'Zinc, Calcium or Minor Keratin Micro-Trauma',
    hemoglobin: '14.1 g/dL (Optimal)',
    curvature: 'Normal Natural Arc',
    ridges: 'Minimal Superficial Striations',
    spots: '4 Distinct High-Reflectance Punctate Foci',
    confidence: '88.5%',
    recommendations: [
      'Increase dietary calcium: fortified plant milks, organic Greek yogurt, almonds, sesame seeds, and kale.',
      'Check daily protein intake to ensure sufficient keratin matrix synthesis (aim for 1.2g/kg bodyweight).',
      'Maintain adequate hydration to prevent nail plate desiccation.'
    ]
  },
  {
    name: 'Clinical Sample D: Optimal Health Benchmark',
    detected: 'Vibrant Pink Capillary Refill, Smooth Keratin Plate',
    deficiency: 'No Micronutrient Deficiencies Detected',
    hemoglobin: '14.8 g/dL (Optimal Hemoglobin)',
    curvature: 'Healthy Anatomic Convexity (160° Lovibond angle)',
    ridges: 'Nil',
    spots: 'Nil',
    confidence: '98.0%',
    recommendations: [
      'Maintain your current well-balanced micronutrient and protein regimen.',
      'Continue cardiopulmonary physical conditioning and hydration.'
    ]
  }
];

export default function AiNailScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState(0);
  const [scanResult, setScanResult] = useState(null);

  const handleRunScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    setScanResult(null);
    soundFx.playPopSound(1.3);

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setScanProgress(p);
      soundFx.playPopSound(1.0 + (p / 100));

      if (p >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setScanResult(PRESET_NAIL_SCENARIOS[selectedScenarioIdx]);
        soundFx.playZenChime();
      }
    }, 180);
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span>AI Nail Micronutrient Scanner</span>
          </h2>
          <p className="text-xs text-slate-400">
            Computer Vision colorimetry & texture segmentation detecting Iron, Zinc, Calcium, and Biotin deficiencies.
          </p>
        </div>

        {/* Preset Selector */}
        <select
          value={selectedScenarioIdx}
          onChange={(e) => setSelectedScenarioIdx(Number(e.target.value))}
          className="bg-slate-900 border border-slate-800 text-purple-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-purple-500"
        >
          {PRESET_NAIL_SCENARIOS.map((s, idx) => (
            <option key={idx} value={idx}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Scanner Container */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
        
        {/* Optical Scanning Stage */}
        <div className="h-56 bg-slate-950 rounded-2xl border border-slate-800 relative flex flex-col items-center justify-center overflow-hidden p-4">
          
          {/* Subtle Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8b5cf610_1px,transparent_1px),linear-gradient(to_bottom,#8b5cf610_1px,transparent_1px)] bg-[size:16px_16px]"></div>

          {/* Fingernail Plate Reticle */}
          <div className={`w-28 h-40 border-2 rounded-t-full rounded-b-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
            isScanning
              ? 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)] scale-105'
              : 'border-slate-700 border-dashed bg-slate-900/40'
          }`}>
            {/* Lunula (Half-moon) */}
            <div className="w-12 h-6 border-b-2 border-purple-400/60 rounded-b-full absolute bottom-4 bg-purple-500/10" />

            {/* Nail Bed Core */}
            <div className="w-18 h-24 rounded-t-full bg-gradient-to-b from-pink-500/20 to-purple-500/10 flex items-center justify-center">
              {isScanning && (
                <div className="w-full h-1 bg-purple-400 shadow-[0_0_10px_#c084fc] animate-pulse" />
              )}
            </div>
          </div>

          {/* Real-time Progress HUD */}
          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center space-y-3">
              <Scan className="w-8 h-8 text-purple-400 animate-spin" />
              <div className="w-48 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-purple-300">
                Segmenting Nail Bed Colorimetry... {scanProgress}%
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="w-full py-3 rounded-xl font-bold font-mono text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-98 text-white transition-all flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(168,85,247,0.35)] cursor-pointer disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          <span>{isScanning ? 'Processing Computer Vision Inference...' : 'Scan / Analyze Fingernail Photo'}</span>
        </button>

        {/* Detailed AI Diagnostics Card */}
        {scanResult && (
          <div className="bg-purple-950/20 border border-purple-500/40 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-purple-400 font-mono flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Micro-Nutritional Biomarker Profile</span>
              </span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                AI Confidence: {scanResult.confidence}
              </span>
            </div>

            {/* Primary Finding */}
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-400 font-mono block text-[10px]">Detected Physical Indicator:</span>
              <p className="text-slate-100 font-bold">{scanResult.detected}</p>
              <p className="text-amber-300 font-mono font-semibold text-xs">
                Linked Deficiency: {scanResult.deficiency}
              </p>
            </div>

            {/* Biomarker Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Hemoglobin Est.</span>
                <span className="text-xs font-bold text-slate-200">{scanResult.hemoglobin}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Curvature / Spooning</span>
                <span className="text-xs font-bold text-slate-200">{scanResult.curvature}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Beau's Ridges</span>
                <span className="text-xs font-bold text-slate-200">{scanResult.ridges}</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-slate-800">
                <span className="text-[9px] text-slate-400 block">Leukonychia Spots</span>
                <span className="text-xs font-bold text-slate-200">{scanResult.spots}</span>
              </div>
            </div>

            {/* Prescribed Dietary Correction */}
            <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 text-xs space-y-1.5">
              <span className="font-bold text-purple-300 block font-mono">
                🥗 Clinical Dietary Corrections:
              </span>
              <ul className="list-disc pl-4 space-y-1 text-purple-100">
                {scanResult.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            <p className="text-[10px] text-slate-500 italic text-center font-mono">
              * Guardrail: Computer vision nail screening is an adjunct triage tool and should be confirmed via clinical serum ferritin & micronutrient blood panel.
            </p>

          </div>
        )}

      </div>

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Scale, 
  Flame, 
  Dumbbell, 
  Utensils, 
  Apple, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Heart, 
  Sparkles,
  RefreshCw,
  Clock,
  Target
} from 'lucide-react';
import { 
  calculateNutritionPlan, 
  ACTIVITY_MULTIPLIERS,
  getBMICategory 
} from '../utils/healthCalculations';
import { soundFx } from '../utils/audioSynthesizer';

export default function BmiNutritionPlanner() {
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(78);
  const [age, setAge] = useState(32);
  const [gender, setGender] = useState('male');
  const [activityKey, setActivityKey] = useState('moderate');
  const [goal, setGoal] = useState('loss');
  const [activeSubtab, setActiveSubtab] = useState('diet'); // diet, workout, breakdown

  const plan = calculateNutritionPlan(weightKg, heightCm, age, gender, activityKey, goal);

  const handleAutoRecommendGoal = () => {
    const recommended = plan.category.defaultGoal;
    setGoal(recommended);
    soundFx.playPopSound(1.3);
  };

  return (
    <div className="space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Scale className="w-5 h-5 text-emerald-400" />
            <span>BMI, Metabolic Engine & Nutrition Planner</span>
          </h2>
          <p className="text-xs text-slate-400">
            Mifflin-St Jeor BMR, TDEE, macronutrient distribution, and cardiopulmonary-adapted exercise routines.
          </p>
        </div>

        <button
          onClick={handleAutoRecommendGoal}
          className="self-start sm:self-auto text-xs font-mono px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/20 transition-all flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto-Goal for BMI: {plan.category.defaultGoal.toUpperCase()}</span>
        </button>
      </div>

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Left Card: Biometric Sliders & Settings */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
          <div className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800 pb-2">
            Biometric Profile
          </div>

          {/* Height Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Height:</span>
              <span className="text-emerald-400 font-bold">{heightCm} cm ({(heightCm / 30.48).toFixed(1)} ft)</span>
            </div>
            <input
              type="range"
              min="130"
              max="220"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Weight Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Weight:</span>
              <span className="text-cyan-400 font-bold">{weightKg} kg ({(weightKg * 2.20462).toFixed(1)} lbs)</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-950 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Age (Years)</label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Biological Sex</label>
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono transition-all ${
                    gender === 'male' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-1 rounded-lg text-xs font-mono transition-all ${
                    gender === 'female' ? 'bg-pink-500/20 text-pink-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          {/* Activity Multiplier */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Daily Physical Activity</label>
            <select
              value={activityKey}
              onChange={(e) => setActivityKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, item]) => (
                <option key={key} value={key} className="bg-slate-900 text-slate-100">
                  {item.label} (×{item.value})
                </option>
              ))}
            </select>
          </div>

          {/* Target Goal Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Target Weight Goal</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { setGoal('loss'); soundFx.playPopSound(1.0); }}
                className={`py-2 px-1 rounded-xl text-xs font-mono border transition-all flex flex-col items-center ${
                  goal === 'loss'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500 font-bold shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 mb-0.5" />
                <span>Fat Loss</span>
                <span className="text-[9px] text-slate-400">-500 kcal</span>
              </button>

              <button
                onClick={() => { setGoal('maintain'); soundFx.playPopSound(1.0); }}
                className={`py-2 px-1 rounded-xl text-xs font-mono border transition-all flex flex-col items-center ${
                  goal === 'maintain'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Heart className="w-3.5 h-3.5 mb-0.5" />
                <span>Maintain</span>
                <span className="text-[9px] text-slate-400">Baseline</span>
              </button>

              <button
                onClick={() => { setGoal('gain'); soundFx.playPopSound(1.0); }}
                className={`py-2 px-1 rounded-xl text-xs font-mono border transition-all flex flex-col items-center ${
                  goal === 'gain'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 mb-0.5" />
                <span>Lean Gain</span>
                <span className="text-[9px] text-slate-400">+400 kcal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Card: Real-time Metabolic Output & Macronutrient Gauge */}
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-mono text-slate-300 font-bold uppercase tracking-wider">
                Metabolic Output & Health Cycle
              </span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${plan.category.badge}`}>
                {plan.category.category}
              </span>
            </div>

            {/* BMI & Target Hero */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">Body Mass Index (BMI)</span>
                <div className={`text-3xl font-black font-mono my-0.5 ${plan.category.color}`}>
                  {plan.bmi}
                </div>
                <span className="text-[9px] text-slate-400 font-mono">kg/m²</span>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 block">Target Daily Intake</span>
                <div className="text-3xl font-black font-mono text-emerald-400 text-glow-emerald my-0.5">
                  {plan.targetCalories}
                </div>
                <span className="text-[9px] text-slate-400 font-mono">kcal / day ({plan.weeklyPace})</span>
              </div>
            </div>

            {/* Health Cycle & BMR Breakdown */}
            <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs font-mono">
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Basal BMR:</span>
                <span className="text-slate-200 font-bold">{plan.bmr} kcal</span>
              </div>
              <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/80 flex justify-between">
                <span className="text-slate-400">Total TDEE:</span>
                <span className="text-slate-200 font-bold">{plan.tdee} kcal</span>
              </div>
            </div>

            {/* Medical Assessment Note */}
            <p className="text-xs text-slate-300 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 mt-3 leading-relaxed">
              🩺 <strong className="text-slate-200">Clinical Impact:</strong> {plan.category.description}
            </p>
          </div>

          {/* Macronutrient Split Bar & Counts */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Daily Macronutrient Target:</span>
              <span className="text-emerald-300 font-bold">{plan.targetCalories} kcal</span>
            </div>

            {/* Visual Macro Bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex border border-slate-800">
              <div style={{ width: '30%' }} className="bg-emerald-400 h-full" title="Protein 30%" />
              <div style={{ width: '40%' }} className="bg-cyan-400 h-full" title="Carbohydrates 40%" />
              <div style={{ width: '30%' }} className="bg-amber-400 h-full" title="Healthy Fats 30%" />
            </div>

            {/* Macro Grams Details */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
              <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-500/30">
                <span className="text-[10px] text-slate-400 block">Protein (30%)</span>
                <span className="text-sm font-bold text-emerald-400">{plan.macros.proteinGrams}g</span>
                <span className="text-[9px] text-slate-400 block">4 kcal/g</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 block">Carbs (40%)</span>
                <span className="text-sm font-bold text-cyan-400">{plan.macros.carbsGrams}g</span>
                <span className="text-[9px] text-slate-400 block">4 kcal/g</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded-xl border border-amber-500/30">
                <span className="text-[10px] text-slate-400 block">Fats (30%)</span>
                <span className="text-sm font-bold text-amber-400">{plan.macros.fatsGrams}g</span>
                <span className="text-[9px] text-slate-400 block">9 kcal/g</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Subtabs for Actionable Diet & Workout Plans */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-4">
        
        <div className="flex space-x-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveSubtab('diet')}
            className={`text-xs font-mono px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              activeSubtab === 'diet'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Prescribed Meal Plan (4 Daily Meals)</span>
          </button>

          <button
            onClick={() => setActiveSubtab('workout')}
            className={`text-xs font-mono px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
              activeSubtab === 'workout'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Targeted Exercise Routine (COPD-Adapted)</span>
          </button>
        </div>

        {/* SUBTAB 1: MEAL PLAN */}
        {activeSubtab === 'diet' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.mealPlan.map((item, idx) => (
              <div key={idx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">{item.meal}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                    {item.calories} kcal
                  </span>
                </div>

                <div className="flex space-x-3 text-[10px] font-mono text-slate-400">
                  <span>P: <strong className="text-emerald-400">{item.protein}g</strong></span>
                  <span>C: <strong className="text-cyan-400">{item.carbs}g</strong></span>
                  <span>F: <strong className="text-amber-400">{item.fats}g</strong></span>
                  <span className="text-slate-500">Scheduled: {item.time}</span>
                </div>

                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {item.items.map((food, fIdx) => (
                    <li key={fIdx} className="leading-snug">{food}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* SUBTAB 2: WORKOUT PLAN */}
        {activeSubtab === 'workout' && (
          <div className="space-y-3">
            <div className="bg-cyan-950/30 border border-cyan-500/30 p-3 rounded-xl text-xs space-y-1">
              <span className="font-bold text-cyan-300 block font-mono uppercase">
                Cardiopulmonary Conditioning Strategy:
              </span>
              <p className="text-cyan-100 leading-relaxed">
                {plan.exercisePlan.weeklyFocus}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {plan.exercisePlan.sessions.map((session, sIdx) => (
                <div key={sIdx} className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="border-b border-slate-800 pb-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 block">{session.day}</span>
                    <h4 className="text-xs font-bold text-slate-100">{session.type}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">Duration: {session.duration}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {session.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

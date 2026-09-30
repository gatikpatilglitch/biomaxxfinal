import React, { useState } from 'react';
import { 
  Flame, 
  Utensils, 
  Dumbbell, 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  Scale, 
  TrendingDown, 
  TrendingUp, 
  Activity, 
  CheckCircle2, 
  ShieldCheck, 
  AlertCircle, 
  Wind, 
  Clock, 
  Edit3, 
  Zap, 
  Heart,
  ChevronDown,
  ChevronUp,
  Target
} from 'lucide-react';
import { useAiFitnessPlan } from '../../hooks/useAiFitnessPlan';
import { calculateBMI, getBMICategory, ACTIVITY_MULTIPLIERS } from '../../utils/healthCalculations';
import { soundFx } from '../../utils/audioSynthesizer';

export default function AiFitnessNutritionView({ userData = {}, whoopData = {} }) {
  const [fitnessSubtab, setFitnessSubtab] = useState('nutrition'); // 'nutrition' | 'calories' | 'exercises' | 'stats'
  const [dietType, setDietType] = useState('veg'); // 'veg' | 'nonVeg'
  const [selectedGoal, setSelectedGoal] = useState('maintain'); // 'loss' | 'maintain' | 'gain'
  const [isEditingCalories, setIsEditingCalories] = useState(false);
  const [customCalorieInput, setCustomCalorieInput] = useState('');

  // Extract biometric data entered in the Personal tab
  const height = Number(userData.height) || 165;
  const weight = Number(userData.weight) || 58;
  const age = Number(userData.age) || 19;
  const gender = userData.gender || 'Female';
  const activityLevel = userData.activityLevel || 'moderate';

  const userBmi = calculateBMI(weight, height);
  const bmiCat = getBMICategory(userBmi);

  const profilePayload = {
    height,
    weight,
    age,
    gender,
    activityLevel,
    bmi: userBmi,
    bmiCategory: bmiCat.category,
    goal: selectedGoal
  };

  const {
    aiPlan,
    loading,
    error,
    lastGenerated,
    isAiGenerated,
    generateAiPlan,
    editCaloricTarget
  } = useAiFitnessPlan(profilePayload, whoopData);

  const handleGenerate = () => {
    soundFx?.playPopSound?.(1.4);
    generateAiPlan(profilePayload);
  };

  const handleGoalChange = (goal) => {
    soundFx?.playPopSound?.(1.2);
    setSelectedGoal(goal);
    generateAiPlan({ ...profilePayload, goal });
  };

  const handleSaveCustomCalories = (e) => {
    e.preventDefault();
    const val = parseInt(customCalorieInput, 10);
    if (!isNaN(val) && val >= 1000 && val <= 5000) {
      editCaloricTarget(val);
      setIsEditingCalories(false);
      soundFx?.playPopSound?.(1.3);
    }
  };

  const activeMealPlan = dietType === 'veg' ? aiPlan.vegPlan : aiPlan.nonVegPlan;
  const caloricTarget = aiPlan.caloricTarget;
  const exercisePlan = aiPlan.exercisePlan;

  return (
    <div className="space-y-4 font-mono">
      
      {/* ========================================================================= */}
      {/* 1. TOP AI GROQ CONTROL BANNER                                             */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1424] via-[#0e172e] to-[#0c1424] border border-cyan-500/35 shadow-[0_0_25px_rgba(0,242,254,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.25)]">
                <Sparkles className="w-4 h-4 text-cyan-300 animate-pulse" />
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white font-sans tracking-tight flex items-center gap-2">
                <span>Groq AI Health & Fitness Engine</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  {isAiGenerated ? 'GROQ ROTATED' : 'METABOLIC BASELINE'}
                </span>
              </h3>
            </div>
            
            <p className="text-[11px] text-slate-300 font-sans">
              Calibrated to Personal Tab: <strong className="text-cyan-300">BMI {userBmi}</strong> ({bmiCat.category}) • {height}cm • {weight}kg • {gender}
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing with Groq AI...' : isAiGenerated ? 'Re-generate with Groq AI' : 'Generate with Groq AI'}</span>
          </button>
        </div>

        {/* Clinical Insight Capsule */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-300 font-sans leading-relaxed flex items-start space-x-2">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-cyan-300">Clinical Metabolic Rationale:</strong> {aiPlan.bmiSummary?.clinicalInsight || caloricTarget.rationale}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SUBTABS SELECTOR                                                       */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0c1220] p-1.5 rounded-2xl border border-slate-800 text-xs">
        {[
          { id: 'nutrition', label: '🥗 Nutrition Plans', icon: Utensils },
          { id: 'calories', label: '🔥 Caloric Targets', icon: Flame },
          { id: 'exercises', label: '🏋️ BMI Exercises', icon: Dumbbell },
          { id: 'stats', label: '⚖️ Body Stats', icon: Scale },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = fitnessSubtab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundFx?.playPopSound?.(1.15);
                setFitnessSubtab(tab.id);
              }}
              className={`py-2 px-2 rounded-xl text-center transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                isActive 
                  ? 'bg-cyan-500/20 text-[#00F2FE] font-bold border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.2)]' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB A: NUTRITION PLANS (VEGETARIAN & NON-VEGETARIAN)                   */}
      {/* ========================================================================= */}
      {fitnessSubtab === 'nutrition' && (
        <div className="space-y-4">
          
          {/* Plan Selector & Veg/Non-Veg Switch */}
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Daily Tailored Nutrition</span>
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
                  <span>{dietType === 'veg' ? '🥗 Vegetarian Daily Plan' : '🍗 Non-Vegetarian Daily Plan'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {caloricTarget.targetCalories} kcal
                  </span>
                </h4>
              </div>

              {/* Veg vs Non-Veg Toggle */}
              <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 self-start sm:self-auto">
                <button
                  onClick={() => {
                    soundFx?.playPopSound?.(1.15);
                    setDietType('veg');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    dietType === 'veg'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🥗 Vegetarian</span>
                </button>
                <button
                  onClick={() => {
                    soundFx?.playPopSound?.(1.15);
                    setDietType('nonVeg');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                    dietType === 'nonVeg'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>🍗 Non-Vegetarian</span>
                </button>
              </div>
            </div>

            {/* Macro Summary Pill */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center text-[10px]">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block">Total Kcal</span>
                <span className="text-xs font-black text-cyan-300">{activeMealPlan?.totalCalories || caloricTarget.targetCalories}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block">Protein</span>
                <span className="text-xs font-black text-rose-300">{activeMealPlan?.totalProtein || caloricTarget.macros?.proteinGrams}g</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block">Carbs</span>
                <span className="text-xs font-black text-cyan-300">{activeMealPlan?.totalCarbs || caloricTarget.macros?.carbsGrams}g</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block">Fats</span>
                <span className="text-xs font-black text-amber-300">{activeMealPlan?.totalFats || caloricTarget.macros?.fatsGrams}g</span>
              </div>
            </div>
          </div>

          {/* 4 Structured Meals */}
          <div className="space-y-3">
            {activeMealPlan?.meals?.map((meal, index) => {
              const icons = ['🌅', '☀️', '⚡', '🌙'];
              return (
                <div 
                  key={index}
                  className="p-4 rounded-3xl bg-[#0e1628] border border-slate-800/90 hover:border-cyan-500/35 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xl">{icons[index] || '🍽️'}</span>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {meal.mealType} • {meal.time || (index === 0 ? '08:00 AM' : index === 1 ? '01:00 PM' : index === 2 ? '04:30 PM' : '07:30 PM')}
                        </span>
                        <h5 className="text-xs sm:text-sm font-bold text-white font-sans">{meal.title}</h5>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black text-cyan-300 block font-mono">{meal.kcal} kcal</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g
                      </span>
                    </div>
                  </div>

                  {/* Meal Items Bullet List */}
                  <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
                    <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                      {meal.items?.map((item, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold mt-0.5">•</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Respiratory / Health Benefit Tag */}
                  {meal.lungBenefit && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-teal-300/90 font-sans bg-teal-950/20 px-3 py-1.5 rounded-xl border border-teal-500/20">
                      <Wind className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      <span><strong>Cardiopulmonary Benefit:</strong> {meal.lungBenefit}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB B: TOTAL CALORIC TARGET & MACROS (EDITABLE)                        */}
      {/* ========================================================================= */}
      {fitnessSubtab === 'calories' && (
        <div className="space-y-4">
          
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/30 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Metabolic Calculation</span>
                  <h4 className="text-sm font-bold text-white font-sans">Total Caloric Targets & Deficit</h4>
                </div>
              </div>

              {!isEditingCalories ? (
                <button
                  onClick={() => {
                    setCustomCalorieInput(String(caloricTarget.targetCalories));
                    setIsEditingCalories(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-1.5 hover:bg-cyan-500/20 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Target</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingCalories(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Editable Calorie Number */}
            {isEditingCalories ? (
              <form onSubmit={handleSaveCustomCalories} className="p-3 bg-slate-950 rounded-2xl border border-cyan-500/50 space-y-2">
                <label className="text-xs text-slate-300 block">Edit Custom Daily Calorie Target (kcal):</label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="1000"
                    max="5000"
                    value={customCalorieInput}
                    onChange={(e) => setCustomCalorieInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-sm focus:border-cyan-400 outline-none"
                    placeholder="e.g. 2100"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-slate-950 border border-cyan-500/25 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase">Target Daily Intake</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-white">{caloricTarget.targetCalories}</span>
                    <span className="text-xs text-cyan-300">kcal/day</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Expected Pace</span>
                  <span className="text-xs font-bold text-emerald-400">{caloricTarget.pace || 'Equilibrium'}</span>
                </div>
              </div>
            )}

            {/* BMR and TDEE Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">BMR (Resting):</span>
                <span className="text-white font-bold">{caloricTarget.bmr} kcal</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">TDEE (Burned):</span>
                <span className="text-cyan-300 font-bold">{caloricTarget.tdee} kcal</span>
              </div>
            </div>

            {/* 3 Interactive Goal Switchers */}
            <div className="space-y-2 pt-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Switch Goal Profile:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'loss', label: 'Weight Loss', desc: 'Deficit for lung unburdening', icon: TrendingDown, color: 'text-amber-400', activeBg: 'bg-amber-500/15 border-amber-400/60' },
                  { id: 'maintain', label: 'Maintain', desc: 'Equilibrium & metabolic stability', icon: Activity, color: 'text-emerald-400', activeBg: 'bg-emerald-500/15 border-emerald-400/60' },
                  { id: 'gain', label: 'Weight Gain', desc: 'Surplus for chest hypertrophy', icon: TrendingUp, color: 'text-indigo-400', activeBg: 'bg-indigo-500/20 border-indigo-400/60' },
                ].map(g => {
                  const Icon = g.icon;
                  const isSel = selectedGoal === g.id;
                  return (
                    <div
                      key={g.id}
                      onClick={() => handleGoalChange(g.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSel ? g.activeBg : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className={`flex items-center space-x-1 ${g.color} mb-1`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase">{g.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">{g.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Macro Distribution */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                Macronutrient Distribution:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Protein (30%)</span>
                  <span className="text-sm font-black text-rose-300">{caloricTarget.macros?.proteinGrams}g</span>
                  <span className="text-[9px] text-slate-500 block">Muscle & repair</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Carbohydrates (40%)</span>
                  <span className="text-sm font-black text-cyan-300">{caloricTarget.macros?.carbsGrams}g</span>
                  <span className="text-[9px] text-slate-500 block">Glycogen energy</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">Healthy Fats (30%)</span>
                  <span className="text-sm font-black text-amber-300">{caloricTarget.macros?.fatsGrams}g</span>
                  <span className="text-[9px] text-slate-500 block">Hormonal balance</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB C: BMI-ADAPTED EXERCISE ROUTINE (AI POWERED)                       */}
      {/* ========================================================================= */}
      {fitnessSubtab === 'exercises' && (
        <div className="space-y-4">
          
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/35 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Personalized for BMI {userBmi}</span>
                  <h4 className="text-sm font-bold text-white font-sans">BMI-Adapted Exercise Protocol</h4>
                </div>
              </div>
              <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${bmiCat.badge}`}>
                {exercisePlan?.bmiCategory || bmiCat.category}
              </span>
            </div>

            {/* Exercise Focus & Joint Safety Guidelines */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-sans">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-cyan-300 font-mono uppercase font-bold block">Exercise Focus:</span>
                <p className="text-slate-300 leading-relaxed">{exercisePlan?.focus}</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1">
                <span className="text-[10px] text-amber-300 font-mono uppercase font-bold block">Joint & Biomechanical Safety:</span>
                <p className="text-slate-300 leading-relaxed">{exercisePlan?.jointSafety}</p>
              </div>
            </div>

            {/* Cardiopulmonary Breathing Tip */}
            {exercisePlan?.respiratoryTip && (
              <div className="p-3 rounded-2xl bg-teal-950/20 border border-teal-500/30 text-xs text-teal-300 flex items-start space-x-2 font-sans">
                <Wind className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span><strong className="text-cyan-300">Respiratory Coaching:</strong> {exercisePlan.respiratoryTip}</span>
              </div>
            )}

            {/* Workout Sessions */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-bold uppercase tracking-wider">Scheduled Weekly Sessions:</span>
                <span className="text-cyan-400 font-bold">{exercisePlan?.weeklyFrequency || '3-4 sessions/week'}</span>
              </div>

              {exercisePlan?.sessions?.map((session, sIdx) => (
                <div 
                  key={sIdx}
                  className="p-4 rounded-3xl bg-slate-900 border border-slate-800/90 hover:border-cyan-500/30 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block font-mono">
                        {session.day}
                      </span>
                      <h5 className="text-sm font-bold text-white font-sans">{session.title}</h5>
                    </div>
                    <div className="text-right text-[11px] font-mono">
                      <span className="text-white font-bold block">{session.duration}</span>
                      <span className="text-slate-400">{session.intensity}</span>
                    </div>
                  </div>

                  {/* Exercises Table */}
                  <div className="space-y-2 font-sans">
                    {session.exercises?.map((ex, eIdx) => (
                      <div 
                        key={eIdx}
                        className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs"
                      >
                        <div className="flex-1">
                          <span className="text-white font-bold">{ex.name}</span>
                          {ex.tip && (
                            <span className="block text-[11px] text-slate-400 mt-0.5">
                              💡 {ex.tip}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold">{ex.sets}</span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200">{ex.reps}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB D: BODY STATS & GOALS                                              */}
      {/* ========================================================================= */}
      {fitnessSubtab === 'stats' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/30 text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Body Mass Index (Personal Tab)</span>
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-cyan-500/40 border-t-cyan-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.2)]">
              <span className="text-2xl font-black text-white">{userBmi}</span>
              <span className={`text-[10px] font-bold ${bmiCat.color}`}>{bmiCat.category}</span>
            </div>
            <p className="text-[11px] text-slate-300 font-sans">
              Optimal healthy weight range for {height} cm: <strong className="text-emerald-400">{((18.5 * height * height) / 10000).toFixed(1)} – {((24.9 * height * height) / 10000).toFixed(1)} kg</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Height</span>
              <span className="font-bold text-white text-base">{height} cm</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Weight</span>
              <span className="font-bold text-white text-base">{weight} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MEDICAL DISCLAIMER                                                     */}
      {/* ========================================================================= */}
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center space-x-2 text-[11px] text-slate-400 font-sans">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>
          <strong className="text-slate-300">Disclaimer:</strong> Not medical advice — consult a healthcare provider for medical concerns. Exercise plans should be cleared with your physician if you have COPD or cardiovascular history.
        </span>
      </div>

    </div>
  );
}

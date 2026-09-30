import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Edit3, 
  CheckCircle2, 
  ShieldCheck, 
  Heart, 
  Award, 
  PhoneCall, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  ArrowLeft,
  Scale,
  Sparkles,
  Flame,
  Activity,
  Moon,
  Wind,
  Utensils,
  Calendar,
  TrendingDown,
  TrendingUp,
  Info,
  Check,
  Zap,
  Target
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';
import { 
  calculateCalorieTargets, 
  DAILY_NUTRITION_PLANS, 
  ACTIVITY_MULTIPLIERS, 
  getBMICategory,
  calculateBMI 
} from '../../utils/healthCalculations';
import { useAchievements } from '../../context/AchievementsContext';
import MedicationsScreen from './MedicationsScreen';
import AiFitnessNutritionView from './AiFitnessNutritionView';

export default function ProfileScreen() {
  const { 
    youSubView, 
    setYouSubView, 
    userData, 
    updateUserData, 
    whoopData, 
    inhalerData,
    setActiveTab,
    setGuardianSubView
  } = useWhoopData();

  const { 
    badges, 
    overallProgress, 
    nextBadgeToUnlock, 
    earnedBadges, 
    upcomingBadges, 
    openBadgeDetail 
  } = useAchievements();

  const [fitnessTab, setFitnessTab] = useState('nutrition'); // 'stats' | 'goals' | 'nutrition'
  const [nutritionGoal, setNutritionGoal] = useState('loss'); // 'loss' | 'maintain' | 'gain'
  const [selectedDay, setSelectedDay] = useState(() => new Date().getDay()); // 0-6 (Sun-Sat)
  const [dietType, setDietType] = useState('veg'); // 'veg' | 'nonVeg'
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name || 'Aditi',
    age: userData.age || 19,
    gender: userData.gender || 'Female',
    height: userData.height || 165,
    weight: userData.weight || 58,
    activityLevel: userData.activityLevel || 'moderate',
    bloodGroup: userData.bloodGroup || 'B+',
    emergencyDoctor: userData.emergencyDoctor || '+91 98765 43210',
    emergencyFamily: userData.emergencyFamily || '+91 87654 32109'
  });

  // Calculate dynamic BMI and healthy weight range for current user
  const currentHeightM = (Number(userData.height) || 165) / 100;
  const currentWeightKg = Number(userData.weight) || 58;
  const currentBMI = calculateBMI(currentWeightKg, Number(userData.height) || 165);
  const currentBMICat = getBMICategory(currentBMI);
  const minHealthyWeight = (18.5 * currentHeightM * currentHeightM).toFixed(1);
  const maxHealthyWeight = (24.9 * currentHeightM * currentHeightM).toFixed(1);

  // Live BMI calculation during edit
  const editHeightM = (Number(formData.height) || 165) / 100;
  const editWeightKg = Number(formData.weight) || 58;
  const editBMI = calculateBMI(editWeightKg, Number(formData.height) || 165);
  const editBMICat = getBMICategory(editBMI);

  // Calorie targets for weight loss and gain (Mifflin-St Jeor + TDEE)
  const calorieTargets = calculateCalorieTargets(
    currentWeightKg, 
    Number(userData.height) || 165, 
    Number(userData.age) || 19, 
    userData.gender || 'female', 
    userData.activityLevel || 'moderate'
  );

  // Selected Day Nutrition Plan (changes every day)
  const dayPlan = DAILY_NUTRITION_PLANS[selectedDay] || DAILY_NUTRITION_PLANS[0];
  const activeMealPlan = dayPlan[dietType] || dayPlan.veg;
  const dayMeals = [
    { key: 'breakfast', label: 'Breakfast', time: '08:00 AM', data: activeMealPlan.breakfast, icon: '🌅' },
    { key: 'lunch', label: 'Lunch', time: '01:00 PM', data: activeMealPlan.lunch, icon: '☀️' },
    { key: 'snack', label: 'Mid-Day Snack', time: '04:30 PM', data: activeMealPlan.snack, icon: '⚡' },
    { key: 'dinner', label: 'Dinner', time: '07:30 PM', data: activeMealPlan.dinner, icon: '🌙' },
  ];

  const totalDayCalories = dayMeals.reduce((sum, m) => sum + (m.data?.kcal || 0), 0);
  const totalDayProtein = dayMeals.reduce((sum, m) => sum + (m.data?.p || 0), 0);
  const totalDayCarbs = dayMeals.reduce((sum, m) => sum + (m.data?.c || 0), 0);
  const totalDayFats = dayMeals.reduce((sum, m) => sum + (m.data?.f || 0), 0);

  const daysOfWeek = [
    { index: 0, short: 'Sun', name: 'Sunday' },
    { index: 1, short: 'Mon', name: 'Monday' },
    { index: 2, short: 'Tue', name: 'Tuesday' },
    { index: 3, short: 'Wed', name: 'Wednesday' },
    { index: 4, short: 'Thu', name: 'Thursday' },
    { index: 5, short: 'Fri', name: 'Friday' },
    { index: 6, short: 'Sat', name: 'Saturday' },
  ];
  const todayDayIndex = new Date().getDay();

  // Privacy toggles
  const [privacyToggles, setPrivacyToggles] = useState({
    healthData: true,
    locationData: true,
    usageAnalytics: false,
    research: false
  });

  const subNavItems = [
    { id: 'overview', label: 'Profile' },
    { id: 'personal', label: 'Personal' },
    { id: 'fitness', label: 'Health & Fitness' },
    { id: 'medications', label: 'Medications' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'privacy', label: 'Privacy' },
    { id: 'settings', label: 'Settings' },
  ];

  const handleStartEdit = () => {
    soundFx.playPopSound(1.1);
    setFormData({
      name: userData.name || 'Aditi',
      age: userData.age || 19,
      gender: userData.gender || 'Female',
      height: userData.height || 165,
      weight: userData.weight || 58,
      activityLevel: userData.activityLevel || 'moderate',
      bloodGroup: userData.bloodGroup || 'B+',
      emergencyDoctor: userData.emergencyDoctor || '+91 98765 43210',
      emergencyFamily: userData.emergencyFamily || '+91 87654 32109'
    });
    setEditingPersonal(true);
  };

  const handleSavePersonal = (e) => {
    e.preventDefault();
    updateUserData(formData);
    setEditingPersonal(false);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300 font-sans">
      
      {/* Sub-Navigation Bar */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center space-x-1.5 min-w-max bg-[#0c1220] p-1.5 rounded-2xl border border-slate-800/80">
          {subNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundFx.playPopSound(1.2);
                setYouSubView(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                youSubView === item.id
                  ? 'bg-cyan-500/20 text-[#00F2FE] border border-cyan-500/40 font-bold shadow-[0_0_10px_rgba(0,242,254,0.25)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PROFILE OVERVIEW (Image 2 Screen 1)                                    */}
      {/* ========================================================================= */}
      {youSubView === 'overview' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="p-5 rounded-3xl bg-[#0e1628]/95 border border-slate-800 space-y-3.5 relative overflow-hidden">
            <div className="flex items-center space-x-3.5">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,242,254,0.25)] flex items-center justify-center text-cyan-400">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white font-sans">{userData.name}</h3>
                  <button 
                    onClick={() => {
                      soundFx.playPopSound(1.1);
                      setYouSubView('personal');
                    }}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Edit Personal Information"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                  <span>{userData.gender} • {userData.age} yrs</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold">BMI {userData.bmi} ({userData.bmiStatus || 'Healthy'})</span>
                </div>
              </div>
            </div>

            {/* Motivational Quote */}
            <p className="text-xs text-slate-300 italic bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80">
              "{`A healthier tomorrow, starts with small steps today.`}"
            </p>

            {/* Health Summary 4-Col */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono">
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Recovery</span>
                <span className={`text-sm font-black ${whoopData.recoveryScore >= 67 ? 'text-emerald-400' : whoopData.recoveryScore >= 34 ? 'text-amber-400' : 'text-rose-400'}`}>{whoopData.recoveryScore}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Sleep</span>
                <span className="text-sm font-black text-indigo-400">{whoopData.sleepHours}h</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SpO₂</span>
                <span className="text-sm font-black text-cyan-300">{whoopData.spo2}%</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">AQI</span>
                <span className="text-sm font-black text-amber-400">{whoopData.aqi}</span>
              </div>
            </div>
          </div>

          {/* Connected Devices */}
          <div 
            onClick={() => {
              setActiveTab('guardian');
              setGuardianSubView('wearable');
            }}
            className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 font-mono font-black text-white text-xs flex items-center justify-center">
                W
              </div>
              <div>
                <span className="text-xs font-bold text-white block">WHOOP 4.0 Strap</span>
                <span className="text-[10px] font-mono text-emerald-400">● Connected</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </div>

          {/* Navigation Links */}
          <div className="space-y-2">
            {[
              { id: 'personal', title: 'Personal Information', sub: 'Edit measurements, BMI & clinical emergency' },
              { id: 'fitness', title: 'Health & Fitness', sub: 'Nutrition meal planner, weight loss/gain calories & BMI' },
              { id: 'medications', title: 'Medications & Inhaler', sub: 'Track doses, reminders and plan' },
              { id: 'achievements', title: 'Achievements', sub: 'Badges and wellness milestones' },
              { id: 'emergency', title: 'Emergency Info', sub: 'Emergency contacts and medical profile' },
              { id: 'settings', title: 'Preferences & Settings', sub: 'Theme, permissions, and device sync' },
            ].map((link) => (
              <div
                key={link.id}
                onClick={() => {
                  soundFx.playPopSound(1.2);
                  setYouSubView(link.id);
                }}
                className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 block">{link.title}</span>
                  <span className="text-[11px] text-slate-400">{link.sub}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PERSONAL INFORMATION (Edit & Dynamic BMI, Category Removed)            */}
      {/* ========================================================================= */}
      {youSubView === 'personal' && (
        <div className="space-y-4">
          
          {/* Dynamic BMI Analytics Card */}
          <div className={`p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e1628] to-slate-900 border ${currentBMICat.border} space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(0,242,254,0.15)]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block">Real-Time Metric</span>
                  <h4 className="text-sm font-bold text-white font-sans">Body Mass Index (BMI)</h4>
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono ${currentBMICat.badge}`}>
                {currentBMICat.category}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white font-mono tracking-tight">{currentBMI}</span>
                <span className="text-xs text-slate-400 font-mono">kg/m²</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-mono">Healthy Weight Range</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">{minHealthyWeight} – {maxHealthyWeight} kg</span>
              </div>
            </div>

            {/* 4-Zone BMI Visual Spectrum Meter */}
            <div className="space-y-1.5 pt-1">
              <div className="grid grid-cols-4 gap-1 h-2 rounded-full overflow-hidden bg-slate-800">
                <div className={`h-full transition-all ${currentBMI < 18.5 ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'bg-sky-950/60'}`} title="Underweight (<18.5)" />
                <div className={`h-full transition-all ${currentBMI >= 18.5 && currentBMI < 24.9 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-emerald-950/60'}`} title="Normal (18.5-24.9)" />
                <div className={`h-full transition-all ${currentBMI >= 24.9 && currentBMI < 30 ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-amber-950/60'}`} title="Overweight (25-29.9)" />
                <div className={`h-full transition-all ${currentBMI >= 30 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-rose-950/60'}`} title="Obese (≥30)" />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                <span>Under (&lt;18.5)</span>
                <span className="text-emerald-400 font-semibold">Normal (18.5–24.9)</span>
                <span>Over (25–29.9)</span>
                <span>Obese (≥30)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              {currentBMICat.description}
            </p>
          </div>

          {/* Personal Information Card */}
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-sans">Personal Information</h3>
              {!editingPersonal && (
                <button
                  onClick={handleStartEdit}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs flex items-center space-x-1.5 hover:bg-cyan-500/20 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {!editingPersonal ? (
              <div className="space-y-2 text-xs">
                {[
                  { label: 'Name', val: userData.name },
                  { label: 'Age', val: `${userData.age} years` },
                  { label: 'Gender', val: userData.gender },
                  { label: 'Height', val: `${userData.height} cm` },
                  { label: 'Weight', val: `${userData.weight} kg` },
                  { label: 'Activity Level', val: ACTIVITY_MULTIPLIERS[userData.activityLevel]?.label?.split('(')[0] || 'Moderately Active' },
                  { label: 'Blood Group', val: userData.bloodGroup },
                  { label: 'Doctor Contact', val: userData.emergencyDoctor },
                  { label: 'Family ICE', val: userData.emergencyFamily }
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-white font-bold">{row.val}</span>
                  </div>
                ))}

                <button
                  onClick={handleStartEdit}
                  className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold font-mono text-xs hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.25)] flex items-center justify-center space-x-2 cursor-pointer transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Personal Information</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSavePersonal} className="space-y-3 text-xs">
                
                {/* Live Preview BMI Badge while typing */}
                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scale className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">Live Calculated BMI:</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="text-sm font-black text-cyan-300">{editBMI}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${editBMICat.badge}`}>{editBMICat.category}</span>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                    placeholder="e.g. Aditi"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Age (Years)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="120"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      required
                      min="50"
                      max="250"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      required
                      min="20"
                      max="300"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Daily Activity Level</label>
                  <select
                    value={formData.activityLevel}
                    onChange={(e) => setFormData({ ...formData, activityLevel: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                  >
                    {Object.entries(ACTIVITY_MULTIPLIERS).map(([key, item]) => (
                      <option key={key} value={key}>{item.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-slate-400 block mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-400 block mb-1">Doctor ICE Phone</label>
                    <input
                      type="text"
                      value={formData.emergencyDoctor}
                      onChange={(e) => setFormData({ ...formData, emergencyDoctor: e.target.value })}
                      className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Family ICE Phone</label>
                  <input
                    type="text"
                    value={formData.emergencyFamily}
                    onChange={(e) => setFormData({ ...formData, emergencyFamily: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-cyan-400 outline-none"
                  />
                </div>

                <div className="flex space-x-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingPersonal(false)}
                    className="flex-1 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-300 font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-bold rounded-xl hover:brightness-110 shadow-[0_0_15px_rgba(0,242,254,0.25)] cursor-pointer transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. HEALTH & FITNESS (Groq AI Calorie Targets, Veg/Non-Veg & BMI Workouts) */}
      {/* ========================================================================= */}
      {youSubView === 'fitness' && (
        <AiFitnessNutritionView userData={userData} whoopData={whoopData} />
      )}

      {/* ========================================================================= */}
      {/* 3.5. MEDICATIONS & INHALER VIEW                                           */}
      {/* ========================================================================= */}
      {youSubView === 'medications' && (
        <MedicationsScreen onBack={() => setYouSubView('overview')} />
      )}

      {/* ========================================================================= */}
      {/* 4. ACHIEVEMENTS & BADGES SYSTEM                                           */}
      {/* ========================================================================= */}
      {youSubView === 'achievements' && (
        <div className="space-y-4 font-sans animate-in fade-in duration-300">
          
          {/* A. YOUR JOURNEY */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/30 space-y-3 shadow-[0_0_25px_rgba(0,242,254,0.08)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">
                YOUR JOURNEY
              </span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {overallProgress.percent}% COMPLETE
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">🏆</span>
              <h3 className="text-base sm:text-lg font-black text-white font-sans">
                {overallProgress.earnedCount} / {overallProgress.totalCount} BADGES EARNED
              </h3>
            </div>

            {/* Overall progress bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 shadow-[0_0_12px_rgba(0,242,254,0.7)] transition-all duration-700"
                  style={{ width: `${overallProgress.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>{overallProgress.earnedCount} Unlocked</span>
                <span>{overallProgress.totalCount - overallProgress.earnedCount} Remaining</span>
              </div>
            </div>
          </div>

          {/* B. NEXT TO UNLOCK */}
          {nextBadgeToUnlock && (
            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold">
                  NEXT TO UNLOCK
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold">
                  Closest milestone
                </span>
              </div>

              <div 
                onClick={() => openBadgeDetail(nextBadgeToUnlock.badge)}
                className="w-full p-5 rounded-3xl bg-gradient-to-b from-[#0f1b33] to-[#0c1424] border-2 border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.18)] transition-all cursor-pointer text-center space-y-3 group"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(0,242,254,0.3)] group-hover:scale-105 transition-transform">
                  <span>{nextBadgeToUnlock.badge.icon}</span>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-base font-black text-white font-sans tracking-wide group-hover:text-cyan-300 transition-colors">
                    {nextBadgeToUnlock.badge.name}
                  </h4>
                  <p className="text-xs text-slate-300 font-sans px-2 leading-relaxed">
                    “{nextBadgeToUnlock.badge.description}”
                  </p>
                </div>

                <div className="max-w-xs mx-auto space-y-2 pt-1 font-mono">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-white font-bold">
                      {nextBadgeToUnlock.badge.current} / {nextBadgeToUnlock.badge.target} {nextBadgeToUnlock.badge.unit}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(0,242,254,0.8)] transition-all duration-500"
                      style={{ width: `${nextBadgeToUnlock.progressPercent}%` }}
                    />
                  </div>

                  <span className="text-xs font-bold text-cyan-400 block pt-0.5">
                    {nextBadgeToUnlock.remainingLabel}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* C. EARNED BADGES (2-Column Grid) */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold">
                EARNED BADGES ({earnedBadges.length})
              </span>
              <span className="text-[10px] text-slate-500">
                Tap to inspect
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {earnedBadges.map((badge) => (
                <div
                  key={badge.id}
                  onClick={() => openBadgeDetail(badge)}
                  className="p-3.5 rounded-2xl bg-gradient-to-b from-[#0d1629] to-[#091122] border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_18px_rgba(0,242,254,0.18)] transition-all cursor-pointer flex flex-col items-center text-center space-y-2 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(0,242,254,0.35)] group-hover:scale-105 transition-transform">
                    <span>{badge.icon}</span>
                  </div>

                  <div className="space-y-1 w-full">
                    <h5 className="text-xs font-black text-white font-sans tracking-wide leading-tight group-hover:text-cyan-300 transition-colors">
                      {badge.name}
                    </h5>
                    <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400 stroke-[3]" />
                      <span>✓ EARNED</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* D. UPCOMING BADGES (2-Column Grid) */}
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-bold">
                UPCOMING BADGES ({upcomingBadges.length})
              </span>
              <span className="text-[10px] text-slate-500">
                In progress & locked
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {upcomingBadges.map((badge) => {
                const isLocked = badge.status === 'locked';
                const progressPercent = Math.min(100, Math.round((badge.current / badge.target) * 100));

                return (
                  <div
                    key={badge.id}
                    onClick={() => openBadgeDetail(badge)}
                    className={`p-3.5 rounded-2xl transition-all cursor-pointer flex flex-col items-center text-center space-y-2 group ${
                      isLocked
                        ? 'bg-slate-900/60 border border-slate-800/80 opacity-70 hover:opacity-100 hover:border-slate-700'
                        : 'bg-[#0d1629] border border-cyan-500/25 hover:border-cyan-500/50 shadow-sm'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl relative ${
                      isLocked
                        ? 'bg-slate-900 border border-slate-800 text-slate-600 grayscale'
                        : 'bg-slate-900 border border-cyan-500/30'
                    }`}>
                      <span>{badge.icon}</span>
                      {isLocked && (
                        <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
                          <Lock className="w-4 h-4 text-slate-400" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 w-full">
                      <h5 className="text-xs font-bold text-white font-sans tracking-wide leading-tight group-hover:text-cyan-300 transition-colors">
                        {badge.name}
                      </h5>

                      {isLocked ? (
                        <div className="inline-flex items-center space-x-1 text-[10px] font-mono text-slate-400">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>LOCKED</span>
                        </div>
                      ) : (
                        <div className="space-y-1 w-full pt-0.5">
                          <span className="text-[10px] font-mono text-cyan-300 font-bold block">
                            {badge.current} / {badge.target} {badge.unit}
                          </span>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-cyan-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. EMERGENCY INFO (Image 2 Screen 9)                                      */}
      {/* ========================================================================= */}
      {youSubView === 'emergency' && (
        <div className="space-y-4 font-mono">
          <div className="p-4 rounded-3xl bg-rose-950/20 border border-rose-500/40 space-y-3">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
              <PhoneCall className="w-4 h-4" />
              <span>Emergency Contacts</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Emergency Services</span>
                <span className="text-rose-400 font-bold">112</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Doctor (Pulmonologist)</span>
                <span className="text-cyan-300 font-bold">{userData.emergencyDoctor}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Family ICE</span>
                <span className="text-white font-bold">{userData.emergencyFamily}</span>
              </div>
            </div>
          </div>

          {/* Medical Info */}
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-2 text-xs">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Medical Information</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div className="p-2 rounded-xl bg-slate-900">Blood Group: <strong className="text-white">{userData.bloodGroup}</strong></div>
              <div className="p-2 rounded-xl bg-slate-900">Allergies: <strong className="text-white">{userData.allergies}</strong></div>
              <div className="p-2 rounded-xl bg-slate-900">Condition: <strong className="text-white">{userData.chronicCondition}</strong></div>
              <div className="p-2 rounded-xl bg-slate-900">Inhaler: <strong className="text-white">{userData.inhalerType}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DATA & PRIVACY (Image 2 Screen 6)                                      */}
      {/* ========================================================================= */}
      {youSubView === 'privacy' && (
        <div className="space-y-3 font-mono">
          <span className="text-xs text-slate-400 uppercase tracking-wider px-1 block font-bold">Data & Privacy Control</span>
          <div className="space-y-2">
            {[
              { key: 'healthData', label: 'Health Biometric Sync', sub: 'Sync WHOOP recovery & respiratory data' },
              { key: 'locationData', label: 'Location Services', sub: 'Used for ambient AQI & smog alerts' },
              { key: 'usageAnalytics', label: 'Usage Analytics', sub: 'Help us improve app performance' },
              { key: 'research', label: 'Research Participation', sub: 'Anonymous COPD research opt-in' },
            ].map((p) => (
              <div key={p.key} className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">{p.label}</span>
                  <span className="text-[11px] text-slate-400">{p.sub}</span>
                </div>
                <button
                  onClick={() => setPrivacyToggles(prev => ({ ...prev, [p.key]: !prev[p.key] }))}
                  className={`w-11 h-6 rounded-full transition-colors relative ${privacyToggles[p.key] ? 'bg-cyan-500' : 'bg-slate-800'}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${privacyToggles[p.key] ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SETTINGS (Image 2 Screen 5)                                            */}
      {/* ========================================================================= */}
      {youSubView === 'settings' && (
        <div className="space-y-2 font-mono text-xs">
          {[
            'App Preferences (Theme, Language, Notifications)',
            'Health Preferences (Units, Goals, Data Sharing)',
            'Privacy & Security (Permissions, Data Control)',
            'Device Connections (WHOOP, Smart Sensors)',
            'Help & Support (FAQs, Contact Us)',
            'About BioMaxxx (Version 2.4.0 Live)'
          ].map((s, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-[#0e1628] border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/30">
              <span className="text-slate-200">{s}</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </div>
          ))}

          <button 
            onClick={() => soundFx.playPopSound(0.8)}
            className="w-full mt-4 py-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 font-bold hover:bg-rose-900/40"
          >
            Log Out
          </button>
        </div>
      )}

    </div>
  );
}

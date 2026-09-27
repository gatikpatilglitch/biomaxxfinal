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
  Wind
} from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

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

  const [fitnessTab, setFitnessTab] = useState('stats'); // 'stats' | 'goals' | 'nutrition'
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    age: userData.age,
    gender: userData.gender,
    height: userData.height,
    weight: userData.weight
  });

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
    { id: 'help', label: 'Help' },
  ];

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
                    onClick={() => setYouSubView('personal')}
                    className="p-1 text-slate-400 hover:text-cyan-300"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
                  <span>{userData.gender} • {userData.age} yrs</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-bold">{userData.category}</span>
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
                <span className="text-sm font-black text-emerald-400">{whoopData.recoveryScore}%</span>
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
              { id: 'personal', title: 'Personal Information', sub: 'Basic details & body measurements' },
              { id: 'fitness', title: 'Health & Fitness', sub: 'BMI, body stats, and goals' },
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
      {/* 2. PERSONAL INFORMATION (Image 2 Screen 2)                                */}
      {/* ========================================================================= */}
      {youSubView === 'personal' && (
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-3 font-mono">
            <h3 className="text-sm font-bold text-white font-sans">Personal Information</h3>

            {!editingPersonal ? (
              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Name', val: userData.name },
                  { label: 'Age', val: `${userData.age} years` },
                  { label: 'Gender', val: userData.gender },
                  { label: 'Category', val: userData.category },
                  { label: 'Height', val: `${userData.height} cm` },
                  { label: 'Weight', val: `${userData.weight} kg` }
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">{row.label}</span>
                    <span className="text-white font-bold">{row.val}</span>
                  </div>
                ))}

                <button
                  onClick={() => setEditingPersonal(true)}
                  className="w-full mt-3 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold font-mono text-xs hover:brightness-110"
                >
                  Edit Information
                </button>
              </div>
            ) : (
              <form onSubmit={handleSavePersonal} className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPersonal(false)}
                    className="flex-1 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl"
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
      {/* 3. HEALTH & FITNESS (Image 2 Screen 3)                                    */}
      {/* ========================================================================= */}
      {youSubView === 'fitness' && (
        <div className="space-y-4 font-mono">
          <div className="flex space-x-1 bg-[#0c1220] p-1 rounded-xl border border-slate-800 text-xs">
            {['stats', 'goals', 'nutrition'].map(tab => (
              <button
                key={tab}
                onClick={() => setFitnessTab(tab)}
                className={`flex-1 py-1.5 rounded-lg capitalize transition-colors ${fitnessTab === tab ? 'bg-cyan-500/20 text-[#00F2FE] font-bold border border-cyan-500/40' : 'text-slate-400'}`}
              >
                {tab === 'stats' ? 'Body Stats' : tab}
              </button>
            ))}
          </div>

          {/* BMI Gauge Hero */}
          <div className="p-5 rounded-3xl bg-[#0e1628] border border-cyan-500/30 text-center space-y-2">
            <span className="text-xs text-slate-400 uppercase tracking-wider block">Body Mass Index</span>
            <div className="w-24 h-24 mx-auto rounded-full border-4 border-emerald-500/40 border-t-emerald-400 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white">{userData.bmi}</span>
              <span className="text-[10px] text-emerald-400 font-bold">{userData.bmiStatus}</span>
            </div>
            <p className="text-[11px] text-slate-300">Target healthy range: 18.5 – 24.9</p>
          </div>

          {/* Body Composition Grid */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Height</span>
              <span className="font-bold text-white text-base">{userData.height} cm</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Weight</span>
              <span className="font-bold text-white text-base">{userData.weight} kg</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Body Fat</span>
              <span className="font-bold text-cyan-300 text-base">{userData.bodyFat}%</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Muscle Mass</span>
              <span className="font-bold text-emerald-300 text-base">{userData.muscleMass} kg</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACHIEVEMENTS (Image 2 Screen 8)                                        */}
      {/* ========================================================================= */}
      {youSubView === 'achievements' && (
        <div className="space-y-4 font-mono">
          <div className="p-4 rounded-3xl bg-[#0e1628] border border-slate-800 space-y-3">
            <span className="text-xs text-slate-400 uppercase tracking-wider block font-bold">Earned Badges</span>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { name: 'First Walk', sub: 'Completed', icon: '🏃' },
                { name: 'Sleep Streak', sub: '3 Days', icon: '🌙' },
                { name: 'AQI Hero', sub: '7 Days', icon: '🛡️' },
                { name: 'Consistency', sub: '7 Days', icon: '⭐' },
                { name: 'Stress Free', sub: '5 Sessions', icon: '🧘' },
                { name: 'Health Guardian', sub: '30 Days', icon: '🏅' },
              ].map((badge, i) => (
                <div key={i} className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <div className="text-2xl">{badge.icon}</div>
                  <span className="text-[10px] font-bold text-white block">{badge.name}</span>
                  <span className="text-[9px] text-cyan-400 block">{badge.sub}</span>
                </div>
              ))}
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

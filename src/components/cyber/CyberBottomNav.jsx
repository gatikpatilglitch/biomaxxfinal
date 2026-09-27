import React from 'react';
import { Home, Shield, Sparkles, User, BarChart2 } from 'lucide-react';
import { useWhoopData } from '../../context/WhoopDataContext';
import { soundFx } from '../../utils/audioSynthesizer';

export default function CyberBottomNav() {
  const { activeTab, setActiveTab } = useWhoopData();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'guardian', label: 'Guardian', icon: Shield },
    { id: 'actions', label: 'Actions', icon: Sparkles },
    { id: 'you', label: 'You', icon: User },
  ];

  const handleSelectTab = (id) => {
    setActiveTab(id);
    soundFx.playPopSound(1.2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto bg-[#0b101c]/95 backdrop-blur-2xl border border-slate-800/90 rounded-full py-2 px-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-around ring-1 ring-cyan-500/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`flex flex-col items-center py-1 px-4 rounded-full transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'text-[#00F2FE] font-bold scale-105' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.5px] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]' : 'stroke-[1.8px]'}`} />
              </div>
              <span className="text-[11px] font-sans tracking-wide">
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] mt-0.5 shadow-[0_0_6px_#00F2FE]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

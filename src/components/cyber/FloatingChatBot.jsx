import React, { useState } from 'react';
import { Bot, X } from 'lucide-react';
import AskMeAnythingBot from './AskMeAnythingBot';
import { soundFx } from '../../utils/audioSynthesizer';

export default function FloatingChatBot() {
  const [open, setOpen] = useState(false);

  const toggle = () => {
    soundFx?.playPopSound?.(1.3);
    setOpen((o) => !o);
  };

  return (
    <>
      {/* Chat panel stays mounted so history and in-flight requests survive open/close */}
      <div
        className={`fixed bottom-40 right-4 z-50 w-[calc(100vw-2rem)] max-w-[400px] ${open ? 'block' : 'hidden'}`}
      >
        <AskMeAnythingBot isModal onClose={toggle} />
      </div>

      <button
        onClick={toggle}
        aria-label={open ? 'Close Ask Me Anything AI' : 'Open Ask Me Anything AI'}
        title="Ask Me Anything AI"
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 text-slate-950 flex items-center justify-center shadow-[0_0_25px_rgba(0,242,254,0.45)] hover:scale-105 active:scale-95 transition-transform cursor-pointer"
      >
        {open ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
      </button>
    </>
  );
}

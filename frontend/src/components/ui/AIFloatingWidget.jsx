import React, { useState } from 'react';
import { Bot, Sparkles } from 'lucide-react';
import AIShoppingAssistantModal from './AIShoppingAssistantModal';

export default function AIFloatingWidget() {
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      {/* Floating Action Button at Bottom Right Corner */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 select-none">
        {/* Tooltip / Prompt Label */}
        <div
          onClick={() => setIsAIAssistantOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`hidden sm:flex items-center space-x-2 bg-[#063328] text-white px-3.5 py-2 rounded-full shadow-2xl border border-emerald-400/30 cursor-pointer transition-all duration-300 transform ${
            isHovered ? 'scale-105 bg-emerald-900 border-emerald-400' : 'opacity-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-black tracking-wide">Ask AI Assistant</span>
        </div>

        {/* Round Floating Bot Icon Button */}
        <button
          onClick={() => setIsAIAssistantOpen(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative group w-14 h-14 rounded-full bg-gradient-to-tr from-[#063328] via-[#094839] to-emerald-600 text-white shadow-2xl flex items-center justify-center border-2 border-emerald-300/40 hover:border-emerald-300 transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
          title="Ask BuyZo AI Shopping Assistant"
        >
          {/* Animated Pulse Ring Background */}
          <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping opacity-75 group-hover:opacity-100 pointer-events-none" />

          {/* Bot Icon */}
          <Bot className="w-7 h-7 stroke-[2] group-hover:rotate-12 transition-transform duration-300" />

          {/* GPT Badge */}
          <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.2 shadow-md border border-white uppercase tracking-tighter">
            GPT
          </span>

          {/* Online Indicator Green Dot */}
          <span className="absolute bottom-0 right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-2xs" />
        </button>
      </div>

      {/* Shopping Assistant Modal */}
      <AIShoppingAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </>
  );
}

import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FinalCTAProps {
  onGetStarted: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onGetStarted }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#17114A] via-[#1F175E] to-[#2B1E78] text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8">
      {/* Subtle Flowing Wave in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden select-none">
        <svg
          className="absolute right-0 bottom-0 w-full h-full text-white/30"
          viewBox="0 0 1200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,100 C 300,180 600,20 900,120 C 1050,170 1150,80 1200,100 L 1200,200 L 0,200 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-8">
        {/* Left Copy */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-white leading-tight">
            There’s More to You. Discover It.
          </h2>
          <p className="text-sm sm:text-base text-purple-200/90 font-normal">
            Your Brain Has a Manual. We Built It.
          </p>
        </div>

        {/* Right CTA Button */}
        <div className="shrink-0 w-full sm:w-auto">
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-white hover:bg-slate-100 text-[#17114A] text-sm font-bold px-6 py-3.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-[#17114A]" />
          </button>
        </div>
      </div>
    </section>
  );
};

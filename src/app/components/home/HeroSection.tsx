import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onGetStarted,
  onExplore,
}) => {
  return (
    <section className="relative overflow-hidden bg-white pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
      {/* Background Abstract Lavender Wave - Desktop & Tablet */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 pointer-events-none overflow-hidden select-none opacity-80 z-0">
        <svg
          className="absolute right-[-10%] top-[-5%] w-[120%] h-[115%] text-purple-100/70"
          viewBox="0 0 700 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="hero-wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ECE8FE" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#DFD9FE" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="hero-wave-grad-2" x1="100%" y1="10%" x2="0%" y2="90%">
              <stop offset="0%" stopColor="#EDE9FE" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#E0DBFE" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 150,0 C 350,180 200,380 600,420 C 680,430 700,500 700,600 L 700,0 Z"
            fill="url(#hero-wave-grad-1)"
          />
          <path
            d="M 280,0 C 420,120 380,320 700,360 L 700,0 Z"
            fill="url(#hero-wave-grad-2)"
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Copy, Buttons */}
          <div className="lg:col-span-8 flex flex-col items-start">
            {/* Eyebrow */}
            <div className="inline-block text-[11px] sm:text-xs font-bold tracking-[0.16em] text-[#4E35DE] uppercase mb-4 sm:mb-5">
              AI-POWERED HUMAN INTELLIGENCE PLATFORM
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-[#0B0C1E] leading-[1.08] sm:leading-[1.06]">
              There’s More to You.<br />
              <span className="text-[#4E35DE]">Discover It.</span>
            </h1>

            {/* Supporting Copy */}
            <div className="mt-6 sm:mt-8 space-y-2 max-w-xl">
              <p className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
                Understand how you learn, think, work and grow.
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                JotMinds turns human intelligence into practical insights for education, development, careers and organizations.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-4">
              <button
                onClick={onGetStarted}
                className="bg-[#4E35DE] hover:bg-[#412dc4] text-white text-sm font-semibold px-6 py-3.5 rounded-lg shadow-sm flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExplore}
                className="bg-white hover:bg-slate-50 border border-[#4E35DE] text-[#4E35DE] text-sm font-semibold px-5 sm:px-6 py-3.5 rounded-lg flex items-center gap-2 transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                <span className="w-5 h-5 rounded-full border border-[#4E35DE] flex items-center justify-center shrink-0">
                  <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                </span>
                <span>Explore JotMinds</span>
              </button>
            </div>
          </div>

          {/* Right Column: Editorial Column Block */}
          <div className="lg:col-span-4 flex lg:justify-end">
            <div className="w-full lg:max-w-[220px] pt-4 lg:pt-0">
              <div className="text-[11px] sm:text-xs font-bold tracking-[0.2em] text-slate-400 uppercase space-y-1">
                <div>PEOPLE.</div>
                <div>POTENTIAL.</div>
                <div>PROGRESS.</div>
              </div>

              {/* Purple accent bar */}
              <div className="w-7 h-[2px] bg-[#4E35DE] my-4 sm:my-5" />

              <p className="text-sm sm:text-[15px] font-medium text-slate-600 leading-snug">
                Human intelligence<br />
                for a brighter<br />
                tomorrow.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

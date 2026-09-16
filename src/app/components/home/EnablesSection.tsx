import React from 'react';
import { User, BookOpen, BarChart3 } from 'lucide-react';

export const EnablesSection: React.FC = () => {
  const capabilities = [
    {
      title: 'For Individuals',
      icon: User,
      text: 'Understand learning, thinking, decision-making, strengths and development.',
    },
    {
      title: 'For Education',
      icon: BookOpen,
      text: 'Support learners, parents, educators and institutions with actionable intelligence.',
    },
    {
      title: 'For Work',
      icon: BarChart3,
      text: 'Apply human intelligence to professional development, talent, teams and organizations.',
    },
  ];

  return (
    <section id="what-it-enables" className="bg-white py-16 sm:py-20 border-t border-slate-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Heading */}
          <div className="lg:col-span-4">
            <div className="text-[11px] font-bold tracking-[0.18em] text-[#4E35DE] uppercase mb-2">
              WHAT JOTMINDS ENABLES
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0B0C1E] tracking-tight leading-tight">
              Human Intelligence.<br />
              Made Actionable.
            </h2>
          </div>

          {/* Right Column: 3 Capability Columns */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-0 items-stretch">
            {capabilities.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-3.5 sm:px-6 lg:px-7 first:pl-0 last:pr-0 sm:border-r border-slate-200 last:border-r-0"
                >
                  <div className="text-[#4E35DE] shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-[13px] text-slate-600 mt-1.5 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

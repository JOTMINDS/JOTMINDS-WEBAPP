import React from 'react';

export const FrameworksStrip: React.FC = () => {
  const frameworks = [
    'Ghana (GES / NaCCA)',
    'Cambridge',
    'Pearson Edexcel',
    'Oxford',
    'International Baccalaureate (IB)',
    'and more',
  ];

  return (
    <section className="bg-[#F5F4FE] border-y border-[#ECE9FE]/80 py-6 sm:py-7">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left / Main frameworks list */}
          <div className="space-y-2">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.14em] text-[#4E35DE] uppercase">
              DESIGNED TO SUPPORT ESTABLISHED EDUCATIONAL, COGNITIVE AND DEVELOPMENT FRAMEWORKS.
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-[13px] font-semibold text-slate-800">
              {frameworks.map((fw, index) => (
                <React.Fragment key={fw}>
                  <span>{fw}</span>
                  {index < frameworks.length - 1 && (
                    <span className="text-slate-300 font-light select-none">|</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right statement with vertical separator */}
          <div className="flex items-center gap-6 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-200/60 w-full lg:w-auto">
            <div className="hidden lg:block w-px bg-slate-300/80 h-10 self-center" />
            <div className="text-xs sm:text-[13px] font-semibold text-slate-700 leading-snug">
              <div>Built for today.</div>
              <div className="text-slate-500 font-medium">Aligned with tomorrow.</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

import React from 'react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Assess',
      description: 'Complete a short, engaging assessment.',
    },
    {
      num: '02',
      title: 'Understand',
      description: 'Get clear, personalized insights and analysis.',
    },
    {
      num: '03',
      title: 'Apply',
      description: 'Use practical recommendations.',
    },
    {
      num: '04',
      title: 'Grow',
      description: 'Track progress and unlock new opportunities.',
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20 lg:py-24 border-t border-slate-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Left Aligned */}
        <div className="max-w-xl">
          <div className="text-[11px] font-bold tracking-[0.18em] text-[#4E35DE] uppercase mb-2">
            HOW JOTMINDS WORKS
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0B0C1E] tracking-tight">
            From Insight to Impact
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            A simple process that turns cognitive insights into real-world results.
          </p>
        </div>

        {/* 4 Steps Row */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 items-stretch">
          {steps.map((step) => (
            <div
              key={step.num}
              className="flex items-start gap-4 lg:pr-8 xl:pr-10 lg:pl-6 first:pl-0 lg:border-r border-slate-200 last:border-r-0"
            >
              <span className="text-2xl sm:text-3xl font-extrabold text-[#4E35DE] shrink-0 leading-none">
                {step.num}
              </span>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

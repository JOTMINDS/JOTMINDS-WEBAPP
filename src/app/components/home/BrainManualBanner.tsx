import React from 'react';

export const BrainManualBanner: React.FC = () => {
  return (
    <section className="w-full bg-[#F5F4FE] border-y border-[#ECE9FE]/60 py-7 sm:py-9 px-4">
      <div className="max-w-[1240px] mx-auto text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-[#0B0C1E] tracking-tight">
          Your Brain Has a Manual. We Built It.
        </h2>
        <p className="text-sm sm:text-[15px] text-slate-600 mt-1.5 font-normal">
          Understand the patterns behind how you learn, think, decide and grow.
        </p>
      </div>
    </section>
  );
};

import React from 'react';
import { GraduationCap, Users, School, Briefcase, Building2, ArrowRight } from 'lucide-react';

interface JourneySectionProps {
  onGetStarted: () => void;
  onSupervisorPortal?: () => void;
  onViewContact?: () => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  onGetStarted,
  onSupervisorPortal,
  onViewContact,
}) => {
  const journeys = [
    {
      id: 'learners',
      title: 'Learners & Students',
      description: 'Discover how you learn, think and grow.',
      cta: 'Get Started',
      icon: GraduationCap,
      onClick: onGetStarted,
    },
    {
      id: 'parents',
      title: 'Parents',
      description: "Understand and support your child's development.",
      cta: 'Learn More',
      icon: Users,
      onClick: onGetStarted,
    },
    {
      id: 'schools',
      title: 'Schools & Educators',
      description: 'Improve teaching and strengthen learner outcomes.',
      cta: 'Explore',
      icon: School,
      onClick: () => {
        if (onSupervisorPortal) onSupervisorPortal();
        else onGetStarted();
      },
    },
    {
      id: 'professionals',
      title: 'Professionals',
      description: 'Discover your strengths and accelerate your career.',
      cta: 'Explore',
      icon: Briefcase,
      onClick: onGetStarted,
    },
    {
      id: 'organizations',
      title: 'Organizations & Employers',
      description: 'Understand talent, build stronger teams and make better decisions.',
      cta: 'Contact Us',
      icon: Building2,
      onClick: () => {
        if (onViewContact) onViewContact();
        else if (onSupervisorPortal) onSupervisorPortal();
        else onGetStarted();
      },
    },
  ];

  return (
    <section id="journey" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="text-[11px] font-bold tracking-[0.18em] text-[#4E35DE] uppercase mb-2">
            CHOOSE YOUR JOURNEY
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0B0C1E] tracking-tight">
            One Platform. Built Around You.
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2.5 leading-relaxed">
            Tailored intelligence for learners, families, educators, professionals and organizations.
          </p>
        </div>

        {/* 5 Horizontal Cards */}
        <div className="mt-12 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-4.5 items-stretch">
          {journeys.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group bg-white rounded-xl border border-slate-200/90 p-5 sm:p-6 flex flex-col justify-between hover:border-[#4E35DE]/50 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-start text-[#4E35DE] mb-4">
                    <Icon className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="text-[15px] sm:text-base font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-600 mt-2.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-auto">
                  <button
                    onClick={item.onClick}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#4E35DE] hover:text-[#3B28B0] transition-colors cursor-pointer group-hover:translate-x-0.5 transform duration-150"
                  >
                    <span>{item.cta}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

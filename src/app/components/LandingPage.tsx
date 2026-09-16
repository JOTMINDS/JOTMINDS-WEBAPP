import React from 'react';
import {
  HomeHeader,
  HeroSection,
  BrainManualBanner,
  JourneySection,
  HowItWorksSection,
  EnablesSection,
  FrameworksStrip,
  FAQSection,
  FinalCTA,
  HomeFooter,
} from './home';

interface LandingPageProps {
  onGetStarted: () => void;
  onSupervisorPortal?: () => void;
  onViewPrivacyPolicy?: () => void;
  onViewTermsOfUse?: () => void;
  onViewContact?: () => void;
}

export function LandingPage({
  onGetStarted,
  onSupervisorPortal,
  onViewPrivacyPolicy,
  onViewTermsOfUse,
  onViewContact,
}: LandingPageProps) {
  const scrollTo = (elementId: string) => {
    const elem = document.getElementById(elementId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#4E35DE]/10 selection:text-[#4E35DE] flex flex-col">
      {/* 1. Header Navigation */}
      <HomeHeader
        onGetStarted={onGetStarted}
        onNavClick={scrollTo}
        onSupervisorPortal={onSupervisorPortal}
      />

      {/* Main Page Flow */}
      <main className="flex-1">
        {/* 2. Hero Section */}
        <HeroSection
          onGetStarted={onGetStarted}
          onExplore={() => scrollTo('journey')}
        />

        {/* 3. Transition Strip ("Your Brain Has a Manual. We Built It.") */}
        <BrainManualBanner />

        {/* 4. Audience Journey Section (5 Cards) */}
        <JourneySection
          onGetStarted={onGetStarted}
          onSupervisorPortal={onSupervisorPortal}
          onViewContact={onViewContact}
        />

        {/* 5. How JotMinds Works ("From Insight to Impact" - 4 Steps) */}
        <HowItWorksSection />

        {/* 6. What JotMinds Enables ("Human Intelligence. Made Actionable." - 3 Capabilities) */}
        <EnablesSection />

        {/* 7. Educational Frameworks Strip (GES, Cambridge, Edexcel, Oxford, IB) */}
        <FrameworksStrip />

        {/* 8. Frequently Asked Questions */}
        <FAQSection />

        {/* 9. Final Call to Action Wave Banner */}
        <FinalCTA onGetStarted={onGetStarted} />
      </main>

      {/* 10. Footer */}
      <HomeFooter
        onNavClick={scrollTo}
        onViewPrivacyPolicy={onViewPrivacyPolicy}
        onViewTermsOfUse={onViewTermsOfUse}
        onViewContact={onViewContact}
      />
    </div>
  );
}
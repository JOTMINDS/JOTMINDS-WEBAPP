import React, { useState } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openIndices, setOpenIndices] = useState<number[]>([0]); // First item open by default or all closed

  const faqs = [
    {
      question: 'What is JotMinds and how does it work?',
      answer:
        'JotMinds is an AI-powered human intelligence platform that decodes how people learn, think, make decisions, and grow. Through validated cognitive assessments—grounded in experiential learning (Kolb), triarchic thinking (Sternberg), and dual-process decision theory—JotMinds generates actionable, personalized profiles for individuals, educators, and organizations.',
    },
    {
      question: 'Who can use JotMinds?',
      answer:
        'JotMinds is built for learners of all ages (from upper primary and secondary to university students), parents looking to support their children’s learning journeys, educators seeking differentiated teaching strategies, working professionals aiming to accelerate career growth, and organizations building high-performing teams.',
    },
    {
      question: 'How can schools and educators use JotMinds?',
      answer:
        'Educators can map the cognitive diversity of entire classrooms, generate curriculum-aligned differentiated lesson plans, identify students needing targeted interventions, and align teaching styles with student learning preferences. Schools also gain school-wide analytics and cross-departmental cognitive harmony insights.',
    },
    {
      question: 'How can organizations use JotMinds?',
      answer:
        'Employers and managers use JotMinds to uncover team cognitive archetypes, optimize collaboration, match employees to high-impact roles, and inform leadership and professional development programs with objective cognitive insights.',
    },
    {
      question: 'Is the assessment free for individual learners?',
      answer:
        'Yes! The foundational cognitive assessments—including the Learning Style, Thinking Style, and Decision-Making assessments—are completely free for individual learners. You can complete your assessments in under 15 minutes and access your personalized cognitive profile immediately.',
    },
  ];

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleViewAll = () => {
    if (openIndices.length === faqs.length) {
      setOpenIndices([]);
    } else {
      setOpenIndices(faqs.map((_, i) => i));
    }
  };

  return (
    <section id="faq" className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with "View all FAQs" link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-10">
          <div>
            <div className="text-[11px] font-bold tracking-[0.18em] text-[#4E35DE] uppercase mb-2">
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-[#0B0C1E] tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-semibold text-[#4E35DE] hover:text-[#3B28B0] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{openIndices.length === faqs.length ? 'Collapse FAQs' : 'View all FAQs'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Accordion List */}
        <div className="space-y-3 sm:space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndices.includes(index);
            return (
              <div
                key={faq.question}
                className="border border-slate-200/90 rounded-xl bg-white overflow-hidden transition-all duration-200 hover:border-slate-300"
              >
                <button
                  onClick={() => toggleIndex(index)}
                  className="w-full text-left py-4.5 px-5 sm:px-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4E35DE]"
                  aria-expanded={isOpen}
                >
                  <span className="text-sm sm:text-base font-bold text-[#0B0C1E] leading-snug">
                    {faq.question}
                  </span>
                  <div
                    className={`shrink-0 text-[#4E35DE] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    <ChevronDown className="w-5 h-5 stroke-[2]" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

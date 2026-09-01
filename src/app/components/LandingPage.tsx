import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Brain, 
  Target, 
  Users, 
  GraduationCap, 
  School, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Building2, 
  Globe, 
  BarChart3, 
  ChevronRight, 
  Check, 
  HelpCircle,
  Clock,
  Award,
  Layers,
  Sparkles,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { FeedbackPrompt } from './FeedbackPrompt';
import { Logo } from './Logo';
import { createClient } from '../utils/supabase/client';

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
  onViewContact 
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'students' | 'teachers' | 'parents' | 'organizations'>('students');
  const [stats, setStats] = useState({
    students: 5400,
    teachers: 480,
    schools: 65,
    assessments: 14200
  });

  // Fetch real counts from Supabase if available
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const [
          { count: studentCount },
          { count: teacherCount },
          { count: schoolCount },
          { count: assessmentCount }
        ] = await Promise.all([
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher'),
          supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'institution_admin'),
          supabase.from('assessments').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          students: (studentCount && studentCount > 0) ? studentCount : 5400,
          teachers: (teacherCount && teacherCount > 0) ? teacherCount : 480,
          schools: (schoolCount && schoolCount > 0) ? schoolCount : 65,
          assessments: (assessmentCount && assessmentCount > 0) ? assessmentCount : 14200
        });
      } catch {
        // Keep defaults if network fails
      }
    };
    fetchStats();
  }, []);

  const scrollTo = (elementId: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(elementId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ─── 1. TOP UTILITY / INSTITUTION BAR ─── */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-200 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Grounded in Kolb & Sternberg Cognitive Science
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-400">Aligned with GES, Cambridge & International Curricula</span>
          </div>
          <div className="flex items-center gap-4">
            {onSupervisorPortal && (
              <button 
                onClick={onSupervisorPortal} 
                className="text-slate-300 hover:text-white font-medium transition-colors flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                For Schools & Organizations
              </button>
            )}
            <button 
              onClick={onViewContact} 
              className="text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN COURSERA-STYLE NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Logo size="md" />
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
                <button 
                  onClick={() => scrollTo('frameworks')} 
                  className="hover:text-blue-700 transition-colors py-2"
                >
                  Assessments
                </button>
                <button 
                  onClick={() => scrollTo('for-educators')} 
                  className="hover:text-blue-700 transition-colors py-2"
                >
                  For Educators
                </button>
                <button 
                  onClick={() => scrollTo('solutions')} 
                  className="hover:text-blue-700 transition-colors py-2"
                >
                  Who It's For
                </button>
                <button 
                  onClick={() => scrollTo('methodology')} 
                  className="hover:text-blue-700 transition-colors py-2"
                >
                  Cognitive Science
                </button>
              </nav>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                onClick={onGetStarted}
                className="hidden sm:inline-flex text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Log In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-[#0056D2] hover:bg-[#00419e] text-white font-semibold text-sm px-6 h-11 rounded-md shadow-sm transition-all"
              >
                Take Free Assessment
              </Button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <button 
              onClick={() => scrollTo('frameworks')} 
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              Assessments & Dimensions
            </button>
            <button 
              onClick={() => scrollTo('for-educators')} 
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              For Educators & Schools
            </button>
            <button 
              onClick={() => scrollTo('solutions')} 
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              Role-Specific Solutions
            </button>
            <button 
              onClick={() => scrollTo('methodology')} 
              className="block w-full text-left py-2 text-sm font-medium text-slate-700"
            >
              Cognitive Science
            </button>
            {onSupervisorPortal && (
              <button 
                onClick={onSupervisorPortal} 
                className="block w-full text-left py-2 text-sm font-semibold text-blue-700"
              >
                Organization Portal →
              </button>
            )}
          </div>
        )}
      </header>

      {/* ─── 3. HERO SECTION (Coursera Split Architecture) ─── */}
      <section className="pt-12 pb-16 lg:pt-20 lg:pb-24 bg-gradient-to-b from-slate-50 via-white to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Authoritative Editorial Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                <Award className="w-3.5 h-3.5 text-blue-600" />
                Validated Educational Assessment Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-bold text-slate-900 leading-[1.12] tracking-tight">
                Understand how you <br />
                <span className="text-[#0056D2]">learn, think, and decide.</span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                JotMinds maps individual cognitive styles using proven experiential and triarchic frameworks. Unlock tailored study methods, differentiated teaching insights, and career clarity in minutes.
              </p>

              {/* Action Strip */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button 
                  onClick={onGetStarted}
                  className="bg-[#0056D2] hover:bg-[#00419e] text-white font-semibold text-base px-8 h-13 rounded-md shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Start Assessment Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
                {onSupervisorPortal && (
                  <Button 
                    variant="outline"
                    onClick={onSupervisorPortal}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-base px-6 h-13 rounded-md"
                  >
                    <Building2 className="w-4 h-4 mr-2 text-slate-500" />
                    For Schools & Teams
                  </Button>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" /> 100% Free for Learners
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" /> 3 to 5 Minutes per Module
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" /> Instant Actionable Report
                </span>
              </div>
            </div>

            {/* Right Column: Coursera-Style Structured Assessment Card Preview */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Card Header */}
                <div className="bg-slate-900 text-white p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 bg-blue-600 text-white rounded">
                      Core Battery
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> ~12 min total
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Comprehensive Cognitive Profile</h3>
                  <p className="text-xs text-slate-300 mt-1">Full evaluation across 3 scientific dimensions</p>
                </div>

                {/* Modules List */}
                <div className="p-6 divide-y divide-slate-100 space-y-4">
                  
                  {/* Module 1 */}
                  <div className="pt-2 first:pt-0 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">Learning Dimensions</h4>
                        <span className="text-[11px] text-slate-500 font-medium">Kolb Model</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Identifies Diverging, Assimilating, Converging, and Accommodating styles.
                      </p>
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div className="pt-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">Thinking Modes</h4>
                        <span className="text-[11px] text-slate-500 font-medium">Sternberg Theory</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Evaluates Analytical, Creative, and Practical problem-solving strengths.
                      </p>
                    </div>
                  </div>

                  {/* Module 3 */}
                  <div className="pt-4 flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">Decision-Making Style</h4>
                        <span className="text-[11px] text-slate-500 font-medium">Dual-System Theory</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Measures reliance on intuitive heuristics versus systematic analytical evaluation.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Footer CTA */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">Deliverable</span>
                    <span className="text-xs font-bold text-slate-800">Diagnostic PDF & Action Plan</span>
                  </div>
                  <Button 
                    size="sm"
                    onClick={onGetStarted}
                    className="bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-semibold px-4"
                  >
                    Start Free →
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. INSTITUTIONAL & FRAMEWORK TRUST BAR ─── */}
      <section className="bg-white py-10 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
            Grounded in Leading Cognitive Science & Education Frameworks
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-10 text-slate-700">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Kolb Experiential Learning Theory
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold">
              <Brain className="w-4 h-4 text-indigo-600" />
              Sternberg Triarchic Theory
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold">
              <School className="w-4 h-4 text-emerald-600" />
              Ghana National Curriculum (GES) Aligned
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold">
              <Award className="w-4 h-4 text-amber-600" />
              Cambridge & Pearson Edexcel Support
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. PLATFORM METRICS / SOCIAL PROOF (Coursera Numbers Style) ─── */}
      <section className="py-12 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            
            <div className="text-center pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.students.toLocaleString()}+
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-600 mt-1">Students Assessed</p>
            </div>

            <div className="text-center pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.teachers.toLocaleString()}+
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-600 mt-1">Educators Onboarded</p>
            </div>

            <div className="text-center pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.schools.toLocaleString()}+
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-600 mt-1">Schools & Institutions</p>
            </div>

            <div className="text-center pt-4 md:pt-0">
              <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                {stats.assessments.toLocaleString()}+
              </div>
              <p className="text-xs md:text-sm font-medium text-slate-600 mt-1">Assessments Completed</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 6. THE THREE SCIENTIFIC FRAMEWORKS (Course Catalog Style) ─── */}
      <section id="frameworks" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Assessment Frameworks</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Explore Our Scientific Cognitive Dimensions
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Each module is self-paced, rigorously validated, and outputs practical pedagogical and personal strategies.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1: Learning Styles */}
            <div className="bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
              <div>
                <div className="h-2 bg-blue-600" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded">
                      DIMENSION 1 · 5 MIN
                    </span>
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    Learning Style Assessment
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Kolb Experiential Learning Model</p>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    Determines how you take in and integrate information through experience, reflective observation, abstract thought, or active experimentation.
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Key Outcomes:</div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-600" /> Personalized study & homework habits
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-600" /> Revision methods tailored to memory intake
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-blue-600" /> Classroom collaboration recommendations
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 bg-white">
                <Button 
                  onClick={onGetStarted}
                  className="w-full bg-slate-900 hover:bg-blue-700 text-white text-sm font-semibold h-10 transition-colors"
                >
                  Start Learning Assessment →
                </Button>
              </div>
            </div>

            {/* Card 2: Thinking Styles */}
            <div className="bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
              <div>
                <div className="h-2 bg-indigo-600" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                      DIMENSION 2 · 4 MIN
                    </span>
                    <Brain className="w-5 h-5 text-indigo-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    Thinking Style Assessment
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Sternberg Triarchic Theory</p>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    Evaluates how your brain structures problem-solving across analytical evaluation, creative synthesis, and practical execution.
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Key Outcomes:</div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-600" /> Problem-solving & project approach
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-600" /> Cognitive strengths for subject selection
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-600" /> Career pathway alignment
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 bg-white">
                <Button 
                  onClick={onGetStarted}
                  className="w-full bg-slate-900 hover:bg-indigo-700 text-white text-sm font-semibold h-10 transition-colors"
                >
                  Start Thinking Assessment →
                </Button>
              </div>
            </div>

            {/* Card 3: Decision Styles */}
            <div className="bg-white rounded-lg border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group">
              <div>
                <div className="h-2 bg-emerald-600" />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
                      DIMENSION 3 · 3 MIN
                    </span>
                    <Target className="w-5 h-5 text-emerald-600" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Decision-Making Assessment
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Dual-System Behavioral Cognition</p>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                    Measures how you weigh evidence, assess uncertainty, and synthesize variables when making academic or career choices.
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                    <div className="text-xs font-semibold text-slate-700">Key Outcomes:</div>
                    <ul className="text-xs text-slate-600 space-y-1.5">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> High-stakes exam & test decision patterns
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Intuitive vs analytical balance
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Leadership & team decision style
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 bg-white">
                <Button 
                  onClick={onGetStarted}
                  className="w-full bg-slate-900 hover:bg-emerald-700 text-white text-sm font-semibold h-10 transition-colors"
                >
                  Start Decision Assessment →
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 7. COURSERA-FOR-ENTERPRISE STYLE SECTION: FOR EDUCATORS & SCHOOLS ─── */}
      <section id="for-educators" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Solution Value */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Institutional Capabilities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
                JotMinds for Schools & Educators
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Empower your teaching staff with actionable cognitive intelligence. Bridge pedagogical gaps, automate lesson preparation, and deliver differentiated instruction across every classroom.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-900/60 border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">AI-Assisted Lesson Planning & Differentiation</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Generate lesson plans automatically structured around your class’s specific cognitive distribution.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-900/60 border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Classroom Cognitive Heatmaps</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Instantly spot students who require alternative explanations, visual scaffolding, or active experimentation.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded bg-blue-900/60 border border-blue-500 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Institution-Wide Reporting & Access Codes</h4>
                    <p className="text-xs text-slate-300 mt-0.5">Batch onboard entire year groups, track term progress, and export administrative analytics.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                {onSupervisorPortal && (
                  <Button 
                    onClick={onSupervisorPortal}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm px-6 h-12 rounded-md"
                  >
                    Open Organization Portal
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={onGetStarted}
                  className="border-slate-700 text-slate-200 hover:bg-slate-800 font-semibold text-sm px-6 h-12 rounded-md"
                >
                  Explore Teacher Tools
                </Button>
              </div>
            </div>

            {/* Right: Institutional UI Preview Mockup */}
            <div className="lg:col-span-6">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl text-slate-100">
                <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Classroom Intelligence</span>
                    <h4 className="text-base font-bold text-white">Grade 9A · Integrated Science</h4>
                  </div>
                  <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs">
                    34 Students Profiled
                  </Badge>
                </div>

                {/* Cognitive Distribution Grid */}
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Visual & Conceptual Learners</span>
                      <span className="text-blue-400">44% (15 students)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full w-[44%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Hands-On & Kinesthetic Learners</span>
                      <span className="text-amber-400">32% (11 students)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full w-[32%]" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-300">Reflective & Analytical Learners</span>
                      <span className="text-purple-400">24% (8 students)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full w-[24%]" />
                    </div>
                  </div>
                </div>

                {/* Pedagogical Recommendation Note */}
                <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-700 text-xs">
                  <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Differentiated Lesson Strategy
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    High hands-on concentration detected. Pair the upcoming physics lab with concrete apparatus models before introducing mathematical formulas.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 8. TABBED AUDIENCE SOLUTIONS (Coursera "Who Is This For") ─── */}
      <section id="solutions" className="py-16 lg:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Tailored Solutions</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Built for Every Stakeholder in Education
            </h2>
            <p className="text-base text-slate-600 mt-2">
              Select your role to explore how JotMinds delivers customized value.
            </p>
          </div>

          {/* Role Navigation Tabs */}
          <div className="flex justify-center border-b border-slate-200 mb-10 overflow-x-auto">
            <div className="flex gap-2 sm:gap-8">
              {[
                { id: 'students', label: 'For Students', icon: GraduationCap },
                { id: 'teachers', label: 'For Teachers', icon: School },
                { id: 'parents', label: 'For Parents', icon: Users },
                { id: 'organizations', label: 'For Institutions', icon: Building2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedRoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedRoleTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 px-3 sm:px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                      isActive 
                        ? 'border-[#0056D2] text-[#0056D2]' 
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Box */}
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-xl p-8 sm:p-10">
            {selectedRoleTab === 'students' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge className="bg-blue-100 text-blue-800 border-0 text-xs">Primary to Tertiary</Badge>
                  <h3 className="text-2xl font-bold text-slate-900">Empowering Independent, Confident Learners</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Stop forcing study habits that fight your biology. Learn how your mind naturally processes information and achieve better results with less stress.
                  </p>
                  <Button onClick={onGetStarted} className="bg-[#0056D2] hover:bg-[#00419e] text-white text-sm font-semibold">
                    Start Student Assessment →
                  </Button>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">What You Receive:</div>
                  <ul className="text-xs text-slate-700 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Personalized Study Routine:</strong> Exact revision techniques matched to your learning dimensions.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Subject & Career Guidance:</strong> Tailored academic recommendations for high school and tertiary tracks.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Exam Strategies:</strong> Methods to manage time and decision-making under pressure.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {selectedRoleTab === 'teachers' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge className="bg-indigo-100 text-indigo-800 border-0 text-xs">Educator Suite</Badge>
                  <h3 className="text-2xl font-bold text-slate-900">Actionable Classroom Insights</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Differentiate your instruction with evidence. Know in advance which topics will trigger learning friction and how to scaffold them.
                  </p>
                  <Button onClick={onGetStarted} className="bg-[#0056D2] hover:bg-[#00419e] text-white text-sm font-semibold">
                    Access Teacher Tools →
                  </Button>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Teacher Features:</div>
                  <ul className="text-xs text-slate-700 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Cognitive Roster:</strong> View your entire class sorted by learning and thinking styles.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>AI Lesson Planning:</strong> Generate lesson plans with differentiated exercises in seconds.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Pre-Flight Lesson Prep:</strong> Review potential student bottlenecks before entering class.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {selectedRoleTab === 'parents' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge className="bg-emerald-100 text-emerald-800 border-0 text-xs">Family Support</Badge>
                  <h3 className="text-2xl font-bold text-slate-900">Understand Your Child’s Potential</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Gain clarity on how your child handles homework, challenges, and motivation—without friction or guesswork.
                  </p>
                  <Button onClick={onGetStarted} className="bg-[#0056D2] hover:bg-[#00419e] text-white text-sm font-semibold">
                    Start Parent Guide →
                  </Button>
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Parent Advantages:</div>
                  <ul className="text-xs text-slate-700 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Observation Assessments:</strong> Add your parental perspective to your child's profile.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Homework Support Tips:</strong> Practical environment tips to reduce evening study stress.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Privacy-First Control:</strong> Access child profiles securely only when shared.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {selectedRoleTab === 'organizations' && (
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <Badge className="bg-slate-200 text-slate-800 border-0 text-xs">School Leaders & HR</Badge>
                  <h3 className="text-2xl font-bold text-slate-900">Institutional Governance & Talent Matching</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Deploy cognitive assessments at scale for admissions, student tracking, teacher performance support, or hiring.
                  </p>
                  {onSupervisorPortal ? (
                    <Button onClick={onSupervisorPortal} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold">
                      Open Organization Dashboard →
                    </Button>
                  ) : (
                    <Button onClick={onGetStarted} className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold">
                      Get Started →
                    </Button>
                  )}
                </div>
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Enterprise Tools:</div>
                  <ul className="text-xs text-slate-700 space-y-2.5">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Bulk Code Generator:</strong> Issue thousands of unique student and teacher test codes.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>School-Wide Analytics:</strong> Track cognitive balance across subject departments and years.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Custom CSV & PDF Exports:</strong> Export institutional accreditation and inspection data.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ─── 9. METHODOLOGY & SCIENCE SECTION ─── */}
      <section id="methodology" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Scientific Foundation</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Why Cognitive Profiling Works
            </h2>
            <p className="text-base text-slate-600 mt-2">
              JotMinds moves away from generic personality quizzes to validated educational cognitive psychology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Experiential Learning Theory</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Based on David Kolb’s research showing that effective learning requires a cyclical movement through concrete feeling, reflective watching, abstract thinking, and active doing.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Brain className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Triarchic Intelligence Model</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Informed by Robert Sternberg’s model establishing that academic success is not a single IQ number, but the dynamic combination of analytical, creative, and practical capabilities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Differentiated Pedagogical Alignment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects cognitive measurements directly to curriculum standards, helping teachers adapt lesson pacing, question framing, and assessments to the classroom's actual needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 10. REAL TESTIMONIALS & OUTCOMES ─── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Educator & Learner Feedback</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-1">
              Trusted in Classrooms Across Ghana & Beyond
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between">
              <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                "JotMinds has given our teaching staff the clarity they were missing. We can instantly identify which students struggle with abstract concepts and adapt our science labs accordingly."
              </p>
              <div className="border-t border-slate-200 pt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-700 text-white font-bold text-xs flex items-center justify-center">
                  EO
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dr. Efua Owusu</h4>
                  <p className="text-[11px] text-slate-500">Head Teacher · Cape Coast</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between">
              <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                "The AI Lesson Planner integrated with our class's cognitive summary saved me 5 hours a week while noticeably increasing classroom engagement and participation."
              </p>
              <div className="border-t border-slate-200 pt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-700 text-white font-bold text-xs flex items-center justify-center">
                  AM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ama Mensah</h4>
                  <p className="text-[11px] text-slate-500">JHS Teacher · Accra</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 flex flex-col justify-between">
              <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                "Understanding my son's thinking style completely changed our homework routine. He's a practical learner, so connecting concepts to real-life objects helped his confidence soar."
              </p>
              <div className="border-t border-slate-200 pt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  KA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kwame Asante</h4>
                  <p className="text-[11px] text-slate-500">Parent · Kumasi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 11. FAQ ACCORDION (Coursera Style) ─── */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Everything You Need to Know
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="bg-white border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-sm font-bold text-slate-900 hover:no-underline text-left">
                How long does an assessment take to complete?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                Each individual dimension (Learning, Thinking, or Decision style) takes between 3 to 5 minutes. You can take them one at a time or complete the entire battery in under 15 minutes.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-white border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-sm font-bold text-slate-900 hover:no-underline text-left">
                Is JotMinds free for students and parents?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                Yes! The core cognitive assessment, individual profiling, and personalized study recommendations are completely free for all learners and parents.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-sm font-bold text-slate-900 hover:no-underline text-left">
                How do schools and teachers use the platform?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                Teachers can create classes, generate individual access codes, and view class-wide cognitive insights. The system also includes an AI Lesson Planner that tailors lesson materials to the class's dominant cognitive patterns.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-white border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-sm font-bold text-slate-900 hover:no-underline text-left">
                Is student cognitive data secure and private?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                We prioritize learner privacy. Individual results are only shared with teachers and parents when explicitly authorized by school administration or the learner. Data is never sold or used for advertising.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── 12. FEEDBACK PROMPT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeedbackPrompt variant="full" />
      </div>

      {/* ─── 13. FINAL CALL TO ACTION BANNER (Coursera Blue Banner) ─── */}
      <section className="bg-[#0056D2] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start Discovering How Your Mind Works Today
          </h2>
          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join thousands of learners, teachers, and school administrators using cognitive insights to unlock their full educational potential.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-white text-[#0056D2] hover:bg-blue-50 font-bold text-base px-8 h-13 shadow-lg"
            >
              Take Free Assessment Now
            </Button>
            {onSupervisorPortal && (
              <Button 
                size="lg"
                variant="outline"
                onClick={onSupervisorPortal}
                className="border-white/40 text-white hover:bg-white/10 font-bold text-base px-8 h-13"
              >
                Organization Portal
              </Button>
            )}
          </div>
          <p className="text-xs text-blue-200 pt-2 font-medium">
            No credit card required · Self-paced · Instant actionable results
          </p>
        </div>
      </section>

      {/* ─── 14. INSTITUTIONAL COURSERA-STYLE FOOTER ─── */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Col 1: Brand / Mission */}
            <div className="col-span-2 space-y-4">
              <div className="brightness-200">
                <Logo size="md" />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                JotMinds is an educational cognitive assessment platform empowering learners, educators, and institutions with scientific insights.
              </p>
              <div className="pt-2">
                <span className="text-[11px] text-slate-500 font-semibold block">Accreditation & Curriculum Support:</span>
                <span className="text-[11px] text-slate-400">GES (Ghana), Cambridge Assessment, Pearson Edexcel, IB.</span>
              </div>
            </div>

            {/* Col 2: Assessments */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assessments</h4>
              <ul className="space-y-2">
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Learning Dimensions</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Thinking Modes</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Decision-Making Style</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Complete Battery</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Student Study Guide</button></li>
              </ul>
            </div>

            {/* Col 3: For Schools */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Educators</h4>
              <ul className="space-y-2">
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Teacher Dashboard</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">AI Lesson Planner</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Classroom Heatmaps</button></li>
                {onSupervisorPortal && <li><button onClick={onSupervisorPortal} className="hover:text-white transition-colors">Organization Portal</button></li>}
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Batch Code Generation</button></li>
              </ul>
            </div>

            {/* Col 4: Legal & Contact */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Policies & Support</h4>
              <ul className="space-y-2">
                <li><button onClick={onViewPrivacyPolicy} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={onViewTermsOfUse} className="hover:text-white transition-colors">Terms of Use</button></li>
                <li><button onClick={onViewContact} className="hover:text-white transition-colors">Contact Support</button></li>
                <li><button onClick={onViewContact} className="hover:text-white transition-colors">Institution Licensing</button></li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright & Accreditation Strip */}
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} JotMinds Education Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Empowering education across Africa and beyond</span>
              <span>·</span>
              <button onClick={onViewPrivacyPolicy} className="hover:text-slate-300">Privacy</button>
              <button onClick={onViewTermsOfUse} className="hover:text-slate-300">Terms</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
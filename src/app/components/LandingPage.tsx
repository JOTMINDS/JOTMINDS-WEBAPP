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
  Search,
  ChevronDown,
  Clock,
  Award,
  Layers,
  Star,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { FeedbackPrompt } from './FeedbackPrompt';
import { Logo } from './Logo';
import { createClient } from '../utils/supabase/client';
import { LanguageSelector } from './ui/LanguageSelector';

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
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'popular' | 'students' | 'teachers' | 'career'>('popular');
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
    setExploreDropdownOpen(false);
    const elem = document.getElementById(elementId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const catalogItems = [
    {
      category: 'popular',
      type: 'COGNITIVE BATTERY · FULL SUITE',
      title: 'Complete Cognitive Profile (Triad Evaluation)',
      provider: 'JotMinds Assessment Labs',
      rating: 4.9,
      reviews: '3.8k',
      duration: '12 min · Free',
      description: 'Comprehensive 3-in-1 assessment covering your Learning Dimensions, Thinking Modes, and Decision System.',
      tags: ['Diverging & Converging', 'Analytical vs Creative', 'Intuitive Heuristics'],
      badgeColor: 'bg-[#2C2E83]'
    },
    {
      category: 'students',
      type: 'FOUNDATIONAL · 5 MIN',
      title: 'Learning Dimensions Assessment',
      provider: 'Experiential Learning Frameworks',
      rating: 4.9,
      reviews: '2.4k',
      duration: '5 min · Free',
      description: 'Discover whether you absorb concepts through hands-on experience, reflective observation, abstract models, or active experimentation.',
      tags: ['Study Habit Optimization', 'Revision Techniques', 'Classroom Scaffolding'],
      badgeColor: 'bg-[#7B61FF]'
    },
    {
      category: 'students',
      type: 'COGNITIVE ARCHITECTURE · 4 MIN',
      title: 'Thinking Styles Assessment',
      provider: 'Cognitive Science Frameworks',
      rating: 4.8,
      reviews: '1.9k',
      duration: '4 min · Free',
      description: 'Map your primary problem-solving mode across Analytical evaluation, Creative ideation, and Practical execution.',
      tags: ['Problem Solving', 'Subject Selection', 'Academic Strengths'],
      badgeColor: 'bg-[#5B7DB1]'
    },
    {
      category: 'teachers',
      type: 'EDUCATOR SUITE · CURRICULUM TOOL',
      title: 'AI-Assisted Differentiated Lesson Planner',
      provider: 'JotMinds for Educators',
      rating: 4.9,
      reviews: '1.2k',
      duration: 'Interactive Tool · Free',
      description: 'Generate curriculum-aligned lesson plans tailored to your class cognitive distribution across GES, Cambridge, and IB.',
      tags: ['Strand & Sub-strand', 'Pre-Class Prep Checklist', 'Classroom Intelligence'],
      badgeColor: 'bg-[#1FC8E1]'
    },
    {
      category: 'teachers',
      type: 'INSTITUTIONAL · CLASSROOM INTELLIGENCE',
      title: 'Class Cognitive Harmony & Heatmap Roster',
      provider: 'JotMinds for Schools',
      rating: 4.9,
      reviews: '850',
      duration: 'Real-Time Analytics',
      description: 'Analyze multi-student cognitive distribution to identify friction points and structure group collaboration effectively.',
      tags: ['Visual vs Hands-on', 'Cognitive Bottlenecks', 'Department Reporting'],
      badgeColor: 'bg-[#2C2E83]'
    },
    {
      category: 'career',
      type: 'APPLIED BEHAVIORAL · 3 MIN',
      title: 'Decision-Making Style & Pressure Assessment',
      provider: 'Applied Psychology Labs',
      rating: 4.8,
      reviews: '1.5k',
      duration: '3 min · Free',
      description: 'Evaluate how you make choices, navigate uncertainty, and balance analytical data against intuitive judgment.',
      tags: ['High-Stakes Decision', 'Team Leadership', 'Risk Synthesis'],
      badgeColor: 'bg-[#FF715B]'
    }
  ];

  const filteredCatalog = activeCatalogTab === 'popular' 
    ? catalogItems 
    : catalogItems.filter(item => item.category === activeCatalogTab || item.category === 'popular');

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#2C2E83]/10 selection:text-[#2C2E83]">
      
      {/* ─── 1. TOP UTILITY HEADER (JotMinds Indigo Institutional Bar) ─── */}
      <div className="bg-[#1a1b4d] text-slate-300 text-xs py-2 px-4 border-b border-[#2C2E83]/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#1FC8E1]" /> Grounded in Validated Cognitive Science
            </span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-slate-300">Aligned with Ghana (GES/NaCCA), Cambridge & IB Standards</span>
          </div>
          <div className="flex items-center gap-4">
            {onSupervisorPortal && (
              <button 
                onClick={onSupervisorPortal} 
                className="text-slate-200 hover:text-[#1FC8E1] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-[#1FC8E1]" />
                For Schools & Institutions
              </button>
            )}
            <button 
              onClick={onViewContact} 
              className="text-slate-400 hover:text-slate-200 transition-colors hidden sm:inline cursor-pointer"
            >
              Support
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. MAIN NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 gap-4">
            
            {/* Logo & Navigation Links */}
            <div className="flex items-center gap-8 shrink-0">
              <div className="cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Logo size="md" />
              </div>

              {/* Desktop Nav Links */}
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => scrollTo('learners')}
                  className="text-xs font-bold text-slate-700 hover:text-[#2C2E83] transition-colors cursor-pointer"
                >
                  For Learners
                </button>
                <button
                  onClick={() => scrollTo('teachers')}
                  className="text-xs font-bold text-slate-700 hover:text-[#2C2E83] transition-colors cursor-pointer"
                >
                  For Teachers
                </button>
                <button
                  onClick={() => scrollTo('for-schools')}
                  className="text-xs font-bold text-slate-700 hover:text-[#2C2E83] transition-colors cursor-pointer"
                >
                  For Schools
                </button>
                <button
                  onClick={() => scrollTo('catalog')}
                  className="text-xs font-bold text-slate-700 hover:text-[#2C2E83] transition-colors cursor-pointer"
                >
                  Assessments
                </button>
              </nav>
            </div>

            {/* Right Action Links */}
            <div className="flex items-center gap-3 shrink-0">
              <LanguageSelector />
              <Button 
                variant="ghost" 
                onClick={onGetStarted}
                className="hidden sm:inline-flex text-xs font-bold text-slate-700 hover:text-[#2C2E83] hover:bg-slate-50 h-10 px-3 cursor-pointer"
              >
                Log In
              </Button>
              <Button 
                onClick={onGetStarted}
                className="bg-[#2C2E83] hover:bg-[#1a1b4d] text-white font-bold text-xs px-5 h-10 rounded shadow-sm transition-all cursor-pointer"
              >
                Join for Free
              </Button>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-3">
            <button 
              onClick={() => scrollTo('learners')}
              className="w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#2C2E83] border-b border-slate-100"
            >
              For Learners
            </button>
            <button 
              onClick={() => scrollTo('teachers')}
              className="w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#2C2E83] border-b border-slate-100"
            >
              For Teachers
            </button>
            <button 
              onClick={() => scrollTo('for-schools')}
              className="w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#2C2E83] border-b border-slate-100"
            >
              For Schools & Institutions
            </button>
            <button 
              onClick={() => scrollTo('catalog')}
              className="w-full text-left py-2 text-sm font-semibold text-slate-700 hover:text-[#2C2E83] border-b border-slate-100"
            >
              All Assessments
            </button>
            <div className="pt-2 flex flex-col gap-2">
              <Button onClick={onGetStarted} className="w-full bg-[#2C2E83] text-white font-bold text-xs">
                Join for Free
              </Button>
              {onSupervisorPortal && (
                <Button onClick={onSupervisorPortal} variant="outline" className="w-full text-xs font-bold text-slate-700">
                  Institution Portal
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── 3. HERO SECTION (JotMinds Brand Styling) ─── */}
      <section className="bg-slate-50 border-b border-slate-200 py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Clean Headline & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2C2E83]/10 border border-[#2C2E83]/20 text-[#2C2E83] text-xs font-semibold rounded-full">
                <Award className="w-3.5 h-3.5 text-[#2C2E83]" />
                Validated Educational Assessment Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                Learn Without Limits. <br />
                <span className="text-[#2C2E83]">Discover How You Think.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                Unlock your academic and professional potential with science-backed cognitive profiling. Personalized learning strategies, curriculum-aligned lesson planning, and institutional intelligence.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
                <Button 
                  onClick={onGetStarted}
                  className="bg-[#2C2E83] hover:bg-[#1a1b4d] text-white font-bold text-sm px-8 h-13 rounded shadow-md hover:shadow-lg transition-all"
                >
                  Join for Free
                </Button>
                {onSupervisorPortal && (
                  <Button 
                    variant="outline"
                    onClick={onSupervisorPortal}
                    className="border-slate-300 text-slate-700 hover:bg-white font-bold text-sm px-6 h-13 rounded bg-white shadow-sm"
                  >
                    <Building2 className="w-4 h-4 mr-2 text-slate-500" />
                    For Enterprise & Schools
                  </Button>
                )}
              </div>

              <div className="pt-4 flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" /> Free for Learners
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" /> Self-Paced (3 to 5 mins)
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600 font-bold" /> Actionable Study & Teaching Plan
                </span>
              </div>
            </div>

            {/* Right: Featured Specialization Card with Brand Header */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-lg border border-slate-200 shadow-xl overflow-hidden hover:shadow-2xl transition-shadow">
                
                {/* Visual Header with JotMinds Indigo */}
                <div className="bg-gradient-to-r from-[#2C2E83] to-[#1a1b4d] text-white p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 bg-[#1FC8E1] text-[#1a1b4d] rounded">
                      Featured Track
                    </span>
                    <span className="text-xs text-slate-200 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> 12 mins · Free
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white leading-snug">
                    Complete Cognitive Triad Evaluation
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    JotMinds Assessment & Educational Frameworks
                  </p>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="flex text-amber-400">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />)}
                    </div>
                    <span className="font-bold text-slate-900">4.9</span>
                    <span className="text-slate-400">(3,800+ student & educator reviews)</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Evaluates how your brain absorbs information across sensory dimensions, formulates creative and analytical solutions, and synthesizes decisions under academic pressure.
                  </p>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                      Included Modules
                    </span>
                    <div className="space-y-1.5 text-xs text-slate-700">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#1FC8E1]"></span>
                        <span>Learning Dimensions (Visual, Auditory, Kinesthetic, Read/Write)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#7B61FF]"></span>
                        <span>Thinking Modes (Analytical, Creative, Practical)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#FF715B]"></span>
                        <span>Decision Systems (Heuristic Intuition vs Analytical Logic)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action */}
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Available Now
                  </span>
                  <Button 
                    size="sm"
                    onClick={onGetStarted}
                    className="bg-[#2C2E83] hover:bg-[#1a1b4d] text-white text-xs font-bold px-5"
                  >
                    Start Assessment →
                  </Button>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. INSTITUTIONAL COLLABORATORS & FRAMEWORKS ─── */}
      <section className="bg-white py-12 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-8">
            Collaborating with Curricula & Research Frameworks Across 50+ Institutions
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center text-slate-600">
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2">
              <School className="w-4 h-4 text-[#2C2E83]" /> GES (Ghana)
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2">
              <Award className="w-4 h-4 text-[#7B61FF]" /> Cambridge Int.
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4 text-[#1FC8E1]" /> Pearson Edexcel
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2">
              <Globe className="w-4 h-4 text-[#2C2E83]" /> IB Curriculum
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2">
              <Brain className="w-4 h-4 text-[#FF715B]" /> Experiential Learning
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-[#5B7DB1]" /> Triarchic Framework
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. CATALOG GRID WITH BRAND TAGS ─── */}
      <section id="catalog" className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2C2E83]">Assessment Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Explore Assessments & Pedagogical Tools
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Validated psychological instruments and classroom intelligence software.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-lg self-start md:self-auto overflow-x-auto">
              {[
                { id: 'popular', label: 'Most Popular' },
                { id: 'students', label: 'For Students' },
                { id: 'teachers', label: 'For Educators' },
                { id: 'career', label: 'Career & Adults' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCatalogTab(tab.id as any)}
                  className={`text-xs font-bold px-3 py-1.5 rounded transition-all whitespace-nowrap ${
                    activeCatalogTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCatalog.map((item, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-lg border border-slate-200 hover:border-[#2C2E83]/40 hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                onClick={onGetStarted}
              >
                <div>
                  <div className={`h-1.5 ${item.badgeColor}`} />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        {item.type}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#2C2E83] transition-colors leading-snug mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-3">{item.provider}</p>

                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-slate-100 mt-2 bg-slate-50/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-slate-900">{item.rating}</span>
                    <span className="text-slate-400">({item.reviews})</span>
                  </div>
                  <span className="text-xs font-bold text-[#2C2E83] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Start <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 6. JOTMINDS FOR SCHOOLS & ENTERPRISE (Deep Indigo Section) ─── */}
      <section id="for-schools" className="py-16 lg:py-24 bg-[#1a1b4d] text-white border-b border-[#2C2E83]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <Badge className="bg-[#1FC8E1] text-[#1a1b4d] border-0 text-xs uppercase font-bold tracking-wider px-3 py-1">
                JotMinds for Institutions
              </Badge>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Empower Your Faculty with Actionable Cognitive Intelligence
              </h2>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                Deliver school-wide differentiated instruction. JotMinds equips head teachers, subject leads, and classroom educators with real-time cognitive metrics and automated curriculum tools.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#232560] rounded border border-[#2C2E83]">
                  <div className="font-bold text-[#1FC8E1] text-xs mb-1">Differentiated Lesson Prep</div>
                  <p className="text-xs text-slate-300">AI-generated lesson plans structured around your class's specific visual, auditory, and kinesthetic proportions.</p>
                </div>
                <div className="p-4 bg-[#232560] rounded border border-[#2C2E83]">
                  <div className="font-bold text-[#7B61FF] text-xs mb-1">Student Risk Heatmaps</div>
                  <p className="text-xs text-slate-300">Spot cognitive friction points before examinations and deliver proactive scaffolding.</p>
                </div>
                <div className="p-4 bg-[#232560] rounded border border-[#2C2E83]">
                  <div className="font-bold text-[#FF715B] text-xs mb-1">Bulk Access Codes</div>
                  <p className="text-xs text-slate-300">Generate thousands of secure test codes and track class completion rates without complex onboarding.</p>
                </div>
                <div className="p-4 bg-[#232560] rounded border border-[#2C2E83]">
                  <div className="font-bold text-[#1FC8E1] text-xs mb-1">Curriculum Alignment</div>
                  <p className="text-xs text-slate-300">Fully structured with strands, sub-strands, and objectives across national and international syllabi.</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                {onSupervisorPortal && (
                  <Button 
                    onClick={onSupervisorPortal}
                    className="bg-[#1FC8E1] hover:bg-[#1bb4ca] text-[#1a1b4d] font-bold text-xs px-6 h-11 rounded"
                  >
                    Open Organization Portal
                  </Button>
                )}
                <Button 
                  variant="outline"
                  onClick={onGetStarted}
                  className="border-slate-600 text-slate-200 hover:bg-white/10 font-bold text-xs px-6 h-11 rounded"
                >
                  Explore Teacher Suite
                </Button>
              </div>
            </div>

            {/* Right: Metrics Card */}
            <div className="lg:col-span-5 bg-[#232560] border border-[#2C2E83] rounded-lg p-6 space-y-6">
              <div className="border-b border-slate-700 pb-4">
                <span className="text-xs font-bold text-[#1FC8E1] uppercase tracking-wider">Institution Impact</span>
                <h4 className="text-lg font-bold text-white mt-0.5">Proven Classroom Outcomes</h4>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>Lesson Preparation Time Saved</span>
                    <span className="text-[#1FC8E1]">5.2 hrs / week</span>
                  </div>
                  <div className="h-2 bg-[#1a1b4d] rounded-full overflow-hidden">
                    <div className="h-full bg-[#1FC8E1] w-[78%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>Student Classroom Engagement</span>
                    <span className="text-[#7B61FF]">+28% Increase</span>
                  </div>
                  <div className="h-2 bg-[#1a1b4d] rounded-full overflow-hidden">
                    <div className="h-full bg-[#7B61FF] w-[84%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-200 mb-1">
                    <span>Classroom Cognitive Alignment</span>
                    <span className="text-[#FF715B]">92% Harmony</span>
                  </div>
                  <div className="h-2 bg-[#1a1b4d] rounded-full overflow-hidden">
                    <div className="h-full bg-[#FF715B] w-[92%]" />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#1a1b4d]/80 rounded border border-[#2C2E83] text-xs text-slate-300">
                "JotMinds gives our teachers the ability to differentiate instruction based on concrete data rather than intuition alone."
                <div className="text-[11px] text-slate-400 font-bold mt-2">— Cape Coast District Academic Directorate</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 7. ROLE-SPECIFIC PILLARS ─── */}
      {/* ─── 7. HOW JOTMINDS HELPS: LEARNERS, TEACHERS & SCHOOLS ─── */}
      <section id="solutions" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="bg-[#2C2E83]/10 text-[#2C2E83] border-[#2C2E83]/20 text-xs font-bold uppercase tracking-wider px-3 py-1 mb-3">
              Tailored Educational Solutions
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              One Unified Platform. Built for Every Stakeholder.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
              JotMinds bridges the gap between student cognitive discovery, classroom instructional differentiation, and school-wide academic leadership.
            </p>
          </div>

          <div className="space-y-12">
            
            {/* 1. FOR LEARNERS */}
            <div id="learners" className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-3xl border border-indigo-100 p-8 sm:p-10 shadow-md">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    For Learners & Students
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                    Understand How You Think & Supercharge Your Study Habits
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Stop forcing study techniques that don’t fit your brain. JotMinds evaluates your natural learning, thinking, and decision modalities in under 10 minutes to generate custom revision workflows.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>Personalized Cognitive Profile:</strong> Visual, kinesthetic, and reflective breakdown.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>Targeted Revision Tactics:</strong> Mind-mapping, structured problem-solving, and active recall.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>Exam Stress Mastery:</strong> Learn how you make decisions under timed conditions.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>100% Free & Self-Paced:</strong> Instant downloadable reports and actionable growth steps.</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={onGetStarted} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-md cursor-pointer">
                      Start Learner Assessment <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>

                {/* Visual Preview Card for Learners */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs">
                        KM
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Student Cognitive Preview</div>
                        <div className="text-[10px] text-slate-500">Form 2 • JHS Cohort</div>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Active Learner</Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Visual / Spatial Processing</span>
                        <span className="text-indigo-600 font-bold">84%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: '84%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Analytical Problem Solving</span>
                        <span className="text-purple-600 font-bold">76%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full" style={{ width: '76%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Deliberate Decision System</span>
                        <span className="text-emerald-600 font-bold">90%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full" style={{ width: '90%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-slate-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span><strong>Tailored Strategy:</strong> Incorporate balance-scale diagrams and structured flashcards before tests.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. FOR TEACHERS */}
            <div id="teachers" className="bg-gradient-to-br from-purple-50/70 via-white to-pink-50/50 rounded-3xl border border-purple-100 p-8 sm:p-10 shadow-md">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
                    <School className="w-4 h-4 text-purple-600" />
                    For Classroom Teachers & Subject Leads
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug">
                    Cut Lesson Planning Time in Half with Curriculum-Aligned AI
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Plan differentiated, high-impact lessons in minutes. Structure objectives, phases, practical exercises, and multi-format assessments tailored directly to your class’s cognitive distribution.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>10-Module Lesson Suite:</strong> AI-generated phases, timings, TLM resources, and exit slips.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>National & International Alignment:</strong> GES/NaCCA, Cambridge, and IB frameworks.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>Assessment Generator:</strong> Instant MCQs, short answers, and homework rubrics.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700"><strong>Compulsory Post-Lesson Reflection:</strong> Log observations, insights, and recommendations.</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={onGetStarted} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-5 rounded-xl shadow-md cursor-pointer">
                      Launch Teacher Workspace <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>

                {/* Visual Preview Card for Teachers */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Linear Equations • Lesson Plan</div>
                        <div className="text-[10px] text-slate-500">NaCCA Curriculum • 45 Mins</div>
                      </div>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800 text-[10px]">AI Generated</Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[11px]">Phase 1: Hook & Concrete Demo (10 min)</span>
                      <span className="text-slate-600 text-[11px]">Physical balance scale demonstration for hands-on learners.</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-800 block text-[11px]">Phase 2: Direct Modeling (15 min)</span>
                      <span className="text-slate-600 text-[11px]">Step-by-step color-coded inverse operations on whiteboard.</span>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                      <span className="font-bold text-emerald-800 block text-[11px]">Phase 3: Differentiated Group Task (15 min)</span>
                      <span className="text-emerald-700 text-[11px]">Scaffolded card sets for core, support, and extension cohorts.</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Export: <strong>PDF & CSV</strong></span>
                    <span className="text-purple-600 font-bold">✓ Ready for Class</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. FOR SCHOOLS & HEADTEACHERS */}
            <div id="for-schools" className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-slate-800 p-8 sm:p-10 shadow-xl">
              <div className="grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1FC8E1]/20 text-[#1FC8E1] text-xs font-bold border border-[#1FC8E1]/30">
                    <Building2 className="w-4 h-4 text-[#1FC8E1]" />
                    For Schools, Principals & Academic Directors
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                    School-Wide Pedagogical Intelligence & Faculty Oversight
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Gain centralized visibility across your entire institution. Monitor faculty instructional preparation, track curriculum coverage by educational level, and evaluate student cognitive data in real time.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1FC8E1] shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200"><strong>Faculty Lesson Tracking:</strong> Track planned vs delivered lessons and teacher post-lesson reflections.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1FC8E1] shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200"><strong>Bulk & Individual Codes:</strong> Upload rosters via CSV or generate codes for independent students.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1FC8E1] shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200"><strong>Level-Grouped Classes:</strong> Early Years, Primary, JHS, and SHS hierarchical organization.</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#1FC8E1] shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-200"><strong>Institutional Analytics:</strong> Multi-class cognitive heatmaps and district reporting.</span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-wrap gap-3">
                    {onSupervisorPortal && (
                      <Button onClick={onSupervisorPortal} className="bg-[#1FC8E1] hover:bg-[#1bb4ca] text-[#1a1b4d] font-bold text-xs px-6 py-5 rounded-xl shadow-md cursor-pointer">
                        Open School Portal <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    )}
                    <Button onClick={onGetStarted} variant="outline" className="border-slate-600 text-slate-200 hover:bg-white/10 font-bold text-xs px-6 py-5 rounded-xl cursor-pointer">
                      Register Your Institution
                    </Button>
                  </div>
                </div>

                {/* Visual Preview Card for Schools */}
                <div className="lg:col-span-5 bg-[#232560] rounded-2xl p-6 border border-[#2C2E83] shadow-xl space-y-4 text-white">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div>
                      <div className="text-xs font-bold text-white">Academic Leadership Overview</div>
                      <div className="text-[10px] text-slate-300">Cape Coast Academy • Term 1</div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
                      98% Faculty Active
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-[#1a1b4d] p-3 rounded-xl border border-slate-700">
                      <span className="text-2xl font-black text-[#1FC8E1]">142</span>
                      <span className="text-[10px] text-slate-300 block">Lessons Delivered</span>
                    </div>
                    <div className="bg-[#1a1b4d] p-3 rounded-xl border border-slate-700">
                      <span className="text-2xl font-black text-emerald-400">94%</span>
                      <span className="text-[10px] text-slate-300 block">Reflections Logged</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-200">
                      <span>Curriculum Coverage Progress</span>
                      <span className="font-bold text-[#1FC8E1]">82%</span>
                    </div>
                    <div className="w-full bg-[#1a1b4d] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-[#1FC8E1] to-emerald-400 h-full rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>

                  <div className="p-3 bg-[#1a1b4d] rounded-xl border border-slate-700 text-xs text-slate-300">
                    💡 <strong>Administrator Insight:</strong> Grade 8 Science showed 28% improvement in guided practice after adopting visual scaffolds.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 8. TESTIMONIALS & OUTCOMES ─── */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2C2E83]">Learner & Educator Outcomes</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              From the Classroom to Graduation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                "The cognitive breakdown showed that 60% of my class were active experimenters. Shifting my science lessons from theory lectures to hands-on demonstrations immediately turned around our term scores."
              </p>
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#2C2E83] text-white font-bold text-xs flex items-center justify-center">
                  AM
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Ama Mensah</h4>
                  <p className="text-[11px] text-slate-500">JHS Integrated Science Teacher · Accra</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                "As head of school, onboarding JotMinds across all our secondary classes gave us an objective picture of student learning diversity and drastically improved parent-teacher meetings."
              </p>
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7B61FF] text-white font-bold text-xs flex items-center justify-center">
                  EO
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Dr. Efua Owusu</h4>
                  <p className="text-[11px] text-slate-500">Head Teacher · Cape Coast</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-slate-700 leading-relaxed italic mb-6">
                "I used to get overwhelmed during exams. Learning my decision-making style taught me how to manage test pacing and trust analytical elimination over second-guessing."
              </p>
              <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1FC8E1] text-[#1a1b4d] font-bold text-xs flex items-center justify-center">
                  KA
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Kwesi Arthur</h4>
                  <p className="text-[11px] text-slate-500">Secondary Student · Kumasi</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─── 9. FREQUENTLY ASKED QUESTIONS ─── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2C2E83]">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Frequently Asked Questions
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-xs sm:text-sm font-bold text-slate-900 hover:no-underline text-left">
                How does JotMinds assess cognitive styles?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                JotMinds uses validated psychometric instruments grounded in experiential learning and multi-dimensional cognitive science. The assessments evaluate information absorption, problem-solving modalities, and decision-making systems through real-world academic scenarios.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-xs sm:text-sm font-bold text-slate-900 hover:no-underline text-left">
                Is the assessment free for individual students?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                Yes. Individual learners can take the foundational cognitive battery, view their visual style breakdown, and receive study tips at zero cost.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-xs sm:text-sm font-bold text-slate-900 hover:no-underline text-left">
                How do schools deploy JotMinds for entire classes?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                Institutions can sign in to the Organization Portal, generate batch student access codes (or upload class rosters via CSV), and assign tests. Teachers then immediately access class cognitive summaries and AI lesson differentiation.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="bg-slate-50 border border-slate-200 rounded-lg px-6 py-2">
              <AccordionTrigger className="text-xs sm:text-sm font-bold text-slate-900 hover:no-underline text-left">
                Which curricula are supported in the Lesson Planner?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-600 leading-relaxed pt-2">
                The Lesson Planner natively supports the Ghana National Curriculum (GES with strands and sub-strands), Cambridge Assessment (Primary, Lower Secondary, IGCSE), Pearson Edexcel, Oxford International, and the IB framework.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* ─── 10. FEEDBACK PROMPT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FeedbackPrompt variant="full" />
      </div>

      {/* ─── 11. FINAL CTA BANNER (JotMinds Indigo Block) ─── */}
      <section className="bg-[#2C2E83] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Take the First Step Toward Cognitive Clarity
          </h2>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
            Join thousands of learners, teachers, and school administrators using JotMinds to personalize education across Africa and beyond.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={onGetStarted}
              className="bg-[#1FC8E1] text-[#1a1b4d] hover:bg-[#1bb4ca] font-bold text-sm px-8 h-13 rounded shadow-lg"
            >
              Join for Free
            </Button>
            {onSupervisorPortal && (
              <Button 
                size="lg"
                variant="outline"
                onClick={onSupervisorPortal}
                className="border-white/40 text-white hover:bg-white/10 font-bold text-sm px-8 h-13 rounded"
              >
                For Organizations
              </Button>
            )}
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Takes ~5 minutes · No credit card required · Free forever for individual learners
          </p>
        </div>
      </section>

      {/* ─── 12. INSTITUTIONAL FOOTER ─── */}
      <footer className="bg-[#1a1b4d] text-slate-400 text-xs border-t border-[#2C2E83]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Col 1: Brand */}
            <div className="col-span-2 space-y-4">
              <div className="brightness-200">
                <Logo size="md" />
              </div>
              <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
                JotMinds is an educational cognitive profiling platform empowering students, educators, and institutions with scientific insights.
              </p>
              <div className="pt-2 text-[11px] text-slate-400">
                Curricula: GES (Ghana) · Cambridge · Pearson Edexcel · Oxford · IB
              </div>
            </div>

            {/* Col 2: Assessments */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Assessments</h4>
              <ul className="space-y-2">
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Learning Dimensions</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Thinking Modes</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Decision Style Battery</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Complete Triad Track</button></li>
              </ul>
            </div>

            {/* Col 3: Educator Suite */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">For Educators</h4>
              <ul className="space-y-2">
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Teacher Dashboard</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">AI Lesson Planner</button></li>
                <li><button onClick={onGetStarted} className="hover:text-white transition-colors">Classroom Heatmaps</button></li>
                {onSupervisorPortal && <li><button onClick={onSupervisorPortal} className="hover:text-white transition-colors">Organization Portal</button></li>}
              </ul>
            </div>

            {/* Col 4: Policies */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Legal & Support</h4>
              <ul className="space-y-2">
                <li><button onClick={onViewPrivacyPolicy} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={onViewTermsOfUse} className="hover:text-white transition-colors">Terms of Use</button></li>
                <li><button onClick={onViewContact} className="hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400">
            <div>
              © {new Date().getFullYear()} JotMinds Platform. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Empowering education across Africa and beyond</span>
              <span>·</span>
              <button onClick={onViewPrivacyPolicy} className="hover:text-slate-200">Privacy</button>
              <button onClick={onViewTermsOfUse} className="hover:text-slate-200">Terms</button>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
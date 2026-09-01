import { BookOpen, Brain, Target, Users, GraduationCap, School, Briefcase, ArrowRight, CheckCircle2, ShieldCheck, Building2, Sparkles, Play, Globe, BarChart3, Heart, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { FeedbackPrompt } from './FeedbackPrompt';
import { Logo } from './Logo';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { createClient } from '../utils/supabase/client';

interface LandingPageProps {
  onGetStarted: () => void;
  onSupervisorPortal?: () => void;
  onViewPrivacyPolicy?: () => void;
  onViewTermsOfUse?: () => void;
  onViewContact?: () => void;
}

// Helper: bold the first word of any benefit string
const formatBenefit = (text: string) => {
  const firstSpace = text.indexOf(' ');
  if (firstSpace === -1) return <strong>{text}</strong>;
  return (
    <>
      <strong className="text-foreground">{text.slice(0, firstSpace)}</strong>
      <span>{text.slice(firstSpace)}</span>
    </>
  );
};

export function LandingPage({ onGetStarted, onSupervisorPortal, onViewPrivacyPolicy, onViewTermsOfUse, onViewContact }: LandingPageProps) {
  const [showStickyHeader, setShowStickyHeader] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeUserTab, setActiveUserTab] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [platformStats, setPlatformStats] = useState({ students: 0, teachers: 0, schools: 0, assessments: 0 });
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);

  // Fetch live platform stats from Supabase
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();
        const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: teacherCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
        const { count: schoolCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'institution_admin');
        const { count: assessmentCount } = await supabase.from('assessments').select('*', { count: 'exact', head: true });
        setPlatformStats({
          students: studentCount || 0,
          teachers: teacherCount || 0,
          schools: schoolCount || 0,
          assessments: assessmentCount || 0
        });
      } catch {
        // Fallback silently
        setPlatformStats({ students: 0, teachers: 0, schools: 0, assessments: 0 });
      }
    };
    fetchStats();
  }, []);

  // Scroll listener for sticky header
  useEffect(() => {
    const handleScroll = () => setShowStickyHeader(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for stats counter animation
  useEffect(() => {
    if (!statsRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setStatsVisible(true);
    }, { threshold: 0.3 });
    observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => setCurrentTestimonial(prev => (prev + 1) % testimonials.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const frameworks = [
    {
      name: 'Learning Style',
      icon: BookOpen,
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-violet-50',
      description: 'Discover how you absorb information',
      details: 'Whether through experience, reflection, analysis, or experimentation — understand your unique learning fingerprint.',
      duration: '~5 min'
    },
    {
      name: 'Thinking Style',
      icon: Brain,
      gradient: 'from-blue-500 to-indigo-600',
      bg: 'bg-blue-50',
      description: 'Understand how you process ideas',
      details: 'Explore your cognitive strengths across analytical, creative, and practical thinking dimensions.',
      duration: '~4 min'
    },
    {
      name: 'Decision Style',
      icon: Target,
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      description: 'Learn how you make choices',
      details: 'Discover whether you rely on intuition, analysis, or a balanced blend when facing decisions.',
      duration: '~3 min'
    }
  ];

  const userTypes = [
    {
      role: 'Students',
      icon: GraduationCap,
      color: 'text-violet-600',
      activeBg: 'bg-violet-600',
      description: 'Elementary through Tertiary',
      benefits: [
        'Discover your unique Learning, Thinking, and Decision profiles',
        'Receive personalized study strategies tailored to how your brain works',
        'Explore career pathways matched to your cognitive strengths',
        'Track growth with daily challenges, badges, and progress insights'
      ]
    },
    {
      role: 'Parents',
      icon: Users,
      color: 'text-blue-600',
      activeBg: 'bg-blue-600',
      description: 'Support your child\'s growth',
      benefits: [
        'View a clear, friendly dashboard of your child\'s cognitive patterns',
        'Complete a Parent Observation Assessment for additional perspective',
        'Receive age-based tips for motivation, study support, and communication',
        'Access results through a privacy-first design — only when your child permits'
      ]
    },
    {
      role: 'Teachers',
      icon: School,
      color: 'text-indigo-600',
      activeBg: 'bg-indigo-600',
      description: 'Teach more effectively',
      benefits: [
        'View class-wide cognitive profiles across learning, thinking, and decision styles',
        'Personalize lesson plans using AI-powered differentiation strategies',
        'Identify students needing extra support with cognitive heatmaps',
        'Generate assessments and track curriculum alignment automatically'
      ]
    },
    {
      role: 'Professionals',
      icon: Briefcase,
      color: 'text-amber-600',
      activeBg: 'bg-amber-600',
      description: 'Young Adults & Career Builders',
      benefits: [
        'Understand your strengths in teamwork, planning, and communication',
        'Explore career pathways that match your cognitive profile',
        'Practice micro-challenges to build real-world professional skills',
        'Boost self-awareness for interviews, leadership, and personal growth'
      ]
    },
    {
      role: 'HR / Employers',
      icon: Building2,
      color: 'text-sky-600',
      activeBg: 'bg-sky-600',
      description: 'Workforce excellence',
      benefits: [
        'Assess candidates during hiring to understand cognitive role fit',
        'Match employees to the right teams and responsibilities',
        'Reduce turnover by aligning strengths with expectations',
        'Access anonymized team dashboards to guide leadership decisions'
      ],
      action: { label: 'Visit Organization Portal', onClick: onSupervisorPortal }
    }
  ];

  const testimonials = [
    {
      quote: "JotMinds has transformed how I understand my students. I can now see exactly which learning approaches will work for each child — it's like having a roadmap for every lesson.",
      name: "Ama Mensah",
      role: "JHS Teacher, Accra",
      avatar: "AM"
    },
    {
      quote: "The cognitive assessments helped my daughter understand why she struggled with certain subjects. Now she uses study strategies that actually match how her brain works.",
      name: "Kwame Asante",
      role: "Parent, Kumasi",
      avatar: "KA"
    },
    {
      quote: "We've onboarded JotMinds across our entire school. The AI lesson planner and classroom intelligence features have genuinely improved both teaching quality and student outcomes.",
      name: "Dr. Efua Owusu",
      role: "Head Teacher, Cape Coast",
      avatar: "EO"
    }
  ];

  const navLinks = [
    { label: 'For Students', target: 'who-is-this-for', tab: 0 },
    { label: 'For Teachers', target: 'who-is-this-for', tab: 2 },
    { label: 'For Employers', target: 'who-is-this-for', tab: 4 },
  ];

  const scrollTo = (id: string, tab?: number) => {
    if (tab !== undefined) setActiveUserTab(tab);
    setMobileMenuOpen(false);
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Animated counter
  const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      if (!statsVisible || target === 0) return;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      return () => clearInterval(timer);
    }, [statsVisible, target]);
    return <span>{count.toLocaleString()}{suffix}</span>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* ─── NAVIGATION BAR ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showStickyHeader 
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-sm border-b border-gray-100 dark:border-gray-800' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="md" />
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.target, link.tab)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {onSupervisorPortal && (
                <Button variant="ghost" size="sm" onClick={onSupervisorPortal} className="hidden sm:flex gap-2 text-gray-600">
                  <ShieldCheck className="h-4 w-4" /> Organization
                </Button>
              )}
              <Button onClick={onGetStarted} size="sm" className="bg-[#5B7DB1] hover:bg-[#4a6a9a] text-white px-5">
                Get Started
              </Button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-gray-600">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-gray-950 border-t border-gray-100 shadow-lg"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <button key={link.label} onClick={() => scrollTo(link.target, link.tab)} className="block w-full text-left py-2 text-gray-700 font-medium">
                  {link.label}
                </button>
              ))}
              {onSupervisorPortal && (
                <button onClick={onSupervisorPortal} className="block w-full text-left py-2 text-gray-700 font-medium">
                  Organization Portal
                </button>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-violet-200/40 to-blue-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <Badge className="mb-6 bg-violet-100 text-violet-700 border-violet-200 px-4 py-1.5 text-sm font-semibold">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> AI-Powered Cognitive Profiling
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-black text-gray-900 dark:text-white leading-[1.1] tracking-tight mb-6">
                Understand How You{' '}
                <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-500 bg-clip-text text-transparent">
                  Learn, Think & Decide
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-xl">
                Take a free cognitive assessment and unlock personalized insights for students, teachers, parents, and professionals.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" onClick={onGetStarted} className="group text-base px-8 h-13 bg-[#5B7DB1] hover:bg-[#4a6a9a] text-white shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all">
                  Start Free Assessment
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button size="lg" variant="outline" className="text-base px-8 h-13 border-2" onClick={() => scrollTo('how-it-works')}>
                  <Play className="mr-2 h-4 w-4" /> See How It Works
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free to use</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Takes ~5 minutes</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Science-backed</span>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Abstract cognitive profile card */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">JM</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">Your Cognitive Profile</p>
                      <p className="text-xs text-gray-500">Personalized insights</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { label: 'Learning Style', value: 'Diverging', pct: 85, color: 'bg-violet-500' },
                      { label: 'Thinking Style', value: 'Creative', pct: 72, color: 'bg-blue-500' },
                      { label: 'Decision Style', value: 'Intuitive', pct: 68, color: 'bg-emerald-500' }
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                          <span className="text-gray-500">{item.value}</span>
                        </div>
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-violet-50 dark:bg-violet-950/30 rounded-xl border border-violet-100 dark:border-violet-900">
                    <p className="text-xs text-violet-700 dark:text-violet-300 font-medium flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" /> AI Insight: You learn best through hands-on experiences and creative exploration.
                    </p>
                  </div>
                </div>
                {/* Decorative floating elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-amber-200 to-orange-300 rounded-2xl rotate-12 opacity-60 -z-10" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-blue-200 to-cyan-300 rounded-full opacity-50 -z-10" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── STATS BANNER ─── */}
      <section ref={statsRef} className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Students Assessed', value: platformStats.students, icon: GraduationCap, suffix: '+' },
              { label: 'Teachers Onboarded', value: platformStats.teachers, icon: School, suffix: '+' },
              { label: 'Schools & Organizations', value: platformStats.schools, icon: Building2, suffix: '+' },
              { label: 'Assessments Completed', value: platformStats.assessments, icon: BarChart3, suffix: '+' },
            ].map((stat) => (
              <div key={stat.label}>
                <stat.icon className="w-6 h-6 text-[#5B7DB1] mx-auto mb-2" />
                <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </div>
                <p className="text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-200">Simple & Quick</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Three simple steps to unlock your cognitive profile</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-violet-300 via-blue-300 to-emerald-300" />
            
            {[
              { step: '1', title: 'Take the Assessment', desc: 'Answer a short, engaging questionnaire designed by cognitive science researchers. No preparation needed.', icon: BookOpen, color: 'from-violet-500 to-purple-600' },
              { step: '2', title: 'Discover Your Profile', desc: 'Receive an instant breakdown of your learning, thinking, and decision-making styles with visual charts.', icon: Brain, color: 'from-blue-500 to-indigo-600' },
              { step: '3', title: 'Unlock Personalized Insights', desc: 'Get AI-powered recommendations tailored to your unique cognitive profile — study tips, career paths, and more.', icon: Sparkles, color: 'from-emerald-500 to-teal-600' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mx-auto mb-6 shadow-lg relative z-10`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-white dark:bg-gray-950 border-2 border-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-500 -mt-2 z-20">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 mt-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THREE FRAMEWORKS ─── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">The Three Cognitive Dimensions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              <strong>Learn</strong> → <strong>Think</strong> → <strong>Decide</strong> — understand the complete cycle of how your mind works
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {frameworks.map((fw, i) => (
              <motion.div
                key={fw.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card
                  className="group cursor-pointer h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 overflow-hidden"
                  onClick={onGetStarted}
                >
                  <div className={`h-1.5 bg-gradient-to-r ${fw.gradient}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${fw.gradient} flex items-center justify-center shadow-md`}>
                        <fw.icon className="h-7 w-7 text-white" />
                      </div>
                      <Badge variant="outline" className="text-xs text-gray-500 font-medium">{fw.duration}</Badge>
                    </div>
                    <CardTitle className="text-xl">{fw.name}</CardTitle>
                    <CardDescription className="text-base font-medium">{fw.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{fw.details}</p>
                    <span className="text-sm font-semibold text-[#5B7DB1] group-hover:text-[#4a6a9a] inline-flex items-center gap-1.5 transition-colors">
                      Take Assessment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHO IS THIS FOR (Tabbed) ─── */}
      <section id="who-is-this-for" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Built for Everyone in Education</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Tailored experiences for every stage of life and career</p>
          </motion.div>

          {/* Tab buttons */}
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl inline-flex gap-1 flex-wrap justify-center">
              {userTypes.map((ut, i) => {
                const Icon = ut.icon;
                return (
                  <button
                    key={ut.role}
                    onClick={() => setActiveUserTab(i)}
                    className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                      activeUserTab === i
                        ? `${ut.activeBg} text-white shadow-md`
                        : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{ut.role}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <motion.div
            key={activeUserTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 overflow-hidden max-w-4xl mx-auto">
              <div className={`h-1.5 ${userTypes[activeUserTab].activeBg}`} />
              <CardContent className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className={`w-16 h-16 rounded-2xl ${userTypes[activeUserTab].activeBg} flex items-center justify-center text-white mb-6 shadow-lg`}>
                      {(() => { const Icon = userTypes[activeUserTab].icon; return <Icon className="w-8 h-8" />; })()}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{userTypes[activeUserTab].role}</h3>
                    <p className="text-gray-500 mb-6">{userTypes[activeUserTab].description}</p>
                    {userTypes[activeUserTab].action ? (
                      <Button onClick={userTypes[activeUserTab].action?.onClick} className={`${userTypes[activeUserTab].activeBg} text-white hover:opacity-90`}>
                        {userTypes[activeUserTab].action?.label} <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={onGetStarted} className="bg-[#5B7DB1] hover:bg-[#4a6a9a] text-white">
                        Get Started <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div>
                    <ul className="space-y-4">
                      {userTypes[activeUserTab].benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{formatBenefit(b)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">What Our Community Says</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Real stories from educators, parents, and learners</p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardContent className="p-8 md:p-12 text-center">
                  <div className="flex justify-center mb-6">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-amber-400 text-xl">★</span>)}
                  </div>
                  <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 italic">
                    "{testimonials[currentTestimonial].quote}"
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 dark:text-white">{testimonials[currentTestimonial].name}</p>
                      <p className="text-sm text-gray-500">{testimonials[currentTestimonial].role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTestimonial(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentTestimonial ? 'bg-[#5B7DB1] w-8' : 'bg-gray-300'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEEDBACK PROMPT ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FeedbackPrompt variant="full" />
      </div>

      {/* ─── FINAL CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5B7DB1] via-indigo-600 to-purple-700" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform How You Learn & Teach?
            </h2>
            <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students, teachers, parents, and professionals across Africa who are unlocking their cognitive potential.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={onGetStarted} className="group text-base px-8 h-14 shadow-xl hover:shadow-2xl transition-all font-semibold">
                Start Your Free Assessment
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              {onSupervisorPortal && (
                <Button size="lg" variant="outline" onClick={onSupervisorPortal} className="text-base px-8 h-14 border-2 border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold">
                  <Building2 className="mr-2 h-5 w-5" /> Organization Portal
                </Button>
              )}
            </div>
            <p className="text-blue-200 text-sm mt-6 font-medium">No credit card required • Takes less than 5 minutes</p>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* About */}
            <div className="col-span-2 md:col-span-1">
              <Logo size="md" className="brightness-200 mb-4" />
              <p className="text-sm leading-relaxed mb-4">
                Empowering learners, educators, and organizations through AI-powered cognitive awareness.
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Ghana
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2.5">
                <li><button onClick={onGetStarted} className="text-sm hover:text-white transition-colors">Student Assessment</button></li>
                <li><button onClick={onGetStarted} className="text-sm hover:text-white transition-colors">Teacher Dashboard</button></li>
                <li><button onClick={onGetStarted} className="text-sm hover:text-white transition-colors">AI Lesson Planner</button></li>
                {onSupervisorPortal && <li><button onClick={onSupervisorPortal} className="text-sm hover:text-white transition-colors">Organization Portal</button></li>}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => scrollTo('how-it-works')} className="text-sm hover:text-white transition-colors">How It Works</button></li>
                <li><button onClick={() => scrollTo('who-is-this-for')} className="text-sm hover:text-white transition-colors">Who It's For</button></li>
                <li><button onClick={onGetStarted} className="text-sm hover:text-white transition-colors">Cognitive Science</button></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => onViewPrivacyPolicy?.()} className="text-sm hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => onViewTermsOfUse?.()} className="text-sm hover:text-white transition-colors">Terms of Use</button></li>
                <li><button onClick={() => onViewContact?.()} className="text-sm hover:text-white transition-colors">Contact Us</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} JotMinds Platform. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Globe className="w-4 h-4" />
              <span className="text-sm">Empowering education across Africa & beyond</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
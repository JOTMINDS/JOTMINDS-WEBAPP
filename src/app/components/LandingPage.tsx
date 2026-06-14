import { BookOpen, Brain, Target, Users, GraduationCap, School, Briefcase, ArrowRight, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { FeedbackPrompt } from './FeedbackPrompt';
import { Logo } from './Logo';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSupervisorPortal?: () => void;
  onViewPrivacyPolicy?: () => void;
  onViewTermsOfUse?: () => void;
  onViewContact?: () => void;
}

export function LandingPage({ onGetStarted, onSupervisorPortal, onViewPrivacyPolicy, onViewTermsOfUse, onViewContact }: LandingPageProps) {
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky header after scrolling 400px (past hero section)
      setShowStickyHeader(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const frameworks = [
    {
      name: 'Your Learning Style',
      icon: BookOpen,
      color: 'from-[#6B4C9A] to-[#7B61FF]',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
      borderColor: 'border-cyan-200 dark:border-cyan-800',
      iconColor: 'text-[#6B4C9A]',
      description: 'Discover how you learn best',
      details: 'Your thoughts make you unique — understand whether you learn through experience, reflection, analysis, or experimentation'
    },
    {
      name: 'Your Thinking Style',
      icon: Brain,
      color: 'from-[#7B61FF] to-[#5B7DB1]',
      bgColor: 'bg-violet-50 dark:bg-violet-950/20',
      borderColor: 'border-violet-200 dark:border-violet-800',
      iconColor: 'text-[#7B61FF]',
      description: 'Understand how you think',
      details: 'Explore your unique cognitive strengths in analytical, creative, or practical thinking'
    },
    {
      name: 'Your Decision Style',
      icon: Target,
      color: 'from-[#5B7DB1] to-[#FF715B]',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      iconColor: 'text-[#5B7DB1]',
      description: 'Learn how you make decisions',
      details: 'Discover whether you rely on intuition or analytical thinking when making choices'
    }
  ];

  const userTypes = [
    {
      role: 'Students',
      icon: GraduationCap,
      color: 'text-[#6B4C9A]',
      description: 'For Elementary to Tertiary',
      benefits: [
        'Discover your Learning, Thinking, and Decision Styles',
        'If you’re 6–10: Enjoy fun thinking games, mood check-ins, and simple self-discovery',
        'If you’re 11–14: Get early academic insights and age-appropriate challenges',
        'If you’re 15–18: Receive personalized Senior High School program recommendations and tertiary guidance',
        'If you’re 19–25: Explore career pathways and practice professional skills',
        'Build better study habits with personalized learning tips',
        'Have fun with daily challenges, stars, badges, and avatars',
        'Share your results (only if you choose) with parents or teachers'
      ]
    },
    {
      role: 'Parents',
      icon: Users,
      color: 'text-[#5B7DB1]',
      description: 'Support your child\'s growth',
      benefits: [
        'View a clear, friendly dashboard of your child’s cognitive patterns',
        'Complete a Parent Observation Assessment to give an additional perspective',
        'Learn how to support homework, study habits, and confidence',
        'Understand your child’s fit for senior high school and tertiary pathways',
        'Track their progress through fun daily challenges',
        'Receive age-based tips for motivation and communication',
        'Access your child’s results only when they permit it (privacy-first design)'
      ]
    },
    {
      role: 'Teachers / Educators',
      icon: School,
      color: 'text-[#7B61FF]',
      description: 'Teach more effectively',
      benefits: [
        'View your students’ learning styles (visual, reflective, hands-on, conceptual)',
        'Understand how they think — analytical, creative, practical, reflective',
        'Gain insights into their decision-making patterns',
        'Personalize lessons and assignments based on cognitive strengths',
        'Identify students who need extra support or alternative learning approaches',
        'Improve participation and academic confidence',
        'Collaborate with parents through clear, simple insights'
      ]
    },
    {
      role: 'Professionals',
      icon: Briefcase,
      color: 'text-[#FF715B]',
      description: 'Young Adults & Adults',
      benefits: [
        'Complete your Learning, Thinking & Decision assessment',
        'Understand your strengths in teamwork, planning, and communication',
        'Explore career pathways that match your cognitive profile',
        'Practice daily micro-challenges to build real-world work skills',
        'Improve your problem-solving and decision-making',
        'Boost self-awareness for interviews, leadership, or personal development',
        'Track your progress as you grow professionally'
      ]
    },
    {
      role: 'HR / Employers',
      icon: Building2,
      color: 'text-[#0ea5e9]', // Sky blue for corporate
      description: 'Workforce excellence',
      benefits: [
        'Assess candidates during hiring to understand role fit',
        'Match employees to the right roles, teams, and responsibilities',
        'Support staff development with personalized growth pathways',
        'Identify team strengths and training needs',
        'Reduce turnover by aligning personalities, roles, and expectations',
        'Access anonymized team dashboards to guide leadership decisions',
        'Use daily professional challenges for continuous workplace development'
      ],
      action: {
        label: 'Visit Organization Portal',
        onClick: onSupervisorPortal
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-violet-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Sticky Header CTA */}
      {showStickyHeader && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md border-b border-gray-200 dark:border-gray-700"
        >
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Logo size="md" />
            </div>
            <Button 
              onClick={onGetStarted}
              size="sm"
              className="bg-[#5B7DB1] hover:bg-[#1a1b4d] text-white h-10 px-6"
            >
              Start Assessment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Header Actions - Moved to top-right nav */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {onSupervisorPortal && (
          <Button 
            variant="outline" 
            onClick={onSupervisorPortal} 
            className="gap-2 bg-white/90 backdrop-blur-md shadow-sm hover:shadow-md transition-all border-gray-200"
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Organization Portal</span>
          </Button>
        )}
      </div>
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 pt-24">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <Badge className="mb-6 bg-gradient-aqua-violet text-[rgb(103,100,100)] border-0 px-4 py-1 text-sm">
            Discover How You Think
          </Badge>
          <div className="mb-6 flex justify-center">
            <Logo size="xl" className="h-20 md:h-24 lg:h-32" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-gray-700 dark:text-gray-300 mb-6 font-bold max-w-3xl mx-auto px-4 leading-snug">
            Understand Your Mind. Learn Better. Think Sharper. Decide Smarter.
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed px-4">
            Start your journey to discovering how you learn, think, and make decisions—so you can grow academically, professionally, and personally.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={onGetStarted} className="group text-lg px-8 h-12 bg-[#5B7DB1] hover:bg-[#1a1b4d] text-[rgb(255,255,255)]">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 h-12" onClick={() => {
              const element = document.getElementById('learn-more');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Learn More
            </Button>
          </div>
        </div>

        {/* Three Frameworks */}
        <div id="learn-more" className="grid md:grid-cols-3 gap-6 mb-20">
          {frameworks.map((framework, index) => {
            const Icon = framework.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              >
                <Card 
                  className={`border-2 ${framework.borderColor} ${framework.bgColor} transition-all hover:shadow-xl hover:-translate-y-1 shadow-md group cursor-pointer h-full`}
                  onClick={onGetStarted}
                >
                  <CardHeader className="space-y-3">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${framework.color} flex items-center justify-center shadow-sm`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{framework.name}</CardTitle>
                    <CardDescription className="text-base font-medium leading-snug">{framework.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{framework.details}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`w-full ${framework.iconColor} hover:bg-white/50 dark:hover:bg-gray-800/50 group-hover:translate-x-1 transition-transform`}
                    >
                      Explore Your Style
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* The Cognitive Cycle */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="mb-20 border-2 shadow-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl">The Complete Cognitive Cycle</CardTitle>
              <CardDescription className="text-base mt-2">How the three cognitive frameworks connect</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#6B4C9A] to-[#7B61FF] flex items-center justify-center text-white mb-3 shadow-md">
                    <BookOpen className="h-10 w-10" />
                  </div>
                  <h4 className="font-semibold mb-1">Input</h4>
                  <p className="text-sm text-muted-foreground">How you learn</p>
                </div>
                
                <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0 flex-shrink-0" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7B61FF] to-[#5B7DB1] flex items-center justify-center text-white mb-3 shadow-md">
                    <Brain className="h-10 w-10" />
                  </div>
                  <h4 className="font-semibold mb-1">Processing</h4>
                  <p className="text-sm text-muted-foreground">How you think</p>
                </div>
                
                <ArrowRight className="h-8 w-8 text-muted-foreground rotate-90 md:rotate-0 flex-shrink-0" />
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#5B7DB1] to-[#FF715B] flex items-center justify-center text-white mb-3 shadow-md">
                    <Target className="h-10 w-10" />
                  </div>
                  <h4 className="font-semibold mb-1">Output</h4>
                  <p className="text-sm text-muted-foreground">How you decide</p>
                </div>
              </div>
              
              <div className="mt-8 text-center p-4 bg-gradient-to-r from-cyan-50 via-violet-50 to-indigo-50 dark:from-cyan-950/20 dark:to-indigo-950/20 rounded-lg border border-violet-200 bg-[rgba(135,41,41,0.01)]">
                <p className="text-sm text-muted-foreground">
                  <strong>Learn</strong> → <strong>Think</strong> → <strong>Decide</strong> → <strong>Act</strong> → <strong>Relearn</strong>
                </p>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="group gap-2 border-2"
                  onClick={() => {
                    const element = document.getElementById('learn-more');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Learn the Science
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* For Different Users - Accordion Design */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-3">Who Is This For?</h2>
          <p className="text-center text-lg text-muted-foreground mb-10">Tailored experiences for every stage of life and career</p>
          
          <Card className="overflow-hidden shadow-md border-2">
            <Accordion type="multiple" className="w-full">
              {userTypes.map((userType, index) => {
                const Icon = userType.icon;
                const bgColor = index % 2 === 0 
                  ? 'bg-white dark:bg-gray-900' 
                  : 'bg-gray-50/50 dark:bg-gray-800/30';
                
                return (
                  <AccordionItem key={index} value={`item-${index}`} className={`${bgColor} border-b last:border-b-0`}>
                    <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-gray-50/80 dark:hover:bg-gray-800/50">
                      <div className="flex items-center gap-4 text-left">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          index === 0 ? 'bg-cyan-100 dark:bg-cyan-950/40' :
                          index === 1 ? 'bg-indigo-100 dark:bg-indigo-950/40' :
                          index === 2 ? 'bg-violet-100 dark:bg-violet-950/40' :
                          index === 3 ? 'bg-orange-100 dark:bg-orange-950/40' :
                          'bg-sky-100 dark:bg-sky-950/40'
                        }`}>
                          <Icon className={`h-6 w-6 ${userType.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-0.5">{userType.role}</h3>
                          <p className="text-sm text-muted-foreground font-normal">{userType.description}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="pt-2">
                        <ul className="space-y-3">
                          {userType.benefits.map((benefit, i) => {
                            // Parse benefits to bold key phrases
                            let formattedBenefit;
                            
                            if (benefit.includes(':')) {
                              const [key, rest] = benefit.split(':');
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">{key}:</strong>
                                  <span>{rest}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Discover')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Discover</strong>
                                  <span>{benefit.substring(8)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('View')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">View</strong>
                                  <span>{benefit.substring(4)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Complete')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Complete</strong>
                                  <span>{benefit.substring(8)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Learn')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Learn</strong>
                                  <span>{benefit.substring(5)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Understand')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Understand</strong>
                                  <span>{benefit.substring(10)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Build')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Build</strong>
                                  <span>{benefit.substring(5)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Have')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Have fun</strong>
                                  <span>{benefit.substring(8)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Share')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Share</strong>
                                  <span>{benefit.substring(5)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Track')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Track</strong>
                                  <span>{benefit.substring(5)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Receive')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Receive</strong>
                                  <span>{benefit.substring(7)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Access')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Access</strong>
                                  <span>{benefit.substring(6)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Gain')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Gain</strong>
                                  <span>{benefit.substring(4)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Personalize')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Personalize</strong>
                                  <span>{benefit.substring(11)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Identify')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Identify</strong>
                                  <span>{benefit.substring(8)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Improve')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Improve</strong>
                                  <span>{benefit.substring(7)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Collaborate')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Collaborate</strong>
                                  <span>{benefit.substring(11)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Explore')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Explore</strong>
                                  <span>{benefit.substring(7)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Practice')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Practice</strong>
                                  <span>{benefit.substring(8)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Boost')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Boost</strong>
                                  <span>{benefit.substring(5)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Assess')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Assess</strong>
                                  <span>{benefit.substring(6)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Match')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Match</strong>
                                  <span>{benefit.substring(5)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Support')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Support</strong>
                                  <span>{benefit.substring(7)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Reduce')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Reduce</strong>
                                  <span>{benefit.substring(6)}</span>
                                </>
                              );
                            } else if (benefit.startsWith('Use')) {
                              formattedBenefit = (
                                <>
                                  <strong className="text-foreground">Use</strong>
                                  <span>{benefit.substring(3)}</span>
                                </>
                              );
                            } else {
                              formattedBenefit = benefit;
                            }
                            
                            return (
                              <li key={i} className="flex items-start gap-2.5 text-sm">
                                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span className="text-muted-foreground leading-relaxed">
                                  {formattedBenefit}
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                        
                        {userType.action && (
                          <div className="mt-6">
                            <Button 
                              variant="outline" 
                              className="w-full border-dashed border-2 h-11" 
                              onClick={userType.action.onClick}
                            >
                              {userType.action.label}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </Card>
        </motion.div>

        {/* Feedback Prompt */}
        <FeedbackPrompt variant="full" className="mb-8" />

        {/* Call to Action */}
        <Card className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0 overflow-hidden relative shadow-2xl">
          {/* Background image with stronger gradient overlay */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 via-indigo-600/90 to-purple-700/95"></div>
          
          <CardHeader className="relative z-10">
            <CardTitle className="text-3xl md:text-4xl text-white mb-2">Ready to Discover Your Cognitive Profile?</CardTitle>
            <CardDescription className="text-blue-100 text-lg max-w-2xl mx-auto">
              Join thousands of students, teachers, parents, and professionals who are unlocking their potential
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 pb-10">
            <Button size="lg" variant="secondary" onClick={onGetStarted} className="group text-lg px-8 h-14 shadow-lg hover:shadow-xl transition-shadow">
              Start Your Assessment Now →
            </Button>
            <p className="text-blue-100 text-sm mt-3 font-medium">Takes less than 5 minutes</p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-muted-foreground">
            <div className="text-center md:text-left">
              <p className="font-semibold text-foreground mb-1.5 text-[15px]">JotMinds Platform</p>
              <p className="text-[14px]">© JotMinds Platform – 2025</p>
            </div>
            <div className="text-center">
              <p className="text-[14px] leading-relaxed">Empowering learners through cognitive awareness</p>
            </div>
            <div className="text-center md:text-right flex flex-col gap-2">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onViewPrivacyPolicy?.();
                }}
                className="text-[14px] hover:text-foreground transition-colors hover:underline"
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onViewTermsOfUse?.();
                }}
                className="text-[14px] hover:text-foreground transition-colors hover:underline"
              >
                Terms of Use
              </a>
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onViewContact?.();
                }}
                className="text-[14px] hover:text-foreground transition-colors hover:underline"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
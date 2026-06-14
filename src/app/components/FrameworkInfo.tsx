import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { BookOpen, Brain, Target, Users, GraduationCap, Briefcase, Info, ArrowRight, Lightbulb } from 'lucide-react';
import { ReactNode } from 'react';

interface FrameworkInfoProps {
  trigger?: ReactNode;
  defaultOpen?: boolean;
  userRole?: 'student' | 'teacher' | 'parent' | 'professional';
}

export function FrameworkInfo({ trigger, defaultOpen = false, userRole }: FrameworkInfoProps) {
  const frameworks = [
    {
      name: 'Your Learning Style',
      orgName: 'Learning Agility',
      icon: BookOpen,
      color: 'hsl(var(--chart-1))',
      focus: 'How you absorb and process new experiences',
      question: 'How do I best learn or engage with new knowledge?',
      theory: "Kolb's Experiential Learning Theory",
      dimensions: ['Concrete Experience (CE)', 'Reflective Observation (RO)', 'Abstract Conceptualization (AC)', 'Active Experimentation (AE)'],
      domain: 'Learning / Adaptation',
      stage: 'Input Stage',
      description: 'How information enters the mind',
      example: 'A person who learns best through hands-on experience (CE) combined with trying things out (AE) = Accommodator learning style'
    },
    {
      name: 'Your Thinking Style',
      orgName: 'Thinking Diversity',
      icon: Brain,
      color: 'hsl(var(--chart-2))',
      focus: 'How you analyze, create, and apply ideas',
      question: 'How do I prefer to think and solve problems?',
      theory: "Sternberg's Triarchic Theory",
      dimensions: ['Analytical Thinking', 'Creative Thinking', 'Practical Thinking'],
      domain: 'Cognition / Problem-Solving',
      stage: 'Processing Stage',
      description: 'How information is processed once it\'s in the mind',
      example: 'A person strong in Creative Thinking excels at innovation and generating new ideas, while Analytical thinkers excel at critical reasoning'
    },
    {
      name: 'Your Decision Style',
      orgName: 'Decision Intelligence',
      icon: Target,
      color: 'hsl(var(--chart-3))',
      focus: 'How you choose or act based on thought or instinct',
      question: 'How do I usually make decisions — fast and intuitive or slow and analytical?',
      theory: 'Dual Process Theory (Kahneman)',
      dimensions: ['System 1 (Intuitive/Fast)', 'System 2 (Analytical/Deliberate)'],
      domain: 'Judgment / Decision-Making',
      stage: 'Output Stage',
      description: 'How insights or conclusions are acted upon',
      example: 'System 1 allows quick, intuitive decisions in familiar situations, while System 2 engages for complex, deliberate reasoning'
    }
  ];

  const getRoleSpecificContent = () => {
    switch (userRole) {
      case 'student':
        return {
          title: 'Why Take All Three Assessments?',
          description: 'Understanding your complete cognitive profile helps you learn more effectively, think clearly, and make better decisions in your studies and life.',
          benefits: [
            'Discover your optimal learning methods for better grades',
            'Understand how you solve problems and think creatively',
            'Learn when to trust your instincts vs. think things through',
            'Get personalized SHS track and career recommendations',
            'Build self-awareness for personal growth'
          ]
        };
      case 'teacher':
        return {
          title: 'Why Assess All Three for Your Students?',
          description: 'A complete cognitive profile helps you differentiate instruction, support diverse learners, and guide students toward success.',
          benefits: [
            'Tailor teaching methods to match student learning styles',
            'Identify and nurture different thinking strengths in your class',
            'Help students develop better decision-making skills',
            'Provide data-driven guidance for academic and career paths',
            'Build stronger student-teacher understanding'
          ]
        };
      case 'parent':
        return {
          title: 'Why Assess All Three for Your Child?',
          description: 'Understanding your child\'s complete cognitive profile helps you support their unique strengths and guide their development effectively.',
          benefits: [
            'Identify how your child learns best to support homework and study',
            'Recognize their natural thinking strengths (analytical, creative, practical)',
            'Understand how they make decisions and respond to challenges',
            'Choose appropriate school programs and extracurricular activities',
            'Improve parent-child communication and mutual understanding',
            'Guide them toward suitable SHS tracks and career paths'
          ]
        };
      case 'professional':
        return {
          title: 'Why Assess All Three in Your Organization?',
          description: 'Map your team\'s "Cognitive DNA" to build learning culture, innovation capacity, and decision-making effectiveness.',
          benefits: [
            'Build Learning Agility: Understand how your team adapts and learns',
            'Foster Thinking Diversity: Balance analytical, creative, and practical approaches',
            'Enhance Decision Intelligence: Optimize strategic and operational effectiveness',
            'Create complementary teams based on cognitive strengths',
            'Improve organizational communication and collaboration',
            'Drive innovation through cognitive diversity'
          ]
        };
      default:
        return {
          title: 'Why Take All Three Assessments?',
          description: 'Together, these assessments provide a complete picture of how you learn, think, and decide.',
          benefits: [
            'Complete cognitive profile for holistic self-awareness',
            'Understand your strengths across different mental processes',
            'Identify areas for personal and professional growth',
            'Make better choices aligned with your natural tendencies',
            'Build on complementary cognitive capabilities'
          ]
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Info className="mr-2 h-4 w-4" />
            About the Frameworks
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-blue-600" />
            Understanding Your Cognitive Assessment
          </DialogTitle>
          <DialogDescription>
            Learn how the three frameworks work together to create your complete cognitive profile
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
            <TabsTrigger value="frameworks" className="text-xs sm:text-sm">Frameworks</TabsTrigger>
            <TabsTrigger value="cycle" className="text-xs sm:text-sm">The Cycle</TabsTrigger>
            <TabsTrigger value="why" className="text-xs sm:text-sm">Why All Three?</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Three Distinct but Connected Frameworks</CardTitle>
                <CardDescription>
                  Each framework measures a different aspect of how you process information and interact with the world
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {frameworks.map((framework, index) => {
                    const Icon = framework.icon;
                    return (
                      <div key={index} className="flex gap-4 p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                        <div 
                          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${framework.color}20` }}
                        >
                          <Icon className="h-6 w-6" style={{ color: framework.color }} />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{framework.name}</h4>
                            <Badge variant="outline">{framework.stage}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{framework.focus}</p>
                          <p className="text-sm italic text-blue-600">"{framework.question}"</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    In Short
                  </h4>
                  <ul className="space-y-1 text-sm">
                    <li><strong>Learning Style</strong> = how information enters the mind</li>
                    <li><strong>Thinking Style</strong> = how information is processed once it's in the mind</li>
                    <li><strong>Decision Style</strong> = how insights or conclusions are acted upon</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frameworks" className="space-y-4">
            {frameworks.map((framework, index) => {
              const Icon = framework.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div 
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${framework.color}20` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: framework.color }} />
                      </div>
                      <div className="flex-1">
                        <CardTitle>{framework.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {userRole === 'professional' ? framework.orgName : framework.name}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-1">Core Focus</p>
                        <p className="text-sm text-muted-foreground">{framework.focus}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Cognitive Domain</p>
                        <p className="text-sm text-muted-foreground">{framework.domain}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Underlying Theory</p>
                        <p className="text-sm text-muted-foreground">{framework.theory}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Key Question</p>
                        <p className="text-sm italic text-blue-600">"{framework.question}"</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Dimensions Measured</p>
                      <div className="flex flex-wrap gap-2">
                        {framework.dimensions.map((dim, i) => (
                          <Badge key={i} variant="secondary">{dim}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Example</p>
                      <p className="text-sm text-muted-foreground">{framework.example}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="cycle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>The Complete Cognitive Cycle</CardTitle>
                <CardDescription>
                  How the three frameworks connect in the human cognitive process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                      <span className="text-xl">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Learning Style (Input Stage)
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        You take in and internalize new information through experience, reflection, or analysis.
                      </p>
                    </div>
                  </div>

                  <div className="ml-8 border-l-2 border-dashed border-muted-foreground/30 pl-4 py-2">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white">
                      <span className="text-xl">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-600" />
                        Thinking Style (Processing Stage)
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        You make sense of that information — either analytically, creatively, or practically.
                      </p>
                    </div>
                  </div>

                  <div className="ml-8 border-l-2 border-dashed border-muted-foreground/30 pl-4 py-2">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white">
                      <span className="text-xl">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Target className="h-5 w-5 text-green-600" />
                        Decision Style (Output Stage)
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        You act on it — either through intuitive, rapid judgments or deliberate reasoning.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-4 rounded-lg border">
                  <h4 className="font-semibold mb-3">Example: The Complete Cycle in Action</h4>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-start gap-2">
                      <Badge variant="secondary" className="flex-shrink-0">Learn</Badge>
                      <span className="text-muted-foreground">
                        A person with <strong>Concrete-Active Learning</strong> may quickly test ideas through hands-on experience
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Badge variant="secondary" className="flex-shrink-0">Think</Badge>
                      <span className="text-muted-foreground">
                        Using <strong>Practical Thinking</strong> to solve real problems with common-sense approaches
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <Badge variant="secondary" className="flex-shrink-0">Decide</Badge>
                      <span className="text-muted-foreground">
                        And relying on <strong>Intuitive Decision-Making</strong> when taking action
                      </span>
                    </p>
                  </div>
                </div>

                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="font-semibold mb-2">The Continuous Cycle</p>
                  <p className="text-sm text-muted-foreground">
                    Learn → Think → Decide → Act → Relearn
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="why" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {userRole === 'student' && <GraduationCap className="h-5 w-5" />}
                  {userRole === 'teacher' && <Users className="h-5 w-5" />}
                  {userRole === 'parent' && <Users className="h-5 w-5" />}
                  {userRole === 'professional' && <Briefcase className="h-5 w-5" />}
                  {roleContent.title}
                </CardTitle>
                <CardDescription>{roleContent.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {roleContent.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                      </div>
                      <p className="text-sm flex-1">{benefit}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold mb-2">Holistic Cognitive Profile</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Assessing all three together provides a 360° view of cognitive capabilities:
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="text-xs font-medium">How you learn</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="text-xs font-medium">How you think</p>
                    </div>
                    <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="text-xs font-medium">How you decide</p>
                    </div>
                  </div>
                </div>

                {userRole === 'professional' && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-lg border">
                    <h4 className="font-semibold mb-2">Organizational Cognitive DNA</h4>
                    <p className="text-sm text-muted-foreground">
                      In organizations, these three combined metrics reveal:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-1" />
                        <strong>Learning Culture:</strong> How teams adapt and grow
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-2" />
                        <strong>Innovation Potential:</strong> Diversity of thinking approaches
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-chart-3" />
                        <strong>Decision Speed & Accuracy:</strong> Strategic effectiveness
                      </li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Takeaway</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  The three frameworks are <strong>distinct but interconnected</strong> components of cognition. 
                  They're not redundant — together they map your complete cognitive performance, ideal for 
                  {userRole === 'student' && ' personal development, academic success, and career planning.'}
                  {userRole === 'teacher' && ' differentiated instruction, student guidance, and educational excellence.'}
                  {userRole === 'parent' && ' supporting your child\'s unique strengths and guiding their development.'}
                  {userRole === 'professional' && ' organizational diagnostics, team building, and strategic decision-making.'}
                  {!userRole && ' both personal development and organizational diagnostics.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
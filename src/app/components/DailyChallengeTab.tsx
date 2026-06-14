import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Flame, Trophy, Star, Calendar, CheckCircle2, XCircle, Sparkles, Brain, Lightbulb, Target, Clock, Settings, Bell, BellOff } from 'lucide-react';
import { 
  getDailyChallengeProgress, 
  completeDailyChallenge,
  updateNotificationSettings,
  getChallengeSettings 
} from '../utils/dailyChallengeApi';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface DailyChallengeTabProps {
  userId: string;
  userName: string;
  userAge: number;
}

interface ChallengeProgress {
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  badges: string[];
  completedDays: string[];
  lastCompletedDate: string | null;
  todayCompleted: boolean;
  notificationFrequency: 'daily' | 'weekly' | 'monthly' | 'off';
}

interface DailyChallenge {
  id: string;
  type: 'questions' | 'puzzle' | 'reflection' | 'practical';
  content: any;
  points: number;
}

const AGE_GROUPS = {
  YOUTH: { min: 11, max: 14, label: 'JHS Explorer' },
  TEEN: { min: 15, max: 18, label: 'SHS Achiever' },
  ADULT: { min: 19, max: 100, label: 'Professional' }
};

export function DailyChallengeTab({ userId, userName, userAge }: DailyChallengeTabProps) {
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [todayChallenge, setTodayChallenge] = useState<DailyChallenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  
  // Challenge response state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [reflectionText, setReflectionText] = useState('');
  const [puzzleAnswer, setPuzzleAnswer] = useState('');
  const [practicalCompleted, setPracticalCompleted] = useState(false);

  useEffect(() => {
    loadProgress();
  }, [userId]);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const data = await getDailyChallengeProgress(userId);
      setProgress(data.progress);
      
      // Check if today's challenge is already completed
      const today = new Date().toISOString().split('T')[0];
      if (!data.progress.todayCompleted) {
        setTodayChallenge(generateDailyChallenge(data.progress.completedDays.length, userAge));
      }
    } catch (error) {
      console.error('Error loading challenge progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDailyChallenge = (dayNumber: number, age: number): DailyChallenge => {
    // Rotate through challenge types: questions → puzzle → reflection → practical
    const cyclePosition = dayNumber % 4;
    const challengeTypes: DailyChallenge['type'][] = ['questions', 'puzzle', 'reflection', 'practical'];
    const type = challengeTypes[cyclePosition];

    const ageGroup = getAgeGroup(age);

    switch (type) {
      case 'questions':
        return generateQuestionsChallenge(ageGroup, age);
      case 'puzzle':
        return generatePuzzleChallenge(ageGroup, age);
      case 'reflection':
        return generateReflectionChallenge(ageGroup, age);
      case 'practical':
        return generatePracticalChallenge(ageGroup, age);
      default:
        return generateQuestionsChallenge(ageGroup, age);
    }
  };

  const getAgeGroup = (age: number): 'youth' | 'teen' | 'adult' => {
    if (age >= AGE_GROUPS.YOUTH.min && age <= AGE_GROUPS.YOUTH.max) return 'youth';
    if (age >= AGE_GROUPS.TEEN.min && age <= AGE_GROUPS.TEEN.max) return 'teen';
    return 'adult';
  };

  const generateQuestionsChallenge = (ageGroup: string, age: number): DailyChallenge => {
    const questionSets = {
      youth: [
        {
          question: "When working on a group project, what do you enjoy most?",
          options: [
            "Coming up with creative new ideas",
            "Organizing and planning the steps",
            "Making sure everyone works together well",
            "Thinking deeply about what we're learning"
          ],
          dimension: ['creative', 'analytical', 'practical', 'reflective']
        },
        {
          question: "How do you prefer to solve a tricky math problem?",
          options: [
            "Try different fun approaches until one works",
            "Break it down step-by-step carefully",
            "Use methods I already know work",
            "Think about why the problem matters"
          ],
          dimension: ['creative', 'analytical', 'practical', 'reflective']
        }
      ],
      teen: [
        {
          question: "When faced with a complex assignment, how do you typically approach it?",
          options: [
            "Brainstorm innovative solutions and unique angles",
            "Research thoroughly and analyze all aspects",
            "Apply proven methods and practical strategies",
            "Consider the deeper meaning and implications"
          ],
          dimension: ['creative', 'analytical', 'practical', 'reflective']
        },
        {
          question: "In class discussions, you're most likely to:",
          options: [
            "Propose new perspectives and unconventional ideas",
            "Question assumptions and examine evidence",
            "Share real-world applications and examples",
            "Connect concepts to broader philosophical questions"
          ],
          dimension: ['creative', 'analytical', 'practical', 'reflective']
        }
      ],
      adult: [
        {
          question: "When approaching a professional challenge, you naturally:",
          options: [
            "Develop innovative strategies and creative solutions",
            "Conduct systematic analysis and data-driven evaluation",
            "Implement proven frameworks and actionable steps",
            "Consider long-term implications and ethical dimensions"
          ],
          dimension: ['creative', 'analytical', 'practical', 'reflective']
        },
        {
          question: "In team meetings, you add the most value by:",
          options: [
            "Generating fresh ideas and novel approaches",
            "Identifying logical flaws and strengthening arguments",
            "Proposing concrete action plans and implementation strategies",
            "Facilitating deeper understanding and perspective-taking"
          ],
          dimension: ['creative', 'analytical', 'practical', 'reflective']
        }
      ]
    };

    const questions = questionSets[ageGroup as keyof typeof questionSets];
    const randomQuestions = questions.sort(() => Math.random() - 0.5).slice(0, 2);

    return {
      id: `questions-${Date.now()}`,
      type: 'questions',
      content: {
        questions: randomQuestions
      },
      points: 20
    };
  };

  const generatePuzzleChallenge = (ageGroup: string, age: number): DailyChallenge => {
    const puzzles = {
      youth: [
        {
          title: "Pattern Detective 🔍",
          description: "Look at this sequence: 2, 4, 8, 16, ___. What comes next and why?",
          hint: "Each number is double the previous one!",
          answer: "32",
          explanation: "Each number is multiplied by 2, so 16 × 2 = 32"
        },
        {
          title: "Word Wizard 🎨",
          description: "How many words can you make from the letters in 'CREATIVE'? (Minimum 3 letters)",
          hint: "Try mixing the letters in different ways!",
          answer: "10",
          explanation: "Examples: CREATE, REACT, ACTIVE, TRACE, CRATE, etc."
        },
        {
          title: "Logic Puzzle 🧩",
          description: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies?",
          hint: "Think step by step!",
          answer: "yes",
          explanation: "If A=B and B=C, then A=C. So yes, all Bloops are Lazzies!"
        }
      ],
      teen: [
        {
          title: "Strategic Thinking 🎯",
          description: "You have 100 meters of fencing to create a rectangular garden. What dimensions give you the maximum area?",
          hint: "Think about squares vs rectangles!",
          answer: "25x25",
          explanation: "A square (25m × 25m = 625 m²) gives the maximum area for a fixed perimeter"
        },
        {
          title: "Analytical Challenge 📊",
          description: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
          hint: "Don't overthink it!",
          answer: "5",
          explanation: "Each machine takes 5 minutes to make 1 widget, so 100 machines still take 5 minutes"
        }
      ],
      adult: [
        {
          title: "Business Logic 💼",
          description: "A company's revenue grew from $100k to $121k. What was the percentage increase?",
          hint: "Calculate the difference first!",
          answer: "21",
          explanation: "($121k - $100k) / $100k = 21% increase"
        },
        {
          title: "Systems Thinking 🔄",
          description: "In a circular meeting table with 8 seats, how many unique seating arrangements are possible?",
          hint: "Rotations that look the same should count as one!",
          answer: "5040",
          explanation: "(8-1)! = 7! = 5,040 unique arrangements when accounting for rotational symmetry"
        }
      ]
    };

    const agePuzzles = puzzles[ageGroup as keyof typeof puzzles];
    const randomPuzzle = agePuzzles[Math.floor(Math.random() * agePuzzles.length)];

    return {
      id: `puzzle-${Date.now()}`,
      type: 'puzzle',
      content: randomPuzzle,
      points: 30
    };
  };

  const generateReflectionChallenge = (ageGroup: string, age: number): DailyChallenge => {
    const prompts = {
      youth: [
        "Think about a time when you solved a problem in a creative way. What did you do differently? How did it feel?",
        "What's one thing you learned this week that made you think differently about something?",
        "If you could teach one skill to everyone in your class, what would it be and why?",
        "Describe a moment when you had to think really carefully before making a decision. What helped you decide?"
      ],
      teen: [
        "Reflect on a recent academic challenge. Which thinking style (creative, analytical, practical, reflective) did you use most? Why?",
        "How has your approach to problem-solving changed over the past year? What influenced this change?",
        "Consider a subject you find difficult. How could you apply different thinking styles to improve your understanding?",
        "What role does reflection play in your learning process? Give a specific example."
      ],
      adult: [
        "Analyze a recent professional decision. How did your dominant thinking style influence the outcome?",
        "What thinking style do you use least often? How might developing it benefit your career?",
        "Reflect on a workplace challenge that required balancing multiple thinking approaches. What did you learn?",
        "How do you adapt your thinking style when collaborating with colleagues who think differently than you?"
      ]
    };

    const agePrompts = prompts[ageGroup as keyof typeof prompts];
    const randomPrompt = agePrompts[Math.floor(Math.random() * agePrompts.length)];

    return {
      id: `reflection-${Date.now()}`,
      type: 'reflection',
      content: {
        prompt: randomPrompt,
        minWords: ageGroup === 'youth' ? 30 : ageGroup === 'teen' ? 50 : 75
      },
      points: 25
    };
  };

  const generatePracticalChallenge = (ageGroup: string, age: number): DailyChallenge => {
    const challenges = {
      youth: [
        {
          title: "Creative Thinking Mission 🎨",
          task: "Today, try to come up with 3 different ways to solve ONE problem you face. It could be organizing your homework, remembering something, or anything else!",
          checkboxes: [
            "I identified a problem I want to solve",
            "I thought of at least 3 different solutions",
            "I tried the most creative solution"
          ]
        },
        {
          title: "Analytical Thinking Quest 🔍",
          task: "Pick something you use every day (like a pencil, phone, or backpack). Ask yourself: Why is it designed this way? What makes it work well? What could be improved?",
          checkboxes: [
            "I chose an everyday object to analyze",
            "I thought about why it's designed that way",
            "I came up with one improvement idea"
          ]
        },
        {
          title: "Practical Thinking Challenge 🛠️",
          task: "Find one thing in your daily routine that could be more efficient. Make a simple plan to improve it, then try it out!",
          checkboxes: [
            "I identified something to improve",
            "I made a practical plan",
            "I tested my improvement"
          ]
        }
      ],
      teen: [
        {
          title: "Creative Innovation Task 💡",
          task: "Identify a common frustration in your school or community. Design an innovative solution using creative thinking approaches.",
          checkboxes: [
            "I identified a real problem worth solving",
            "I brainstormed multiple creative solutions",
            "I developed one solution in detail",
            "I considered how to implement it"
          ]
        },
        {
          title: "Analytical Deep Dive 📊",
          task: "Choose a current event or news story. Analyze it from multiple perspectives, identifying assumptions, evidence, and logical connections.",
          checkboxes: [
            "I selected a current event to analyze",
            "I identified different perspectives",
            "I evaluated the evidence critically",
            "I drew my own informed conclusion"
          ]
        }
      ],
      adult: [
        {
          title: "Strategic Innovation Exercise 🚀",
          task: "Identify a process in your work that could be improved. Apply design thinking to develop and prototype a creative solution.",
          checkboxes: [
            "I mapped out the current process",
            "I identified pain points and opportunities",
            "I designed an innovative solution",
            "I created an implementation plan",
            "I identified success metrics"
          ]
        },
        {
          title: "Systems Analysis Project 🔄",
          task: "Analyze a complex system in your professional domain. Map its components, relationships, and feedback loops.",
          checkboxes: [
            "I selected a complex system to analyze",
            "I identified key components",
            "I mapped relationships and dependencies",
            "I recognized feedback loops",
            "I proposed one optimization"
          ]
        }
      ]
    };

    const ageChallenges = challenges[ageGroup as keyof typeof challenges];
    const randomChallenge = ageChallenges[Math.floor(Math.random() * ageChallenges.length)];

    return {
      id: `practical-${Date.now()}`,
      type: 'practical',
      content: randomChallenge,
      points: 35
    };
  };

  const handleCompleteChallenge = async () => {
    if (!todayChallenge || !progress) return;

    setCompleting(true);
    try {
      let response: any = {};

      // Collect response based on challenge type
      switch (todayChallenge.type) {
        case 'questions':
          response = { answers: selectedAnswers };
          break;
        case 'puzzle':
          response = { answer: puzzleAnswer };
          break;
        case 'reflection':
          response = { reflection: reflectionText };
          break;
        case 'practical':
          response = { completed: practicalCompleted };
          break;
      }

      const result = await completeDailyChallenge(userId, todayChallenge.id, response);
      
      setEarnedPoints(result.pointsEarned);
      setEarnedBadges(result.newBadges);
      setProgress(result.updatedProgress);
      setShowResults(true);
      setTodayChallenge(null);
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleNotificationChange = async (frequency: 'daily' | 'weekly' | 'monthly' | 'off') => {
    if (!progress) return;
    
    try {
      await updateNotificationSettings(userId, frequency);
      setProgress({ ...progress, notificationFrequency: frequency });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const isAnswersComplete = () => {
    if (!todayChallenge) return false;

    switch (todayChallenge.type) {
      case 'questions':
        return Object.keys(selectedAnswers).length === todayChallenge.content.questions.length;
      case 'puzzle':
        return puzzleAnswer.trim().length > 0;
      case 'reflection':
        const wordCount = reflectionText.trim().split(/\s+/).length;
        return wordCount >= todayChallenge.content.minWords;
      case 'practical':
        return practicalCompleted;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-12 w-12 animate-pulse text-purple-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your challenges...</p>
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Error loading challenge data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700/70">Current Streak</p>
                <p className="text-3xl font-bold text-orange-600">{progress.currentStreak}</p>
                <p className="text-xs text-orange-700/70 mt-1">days 🔥</p>
              </div>
              <Flame className="h-12 w-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700/70">Total Points</p>
                <p className="text-3xl font-bold text-yellow-600">{progress.totalPoints}</p>
                <p className="text-xs text-yellow-700/70 mt-1">XP earned ⭐</p>
              </div>
              <Star className="h-12 w-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700/70">Longest Streak</p>
                <p className="text-3xl font-bold text-purple-600">{progress.longestStreak}</p>
                <p className="text-xs text-purple-700/70 mt-1">days 🏆</p>
              </div>
              <Trophy className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700/70">Badges Earned</p>
                <p className="text-3xl font-bold text-blue-600">{progress.badges.length}</p>
                <p className="text-xs text-blue-700/70 mt-1">achievements 🎖️</p>
              </div>
              <Trophy className="h-12 w-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <Card className="border-2 border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-slate-600" />
              <CardTitle className="text-lg">Challenge Reminders</CardTitle>
            </div>
            <Select
              value={progress.notificationFrequency}
              onValueChange={(value) => handleNotificationChange(value as any)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Reminders</SelectItem>
                <SelectItem value="weekly">Weekly Reminders</SelectItem>
                <SelectItem value="monthly">Monthly Reminders</SelectItem>
                <SelectItem value="off">
                  <span className="flex items-center gap-2">
                    <BellOff className="h-4 w-4" />
                    Off
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Today's Challenge or Completion Message */}
      {progress.todayCompleted ? (
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-8 pb-8 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-700 mb-2">Challenge Complete! 🎉</h3>
            <p className="text-green-700/80 mb-4">
              You've completed today's challenge. Come back tomorrow for a new one!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-green-700/80">Next challenge in: {getTimeUntilMidnight()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : todayChallenge ? (
        <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                {getChallengeTypeLabel(todayChallenge.type)}
              </Badge>
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                +{todayChallenge.points} XP
              </Badge>
            </div>
            <CardTitle className="text-2xl flex items-center gap-2">
              {getChallengeIcon(todayChallenge.type)}
              Today's Challenge
            </CardTitle>
            <CardDescription className="text-indigo-700/70">
              Complete today's challenge to maintain your streak and earn points!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderChallengeContent()}

            <div className="flex items-center justify-between pt-4 border-t border-indigo-200">
              <div className="text-sm text-indigo-700/70">
                {isAnswersComplete() ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Ready to submit!
                  </span>
                ) : (
                  <span>Complete all parts to submit</span>
                )}
              </div>
              <Button
                onClick={handleCompleteChallenge}
                disabled={!isAnswersComplete() || completing}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                size="default"
              >
                {completing ? 'Submitting...' : 'Complete Challenge'}
                <Sparkles className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Badges Display */}
      {progress.badges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Your Badges
            </CardTitle>
            <CardDescription>Achievements you've unlocked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {progress.badges.map((badge, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 text-center"
                >
                  <div className="text-3xl mb-2">{getBadgeEmoji(badge)}</div>
                  <p className="text-sm font-semibold">{badge}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              🎉 Challenge Completed!
            </DialogTitle>
            <DialogDescription className="text-center">
              View your earned points and badges
            </DialogDescription>
          </DialogHeader>
          <div className="text-center pt-4 space-y-4">
            <div className="text-6xl">✨</div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">+{earnedPoints} XP</p>
              <p className="text-sm text-muted-foreground mt-1">Points earned</p>
            </div>
            
            {earnedBadges.length > 0 && (
              <div className="pt-4 border-t">
                <p className="font-semibold mb-2">New Badges Unlocked!</p>
                <div className="flex justify-center gap-2">
                  {earnedBadges.map((badge, index) => (
                    <div key={index} className="text-2xl">
                      {getBadgeEmoji(badge)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Current Streak: <span className="font-bold text-orange-500">{progress?.currentStreak} days 🔥</span>
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowResults(false)} className="w-full">
              Awesome! 🚀
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderChallengeContent() {
    if (!todayChallenge) return null;

    switch (todayChallenge.type) {
      case 'questions':
        return (
          <div className="space-y-6">
            {todayChallenge.content.questions.map((q: any, qIndex: number) => (
              <div key={qIndex} className="p-4 bg-white rounded-lg border-2 border-indigo-200">
                <p className="font-semibold mb-4 text-gray-900">
                  {qIndex + 1}. {q.question}
                </p>
                <RadioGroup
                  value={selectedAnswers[qIndex]?.toString()}
                  onValueChange={(value) => setSelectedAnswers({ ...selectedAnswers, [qIndex]: parseInt(value) })}
                >
                  {q.options.map((option: string, optIndex: number) => (
                    <div key={optIndex} className="flex items-center space-x-2 mb-2 bg-[rgba(0,0,0,0)]">
                      <RadioGroupItem value={optIndex.toString()} id={`q${qIndex}-opt${optIndex}`} />
                      <Label htmlFor={`q${qIndex}-opt${optIndex}`} className="cursor-pointer text-gray-900">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
          </div>
        );

      case 'puzzle':
        return (
          <div className="p-6 bg-white rounded-lg border-2 border-purple-200">
            <h3 className="text-xl font-bold mb-3 text-purple-700">
              {todayChallenge.content.title}
            </h3>
            <p className="text-gray-700 mb-4">{todayChallenge.content.description}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>💡 Hint:</strong> {todayChallenge.content.hint}
              </p>
            </div>
            <div>
              <Label htmlFor="puzzle-answer" className="mb-2 block text-gray-900">
                Your Answer:
              </Label>
              <input
                id="puzzle-answer"
                type="text"
                value={puzzleAnswer}
                onChange={(e) => setPuzzleAnswer(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                placeholder="Type your answer here..."
              />
            </div>
          </div>
        );

      case 'reflection':
        return (
          <div className="p-6 bg-white rounded-lg border-2 border-cyan-200">
            <h3 className="text-xl font-bold mb-3 text-cyan-700">
              Today's Reflection
            </h3>
            <p className="text-gray-700 mb-4 italic">"{todayChallenge.content.prompt}"</p>
            <div>
              <Label htmlFor="reflection-text" className="mb-2 block text-gray-900">
                Your Reflection (minimum {todayChallenge.content.minWords} words):
              </Label>
              <Textarea
                id="reflection-text"
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                className="min-h-[150px] border-2 border-gray-300 focus:border-cyan-500"
                placeholder="Share your thoughts..."
              />
              <p className="text-sm text-gray-500 mt-2">
                Word count: {reflectionText.trim().split(/\s+/).filter(w => w.length > 0).length} / {todayChallenge.content.minWords}
              </p>
            </div>
          </div>
        );

      case 'practical':
        return (
          <div className="p-6 bg-white rounded-lg border-2 border-green-200">
            <h3 className="text-xl font-bold mb-3 text-green-700">
              {todayChallenge.content.title}
            </h3>
            <p className="text-gray-700 mb-4">{todayChallenge.content.task}</p>
            <div className="space-y-3">
              <p className="font-semibold text-sm text-gray-600">Complete these steps:</p>
              {todayChallenge.content.checkboxes.map((checkbox: string, index: number) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{checkbox}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={practicalCompleted}
                  onChange={(e) => setPracticalCompleted(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="font-semibold text-gray-900">
                  I've completed this practical challenge
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  }
}

function getChallengeTypeLabel(type: string): string {
  switch (type) {
    case 'questions':
      return '📝 Thinking Questions';
    case 'puzzle':
      return '🧩 Brain Teaser';
    case 'reflection':
      return '💭 Daily Reflection';
    case 'practical':
      return '🎯 Practical Challenge';
    default:
      return 'Daily Challenge';
  }
}

function getChallengeIcon(type: string) {
  switch (type) {
    case 'questions':
      return <Brain className="h-6 w-6 text-indigo-500" />;
    case 'puzzle':
      return <Lightbulb className="h-6 w-6 text-purple-500" />;
    case 'reflection':
      return <Sparkles className="h-6 w-6 text-cyan-500" />;
    case 'practical':
      return <Target className="h-6 w-6 text-green-500" />;
    default:
      return <Brain className="h-6 w-6" />;
  }
}

function getBadgeEmoji(badge: string): string {
  if (badge.includes('7-Day')) return '🔥';
  if (badge.includes('30-Day')) return '💯';
  if (badge.includes('100-Day')) return '👑';
  if (badge.includes('First')) return '⭐';
  if (badge.includes('Master')) return '🎓';
  if (badge.includes('Legend')) return '🏆';
  return '🎖️';
}

function getTimeUntilMidnight(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  
  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}
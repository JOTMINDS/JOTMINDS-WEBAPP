import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Brain, Lightbulb, Scale, Users, ChevronRight, ChevronLeft } from 'lucide-react';

interface ProfessionalCognitiveAssessmentProps {
  onComplete: (responses: ProfessionalAssessmentResponses) => void;
  onBack: () => void;
}

export interface ProfessionalAssessmentResponses {
  learning: number[];
  thinking: number[];
  decisionMaking: number[];
  motivation?: number[];
}

const sections = [
  {
    id: 'learning',
    title: 'Learning Preferences',
    icon: Brain,
    description: 'How you prefer to acquire and apply knowledge',
    benefit: 'Understanding how you learn best helps you adapt quickly, collaborate more effectively, and retain information better.',
    questions: [
      'I learn best by trying things out rather than only reading about them.',
      'I prefer to reflect and analyze before putting ideas into action.',
      'I like to connect ideas and build frameworks before starting a task.',
      'I learn best when I can observe and take notes before participating.',
      'I enjoy experimenting with new approaches to test my understanding.',
      'I prefer when learning is linked to real-world challenges or outcomes.',
    ]
  },
  {
    id: 'thinking',
    title: 'Thinking Orientation',
    icon: Lightbulb,
    description: 'How you process, organize, and interpret ideas',
    benefit: 'Thinking orientation reveals how you approach problems, innovate, and combine creativity with logic.',
    questions: [
      'I enjoy finding new ways to solve familiar problems.',
      'I often back my ideas with data, logic, or clear reasoning.',
      'I can see patterns and relationships between unrelated ideas.',
      'I\'m comfortable switching between big-picture and details.',
      'I like to question assumptions and explore alternative solutions.',
      'I feel most productive when balancing creativity with structure.',
    ]
  },
  {
    id: 'decisionMaking',
    title: 'Decision-Making Behavior',
    icon: Scale,
    description: 'How you evaluate information and take action',
    benefit: 'Understanding your decision-making style improves leadership, judgment, and problem-solving under pressure.',
    questions: [
      'I make decisions by weighing pros and cons before acting.',
      'I trust my intuition when a quick choice is needed.',
      'I prefer to collect enough information before committing.',
      'Under pressure, I rely on experience more than analysis.',
      'I seek feedback before finalizing important decisions.',
      'I can balance logic with instinct when leading a project.',
    ]
  },
  {
    id: 'motivation',
    title: 'Professional Motivation & Collaboration',
    icon: Users,
    description: 'Your motivation drivers and collaboration preferences',
    benefit: 'Optional section for extended insights on teamwork and autonomy.',
    questions: [
      'I perform best in environments that allow autonomy and experimentation.',
      'I feel most engaged when I can see the results of my work.',
      'Constructive feedback helps me refine my approach.',
      'I value collaboration and brainstorming before final execution.',
    ],
    optional: true
  }
];

const responseOptions = [
  { value: 1, label: 'Strongly Disagree', emoji: '😟' },
  { value: 2, label: 'Disagree', emoji: '🙁' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Agree', emoji: '🙂' },
  { value: 5, label: 'Strongly Agree', emoji: '😊' },
];

export function ProfessionalCognitiveAssessment({ onComplete, onBack }: ProfessionalCognitiveAssessmentProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<ProfessionalAssessmentResponses>({
    learning: [],
    thinking: [],
    decisionMaking: [],
    motivation: []
  });

  const section = sections[currentSection];
  const totalQuestions = sections.reduce((sum, s) => sum + s.questions.length, 0);
  const answeredQuestions = responses.learning.length + responses.thinking.length + 
                             responses.decisionMaking.length + (responses.motivation?.length || 0);
  const progress = (answeredQuestions / totalQuestions) * 100;

  const handleResponse = (value: number) => {
    const sectionKey = section.id as keyof ProfessionalAssessmentResponses;
    const currentResponses = [...(responses[sectionKey] || [])];
    currentResponses[currentQuestion] = value;
    
    setResponses({
      ...responses,
      [sectionKey]: currentResponses
    });

    // Auto-advance to next question
    setTimeout(() => {
      if (currentQuestion < section.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else if (currentSection < sections.length - 1) {
        setCurrentSection(currentSection + 1);
        setCurrentQuestion(0);
      } else {
        // Assessment complete
        onComplete(responses);
      }
    }, 300);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(sections[currentSection - 1].questions.length - 1);
    }
  };

  const handleSkipSection = () => {
    if (section.optional && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    } else if (section.optional) {
      onComplete(responses);
    }
  };

  const SectionIcon = section.icon;
  const sectionKey = section.id as keyof ProfessionalAssessmentResponses;
  const currentResponse = responses[sectionKey]?.[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="shadow-soft">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Badge variant="secondary" className="text-sm">
            Professional Assessment
          </Badge>
        </div>

        {/* Progress */}
        <Card className="border-2 shadow-large">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Section {currentSection + 1} of {sections.length}</span>
                <span>Question {currentQuestion + 1} of {section.questions.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section Info */}
        <Card className="border-2 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-800/50">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <SectionIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Section {currentSection + 1}: {section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 text-sm text-blue-900 dark:text-blue-200">
              💡 {section.benefit}
            </div>
          </CardHeader>
        </Card>

        {/* Question Card */}
        <Card className="border-2 shadow-large">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Badge variant="outline" className="mb-3">
                  Question {currentQuestion + 1} of {section.questions.length}
                </Badge>
                <CardTitle className="text-2xl leading-relaxed">
                  {section.questions[currentQuestion]}
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Response Options */}
            <div className="grid gap-3">
              {responseOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left hover:shadow-md hover:scale-[1.02] ${
                    currentResponse === option.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{option.emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{option.label}</div>
                      <div className="text-sm text-muted-foreground">Rating: {option.value}/5</div>
                    </div>
                    {currentResponse === option.value && (
                      <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentSection === 0 && currentQuestion === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              {section.optional && (
                <Button
                  variant="ghost"
                  onClick={handleSkipSection}
                  className="text-muted-foreground"
                >
                  Skip Optional Section
                </Button>
              )}
              
              {currentResponse && (
                <Button
                  onClick={() => handleResponse(currentResponse)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {currentQuestion < section.questions.length - 1 ? (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  ) : currentSection < sections.length - 1 ? (
                    <>
                      Next Section
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    'Complete Assessment'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <Card className="border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <CardContent className="pt-6">
            <p className="text-sm text-center text-muted-foreground">
              💭 Answer honestly based on how you naturally work and think. There are no right or wrong answers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

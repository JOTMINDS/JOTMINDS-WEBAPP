import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Sparkles, Eye, Award, PartyPopper } from 'lucide-react';
import { JHS_QUESTIONS, THINKING_STYLES } from '../utils/jhsThinkingData';
import { calculateJHSScores, JHSResults } from '../utils/jhsScoring';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Confetti } from './kids/Confetti';

interface JHSThinkingAssessmentProps {
  userId: string;
  onComplete: (results: JHSResults) => void;
  onCancel: () => void;
}

const EMOJI_SCALE = [
  { value: 1, emoji: '😕', label: 'Not really me' },
  { value: 2, emoji: '😐', label: 'A little like me' },
  { value: 3, emoji: '🙂', label: 'Sometimes me' },
  { value: 4, emoji: '😃', label: 'Mostly me' },
  { value: 5, emoji: '🤩', label: 'Totally me!' }
];

const SECTION_INFO = {
  creative: {
    title: '🎨 CREATIVE THINKING',
    subtitle: '"I love to imagine and explore ideas!"',
    description: 'These questions help see how your mind creates new ideas or connects things differently.',
    color: '#FF715B'
  },
  analytical: {
    title: '🔍 ANALYTICAL THINKING',
    subtitle: '"I like figuring out how things work."',
    description: 'These questions show how your brain notices details and uses logic.',
    color: '#6B4C9A'
  },
  practical: {
    title: '🛠️ PRACTICAL THINKING',
    subtitle: '"I use what I know to make things work."',
    description: 'These questions explore how you turn ideas into action and solve real-life challenges.',
    color: '#5B7DB1'
  },
  reflective: {
    title: '💭 REFLECTIVE THINKING',
    subtitle: '"I think about my thoughts and choices."',
    description: 'These questions check how you learn from experience and understand yourself better.',
    color: '#9B59B6'
  }
};

export function JHSThinkingAssessment({ userId, onComplete, onCancel }: JHSThinkingAssessmentProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<number[]>(new Array(24).fill(0));
  const [showPreview, setShowPreview] = useState(false);
  const [showSectionSummary, setShowSectionSummary] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);

  const question = JHS_QUESTIONS[currentQuestion];
  const currentSection = question.section;
  const sectionInfo = SECTION_INFO[currentSection];
  const progress = ((currentQuestion + 1) / JHS_QUESTIONS.length) * 100;
  const isLastQuestion = currentQuestion === JHS_QUESTIONS.length - 1;
  const canProceed = responses[currentQuestion] > 0;

  // Check if we're at the start of a new section
  const isNewSection = currentQuestion === 0 || 
    JHS_QUESTIONS[currentQuestion].section !== JHS_QUESTIONS[currentQuestion - 1]?.section;

  // Check if we're at the end of a section
  const isEndOfSection = currentQuestion < JHS_QUESTIONS.length - 1 && 
    JHS_QUESTIONS[currentQuestion].section !== JHS_QUESTIONS[currentQuestion + 1]?.section;

  // Get section progress
  const getSectionProgress = () => {
    const sectionQuestions = JHS_QUESTIONS.filter(q => q.section === currentSection);
    const sectionStartIndex = JHS_QUESTIONS.findIndex(q => q.section === currentSection);
    const questionsAnswered = currentQuestion - sectionStartIndex + 1;
    return {
      total: sectionQuestions.length,
      answered: questionsAnswered,
      percentage: (questionsAnswered / sectionQuestions.length) * 100
    };
  };

  const handleResponse = (value: number) => {
    const newResponses = [...responses];
    newResponses[currentQuestion] = value;
    setResponses(newResponses);
    
    // Auto-scroll to top after selection
    setTimeout(() => {
      questionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const handleNext = () => {
    if (isEndOfSection && canProceed) {
      // Show section summary before moving to next section
      setShowSectionSummary(true);
    } else if (currentQuestion < JHS_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleContinueAfterSummary = () => {
    setShowSectionSummary(false);
    setCurrentQuestion(currentQuestion + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Show confetti animation
    setShowConfetti(true);
    
    // Calculate and submit results after a brief delay for confetti effect
    setTimeout(() => {
      const results = calculateJHSScores(responses);
      onComplete(results);
    }, 2000);
  };

  // Preview Questions Modal
  const PreviewModal = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">
            <Eye className="inline-block mr-2 h-6 w-6" style={{ color: '#5B7DB1' }} />
            Preview All Questions
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Here's what you'll be asked. Don't worry — you'll answer one at a time!
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {Object.entries(SECTION_INFO).map(([sectionKey, section]) => {
            const sectionQuestions = JHS_QUESTIONS.filter(q => q.section === sectionKey);
            return (
              <div key={sectionKey} className="border rounded-lg p-4 bg-white" style={{ borderColor: section.color }}>
                <h3 className="font-bold mb-3" style={{ color: section.color }}>
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {sectionQuestions.map((q, idx) => (
                    <div key={q.id} className="flex gap-2 text-sm text-gray-700">
                      <span className="font-semibold text-gray-500">{idx + 1}.</span>
                      <span>{q.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={() => setShowPreview(false)} style={{ backgroundColor: '#5B7DB1' }}>
            Got it! Let's start
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Section Summary Checkpoint
  const SectionSummary = () => {
    const sectionProgress = getSectionProgress();
    return (
      <Dialog open={showSectionSummary} onOpenChange={setShowSectionSummary}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center" style={{ color: sectionInfo.color }}>
              <Award className="inline-block mr-2 h-8 w-8" />
              Section Complete!
            </DialogTitle>
            <DialogDescription className="text-center">
              Review your progress before continuing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="font-bold text-xl mb-2" style={{ color: sectionInfo.color }}>
                {sectionInfo.title}
              </h3>
              <p className="text-gray-600 mb-4">
                You just completed {sectionProgress.total} questions about {currentSection} thinking!
              </p>
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-3xl font-bold" style={{ color: sectionInfo.color }}>
                  {sectionProgress.answered}/{sectionProgress.total}
                </div>
                <p className="text-sm text-gray-600">Questions answered</p>
              </div>
            </div>
            <div className="pt-4">
              <Progress value={((currentQuestion + 1) / JHS_QUESTIONS.length) * 100} className="h-3 mb-2" />
              <p className="text-sm text-center text-gray-600">
                Overall progress: {currentQuestion + 1} of {JHS_QUESTIONS.length} questions
              </p>
            </div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={handleContinueAfterSummary}
              className="w-full"
              style={{ backgroundColor: '#5B7DB1' }}
            >
              Continue to Next Section <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <Card className="border-4 bg-white" style={{ borderColor: '#5B7DB1' }}>
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl" style={{ color: '#5B7DB1' }}>
                🧠 JOTMINDS – THINKING STYLES ADVENTURE
              </CardTitle>
              <CardDescription className="text-lg text-gray-700">
                Discover how your mind learns, solves, and creates!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Welcome Message */}
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg border border-blue-200">
                <p className="text-lg text-gray-800 leading-relaxed">
                  👋 <strong>Hey there, Thinker!</strong> Every brain is unique — including yours! 
                  Let's find out how you love to think, solve problems, and come up with ideas. 
                  There are no right or wrong answers — just be honest about what feels true for you.
                </p>
              </div>

              {/* How to Answer */}
              <div className="space-y-3">
                <h3 className="font-bold text-xl" style={{ color: '#5B7DB1' }}>
                  🌈 HOW TO ANSWER
                </h3>
                <p className="text-gray-700">
                  Choose what sounds most like you:
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_SCALE.map((item) => (
                    <div key={item.value} className="text-center p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="text-3xl mb-1">{item.emoji}</div>
                      <div className="text-xs text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* What You'll Discover */}
              <div className="space-y-3">
                <h3 className="font-bold text-xl" style={{ color: '#5B7DB1' }}>
                  ⭐ WHAT YOU'LL DISCOVER
                </h3>
                <p className="text-gray-700">
                  The app will show your <strong>Thinking Style Power Mix!</strong> You'll see which thinking 
                  skills are your strongest — and which ones are growing.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {Object.entries(THINKING_STYLES).map(([key, style]) => (
                    <div key={key} className="bg-white p-4 rounded-lg shadow-sm border-2" style={{ borderColor: style.color }}>
                      <div className="text-2xl mb-2">{style.emoji}</div>
                      <div className="font-bold text-sm" style={{ color: style.color }}>{style.friendlyName}</div>
                      <div className="text-xs text-gray-600 mt-1">{style.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Start Button */}
              <div className="pt-4 space-y-3">
                <Button 
                  onClick={() => setShowPreview(true)}
                  variant="outline"
                  className="w-full py-6 border-2"
                  style={{ borderColor: '#5B7DB1', color: '#5B7DB1' }}
                >
                  <Eye className="mr-2 h-5 w-5" />
                  Preview All Questions
                </Button>
                <Button 
                  onClick={() => setShowIntro(false)}
                  className="w-full text-sm sm:text-base py-6"
                  style={{ backgroundColor: '#5B7DB1' }}
                >
                  Let's Start My Thinking Adventure! 🚀
                </Button>
                <Button
                  onClick={onCancel}
                  variant="ghost"
                  className="w-full mt-2"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Preview Modal */}
        <PreviewModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-3xl mx-auto py-8" ref={questionRef}>
        <Card className="bg-white">
          <CardHeader>
            {/* Section Header (show at start of each section) */}
            {isNewSection && (
              <div className="mb-6 p-6 rounded-lg border-2" style={{ 
                backgroundColor: `${sectionInfo.color}15`,
                borderColor: `${sectionInfo.color}40`
              }}>
                <h2 className="text-2xl font-bold mb-2" style={{ color: sectionInfo.color }}>
                  {sectionInfo.title}
                </h2>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  {sectionInfo.subtitle}
                </p>
                <p className="text-sm text-gray-600">
                  {sectionInfo.description}
                </p>
              </div>
            )}

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Question {currentQuestion + 1} of {JHS_QUESTIONS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Question */}
            <div className="text-center py-6" ref={questionRef}>
              <p className="text-xl text-gray-800 leading-relaxed">
                {question.text}
              </p>
            </div>

            {/* Emoji Response Scale */}
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600 font-semibold">
                How much does this sound like you?
              </p>
              <div className="grid grid-cols-5 gap-3">
                {EMOJI_SCALE.map((item) => (
                  <button
                    key={item.value}
                    onClick={() => handleResponse(item.value)}
                    className={`p-3 rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${
                      responses[currentQuestion] === item.value
                        ? 'ring-4 scale-110 shadow-lg'
                        : 'hover:scale-105 hover:shadow-md'
                    }`}
                    style={{
                      backgroundColor: responses[currentQuestion] === item.value
                        ? `${sectionInfo.color}20`
                        : 'white',
                      borderColor: responses[currentQuestion] === item.value
                        ? sectionInfo.color
                        : '#E5E7EB',
                      borderWidth: '2px',
                      ringColor: sectionInfo.color
                    }}
                  >
                    <div className="text-3xl sm:text-4xl">{item.emoji}</div>
                    <div className="text-[10px] sm:text-xs text-gray-700 font-medium leading-tight text-center">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={currentQuestion === 0 ? onCancel : handlePrevious}
                className="min-w-[120px]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {currentQuestion === 0 ? 'Cancel' : 'Previous'}
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed}
                  style={{ backgroundColor: canProceed ? '#5B7DB1' : undefined }}
                  className="min-w-[120px]"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  See My Results!
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed}
                  style={{ backgroundColor: canProceed ? sectionInfo.color : undefined }}
                  className="min-w-[120px]"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Helper message */}
            {!canProceed && (
              <p className="text-center text-sm text-gray-500">
                Please select an emoji above to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {showConfetti && <Confetti />}
      <SectionSummary />
    </div>
  );
}
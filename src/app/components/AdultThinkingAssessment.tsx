import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { adultQuestions } from '../utils/adultThinkingData';
import { calculateAdultScores, AdultResponse, AdultResults } from '../utils/adultScoring';
import { ArrowRight, ArrowLeft, CheckCircle, Briefcase, Target } from 'lucide-react';

interface AdultThinkingAssessmentProps {
  userId: string;
  onComplete: (results: AdultResults) => void;
  onCancel: () => void;
}

export function AdultThinkingAssessment({ userId, onComplete, onCancel }: AdultThinkingAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<AdultResponse[]>([]);
  const [showIntro, setShowIntro] = useState(true);

  const progress = ((responses.length / adultQuestions.length) * 100);
  const currentQuestionData = adultQuestions[currentQuestion];

  // Safety check - return loading if no question data
  if (!showIntro && !currentQuestionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-700 mx-auto mb-4"></div>
          <p className="text-slate-700">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Professional Likert scale options
  const likertOptions = [
    { value: 1, label: 'Strongly Disagree', color: 'bg-red-50 hover:bg-red-100 border-red-200 text-red-900', icon: '⊖' },
    { value: 2, label: 'Disagree', color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900', icon: '−' },
    { value: 3, label: 'Neutral', color: 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-900', icon: '○' },
    { value: 4, label: 'Agree', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900', icon: '+' },
    { value: 5, label: 'Strongly Agree', color: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900', icon: '⊕' }
  ];

  const handleResponse = (value: number) => {
    const newResponse: AdultResponse = {
      questionId: currentQuestionData.id,
      value
    };

    const updatedResponses = [...responses];
    const existingIndex = updatedResponses.findIndex(r => r.questionId === currentQuestionData.id);
    
    if (existingIndex >= 0) {
      updatedResponses[existingIndex] = newResponse;
    } else {
      updatedResponses.push(newResponse);
    }

    setResponses(updatedResponses);

    console.log('[AdultThinking] Response recorded:', { questionId: currentQuestionData.id, value, totalResponses: updatedResponses.length });

    // Auto-advance to next question
    if (currentQuestion < adultQuestions.length - 1) {
      console.log('[AdultThinking] Auto-advancing to next question');
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 250);
    } else {
      console.log('[AdultThinking] Last question - no auto-advance');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleNext = () => {
    console.log('[AdultThinking] Next button clicked', { 
      currentQuestion, 
      totalQuestions: adultQuestions.length,
      hasResponse: !!getCurrentResponse()
    });
    if (currentQuestion < adultQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      console.log('[AdultThinking] Moving to question', currentQuestion + 1);
    }
  };

  const handleSubmit = () => {
    console.log('[AdultThinking] Submit clicked with responses:', responses.length);
    const results = calculateAdultScores(responses);
    onComplete(results);
  };

  const getCurrentResponse = () => {
    if (!currentQuestionData) return undefined;
    return responses.find(r => r.questionId === currentQuestionData.id)?.value;
  };

  const getSectionColor = (section: string) => {
    if (section.includes('Creative')) return 'from-rose-600 to-pink-600';
    if (section.includes('Analytical')) return 'from-blue-600 to-cyan-600';
    if (section.includes('Practical')) return 'from-emerald-600 to-teal-600';
    if (section.includes('Reflective')) return 'from-purple-600 to-violet-600';
    return 'from-slate-600 to-gray-600';
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex items-center justify-center p-4">
        <Card className="max-w-3xl w-full border-2 border-slate-300 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Professional Thinking Styles Assessment
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Discover your professional thinking profile and unlock personalized career development insights
            </CardDescription>
            <Badge className="mx-auto mt-3 bg-gradient-to-r from-slate-700 to-slate-900 text-white px-4 py-1">
              For Professionals & Young Adults (Ages 19-25)
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 text-slate-900">Assess Your Thinking Style for Career Success:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎨</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Creative Thinking</p>
                    <p className="text-xs text-slate-600">Innovation & ideation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🔍</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Analytical Thinking</p>
                    <p className="text-xs text-slate-600">Data-driven reasoning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🛠️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Practical Thinking</p>
                    <p className="text-xs text-slate-600">Execution & results</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💭</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">Reflective Thinking</p>
                    <p className="text-xs text-slate-600">Self-awareness & insight</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-6 border-2 border-amber-200 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-700" />
                Unlock Your Career Roadmap (19-25)
              </h3>
              <p className="text-sm text-slate-700 mb-3">
                Designed for young adults exploring career pathways:
              </p>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5 font-bold">✓</span>
                  <span><strong>Explore career pathways</strong> that match your cognitive profile</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5 font-bold">✓</span>
                  <span><strong>Practice professional skills</strong> through daily challenges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5 font-bold">✓</span>
                  <span><strong>Boost self-awareness</strong> for interviews and leadership roles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5 font-bold">✓</span>
                  <span><strong>Identify growth areas</strong> for professional development</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-0.5 font-bold">✓</span>
                  <span><strong>Improve problem-solving</strong> and decision-making skills</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Assessment Details:</h3>
              <ul className="text-sm text-slate-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 mt-0.5">•</span>
                  <span><strong>24 professional statements</strong> across four thinking dimensions</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 mt-0.5">•</span>
                  <span>Rate each statement on a <strong>5-point scale</strong> based on your professional experience</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 mt-0.5">•</span>
                  <span>Reflect on your <strong>typical work behavior</strong> and preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 mt-0.5">•</span>
                  <span>Approximately <strong>8-10 minutes</strong> to complete</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-600 mt-0.5">•</span>
                  <span>Answer honestly for the most accurate career recommendations</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-300"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white shadow-lg"
                onClick={() => setShowIntro(false)}
              >
                Begin Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isComplete = responses.length === adultQuestions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className={`bg-gradient-to-r ${getSectionColor(currentQuestionData.section)} text-white px-4 py-2`}>
              {currentQuestionData.section}
            </Badge>
            <span className="text-sm font-medium text-slate-600">
              Question {currentQuestion + 1} of {adultQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-200" />
          <p className="text-xs text-slate-500 mt-2 text-right">{Math.round(progress)}% Complete</p>
        </div>

        {/* Question Card */}
        <Card className="border-2 border-slate-300 shadow-xl mb-6">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl text-slate-900 leading-relaxed font-normal">
              {currentQuestionData.text}
            </CardTitle>
            <CardDescription className="text-sm mt-3 text-slate-600">
              Rate this statement based on how accurately it describes your professional behavior and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {likertOptions.map((option) => {
              const isSelected = getCurrentResponse() === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${option.color} ${
                    isSelected ? 'ring-4 ring-offset-2 ring-slate-400 scale-[1.02] shadow-lg' : 'shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold">{option.icon}</span>
                      <span className="font-semibold">{option.label}</span>
                    </div>
                    {isSelected && <CheckCircle className="h-5 w-5 text-slate-700" />}
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2 border-slate-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex-1"></div>

          {isComplete ? (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg px-8"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              View Career Insights
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!getCurrentResponse()}
              className="bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
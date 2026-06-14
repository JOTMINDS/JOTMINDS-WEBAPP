import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { shsQuestions } from '../utils/shsThinkingData';
import { calculateSHSScores, SHSResponse, SHSResults } from '../utils/shsScoring';
import { ArrowRight, ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';

interface SHSThinkingAssessmentProps {
  userId: string;
  onComplete: (results: SHSResults) => void;
  onCancel: () => void;
}

export function SHSThinkingAssessment({ userId, onComplete, onCancel }: SHSThinkingAssessmentProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<SHSResponse[]>([]);
  const [showIntro, setShowIntro] = useState(true);

  const progress = ((responses.length / shsQuestions.length) * 100);
  const currentQuestionData = shsQuestions[currentQuestion];

  // Likert scale options
  const likertOptions = [
    { value: 1, label: 'Strongly Disagree', color: 'bg-red-100 hover:bg-red-200 border-red-300 text-red-900' },
    { value: 2, label: 'Disagree', color: 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-900' },
    { value: 3, label: 'Neutral', color: 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-900' },
    { value: 4, label: 'Agree', color: 'bg-blue-100 hover:bg-blue-200 border-blue-300 text-blue-900' },
    { value: 5, label: 'Strongly Agree', color: 'bg-green-100 hover:bg-green-200 border-green-300 text-green-900' }
  ];

  const handleResponse = (value: number) => {
    const newResponse: SHSResponse = {
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

    // Auto-advance to next question
    if (currentQuestion < shsQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(prev => prev + 1), 300);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    const results = calculateSHSScores(responses);
    onComplete(results);
  };

  const getCurrentResponse = () => {
    return responses.find(r => r.questionId === currentQuestionData.id)?.value;
  };

  const getSectionColor = (section: string) => {
    if (section.includes('Creative')) return 'from-pink-500 to-orange-500';
    if (section.includes('Analytical')) return 'from-blue-500 to-cyan-500';
    if (section.includes('Practical')) return 'from-green-500 to-teal-500';
    if (section.includes('Reflective')) return 'from-purple-500 to-indigo-500';
    return 'from-gray-500 to-gray-600';
  };

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 border-indigo-200 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              SHS Thinking Styles Assessment
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Discover your unique thinking patterns and find the perfect tertiary program
            </CardDescription>
            <Badge className="mx-auto mt-3 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
              For Senior High School Students (Ages 15-18)
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 border border-indigo-100">
              <h3 className="font-semibold text-lg mb-4 text-gray-900">What You'll Discover:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🎨</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Creative Thinking</p>
                    <p className="text-xs text-gray-600">Innovation & originality</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🔍</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Analytical Thinking</p>
                    <p className="text-xs text-gray-600">Logic & reasoning</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🛠️</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Practical Thinking</p>
                    <p className="text-xs text-gray-600">Real-world application</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">💭</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">Reflective Thinking</p>
                    <p className="text-xs text-gray-600">Self-awareness & insight</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-5 border border-yellow-200">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🎓</span>
                Get Personalized University Program Recommendations
              </h3>
              <p className="text-sm text-gray-700">
                Based on your thinking style profile, we'll recommend specific college and university programs that align with your strengths, along with career pathways and top schools in the Philippines.
              </p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
              <ul className="text-sm text-gray-700 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Answer 24 questions honestly using the 5-point scale</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Rate each statement from "Strongly Disagree" to "Strongly Agree"</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>There are no right or wrong answers - be authentic!</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>Takes approximately 6-8 minutes to complete</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white shadow-md"
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

  const isComplete = responses.length === shsQuestions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Badge className={`bg-gradient-to-r ${getSectionColor(currentQuestionData.section)} text-white px-4 py-1.5`}>
              {currentQuestionData.section}
            </Badge>
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {shsQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-gray-200" />
          <p className="text-xs text-gray-500 mt-2 text-right">{Math.round(progress)}% Complete</p>
        </div>

        {/* Question Card */}
        <Card className="border-2 border-indigo-200 shadow-xl mb-6">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900 leading-relaxed">
              {currentQuestionData.text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {likertOptions.map((option) => {
              const isSelected = getCurrentResponse() === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleResponse(option.value)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${option.color} ${
                    isSelected ? 'ring-4 ring-offset-2 ring-indigo-400 scale-105' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.label}</span>
                    {isSelected && <CheckCircle className="h-5 w-5 text-indigo-600" />}
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
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex-1"></div>

          {isComplete ? (
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg px-8"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              View Results
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => Math.min(prev + 1, shsQuestions.length - 1))}
              disabled={!getCurrentResponse()}
              className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white"
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

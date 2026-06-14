import { useState, useMemo, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Users, BookOpen, Gavel, Zap, GraduationCap, 
  Settings, Heart, Rocket, ChevronLeft, ChevronRight, Save, Shuffle
} from 'lucide-react';
import { teachingStyleQuestions } from '../utils/teachingStyleQuestions';
import { Question } from '../types';
import { toast } from 'sonner';

interface TeachingStyleAssessmentProps {
  onComplete: (responses: number[]) => void;
  onBack: () => void;
  initialResponses?: number[]; // Load saved progress (full 64-length array)
  initialQuestions?: Question[]; // Load saved subset
  initialPage?: number;
  onSaveProgress?: (responses: number[], currentSection: number, questions: Question[]) => void;
}

const responseOptions = [
  { value: 1, label: 'Strongly Disagree', emoji: '😟' },
  { value: 2, label: 'Disagree', emoji: '🙁' },
  { value: 3, label: 'Neutral', emoji: '😐' },
  { value: 4, label: 'Agree', emoji: '🙂' },
  { value: 5, label: 'Strongly Agree', emoji: '😊' },
];

export function TeachingStyleAssessment({ onComplete, onBack, initialResponses, initialQuestions, initialPage, onSaveProgress }: TeachingStyleAssessmentProps) {
  const [currentPage, setCurrentPage] = useState(initialPage || 0);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  
  // Store responses as an array indexed by question ID (0-based)
  // We initialize with empty values, or handled dynamically
  // Find max ID to ensure array is large enough (handling gaps in IDs)
  const maxQuestionId = useMemo(() => Math.max(...teachingStyleQuestions.map(q => q.id)), []);
  
  const [responses, setResponses] = useState<number[]>(
    initialResponses && initialResponses.length > 0 ? initialResponses : new Array(maxQuestionId).fill(0)
  );

  // Initialize questions
  useEffect(() => {
    if (initialQuestions && initialQuestions.length > 0) {
      setActiveQuestions(initialQuestions);
    } else {
      // Generate new subset
      const generated = generateAssessmentSubset();
      setActiveQuestions(generated);
    }
  }, []); // Run only on mount

  const generateAssessmentSubset = () => {
    // Pools definition based on Axes
    const pools = {
        authorityPos: [7, 18, 20, 22, 24, 93, 94, 96, 97, 99, 100, 101, 103, 104, 106, 162],
        authorityNeg: [1, 2, 6, 17, 19, 21, 23, 95, 98, 102, 105, 143, 158],
        knowledgePos: [11, 12, 13, 15, 16, 92, 163],
        knowledgeNeg: [9, 10, 14, 91, 130],
        assessmentPos: [34, 35, 36, 38, 40, 121, 122, 124, 125, 126, 128, 129, 131, 132, 133, 138, 146, 150],
        assessmentNeg: [33, 37, 39, 123, 127],
        climatePos: [50, 51, 53, 54, 55, 137, 155, 156, 157, 159],
        climateNeg: [49, 52, 56, 148],
        adaptPos: [42, 43, 44, 45, 47, 48, 107, 108, 110, 111, 112, 114, 115, 117, 118, 119, 120, 134, 144, 160],
        adaptNeg: [41, 46, 109, 113, 116, 140, 141, 145],
        motivationAll: [25, 26, 27, 28, 29, 30, 31, 32, 161, 164],
        innovationAll: [57, 58, 59, 60, 61, 62, 63, 64, 135, 136, 139, 142, 147, 149, 151, 152, 153, 154]
    };

    const getRandom = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];
    
    // Pick 12 questions ensuring coverage of key axes
    const selectedIds = [
        getRandom(pools.authorityPos),
        getRandom(pools.authorityNeg),
        getRandom(pools.knowledgePos),
        getRandom(pools.knowledgeNeg),
        getRandom(pools.assessmentPos),
        getRandom(pools.assessmentNeg),
        getRandom(pools.climatePos),
        getRandom(pools.climateNeg),
        getRandom(pools.adaptPos),
        getRandom(pools.adaptNeg),
        getRandom(pools.motivationAll),
        getRandom(pools.innovationAll)
    ];

    // Shuffle the result
    return selectedIds
        .sort(() => Math.random() - 0.5)
        .map(id => teachingStyleQuestions.find(q => q.id === id)!);
  };

  // Pagination Logic: 4 questions per page (3 pages total)
  const QUESTIONS_PER_PAGE = 4;
  const totalPages = Math.ceil(activeQuestions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = activeQuestions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE);

  // Calculate overall progress based on the ACTIVE subset
  const answeredCount = activeQuestions.filter(q => responses[q.id - 1] > 0).length;
  const totalActiveQuestions = activeQuestions.length;
  const progress = totalActiveQuestions > 0 ? (answeredCount / totalActiveQuestions) * 100 : 0;

  // Check if current page is complete
  const isPageComplete = currentQuestions.every(q => responses[q.id - 1] > 0);

  const handleResponse = (questionId: number, value: number) => {
    const newResponses = [...responses];
    newResponses[questionId - 1] = value;
    setResponses(newResponses);
  };

  const handleNextPage = () => {
    if (onSaveProgress) {
        onSaveProgress(responses, currentPage, activeQuestions);
    }

    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    } else {
      onComplete(responses);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveAndExit = () => {
    if (onSaveProgress) {
      onSaveProgress(responses, currentPage, activeQuestions);
      toast.success("Progress saved!");
    }
    onBack();
  };

  const isFullAssessment = activeQuestions.length > 20;

  if (activeQuestions.length === 0) {
      return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-4 rounded-xl shadow-sm border">
          <Button variant="ghost" onClick={handleSaveAndExit} className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Save & Exit
          </Button>
          <div className="flex items-center gap-2">
             <Badge variant="secondary" className="text-sm hidden sm:inline-flex">
                {isFullAssessment ? <BookOpen className="h-3 w-3 mr-1" /> : <Shuffle className="h-3 w-3 mr-1" />}
                {isFullAssessment ? "Standard Diagnostic" : "Adaptive Assessment"}
            </Badge>
            <span className="text-sm font-medium text-muted-foreground">
                Page {currentPage + 1}/{totalPages}
            </span>
          </div>
          {onSaveProgress && (
             <Button variant="outline" size="sm" onClick={() => {
                 onSaveProgress(responses, currentPage, activeQuestions);
                 toast.success("Progress saved!");
             }}>
                 <Save className="h-4 w-4 mr-2" />
                 Save
             </Button>
          )}
        </div>

        {/* Progress */}
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Assessment Progress</span>
                <span className="font-semibold">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground mt-2">
                  {isFullAssessment 
                    ? `Answering ${activeQuestions.length} selected questions for a robust profile analysis (Standard Diagnostic).` 
                    : `Answering ${activeQuestions.length} randomly selected questions to determine your teaching profile.`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-6">
            {currentQuestions.map((question, index) => {
                const responseValue = responses[question.id - 1];
                return (
                    <Card key={question.id} className={`border-2 transition-all ${responseValue > 0 ? 'border-green-200 bg-green-50/30 dark:border-green-900/50' : 'hover:border-indigo-200'}`}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Question {currentPage * QUESTIONS_PER_PAGE + index + 1} of {activeQuestions.length}</span>
                                {responseValue > 0 && <span className="text-green-600 text-sm font-medium flex items-center"><Save className="h-3 w-3 mr-1" /> Answered</span>}
                            </div>
                            <CardTitle className="text-lg leading-relaxed font-normal">
                                {question.text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 sm:gap-4 justify-between">
                                {responseOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleResponse(question.id, option.value)}
                                        className={`
                                            flex-1 min-w-[60px] flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                                            ${responseValue === option.value 
                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm scale-105' 
                                                : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50 text-gray-500'}
                                        `}
                                    >
                                        <span className="text-2xl mb-1 filter grayscale-[0.2]">{option.emoji}</span>
                                        <span className="text-[10px] sm:text-xs font-medium text-center">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-6 pb-12">
            <Button
            variant="outline"
            size="lg"
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="w-32"
            >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
            </Button>
            
            <Button
                size="lg"
                onClick={handleNextPage}
                disabled={!isPageComplete}
                className={`w-32 ${isPageComplete ? 'bg-indigo-600 hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'}`}
            >
                {currentPage < totalPages - 1 ? (
                    <>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                ) : (
                    'Finish'
                )}
            </Button>
        </div>
      </div>
    </div>
  );
}

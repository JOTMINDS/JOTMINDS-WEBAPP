import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useAuth } from './AuthContext';
import { ArrowLeft, ArrowRight, CheckCircle, Eye } from 'lucide-react';
import { AssessmentPreview } from './AssessmentPreview';
import { SectionSummary } from './SectionSummary';
import { ConfettiCelebration } from './ConfettiCelebration';
import { 
  fetchAssessmentQuestions, 
  autoSaveProgress, 
  submitAssessmentWithServerScoring 
} from '../utils/assessmentApi';

interface AssessmentProps {
  type: 'learning' | 'thinking' | 'decision';
  onComplete: (results: any) => void;
  onBack: () => void;
  showPreview?: boolean;
}

export const Assessment: React.FC<AssessmentProps> = ({ 
  type, 
  onComplete, 
  onBack,
  showPreview = true
}) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(showPreview);
  const [showSectionSummary, setShowSectionSummary] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [questionVersion, setQuestionVersion] = useState('v1');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  // Load questions from backend - will re-run on every mount due to key prop in App.tsx
  useEffect(() => {
    if (!user) return;

    const loadQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const framework = 
          type === 'learning' ? 'kolb' :
          type === 'thinking' ? 'sternberg' :
          'dual-process';
        
        // Fetch questions with randomization enabled and user-specific seed
        const data = await fetchAssessmentQuestions(framework, 'v1', {
          randomize: true,
          userId: user.id
        });
        
        setQuestions(data.questions);
        setQuestionVersion(data.version);
        
        // Verify question distribution (debugging)
        const styleDistribution: Record<string, number> = {};
        data.questions.forEach((q: any) => {
          styleDistribution[q.style] = (styleDistribution[q.style] || 0) + 1;
        });
        
        console.log(`[Assessment] ✅ NEW ASSESSMENT SESSION - Loaded ${data.questions.length} questions for ${framework}`, {
          randomized: data.randomized,
          seed: data.seed,
          timestamp: new Date().toISOString(),
          firstQuestionId: data.questions[0]?.id,
          lastQuestionId: data.questions[data.questions.length - 1]?.id,
          first5Questions: data.questions.slice(0, 5).map((q: any) => q.id),
          styleDistribution // Show how many questions of each style
        });
      } catch (error) {
        console.error('[Assessment] Failed to load questions:', error);
        // Fallback to local questions if backend fails
        const { learningStyleQuestions, thinkingStyleQuestions, decisionStyleQuestions, generatePersonalizedQuestions } = await import('../utils/assessmentData');
        const allQuestions = 
          type === 'learning' ? learningStyleQuestions :
          type === 'thinking' ? thinkingStyleQuestions :
          decisionStyleQuestions;
        const personalizedQuestions = generatePersonalizedQuestions(user.id, allQuestions);
        setQuestions(personalizedQuestions);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, [type, user]);

  // Auto-save progress every 3 seconds
  useEffect(() => {
    if (answers.length > 0 && user) {
      const autoSave = async () => {
        setIsSaving(true);
        try {
          await autoSaveProgress(type, currentIndex, answers, false);
        } catch (error) {
          console.error('[Assessment] Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      };

      const timeout = setTimeout(autoSave, 3000); // Changed to 3 seconds
      return () => clearTimeout(timeout);
    }
  }, [answers, currentIndex, type, user]);

  // Auto-scroll to next question after selection
  useEffect(() => {
    if (autoScrollEnabled && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentIndex, autoScrollEnabled]);

  // Check for section completion (every 5 questions)
  const checkSectionComplete = (questionIndex: number) => {
    return questionIndex > 0 && questionIndex % 5 === 0 && questionIndex < questions.length;
  };

  const getSectionMotivationalMessage = () => {
    const messages = [
      "You're doing great! Keep up the awesome work! 🌟",
      "Fantastic progress! You're really getting into it! 💪",
      "Amazing! You're more than halfway there! 🚀",
      "Excellent work! Almost at the finish line! 🎯",
      "Outstanding! One more section to go! 🏆"
    ];
    const sectionIndex = Math.floor(currentIndex / 5);
    return messages[Math.min(sectionIndex, messages.length - 1)];
  };

  const handleAnswer = () => {
    if (selectedOption === null) return;

    console.log('[Assessment] Handling answer for question', currentIndex);
    console.log('[Assessment] Selected option:', selectedOption);

    const currentQuestion = questions[currentIndex];
    const selectedOptionData = currentQuestion.options[selectedOption];

    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      selectedOption: selectedOptionData.text,
      selectedValue: selectedOptionData.value, // Likert scale value (1-5)
      selectedStyle: currentQuestion.style // Style is on the question, not the option
    };

    console.log('[Assessment] New answers array:', newAnswers);
    console.log('[Assessment] Answers length:', newAnswers.length);
    console.log('[Assessment] Questions length:', questions.length);

    setAnswers(newAnswers);

    // Check if section is complete (every 5 questions)
    const nextIndex = currentIndex + 1;
    if (checkSectionComplete(nextIndex)) {
      setShowSectionSummary(true);
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(nextIndex);
      setSelectedOption(newAnswers[nextIndex] ? 
        currentQuestion.options.findIndex((opt: any) => opt.text === newAnswers[nextIndex].selectedOption) : 
        null
      );
    } else {
      console.log('[Assessment] Last question answered!');
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (answers[currentIndex - 1]) {
        const prevQuestion = questions[currentIndex - 1];
        const answerIndex = prevQuestion.options.findIndex(
          (opt: any) => opt.text === answers[currentIndex - 1].selectedOption
        );
        setSelectedOption(answerIndex);
      } else {
        setSelectedOption(null);
      }
    }
  };

  const handleSubmit = async () => {
    if (answers.length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    // Show confetti immediately
    setShowConfetti(true);

    setIsSaving(true);

    try {
      // Pass user profile for personalized insights
      const userProfile = {
        age: user.age,
        role: user.role,
        educationLevel: user.user_metadata?.educationLevel || user.educationLevel,
        school: user.user_metadata?.school || user.school,
        position: user.user_metadata?.position || user.position,
        industrySector: user.user_metadata?.industrySector || user.industrySector,
        name: user.name
      };
      
      const results = await submitAssessmentWithServerScoring(
        type,
        answers,
        questionVersion,
        userProfile
      );

      // Wait for confetti to finish before completing
      setTimeout(() => {
        onComplete({
          results,
          completedAt: new Date().toISOString()
        });
      }, 4000);
    } catch (error) {
      console.error('Failed to submit assessment:', error);
      alert('Failed to submit assessment. Please try again.');
      setShowConfetti(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#5B7DB1' }}></div>
          <p>Loading assessment...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;
  const allQuestionsAnswered = answers.length === questions.length && answers.every(a => a !== undefined);
  
  // Check if current question is answered
  const currentQuestionAnswered = answers[currentIndex] !== undefined;

  console.log('[Assessment] Current state:');
  console.log('  - currentIndex:', currentIndex);
  console.log('  - isLastQuestion:', isLastQuestion);
  console.log('  - currentQuestionAnswered:', currentQuestionAnswered);
  console.log('  - answers.length:', answers.length);
  console.log('  - questions.length:', questions.length);
  console.log('  - allQuestionsAnswered:', allQuestionsAnswered);
  console.log('  - selectedOption:', selectedOption);

  const getAssessmentTitle = () => {
    switch (type) {
      case 'learning': return 'Your Learning Style';
      case 'thinking': return 'Your Thinking Style';
      case 'decision': return 'Your Decision Style';
    }
  };

  // Show preview modal first
  if (showPreviewModal) {
    return (
      <AssessmentPreview
        type={type}
        questionCount={questions.length}
        estimatedTime={Math.ceil(questions.length * 0.5)} // ~30 seconds per question
        onStart={() => setShowPreviewModal(false)}
        onClose={onBack}
      />
    );
  }

  // Show section summary
  if (showSectionSummary) {
    const sectionNumber = Math.floor(currentIndex / 5);
    const totalSections = Math.ceil(questions.length / 5);
    
    return (
      <>
        <SectionSummary
          sectionNumber={sectionNumber}
          totalSections={totalSections}
          questionsAnswered={currentIndex}
          totalQuestions={questions.length}
          sectionTitle={`Section ${sectionNumber}`}
          motivationalMessage={getSectionMotivationalMessage()}
          onContinue={() => {
            setShowSectionSummary(false);
            setCurrentIndex(currentIndex);
            setSelectedOption(answers[currentIndex] ? 
              questions[currentIndex].options.findIndex((opt: any) => 
                opt.text === answers[currentIndex].selectedOption
              ) : null
            );
          }}
        />
        <ConfettiCelebration show={showSectionSummary} />
      </>
    );
  }

  return (
    <>
      <ConfettiCelebration 
        show={showConfetti} 
        onComplete={() => setShowConfetti(false)} 
      />
      
      <div className="min-h-screen py-8 px-4" style={{ background: 'linear-gradient(to bottom, #F8F9FA 0%, #FFFFFF 100%)' }}>
        <div className="max-w-3xl mx-auto">
          {/* Header Section with strict spacing */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            {/* Title: 16px margin bottom */}
            <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h1 className="text-2xl" style={{ color: '#5B7DB1' }}>{getAssessmentTitle()}</h1>
              <span className="text-sm" style={{ color: '#6B7280' }}>
                Question {currentIndex + 1} of {questions.length}
              </span>
            </div>
            
            {/* Subtitle: 12px margin bottom */}
            <p className="text-sm" style={{ color: '#6B7280', marginBottom: '12px' }}>
              Select the option that best describes you
            </p>
            
            {/* Progress bar: 20px margin bottom - FIXED percentage calculation */}
            <Progress 
              value={Math.round((currentIndex + 1) / questions.length * 100)} 
              className="h-2" 
              style={{ marginBottom: '20px' }}
            />
            
            {isSaving && (
              <p className="text-xs" style={{ color: '#6B4C9A' }}>Saving progress...</p>
            )}
          </div>

          <Card className="shadow-lg" ref={cardRef}>
            {/* Question Section with improved spacing */}
            <CardHeader style={{ paddingBottom: '20px' }}>
              {/* Question text: 20px margin bottom, improved line-height for mobile */}
              <CardTitle 
                className="text-xl leading-relaxed max-w-2xl" 
                style={{ marginBottom: '0' }}
              >
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {/* Options: 12px spacing between options */}
              <RadioGroup
                value={selectedOption?.toString()}
                onValueChange={(value) => setSelectedOption(parseInt(value))}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {currentQuestion.options.map((option: any, index: number) => (
                    <div
                      key={index}
                      className={`flex items-center rounded-lg border-2 transition-all cursor-pointer ${
                        selectedOption === index
                          ? 'border-[#5B7DB1] bg-[#F0F0FF]'
                          : 'border-gray-200 hover:border-[#6B4C9A]'
                      }`}
                      style={{ 
                        padding: '12px 16px',
                        gap: '12px'
                      }}
                      onClick={() => setSelectedOption(index)}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label 
                        htmlFor={`option-${index}`} 
                        className="flex-1 cursor-pointer leading-normal"
                        style={{ margin: 0 }}
                      >
                        {option.text}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              {/* Navigation Buttons: 24px top, 12px bottom */}
              <div 
                className="flex items-center justify-between border-t" 
                style={{ marginTop: '24px', paddingTop: '24px', paddingBottom: '12px' }}
              >
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <div className="flex gap-3">
                  {/* On last question, show Next/Save button if current question not answered yet */}
                  {isLastQuestion && !currentQuestionAnswered && (
                    <Button
                      onClick={handleAnswer}
                      disabled={selectedOption === null}
                      style={{ backgroundColor: selectedOption !== null ? '#5B7DB1' : undefined }}
                    >
                      Save Answer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}

                  {/* Show Submit button on last question only if current question is answered */}
                  {isLastQuestion && currentQuestionAnswered && (
                    <Button
                      onClick={handleSubmit}
                      disabled={!allQuestionsAnswered || isSaving}
                      style={{ backgroundColor: allQuestionsAnswered ? '#FF715B' : undefined }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {isSaving ? 'Submitting...' : 'Submit Assessment'}
                    </Button>
                  )}

                  {/* On all other questions, show Next button */}
                  {!isLastQuestion && (
                    <Button
                      onClick={handleAnswer}
                      disabled={selectedOption === null}
                      style={{ backgroundColor: selectedOption !== null ? '#5B7DB1' : undefined }}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: '#F0F9FF', borderLeft: '4px solid #6B4C9A' }}>
            <p className="text-sm">
              <strong>Note:</strong> Questions are randomized for each assessment attempt to ensure a fresh experience. 
              Your progress is automatically saved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
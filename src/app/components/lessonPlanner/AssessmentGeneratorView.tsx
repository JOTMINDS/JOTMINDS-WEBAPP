import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FileCheck, Sparkles, CheckCircle2, HelpCircle, BookOpen, MessageSquare, Loader } from 'lucide-react';
import { GeneratedAssessment, LessonPlan } from '../../types/lessonPlannerTypes';
import { generateAILessonAssessment } from '../../utils/aiService';
import { toast } from 'sonner';

interface AssessmentGeneratorViewProps {
  plan?: LessonPlan;
  onAssessmentGenerated?: (assmt: GeneratedAssessment) => void;
}

export const AssessmentGeneratorView: React.FC<AssessmentGeneratorViewProps> = ({
  plan,
  onAssessmentGenerated
}) => {
  const [assessment, setAssessment] = useState<GeneratedAssessment>(
    plan?.assessment || {
      id: `assmt-${Date.now()}`,
      title: `${plan?.topic || 'Linear Equations'} Assessment Suite`,
      mcqs: [
        {
          id: 'mcq-1',
          type: 'mcq',
          question: 'What is the first step to solve the equation 2x + 4 = 12?',
          options: ['Subtract 4 from both sides', 'Divide both sides by 2', 'Add 4 to both sides', 'Multiply by 12'],
          correctAnswer: 'Subtract 4 from both sides',
          explanation: 'Subtract constant 4 first to isolate term 2x.'
        },
        {
          id: 'mcq-2',
          type: 'mcq',
          question: 'If 3y = 18, what is the value of y?',
          options: ['3', '6', '15', '21'],
          correctAnswer: '6',
          explanation: '18 divided by 3 equals 6.'
        },
        {
          id: 'mcq-3',
          type: 'mcq',
          question: 'Which of these is a linear equation in one variable?',
          options: ['x^2 + 5 = 9', '2x + 3y = 10', '4z - 7 = 13', 'x^3 = 27'],
          correctAnswer: '4z - 7 = 13',
          explanation: 'It has only one variable (z) and its highest power is 1.'
        },
        {
          id: 'mcq-4',
          type: 'mcq',
          question: 'If x/4 = 5, what is the value of x?',
          options: ['1', '9', '20', '1.25'],
          correctAnswer: '20',
          explanation: 'Multiply both sides by 4 to isolate x (5 * 4 = 20).'
        },
        {
          id: 'mcq-5',
          type: 'mcq',
          question: 'Translate to an equation: "Five less than twice a number is fifteen."',
          options: ['5 - 2x = 15', '2x - 5 = 15', '2(x - 5) = 15', '5x - 2 = 15'],
          correctAnswer: '2x - 5 = 15',
          explanation: '"Twice a number" is 2x, "five less than" means subtract 5.'
        },
        {
          id: 'mcq-6',
          type: 'mcq',
          question: 'What is the value of p if 7p - 2 = 12?',
          options: ['2', '4', '14', '7'],
          correctAnswer: '2',
          explanation: 'Add 2 to both sides to get 7p = 14, then divide by 7 to get p = 2.'
        },
        {
          id: 'mcq-7',
          type: 'mcq',
          question: 'Which equation represents "a number divided by 3 is equal to 9"?',
          options: ['3n = 9', 'n/3 = 9', 'n - 3 = 9', 'n + 3 = 9'],
          correctAnswer: 'n/3 = 9',
          explanation: '"A number divided by 3" is written as n/3.'
        },
        {
          id: 'mcq-8',
          type: 'mcq',
          question: 'If 5(x - 2) = 20, what is the value of x?',
          options: ['4', '6', '8', '2'],
          correctAnswer: '6',
          explanation: 'Divide by 5 first (x - 2 = 4), then add 2 (x = 6).'
        }
      ],
      shortAnswer: [
        {
          id: 'sa-1',
          type: 'short_answer',
          question: 'Solve for y: 4y - 8 = 16. Show your step-by-step working.',
          correctAnswer: 'Step 1: 4y = 24. Step 2: y = 6.'
        },
        {
          id: 'sa-2',
          type: 'short_answer',
          question: 'Solve for m: 3(m + 2) = 21',
          correctAnswer: 'Step 1: m + 2 = 7 (divide by 3). Step 2: m = 5.'
        },
        {
          id: 'sa-3',
          type: 'short_answer',
          question: 'A rectangle has a length of x+3 and a width of 4. If the perimeter is 28, find x.',
          correctAnswer: 'Perimeter = 2(length + width). 2(x+3 + 4) = 28 -> 2(x+7) = 28 -> x+7 = 14 -> x = 7.'
        },
        {
          id: 'sa-4',
          type: 'short_answer',
          question: 'Write a word problem that can be solved using the equation 2x + 5 = 15.',
          correctAnswer: 'Example: I bought 2 pens of the same price and a $5 notebook. My total was $15. How much was each pen?'
        },
        {
          id: 'sa-5',
          type: 'short_answer',
          question: 'Solve the equation: 5x + 7 = 2x + 16',
          correctAnswer: 'Subtract 2x from both sides: 3x + 7 = 16. Subtract 7: 3x = 9. Divide by 3: x = 3.'
        }
      ],
      discussion: [
        {
          id: 'disc-1',
          type: 'discussion',
          question: 'In a real-life taxi fare equation (Fare = $5 + $2/km), explain why the $5 base fee is considered a constant and the distance traveled is a variable.'
        },
        {
          id: 'disc-2',
          type: 'discussion',
          question: 'Why must we perform the same mathematical operation on BOTH sides of the equals sign when solving an equation?'
        },
        {
          id: 'disc-3',
          type: 'discussion',
          question: 'Compare and contrast solving 2x + 4 = 10 and 2(x + 4) = 10. Does the order of operations matter?'
        },
        {
          id: 'disc-4',
          type: 'discussion',
          question: 'How do you check your answer after solving an algebraic equation? Why is this step important?'
        },
        {
          id: 'disc-5',
          type: 'discussion',
          question: 'Can an equation have no solution? Discuss an example of when this might occur.'
        }
      ],
      practicalExercises: [
        {
          id: 'prac-1',
          type: 'practical',
          question: 'Using physical or drawn balance scales, model the equation x + 5 = 11 and demonstrate how removing 5 from both sides maintains balance.'
        },
        {
          id: 'prac-2',
          type: 'practical',
          question: 'Create a short skit or presentation explaining how to use opposite operations to find a hidden treasure (the unknown variable).'
        },
        {
          id: 'prac-3',
          type: 'practical',
          question: 'Use algebra tiles to construct the equation 3x - 2 = 7, then physically add two positive tiles to both sides.'
        },
        {
          id: 'prac-4',
          type: 'practical',
          question: 'Design a board game where players advance spaces by correctly identifying the next inverse operation needed to solve complex equations.'
        },
        {
          id: 'prac-5',
          type: 'practical',
          question: 'Measure various objects in the classroom and create linear equations representing their combined lengths.'
        }
      ],
      homework: [
        {
          id: 'hw-1',
          type: 'homework',
          question: 'Complete textbook page 45, questions 1 to 5 on linear equation word problems. Write a short real-world scenario representing the equation 3x + 2 = 14.'
        },
        {
          id: 'hw-2',
          type: 'homework',
          question: 'Find one example of a linear relationship in your home (e.g., cell phone bill, streaming subscription) and write an equation for it.'
        },
        {
          id: 'hw-3',
          type: 'homework',
          question: 'Solve the 10 mixed equations on Worksheet A. Highlight any steps where you made a mistake and explain how you fixed it.'
        },
        {
          id: 'hw-4',
          type: 'homework',
          question: 'Interview a parent or guardian about how they use math or budgets in their daily work, and formulate one linear equation from their example.'
        },
        {
          id: 'hw-5',
          type: 'homework',
          question: 'Create a 5-question quiz on solving linear equations for a classmate, including an answer key with full working steps.'
        }
      ]
    }
  );

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAssessment = async () => {
    setIsGenerating(true);
    toast.info('Generating Assessment Questions...');

    const res = await generateAILessonAssessment({
      subject: plan?.subject || 'Mathematics',
      topic: plan?.topic || 'Linear Equations',
      gradeClass: plan?.gradeClass || 'JHS 2'
    });

    setIsGenerating(false);

    if (res?.mcqs) {
      setAssessment(res);
      if (onAssessmentGenerated) onAssessmentGenerated(res);
      toast.success('Fresh Assessment Suite generated successfully!');
    } else {
      toast.success('Assessment items refreshed!');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-indigo-800/30 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-400/30 px-3 py-0.5 text-xs">
              Module 4 • Assessment Generator
            </Badge>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 px-3 py-0.5 text-xs">
              Auto-Generated Assessment Suite
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" /> Multi-Format Assessment & Homework Generator
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Generate Multiple Choice Questions, Short Answers, Discussion Prompts, Practical Exercises, and Homework.
          </p>
        </div>

        <Button
          onClick={handleGenerateAssessment}
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md"
        >
          {isGenerating ? <Loader className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          Generate Full Assessment Suite
        </Button>
      </div>

      {/* Tabs for Question Formats */}
      <Tabs defaultValue="mcqs" className="w-full">
        <TabsList className="flex overflow-x-auto scrollbar-none p-1 rounded-xl bg-slate-100 dark:bg-slate-900 sm:grid sm:grid-cols-5">
          <TabsTrigger value="mcqs" className="text-xs font-semibold">
            MCQs ({assessment.mcqs.length})
          </TabsTrigger>
          <TabsTrigger value="short_answer" className="text-xs font-semibold">
            Short Answer ({assessment.shortAnswer.length})
          </TabsTrigger>
          <TabsTrigger value="discussion" className="text-xs font-semibold">
            Discussion ({assessment.discussion.length})
          </TabsTrigger>
          <TabsTrigger value="practical" className="text-xs font-semibold">
            Practical ({assessment.practicalExercises.length})
          </TabsTrigger>
          <TabsTrigger value="homework" className="text-xs font-semibold">
            Homework ({assessment.homework.length})
          </TabsTrigger>
        </TabsList>

        {/* MCQs */}
        <TabsContent value="mcqs" className="space-y-4 mt-4">
          {assessment.mcqs.map((q, idx) => (
            <Card key={idx} className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    Q{idx + 1}. {q.question}
                  </h4>
                  <Badge variant="outline" className="text-[10px]">Multiple Choice</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options?.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
                        opt === q.correctAnswer
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
                      }`}
                    >
                      <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                      {opt === q.correctAnswer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                    💡 <strong>Explanation:</strong> {q.explanation}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Short Answer */}
        <TabsContent value="short_answer" className="space-y-4 mt-4">
          {assessment.shortAnswer.map((q, idx) => (
            <Card key={idx} className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Q{idx + 1}. {q.question}
                </h4>
                {q.correctAnswer && (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider block">
                      Sample Answer & Key:
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{q.correctAnswer}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Discussion */}
        <TabsContent value="discussion" className="space-y-4 mt-4">
          {assessment.discussion.map((q, idx) => (
            <Card key={idx} className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <span>Discussion Prompt {idx + 1}: {q.question}</span>
                </h4>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Practical */}
        <TabsContent value="practical" className="space-y-4 mt-4">
          {assessment.practicalExercises.map((q, idx) => (
            <Card key={idx} className="shadow-xs border-slate-200 dark:border-slate-800">
              <CardContent className="p-5 space-y-2">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Practical Task {idx + 1}: {q.question}
                </h4>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Homework */}
        <TabsContent value="homework" className="space-y-4 mt-4">
          {assessment.homework.map((q, idx) => (
            <Card key={idx} className="shadow-xs border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
              <CardContent className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-purple-600 text-white text-xs">Auto-Generated Homework Task</Badge>
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {q.question}
                </h4>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

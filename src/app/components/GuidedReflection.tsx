import { useState } from 'react';
import { Lightbulb, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ReflectionPrompt {
  question: string;
  placeholder: string;
  sampleResponse: string;
}

interface GuidedReflectionProps {
  cognitiveStyle: string;
  assessmentType: string;
  onSaveReflection?: (reflections: Record<string, string>) => void;
}

export function GuidedReflection({ cognitiveStyle, assessmentType, onSaveReflection }: GuidedReflectionProps) {
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [showSamples, setShowSamples] = useState<Record<string, boolean>>({});

  const getPrompts = (): ReflectionPrompt[] => {
    const basePrompts: ReflectionPrompt[] = [
      {
        question: "What surprised you most about your results?",
        placeholder: "Reflect on any unexpected findings...",
        sampleResponse: `I was surprised to discover that I'm a ${cognitiveStyle} thinker. I always thought I was more analytical, but now I see how my preference for ${assessmentType === 'kolb' ? 'hands-on learning' : 'creative problem-solving'} shows up in my daily study habits.`
      },
      {
        question: "How does this profile show up in your current academic life?",
        placeholder: "Think about specific examples from classes or assignments...",
        sampleResponse: `In my chemistry class, I notice that I ${getStyleBehavior()}. This matches my ${cognitiveStyle} profile perfectly.`
      },
      {
        question: "What's one study habit you want to change based on these insights?",
        placeholder: "Be specific about what you'll do differently...",
        sampleResponse: `Based on my results, I want to ${getActionableChange()}. I'll start by ${getSpecificAction()} this week.`
      },
      {
        question: "How can you use these insights in your next exam preparation?",
        placeholder: "Create a concrete plan...",
        sampleResponse: `For my upcoming exams, I'll ${getExamStrategy()}. This aligns with my strengths as a ${cognitiveStyle} learner.`
      },
      {
        question: "Which career path from the recommendations resonates most with you? Why?",
        placeholder: "Connect the career to your interests and strengths...",
        sampleResponse: "The career in [specific field] resonates with me because I've always enjoyed [specific activity], and I can see how my strengths in [specific skill] would help me succeed."
      }
    ];

    return basePrompts;
  };

  const getStyleBehavior = (): string => {
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return 'prefer to watch demonstrations first before trying experiments myself, and I often think deeply about what we learned after class';
        case 'assimilating':
          return 'take detailed notes and organize them into structured outlines, spending time understanding theories before applying them';
        case 'converging':
          return 'immediately want to test concepts through experiments and practical applications';
        case 'accommodating':
          return 'learn best by jumping into lab work and figuring things out through trial and error';
        default:
          return 'approach learning in a balanced way';
      }
    }

    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return 'always analyze problems step-by-step and compare different solutions before choosing one';
        case 'creative':
          return "often come up with unusual solutions that my classmates haven't thought of";
        case 'practical':
          return 'focus on how concepts apply to real-world situations and everyday problems';
        default:
          return 'combine different thinking approaches';
      }
    }

    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'intuitive':
          return 'often make quick decisions based on patterns I recognize, which usually turn out right';
        case 'reflective':
          return 'take time to think through all options carefully before making decisions';
        default:
          return 'balance quick intuition with careful analysis';
      }
    }

    return 'approach learning systematically';
  };

  const getActionableChange = (): string => {
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return 'schedule regular reflection time after classes and join a study group to discuss different perspectives';
        case 'assimilating':
          return 'create more visual concept maps to organize my notes and allocate quiet study time without distractions';
        case 'converging':
          return 'solve more practice problems instead of just reading notes, and test concepts through hands-on application';
        case 'accommodating':
          return 'create more opportunities for active learning and teach concepts to others to solidify understanding';
        default:
          return 'adapt my study methods to match my natural learning style';
      }
    }

    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return 'break down complex topics into smaller analytical steps and create comparison charts';
        case 'creative':
          return 'use more colorful mind maps and creative memory techniques like storytelling';
        case 'practical':
          return 'connect every concept to real-world examples and focus on practical application';
        default:
          return 'leverage my thinking strengths more intentionally';
      }
    }

    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'intuitive':
          return 'trust my instincts more during exams while having a quick review strategy';
        case 'reflective':
          return 'allocate more time for thorough review and deliberate practice';
        default:
          return 'balance intuition with analysis based on the situation';
      }
    }

    return 'optimize my study approach';
  };

  const getSpecificAction = (): string => {
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return 'joining a study group and keeping a reflection journal';
        case 'assimilating':
          return 'creating detailed Cornell notes and reviewing them systematically';
        case 'converging':
          return 'solving 5 practice problems daily';
        case 'accommodating':
          return 'explaining concepts to my roommate after each class';
        default:
          return 'trying new study techniques';
      }
    }
    return 'implementing my new strategy';
  };

  const getExamStrategy = (): string => {
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return 'organize study group discussions to explore different perspectives, then reflect on key concepts in my journal';
        case 'assimilating':
          return 'create comprehensive study guides organized by topic, then review them in quiet 2-hour blocks';
        case 'converging':
          return 'focus on solving past exam questions and practicing application problems';
        case 'accommodating':
          return 'create flashcards and study while walking, explaining concepts aloud to myself';
        default:
          return 'use a balanced study approach';
      }
    }

    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return 'break down each topic into logical components and create comparison tables';
        case 'creative':
          return 'make colorful mind maps linking all concepts and create memory stories';
        case 'practical':
          return 'apply each concept to real scenarios and focus on practical problem-solving';
        default:
          return 'combine different thinking approaches';
      }
    }

    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'intuitive':
          return 'do quick review sessions to reinforce patterns, then trust my instincts during the exam';
        case 'reflective':
          return 'start studying early with thorough, systematic review sessions';
        default:
          return 'balance quick pattern recognition with careful analysis';
      }
    }

    return 'optimize my exam preparation';
  };

  const prompts = getPrompts();

  const handleReflectionChange = (index: number, value: string) => {
    setReflections(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const toggleSample = (index: number) => {
    setShowSamples(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleSave = () => {
    if (onSaveReflection) {
      onSaveReflection(reflections);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <CardTitle>Guided Reflection</CardTitle>
        </div>
        <CardDescription>
          Take a moment to reflect on your results and what they mean for you
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {prompts.map((prompt, index) => (
          <div key={index} className="space-y-2">
            {/* Question */}
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500 mt-1 flex-shrink-0" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                {prompt.question}
              </h4>
            </div>

            {/* Sample Toggle */}
            <button
              onClick={() => toggleSample(index)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {showSamples[index] ? (
                <>
                  Hide sample response <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Show sample response <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Sample Response */}
            {showSamples[index] && (
              <div className="bg-amber-50 dark:bg-amber-950 p-3 rounded-lg border-l-4 border-amber-400">
                <p className="text-sm text-amber-900 dark:text-amber-100 italic">
                  <strong>Sample:</strong> {prompt.sampleResponse}
                </p>
              </div>
            )}

            {/* Text Area */}
            <Textarea
              placeholder={prompt.placeholder}
              value={reflections[index] || ''}
              onChange={(e) => handleReflectionChange(index, e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        ))}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>
            Save Reflections
          </Button>
        </div>

        {/* Reflection Tips */}
        <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg mt-6">
          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
            💡 Reflection Tips
          </h4>
          <ul className="space-y-1 text-sm text-purple-800 dark:text-purple-200">
            <li>• Be honest and specific - there are no wrong answers</li>
            <li>• Connect insights to real experiences from your studies</li>
            <li>• Think about actionable changes you can make this week</li>
            <li>• Return to these reflections after your next exam to see your progress</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
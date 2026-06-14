import { BookOpen, Clock, FileText, Brain, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface StudyStrategy {
  timeOfDay: string;
  studyPattern: string;
  noteTakingMethod: string;
  revisionFrequency: string;
  memoryTechniques: string[];
}

interface StudyStrategyGeneratorProps {
  cognitiveStyle: string;
  assessmentType: string;
}

export function StudyStrategyGenerator({ cognitiveStyle, assessmentType }: StudyStrategyGeneratorProps) {
  const getStrategy = (): StudyStrategy => {
    // Kolb Learning Styles
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return {
            timeOfDay: 'Morning or late afternoon (when you can reflect)',
            studyPattern: 'Mix of group discussions and solo reflection',
            noteTakingMethod: 'Mind maps, visual diagrams, and reflective journaling',
            revisionFrequency: 'Weekly with peer discussions',
            memoryTechniques: ['Create visual connections', 'Relate to personal experiences', 'Use group study sessions', 'Record and review lecture notes']
          };
        case 'assimilating':
          return {
            timeOfDay: 'Morning (when mind is fresh for logical thinking)',
            studyPattern: 'Long, focused study blocks with minimal interruption',
            noteTakingMethod: 'Cornell Notes, detailed outlines, and structured summaries',
            revisionFrequency: 'Regular review sessions (daily for key concepts)',
            memoryTechniques: ['Create logical frameworks', 'Build concept maps', 'Summarize in own words', 'Use systematic review schedules']
          };
        case 'converging':
          return {
            timeOfDay: 'Afternoon (when energy is high for practical work)',
            studyPattern: 'Shorter sessions with hands-on practice',
            noteTakingMethod: 'Bullet points with problem-solving examples',
            revisionFrequency: 'Practice-based review (solve problems regularly)',
            memoryTechniques: ['Practice application', 'Work through examples', 'Create solution templates', 'Use flashcards for formulas']
          };
        case 'accommodating':
          return {
            timeOfDay: 'Flexible - mix throughout the day',
            studyPattern: 'Dynamic sessions with movement and variety',
            noteTakingMethod: 'Quick sketches, action points, and experiment notes',
            revisionFrequency: 'As-needed before deadlines',
            memoryTechniques: ['Learn by doing', 'Create physical models', 'Use movement while studying', 'Group work and teaching others']
          };
        default:
          return getDefaultStrategy();
      }
    }

    // Sternberg Thinking Styles
    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return {
            timeOfDay: 'Morning (peak cognitive hours)',
            studyPattern: 'Structured, systematic study sessions',
            noteTakingMethod: 'Detailed Cornell Notes with analysis sections',
            revisionFrequency: 'Daily review with weekly synthesis',
            memoryTechniques: ['Break down complex topics', 'Compare and contrast', 'Create logical chains', 'Use critical analysis']
          };
        case 'creative':
          return {
            timeOfDay: 'Late morning or evening (when creativity flows)',
            studyPattern: 'Flexible sessions with brainstorming breaks',
            noteTakingMethod: 'Mind maps, doodles, and creative connections',
            revisionFrequency: 'Periodic creative review sessions',
            memoryTechniques: ['Make creative associations', 'Use colorful notes', 'Invent memory stories', 'Link to unique examples']
          };
        case 'practical':
          return {
            timeOfDay: 'Afternoon (application-focused time)',
            studyPattern: 'Short, focused sessions with real-world practice',
            noteTakingMethod: 'Action-oriented notes with examples',
            revisionFrequency: 'Before exams with practical application',
            memoryTechniques: ['Apply to real situations', 'Use practical examples', 'Create checklists', 'Practice with case studies']
          };
        default:
          return getDefaultStrategy();
      }
    }

    // Dual-Process Decision Styles
    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'intuitive':
        case 'balanced':
          return {
            timeOfDay: 'Morning (trust your fresh instincts)',
            studyPattern: 'Quick review sessions with intuitive connections',
            noteTakingMethod: 'Key points with pattern recognition',
            revisionFrequency: 'Regular but brief reviews',
            memoryTechniques: ['Trust first impressions', 'Make quick connections', 'Use pattern recognition', 'Rely on context cues']
          };
        case 'reflective':
          return {
            timeOfDay: 'Evening (when you can think deeply)',
            studyPattern: 'Long, deliberate study blocks',
            noteTakingMethod: 'Cornell Notes with reflection sections',
            revisionFrequency: 'Thorough weekly reviews',
            memoryTechniques: ['Deep processing', 'Elaborate on details', 'Self-questioning', 'Spaced repetition with analysis']
          };
        default:
          return getDefaultStrategy();
      }
    }

    return getDefaultStrategy();
  };

  const getDefaultStrategy = (): StudyStrategy => ({
    timeOfDay: 'Morning or afternoon (when most alert)',
    studyPattern: 'Balanced mix of focused study and breaks',
    noteTakingMethod: 'Cornell Notes or organized outlines',
    revisionFrequency: 'Weekly review sessions',
    memoryTechniques: ['Active recall', 'Spaced repetition', 'Practice testing', 'Teach others']
  });

  const strategy = getStrategy();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <CardTitle>Your Personalized Study Strategy</CardTitle>
        </div>
        <CardDescription>
          Based on your {cognitiveStyle} profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Best Study Time */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Best Study Time
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {strategy.timeOfDay}
            </p>
          </div>
        </div>

        {/* Study Pattern */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Recommended Study Pattern
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {strategy.studyPattern}
            </p>
          </div>
        </div>

        {/* Note-Taking Method */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Best Note-Taking Method
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {strategy.noteTakingMethod}
            </p>
          </div>
        </div>

        {/* Revision Frequency */}
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Ideal Revision Frequency
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {strategy.revisionFrequency}
            </p>
          </div>
        </div>

        {/* Memory Techniques */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Memory Techniques for You
          </h4>
          <ul className="space-y-2">
            {strategy.memoryTechniques.map((technique, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
                <span className="text-gray-600 dark:text-gray-400">{technique}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Example Application */}
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg mt-4">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Example:</strong> {getExampleText()}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  function getExampleText(): string {
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return "Before an exam, organize a study group to discuss key concepts. After, reflect on what you learned in a journal.";
        case 'assimilating':
          return "Use Cornell Notes to organize lecture content, then create a one-page summary of key theories before exams.";
        case 'converging':
          return "Practice 5 different problem types daily, timing yourself to build speed and accuracy.";
        case 'accommodating':
          return "Create a physical model or teach a friend to solidify your understanding of complex topics.";
        default:
          return "Mix different study methods based on the subject matter and your energy levels.";
      }
    }

    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return "Break down each chapter into logical sections, analyze relationships, and create comparison charts.";
        case 'creative':
          return "Use colorful mind maps to connect ideas across chapters, creating stories to remember key concepts.";
        case 'practical':
          return "Apply each concept to a real-world scenario you've experienced or observed.";
        default:
          return "Combine analysis, creativity, and practical application for comprehensive understanding.";
      }
    }

    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'reflective':
          return "Allocate 2-hour blocks for deep study with Cornell Notes, reviewing each section before moving on.";
        default:
          return "Use quick review sessions to reinforce key patterns and trust your instincts during exams.";
      }
    }

    return "Adapt your study methods based on what works best for each subject.";
  }
}

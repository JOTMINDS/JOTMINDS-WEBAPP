import { TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface AcademicSuccessTipsProps {
  cognitiveStyle: string;
  assessmentType: string;
}

interface Tip {
  category: string;
  tips: string[];
}

export function AcademicSuccessTips({ cognitiveStyle, assessmentType }: AcademicSuccessTipsProps) {
  const getTips = (): Tip[] => {
    // Kolb Learning Styles
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return [
            {
              category: 'Study Environment',
              tips: [
                'Create a calm, quiet space for reflection and deep thinking',
                'Use calming background music or nature sounds while studying',
                'Keep a reflection journal next to your study area'
              ]
            },
            {
              category: 'Learning Strategies',
              tips: [
                'Join or form study groups to explore different perspectives',
                'Watch educational videos before reading textbook chapters',
                'Connect new concepts to personal experiences or stories',
                'Take time to reflect after each study session - ask "What did I learn?"'
              ]
            },
            {
              category: 'Exam Preparation',
              tips: [
                'Discuss potential exam questions with classmates',
                'Create mind maps showing connections between topics',
                'Review your reflection journal to remember key insights',
                'Practice explaining concepts from multiple viewpoints'
              ]
            }
          ];

        case 'assimilating':
          return [
            {
              category: 'Study Environment',
              tips: [
                'Designate a quiet, organized workspace free from distractions',
                'Keep all materials (textbooks, notes, pens) systematically arranged',
                'Use good lighting and ensure proper desk setup for long study sessions'
              ]
            },
            {
              category: 'Learning Strategies',
              tips: [
                'Use Cornell Notes method for all lectures',
                'Create detailed outlines before exams summarizing each chapter',
                'Read textbook chapters before class to maximize understanding',
                'Focus on understanding theories and principles before memorizing facts',
                'Create concept maps showing logical relationships between ideas'
              ]
            },
            {
              category: 'Exam Preparation',
              tips: [
                'Start reviewing 2-3 weeks before exams',
                'Organize study material by topic and subtopic',
                'Create one-page summaries for each major concept',
                'Study in focused 2-hour blocks with 15-minute breaks'
              ]
            }
          ];

        case 'converging':
          return [
            {
              category: 'Study Environment',
              tips: [
                'Set up a workspace where you can spread out practice problems',
                'Keep a whiteboard nearby for working through solutions',
                'Have access to practical tools, models, or equipment relevant to your subjects'
              ]
            },
            {
              category: 'Learning Strategies',
              tips: [
                'Solve practice problems immediately after learning new concepts',
                'Focus on application rather than just reading theory',
                'Create step-by-step solution guides for common problem types',
                'Test concepts through hands-on experiments or simulations',
                'Time yourself solving problems to build speed'
              ]
            },
            {
              category: 'Exam Preparation',
              tips: [
                'Solve past exam questions extensively',
                'Practice under timed conditions',
                'Focus on understanding the methodology behind solutions',
                'Create formula sheets with worked examples'
              ]
            }
          ];

        case 'accommodating':
          return [
            {
              category: 'Study Environment',
              tips: [
                'Create a flexible study space where you can move around',
                'Study in varied locations (library, home, outdoors) to stay engaged',
                'Keep your space energetic with good lighting and motivating visuals'
              ]
            },
            {
              category: 'Learning Strategies',
              tips: [
                'Study while walking or moving to retain information better',
                'Teach concepts to friends or family members',
                'Use flashcards for quick, active review sessions',
                'Create physical models or demonstrations of concepts',
                'Take frequent short breaks and switch between subjects'
              ]
            },
            {
              category: 'Exam Preparation',
              tips: [
                'Create study games or challenges with classmates',
                'Use active recall by explaining topics aloud',
                'Practice with real-world applications and examples',
                'Form last-minute study groups for dynamic review'
              ]
            }
          ];

        default:
          return getDefaultTips();
      }
    }

    // Sternberg Thinking Styles
    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return [
            {
              category: 'Study Approach',
              tips: [
                'Break complex topics into smaller, logical components',
                'Create comparison charts for similar concepts',
                'Question everything - ask "why" and "how" constantly',
                'Verify information from multiple reliable sources'
              ]
            },
            {
              category: 'Note-Taking',
              tips: [
                'Use structured note-taking systems (Cornell Notes, Outline method)',
                'Highlight logical connections between ideas',
                'Create pro/con lists when learning about different approaches',
                'Add your own analytical comments to lecture notes'
              ]
            },
            {
              category: 'Time Management',
              tips: [
                'Allocate extra time for deep analysis of challenging topics',
                'Schedule regular review sessions to check your understanding',
                'Plan study sessions around your peak analytical hours (usually morning)',
                'Allow buffer time for thorough exam preparation'
              ]
            }
          ];

        case 'creative':
          return [
            {
              category: 'Study Approach',
              tips: [
                'Use colorful notes, doodles, and visual elements',
                'Create memory stories or mnemonics for facts',
                'Link concepts to unusual or unexpected examples',
                'Generate your own creative questions about material'
              ]
            },
            {
              category: 'Note-Taking',
              tips: [
                'Use mind maps with colors, symbols, and drawings',
                'Create visual metaphors for abstract concepts',
                'Design your own diagrams even when the book provides them',
                'Use different colored pens for different types of information'
              ]
            },
            {
              category: 'Time Management',
              tips: [
                'Schedule study sessions when you feel most creative (often evening)',
                'Allow brainstorming time before structured study',
                'Take creative breaks (draw, write, imagine) between study blocks',
                'Mix subjects creatively rather than studying one at a time'
              ]
            }
          ];

        case 'practical':
          return [
            {
              category: 'Study Approach',
              tips: [
                'Connect every concept to real-world applications',
                'Ask "How would I use this?" for each topic',
                'Find practical examples from daily life for abstract ideas',
                'Focus on actionable knowledge over pure theory'
              ]
            },
            {
              category: 'Note-Taking',
              tips: [
                'Write practical examples next to theoretical concepts',
                'Create "action lists" - what to do with the information',
                'Note real-world contexts where concepts apply',
                'Keep notes concise and application-focused'
              ]
            },
            {
              category: 'Time Management',
              tips: [
                'Study when you can immediately apply the knowledge',
                'Prioritize subjects/topics with clear practical value',
                'Use short, focused study sessions with immediate practice',
                'Schedule review sessions before practical exams or projects'
              ]
            }
          ];

        default:
          return getDefaultTips();
      }
    }

    // Dual-Process Decision Styles
    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'intuitive':
        case 'balanced':
          return [
            {
              category: 'Learning Strategy',
              tips: [
                'Trust your pattern recognition - if something feels off, investigate',
                'Use quick review methods like flashcards',
                'Learn to recognize question patterns in exams',
                'Balance intuition with key facts verification'
              ]
            },
            {
              category: 'Exam Strategy',
              tips: [
                'Go with your first instinct on multiple choice questions',
                'Quick scan of the entire exam before starting',
                'Trust pattern recognition for familiar question types',
                'Only change answers if you spot a clear error'
              ]
            }
          ];

        case 'reflective':
          return [
            {
              category: 'Learning Strategy',
              tips: [
                'Allocate ample time for deep processing of material',
                'Use spaced repetition with thorough review sessions',
                'Write reflective summaries after study sessions',
                'Analyze errors carefully to understand root causes'
              ]
            },
            {
              category: 'Exam Strategy',
              tips: [
                'Start studying well in advance (3-4 weeks before exams)',
                'Read questions carefully and plan answers before writing',
                'Allocate time to review all answers before submitting',
                'Practice with time limits to balance thoroughness with speed'
              ]
            }
          ];

        default:
          return getDefaultTips();
      }
    }

    return getDefaultTips();
  };

  function getDefaultTips(): Tip[] {
    return [
      {
        category: 'General Study Tips',
        tips: [
          'Study consistently rather than cramming',
          'Take regular breaks to maintain focus',
          'Stay organized with a study schedule',
          'Ask questions when concepts are unclear'
        ]
      }
    ];
  }

  const tips = getTips();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          <CardTitle>Academic Success Tips</CardTitle>
        </div>
        <CardDescription>
          Personalized strategies for your {cognitiveStyle} learning profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {tips.map((tipCategory, index) => (
          <div key={index}>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <span className="text-blue-600 dark:text-blue-400">📚</span>
              {tipCategory.category}
            </h3>
            <ul className="space-y-2">
              {tipCategory.tips.map((tip, tipIndex) => (
                <li key={tipIndex} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Weekly Challenge */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg mt-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
            <span>🎯</span> This Week's Challenge
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {getWeeklyChallenge()}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            Try this for one week and notice the difference in your learning!
          </p>
        </div>
      </CardContent>
    </Card>
  );

  function getWeeklyChallenge(): string {
    if (assessmentType === 'kolb') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'diverging':
          return 'Form a study group with 3-4 classmates. Spend 30 minutes discussing one topic from different perspectives, then reflect individually on what you learned.';
        case 'assimilating':
          return 'For your most challenging subject, create a comprehensive one-page concept map showing all relationships between ideas. Use this as your primary review tool.';
        case 'converging':
          return 'Solve 5 practice problems daily in your weakest subject. Time yourself and track your improvement over the week.';
        case 'accommodating':
          return 'Teach one concept from each of your subjects to a friend or family member. Explain it in your own words while moving or using props.';
        default:
          return 'Try a new study technique this week and note how it affects your understanding.';
      }
    }

    if (assessmentType === 'sternberg') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'analytical':
          return 'For each topic you study, create a comparison chart showing similarities and differences with related concepts. Identify patterns across topics.';
        case 'creative':
          return 'Create a colorful visual study guide for one subject using mind maps, doodles, and creative connections. Make it visually memorable.';
        case 'practical':
          return 'Find 3 real-world examples for every abstract concept you learn this week. Connect theory to daily life.';
        default:
          return 'Apply one new study strategy each day this week.';
      }
    }

    if (assessmentType === 'dual-process') {
      switch (cognitiveStyle.toLowerCase()) {
        case 'reflective':
          return 'After each study session, write a 5-minute reflection on what you learned, what confused you, and what connections you made.';
        default:
          return 'Practice quick review sessions (10-15 minutes) before bed to reinforce key patterns and concepts.';
      }
    }

    return 'Choose one tip from above and commit to practicing it daily this week.';
  }
}

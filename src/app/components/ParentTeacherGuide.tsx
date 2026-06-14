import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Download, BookOpen, Heart, Lightbulb, Target, Users } from 'lucide-react';

interface ParentTeacherGuideProps {
  childName?: string;
  results?: {
    creative: number;
    analytical: number;
    practical: number;
    reflective: number;
  };
}

export function ParentTeacherGuide({ childName = "your child", results }: ParentTeacherGuideProps) {
  const thinkingStyles = [
    {
      emoji: '🎨',
      name: 'Creative Thinking',
      friendlyName: 'The Imagination Hero',
      score: results?.creative,
      color: 'from-pink-500 to-purple-500',
      bgColor: 'from-pink-50 to-purple-50',
      borderColor: 'border-pink-300',
      whatItMeans: 'Your child enjoys creating, imagining, and exploring new ideas. They think outside the box and love to try things differently.',
      youMightNotice: [
        'Love drawing, storytelling, or making up games',
        'Prefer open-ended play or hands-on discovery',
        'Can turn simple things (like paper and tape!) into exciting inventions'
      ],
      howToSupport: [
        'Give them space to explore freely — let their imagination lead',
        'Praise ideas, not just results ("That\'s a really fun idea!")',
        'Encourage creative outlets like art, music, or building projects',
        'Ask open-ended questions: "What else could we do?" or "Why do you think that works?"'
      ],
      activities: [
        'Ask your child to invent a new toy or draw their dream classroom',
        'Create art together with unusual materials',
        'Encourage storytelling and imaginative play',
        'Build things together with blocks or craft supplies'
      ]
    },
    {
      emoji: '🔍',
      name: 'Analytical Thinking',
      friendlyName: 'The Puzzle Solver',
      score: results?.analytical,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-300',
      whatItMeans: 'Your child likes to figure things out logically. They ask questions, notice patterns, and enjoy solving puzzles or mysteries.',
      youMightNotice: [
        'Like sorting, comparing, or classifying things',
        'Ask "why" or "how" questions a lot',
        'Enjoy challenges that require reasoning (puzzles, blocks, experiments)',
        'Want clear instructions or rules before starting'
      ],
      howToSupport: [
        'Encourage problem-solving through games and everyday questions',
        'Give them time to think before answering',
        'Help them keep a "thinking journal" where they record what they discover',
        'Challenge them with age-appropriate logic games or riddles'
      ],
      activities: [
        'Play "Spot the Difference" or solve riddles together',
        'Do science experiments at home',
        'Sort and organize things together',
        'Ask them to explain how things work'
      ]
    },
    {
      emoji: '🛠️',
      name: 'Practical Thinking',
      friendlyName: 'The Fix-It Star',
      score: results?.practical,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-300',
      whatItMeans: 'Your child enjoys using what they know to make things work in real life. They are hands-on learners who love to help and see quick results.',
      youMightNotice: [
        'Prefer doing to watching — they learn best by trying',
        'Like helping around the house or fixing simple problems',
        'Remember lessons when they apply them right away',
        'Enjoy tasks with visible outcomes (building, cooking, crafting)'
      ],
      howToSupport: [
        'Give them real responsibilities (like organizing a shelf or mixing ingredients)',
        'Let them show you how they solve something',
        'Connect schoolwork to real-world examples ("How could we use this in real life?")',
        'Encourage them to plan and complete small projects independently'
      ],
      activities: [
        'Let them help fix, organize, or cook something',
        'Give them age-appropriate household tasks',
        'Build useful things together',
        'Practice real-life skills like tying shoes or setting the table'
      ]
    },
    {
      emoji: '💭',
      name: 'Reflective Thinking',
      friendlyName: 'The Wise Thinker',
      score: results?.reflective,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-300',
      whatItMeans: 'Your child learns deeply by reflecting and thinking about experiences. They care about feelings, fairness, and doing things right.',
      youMightNotice: [
        'Like to talk about what they\'ve learned or how they feel',
        'Pause before answering — they think carefully first',
        'Are kind, empathetic, and often help others',
        'Learn from past experiences and want to improve'
      ],
      howToSupport: [
        'Ask reflection questions: "What did you enjoy most?" or "What could we do differently next time?"',
        'Encourage journaling or quiet moments after activities',
        'Model calm and thoughtful problem-solving',
        'Recognize their sensitivity as a strength — it helps them understand others deeply'
      ],
      activities: [
        'Ask about their favorite moment of the day and what they learned',
        'Encourage drawing or writing about feelings',
        'Practice gratitude together',
        'Discuss how different people might feel in different situations'
      ]
    }
  ];

  // Sort by score if results are provided
  const sortedStyles = results 
    ? [...thinkingStyles].sort((a, b) => (b.score || 0) - (a.score || 0))
    : thinkingStyles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-4 border-purple-300 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <div className="text-6xl mb-4">📘</div>
          <CardTitle className="text-3xl mb-3">
            Parent & Teacher Interpretation Guide
          </CardTitle>
          <CardDescription className="text-lg">
            Understanding Your Child's Thinking Powers
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
            <div className="flex items-start gap-3">
              <Heart className="h-8 w-8 text-purple-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-xl leading-relaxed">
                  <strong>"Every child thinks and learns in their own special way."</strong>
                </p>
                <p className="text-base leading-relaxed mt-2">
                  This guide helps you understand what {childName}'s Jotminds Thinking Styles mean — and how you can support them to think, grow, and shine!
                </p>
              </div>
            </div>
          </div>

          {results && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg border-2 border-yellow-300">
              <p className="text-lg mb-3">
                <strong>{childName}'s Primary Thinking Power:</strong>
              </p>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{sortedStyles[0].emoji}</span>
                <div>
                  <p className="text-xl text-purple-600">
                    {sortedStyles[0].friendlyName}
                  </p>
                  <p className="text-base text-gray-700">
                    Score: {sortedStyles[0].score} / 25
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Style Guides */}
      {sortedStyles.map((style, index) => {
        const isPrimary = results && index === 0;
        
        return (
          <Card
            key={style.name}
            className={`${isPrimary ? 'border-4 border-yellow-400 shadow-xl' : 'border-2 border-gray-200'}`}
          >
            <CardHeader className={`bg-gradient-to-r ${style.color} text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{style.emoji}</span>
                  <div>
                    <CardTitle className="text-2xl">{style.name}</CardTitle>
                    <CardDescription className="text-white opacity-90 text-base">
                      {style.friendlyName}
                    </CardDescription>
                  </div>
                </div>
                {isPrimary && (
                  <Badge className="bg-yellow-400 text-yellow-900 text-base px-4 py-2">
                    ⭐ Primary Style
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* What It Means */}
              <div>
                <h4 className="text-lg mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                  <strong>What It Means:</strong>
                </h4>
                <div className={`bg-gradient-to-r ${style.bgColor} p-4 rounded-lg border-2 ${style.borderColor}`}>
                  <p className="text-base leading-relaxed">{style.whatItMeans}</p>
                </div>
              </div>

              {/* You Might Notice */}
              <div>
                <h4 className="text-lg mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <strong>You Might Notice That They...</strong>
                </h4>
                <div className="space-y-2">
                  {style.youMightNotice.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <span className="text-lg">•</span>
                      <span className="text-base">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Support */}
              <div>
                <h4 className="text-lg mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <strong>How to Support This Style:</strong>
                </h4>
                <div className="space-y-2">
                  {style.howToSupport.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      <span className="text-lg">→</span>
                      <span className="text-base">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div>
                <h4 className="text-lg mb-3 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <strong>Try This!</strong>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {style.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <span className="text-lg">✓</span>
                      <span className="text-base">{activity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* When Styles Work Together */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6 text-green-600" />
            When Styles Work Together
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed">
            Every child has a mix of thinking powers. For example:
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-2 bg-white p-4 rounded-lg border border-green-200">
              <span className="text-2xl">🎨🛠️</span>
              <p className="text-base"><strong>A Creative–Practical child</strong> might become a great young inventor.</p>
            </div>
            <div className="flex items-start gap-2 bg-white p-4 rounded-lg border border-green-200">
              <span className="text-2xl">🔍💭</span>
              <p className="text-base"><strong>A Careful–Thoughtful child</strong> might grow into a compassionate problem-solver.</p>
            </div>
            <div className="flex items-start gap-2 bg-white p-4 rounded-lg border border-green-200">
              <span className="text-2xl">🎨🔍</span>
              <p className="text-base"><strong>A Creative–Careful child</strong> might balance imagination with logic beautifully.</p>
            </div>
          </div>
          <p className="text-lg leading-relaxed mt-4">
            Encourage your child to use <strong>all four thinking powers</strong>, because strong thinking comes from balance — imagination, focus, action, and reflection.
          </p>
        </CardContent>
      </Card>

      {/* How to Talk About Results */}
      <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            💬 How to Talk About Results With Your Child
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg leading-relaxed">
            Keep it positive and playful:
          </p>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
              <p className="text-base italic">
                "Wow! You're really good at solving puzzles — that's your Thinking Power!"
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
              <p className="text-base italic">
                "Let's see if we can use your creative brain to think of a new idea today!"
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200 mt-4">
            <p className="text-lg leading-relaxed">
              Help them understand that thinking powers can grow, just like muscles —
            </p>
            <p className="text-xl text-purple-600 mt-2 text-center">
              <strong>"Every time you use your mind, it gets stronger."</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={() => window.print()}
          size="lg"
          className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg"
        >
          <Download className="mr-2 h-5 w-5" />
          Print This Guide
        </Button>
      </div>
    </div>
  );
}

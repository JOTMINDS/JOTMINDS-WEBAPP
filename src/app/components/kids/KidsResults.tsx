import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CelebratingMascot } from './Mascot';
import { KidsButton } from './KidsButton';
import { KidsCard } from './KidsCard';
import { AudioNarration } from './AudioNarration';
import { Confetti, CelebrationEffect, Badge } from './Confetti';
import { Home, Share2, Download } from 'lucide-react';
import { User } from '../../types/index';

interface KidsResultsProps {
  type: 'learning' | 'thinking' | 'decision' | 'problem-solving' | 'social-thinking';
  results: any;
  insights: string;
  onBackToDashboard: () => void;
  onStartNext?: (type: 'learning' | 'thinking' | 'decision' | 'problem-solving' | 'social-thinking') => void;
  user?: User;
}

// Kid-friendly result descriptions
const resultDescriptions: Record<string, any> = {
  learning: {
    visual: {
      title: 'You Learn by Seeing! 👀',
      emoji: '🎨',
      description: 'You love pictures, colors, and watching videos!',
      tips: [
        '🌈 Use colorful notes',
        '📺 Watch educational videos',
        '📚 Look at pictures in books',
        '🖼️ Draw what you learn'
      ]
    },
    auditory: {
      title: 'You Learn by Listening! 👂',
      emoji: '🎵',
      description: 'You love sounds, music, and stories!',
      tips: [
        '🎧 Listen to audiobooks',
        '🎤 Read out loud',
        '🎼 Use songs to remember',
        '💬 Talk about what you learn'
      ]
    },
    kinesthetic: {
      title: 'You Learn by Doing! ✋',
      emoji: '⚽',
      description: 'You love moving, touching, and trying things!',
      tips: [
        '🤸 Take movement breaks',
        '🔨 Build and create',
        '🎯 Use hands-on activities',
        '🏃 Learn while moving'
      ]
    }
  },
  thinking: {
    analytical: {
      title: 'You Think Step-by-Step! 🧩',
      emoji: '🎯',
      description: 'You like to solve puzzles and understand how things work!',
      tips: [
        '🔍 Ask lots of questions',
        '📊 Make organized lists',
        '🧮 Solve brain teasers',
        '📝 Plan before you start'
      ]
    },
    creative: {
      title: 'You Think Creatively! 🎨',
      emoji: '💡',
      description: 'You have a big imagination and love new ideas!',
      tips: [
        '🌟 Dream up new ideas',
        '🎭 Use your imagination',
        '✏️ Draw and create',
        '🌈 Think outside the box'
      ]
    },
    practical: {
      title: 'You Think Practically! 🔧',
      emoji: '👍',
      description: 'You like to use what works and get things done!',
      tips: [
        '✓ Use what you know',
        '🛠️ Build useful things',
        '📋 Follow steps that work',
        '💪 Practice to get better'
      ]
    }
  },
  decision: {
    quick: {
      title: 'You Decide Quickly! ⚡',
      emoji: '💨',
      description: 'You trust your feelings and go for it!',
      tips: [
        '❤️ Trust your gut feeling',
        '⚡ Be brave and try',
        '🎮 Learn from mistakes',
        '🌟 Stay positive'
      ]
    },
    careful: {
      title: 'You Think Before Deciding! 🤔',
      emoji: '⚖️',
      description: 'You like to think things through carefully!',
      tips: [
        '📝 Make lists of choices',
        '🤔 Think about what might happen',
        '⏰ Take your time',
        '📊 Ask yourself questions'
      ]
    },
    social: {
      title: 'You Decide with Others! 👥',
      emoji: '🤝',
      description: 'You like to talk to people and work together!',
      tips: [
        '💬 Talk to friends and family',
        '👥 Work in teams',
        '🗣️ Share your ideas',
        '🤗 Help each other'
      ]
    }
  },
  'problem-solving': {
    logical: {
      title: 'You Solve Problems Logically! 🧠',
      emoji: '🔍',
      description: 'You think step by step to find answers!',
      tips: [
        '📝 Break problems into steps',
        '🤔 Ask yourself questions',
        '🧮 Think carefully',
        '📊 Make a plan'
      ]
    },
    creative: {
      title: 'You Solve Problems Creatively! 🎨',
      emoji: '💡',
      description: 'You use your imagination to find new ways!',
      tips: [
        '🌟 Dream up new ideas',
        '🎭 Try different ways',
        '✏️ Draw your ideas',
        '🌈 Think outside the box'
      ]
    },
    trial: {
      title: 'You Solve Problems by Trying! 🔬',
      emoji: '🚀',
      description: 'You like to test things and see what works!',
      tips: [
        '✓ Try different solutions',
        '🔨 Test your ideas',
        '💪 Learn from mistakes',
        '🎯 Keep trying!'
      ]
    }
  },
  'social-thinking': {
    leader: {
      title: 'You Are a Great Leader! 👑',
      emoji: '⭐',
      description: 'You help organize and lead others!',
      tips: [
        '💬 Share your ideas',
        '👥 Help everyone join in',
        '🎯 Make good plans',
        '🌟 Be kind and fair'
      ]
    },
    helper: {
      title: 'You Are a Great Helper! 🤝',
      emoji: '💝',
      description: 'You love to help and care for others!',
      tips: [
        '❤️ Listen to your friends',
        '🤗 Be kind and caring',
        '👂 Understand feelings',
        '💪 Help when needed'
      ]
    },
    follower: {
      title: 'You Are a Great Team Player! 🎈',
      emoji: '🌈',
      description: 'You work well with others and enjoy being part of a team!',
      tips: [
        '👥 Work well with others',
        '🎉 Join in the fun',
        '⏳ Wait your turn',
        '😊 Be a good friend'
      ]
    }
  }
};

export function KidsResults({
  type,
  results,
  insights,
  onBackToDashboard,
  onStartNext,
  user
}: KidsResultsProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [stars, setStars] = useState(0);

  useEffect(() => {
    // Animate stars counting up
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setStars(count);
      if (count >= 5) clearInterval(interval);
    }, 200);

    // Hide confetti after 3 seconds
    const timer = setTimeout(() => setShowConfetti(false), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const dominantStyle = results?.dominantStyle || 'visual';
  const styleInfo = resultDescriptions[type]?.[dominantStyle] || resultDescriptions[type]?.visual;

  const assessmentConfig = {
    learning: { color: '#667eea', icon: '📚', title: 'Learning Style' },
    thinking: { color: '#4ECDC4', icon: '🧠', title: 'Thinking Style' },
    decision: { color: '#FF9800', icon: '🎯', title: 'Decision Style' },
    'problem-solving': { color: '#FF6B9D', icon: '🔧', title: 'Problem-Solving Style' },
    'social-thinking': { color: '#FEC163', icon: '🤝', title: 'Social-Thinking Style' }
  };

  const config = assessmentConfig[type];

  // Add safety checks for undefined config or styleInfo
  if (!config || !styleInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Oops! Something went wrong with your results.</p>
          <KidsButton onClick={onBackToDashboard} color="#667eea">
            Go Back Home
          </KidsButton>
        </div>
      </div>
    );
  }

  // Helper function to check if an assessment is completed
  const isAssessmentCompleted = (assessmentType: 'learning' | 'thinking' | 'decision' | 'problem-solving' | 'social-thinking') => {
    if (!user) return false;
    
    // Map assessment type to backend assessment names
    const assessmentMap = {
      learning: 'kolb',
      thinking: 'sternberg',
      decision: 'dual-process',
      'problem-solving': 'problem-solving',
      'social-thinking': 'social-thinking'
    };
    
    const backendType = assessmentMap[assessmentType];
    
    // Check assessmentsCompleted array first (backend uses this)
    if (user.assessmentsCompleted?.includes(backendType)) {
      return true;
    }
    
    // Fallback to assessments array (legacy support)
    return user.assessments?.some((a: any) => a.type === backendType) || false;
  };

  // Next assessment suggestions - only show uncompleted assessments
  const nextAssessments = [
    { type: 'learning' as const, title: 'Learning Style', icon: '📚', color: '#667eea' },
    { type: 'thinking' as const, title: 'Thinking Style', icon: '🧠', color: '#4ECDC4' },
    { type: 'decision' as const, title: 'Decision Style', icon: '🎯', color: '#FF9800' },
    { type: 'problem-solving' as const, title: 'Problem-Solving Style', icon: '🔧', color: '#FF6B9D' },
    { type: 'social-thinking' as const, title: 'Social-Thinking Style', icon: '🤝', color: '#FEC163' }
  ].filter(a => a.type !== type && !isAssessmentCompleted(a.type));

  return (
    <div 
      className="min-h-screen p-4 md:p-8"
      style={{ background: 'linear-gradient(135deg, #667eea15 0%, #FF6B9D15 50%, #FEC16330 100%)' }}
    >
      {/* Enhanced Confetti Effect */}
      <Confetti show={showConfetti} duration={3000} density="heavy" />

      <div className="max-w-4xl mx-auto">
        {/* Celebration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <CelebratingMascot message="You did amazing! Great job!" />
          
          {/* Stars Earned */}
          <motion.div 
            className="mt-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              You Earned {stars} Stars! ⭐
            </h2>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="text-5xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: i < stars ? 1 : 0, rotate: 0 }}
                  transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
                >
                  ⭐
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mb-8"
        >
          <KidsCard
            color={config.color}
            icon={styleInfo.emoji}
            title={styleInfo.title}
            interactive={false}
          >
            <div className="space-y-6">
              {/* Description with Audio */}
              <div className="flex items-start gap-3">
                <AudioNarration
                  text={`${styleInfo.title}. ${styleInfo.description}`}
                  autoPlay={true}
                />
                <p className="text-2xl text-gray-700 flex-1">
                  {styleInfo.description}
                </p>
              </div>

              {/* Large Emoji */}
              <motion.div
                className="text-9xl text-center"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {styleInfo.emoji}
              </motion.div>

              {/* Tips */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  💡 Tips to Help You Learn Better:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {styleInfo.tips.map((tip: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      className="bg-white rounded-2xl p-4 shadow-md border-2"
                      style={{ borderColor: config.color }}
                    >
                      <p className="text-lg font-medium">{tip}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </KidsCard>
        </motion.div>

        {/* Action Buttons */}
        <div className="space-y-4 mb-8">
          <KidsButton
            variant="success"
            size="huge"
            icon={<Home />}
            onClick={onBackToDashboard}
          >
            Back to Dashboard
          </KidsButton>
        </div>

        {/* Next Quizzes */}
        {onStartNext && (
          <div>
            {nextAssessments.length > 0 ? (
              <>
                <h3 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                  🎮 Try Another Quiz!
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nextAssessments.map((assessment, index) => (
                    <motion.div
                      key={assessment.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 + index * 0.2 }}
                    >
                      <KidsCard
                        color={assessment.color}
                        icon={assessment.icon}
                        title={assessment.title}
                        onClick={() => onStartNext(assessment.type)}
                      >
                        <div className="text-center py-4">
                          <p className="text-xl font-medium text-gray-700 mb-4">
                            Discover more about yourself!
                          </p>
                          <KidsButton
                            variant="primary"
                            size="medium"
                            icon="▶️"
                            onClick={() => onStartNext(assessment.type)}
                          >
                            Start Quiz
                          </KidsButton>
                        </div>
                      </KidsCard>
                    </motion.div>
                  ))}
                </div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2 }}
                className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-8 shadow-xl border-4 border-yellow-400 text-center"
              >
                <div className="text-7xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  Awesome! You Did It All! 🎉
                </h3>
                <p className="text-xl text-gray-700 mb-6">
                  You completed all the quizzes! You're a superstar! ⭐
                </p>
                <p className="text-lg text-gray-600">
                  Go back to the dashboard to see all your results and badges!
                </p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
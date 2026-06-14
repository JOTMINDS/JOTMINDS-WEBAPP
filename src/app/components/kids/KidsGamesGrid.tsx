/**
 * Kids Games Selection Grid
 * Allows children to choose which quiz/game to play
 * Optimized for ages 6-10 with large touch targets and animations
 */

import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { KidsIconButton } from './KidsButton';
import { NarratedText } from './AudioNarration';
import { WelcomeMascot } from './Mascot';
import { soundManager } from './SoundFeedback';
import { User } from '../../types/index';

interface Quiz {
  id: 'learning' | 'thinking' | 'decision';
  name: string;
  shortName: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  completed: boolean;
  starsEarned: number;
}

interface KidsGamesGridProps {
  user: User;
  onSelectQuiz: (type: 'learning' | 'thinking' | 'decision') => void;
  onBack: () => void;
}

export function KidsGamesGrid({ user, onSelectQuiz, onBack }: KidsGamesGridProps) {
  // Check completion status
  const hasAssessment = (type: string) => {
    if (user.assessmentsCompleted?.includes(type)) {
      return true;
    }
    return user.assessments?.some(a => a.type === type) || false;
  };

  const quizzes: Quiz[] = [
    {
      id: 'learning',
      name: 'Learning Style Quiz',
      shortName: 'Learning',
      icon: '📚',
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      description: 'How you learn best!',
      completed: hasAssessment('kolb'),
      starsEarned: hasAssessment('kolb') ? 5 : 0,
    },
    {
      id: 'thinking',
      name: 'Thinking Style Quiz',
      shortName: 'Thinking',
      icon: '🧠',
      color: '#4ECDC4',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%)',
      description: 'How your brain works!',
      completed: hasAssessment('sternberg'),
      starsEarned: hasAssessment('sternberg') ? 5 : 0,
    },
    {
      id: 'decision',
      name: 'Decision Style Quiz',
      shortName: 'Decision',
      icon: '🎯',
      color: '#FF9800',
      gradient: 'linear-gradient(135deg, #FF9800 0%, #FF6B9D 100%)',
      description: 'How you make choices!',
      completed: hasAssessment('dual-process'),
      starsEarned: hasAssessment('dual-process') ? 5 : 0,
    },
  ];

  const handleQuizSelect = (quiz: Quiz) => {
    soundManager.play('pop');
    onSelectQuiz(quiz.id);
  };

  const handleBackClick = () => {
    soundManager.play('click');
    onBack();
  };

  return (
    <div 
      className="min-h-screen p-6 md:p-8"
      style={{ 
        background: 'linear-gradient(135deg, #FFD700 0%, #FF6B9D 50%, #667eea 100%)'
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <KidsIconButton
            icon={<ArrowLeft />}
            onClick={handleBackClick}
            color="#FFFFFF"
            label="Back"
          />
          
          <NarratedText text="Choose a quiz to play!" autoPlay={true}>
            <h1 
              className="text-5xl md:text-6xl font-black text-white text-center flex-1"
              style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.3)' }}
            >
              Choose Your Quiz! 🎮
            </h1>
          </NarratedText>

          {/* Spacer for symmetry */}
          <div className="w-16"></div>
        </div>

        {/* Mascot Helper */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <WelcomeMascot />
        </motion.div>

        {/* Quiz Grid - 3 Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          {quizzes.map((quiz, index) => (
            <motion.button
              key={quiz.id}
              className="relative rounded-3xl shadow-2xl overflow-hidden"
              style={{
                background: quiz.gradient,
                border: '8px solid white',
                aspectRatio: '1',
                minHeight: '240px',
              }}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
              }}
              transition={{ 
                delay: index * 0.15,
                type: "spring",
                stiffness: 150
              }}
              whileHover={{ 
                scale: 1.1, 
                y: -15,
                rotate: [0, -3, 3, 0],
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleQuizSelect(quiz)}
            >
              {/* Completed Badge */}
              {quiz.completed && (
                <motion.div
                  className="absolute top-4 right-4 bg-green-500 rounded-full p-3 shadow-xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.15 + 0.5, type: "spring" }}
                >
                  <span className="text-3xl">✓</span>
                </motion.div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {/* Large Icon */}
                <motion.div
                  className="text-9xl mb-4"
                  animate={{ 
                    rotate: [0, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.5
                  }}
                >
                  {quiz.icon}
                </motion.div>

                {/* Quiz Name */}
                <h2 
                  className="text-4xl font-black text-white mb-3 text-center"
                  style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
                >
                  {quiz.shortName}
                </h2>

                {/* Description */}
                <p 
                  className="text-xl font-bold text-white mb-4 text-center"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {quiz.description}
                </p>

                {/* Star Rating */}
                <div className="flex gap-2 justify-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <motion.span
                      key={i}
                      className="text-4xl"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: index * 0.15 + 0.6 + (i * 0.1),
                        type: "spring"
                      }}
                    >
                      {i < quiz.starsEarned ? '⭐' : '☆'}
                    </motion.span>
                  ))}
                </div>

                {/* Status Label */}
                <div 
                  className="text-lg font-bold text-white"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {quiz.completed ? 'Play Again!' : 'Start Quiz!'}
                </div>
              </div>

              {/* Animated Border Glow Effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  border: '4px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '1.5rem',
                }}
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.3
                }}
              />
            </motion.button>
          ))}
        </div>

        {/* Helpful Text */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p 
            className="text-3xl font-bold text-white mb-2"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            Tap any quiz to begin! 🚀
          </p>
          <p 
            className="text-xl text-white"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
          >
            Each quiz takes about 2 minutes
          </p>
        </motion.div>
      </div>
    </div>
  );
}

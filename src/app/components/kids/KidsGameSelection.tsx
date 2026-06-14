/**
 * KIDS GAME SELECTION SCREEN
 * 
 * Allows kids to choose which assessment category they want to complete.
 * Shows all 5 approved categories with visual cards.
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { WelcomeMascot } from './Mascot';
import { NarratedText } from './AudioNarration';
import { useSound } from './SoundFeedback';
import { CATEGORY_INFO } from '../../utils/approvedKidsQuestions';

interface KidsGameSelectionProps {
  userName: string;
  onSelectGame: (category: 'problem-solving' | 'decision-making' | 'social-thinking' | 'motivation' | 'attention-behaviour') => void;
  onBack: () => void;
  completedCategories?: string[];
}

const games = [
  {
    id: 'problem-solving' as const,
    title: 'Problem Solver',
    subtitle: 'Puzzles & Challenges!',
    emoji: '🧩',
    color: '#9333ea',
    gradient: 'from-purple-500 to-pink-500',
    questionCount: 100
  },
  {
    id: 'decision-making' as const,
    title: 'Smart Choices',
    subtitle: 'Making Good Decisions!',
    emoji: '🚦',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-cyan-500',
    questionCount: 100
  },
  {
    id: 'social-thinking' as const,
    title: 'Friendly You',
    subtitle: 'Friends & Teamwork!',
    emoji: '🌈',
    color: '#10b981',
    gradient: 'from-green-500 to-emerald-500',
    questionCount: 100
  },
  {
    id: 'motivation' as const,
    title: 'Try Your Best',
    subtitle: 'Never Give Up!',
    emoji: '⭐',
    color: '#f59e0b',
    gradient: 'from-yellow-500 to-orange-500',
    questionCount: 100
  },
  {
    id: 'attention-behaviour' as const,
    title: 'Focus Power',
    subtitle: 'Pay Attention & Focus!',
    emoji: '🎯',
    color: '#ef4444',
    gradient: 'from-red-500 to-pink-500',
    questionCount: 100
  }
];

export function KidsGameSelection({ 
  userName, 
  onSelectGame, 
  onBack,
  completedCategories = []
}: KidsGameSelectionProps) {
  const { play } = useSound();

  const handleGameClick = (gameId: typeof games[number]['id']) => {
    play('next');
    onSelectGame(gameId);
  };

  const isCompleted = (gameId: string) => {
    return completedCategories.includes(gameId);
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 md:p-8"
      style={{ 
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FFD700 50%, #667eea 100%)'
      }}
    >
      <div className="max-w-7xl w-full">
        {/* Back Button */}
        <motion.button
          className="mb-8 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center"
          onClick={() => {
            play('pop');
            onBack();
          }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeft className="w-8 h-8 text-gray-700" />
        </motion.button>

        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Mascot */}
          <div className="flex justify-center mb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 150, delay: 0.2 }}
            >
              <WelcomeMascot />
            </motion.div>
          </div>

          {/* Title */}
          <NarratedText text={`Choose a game, ${userName}!`} autoPlay={true}>
            <h1 
              className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-4"
              style={{ 
                textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
                letterSpacing: '0.05em'
              }}
            >
              Choose a Game! 🎮
            </h1>
          </NarratedText>

          <p 
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Which one do you want to play?
          </p>
        </motion.div>

        {/* Game Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {games.map((game, index) => (
            <motion.button
              key={game.id}
              className="relative rounded-3xl shadow-2xl overflow-hidden aspect-square"
              style={{
                background: `linear-gradient(135deg, ${game.color} 0%, ${game.color}dd 100%)`,
                border: '8px solid white'
              }}
              whileHover={{ 
                scale: 1.08, 
                y: -10,
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleGameClick(game.id)}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                delay: 0.3 + (index * 0.1),
                type: "spring",
                stiffness: 150
              }}
            >
              {/* Completed Badge */}
              {isCompleted(game.id) && (
                <motion.div
                  className="absolute top-4 right-4 z-10 bg-green-500 rounded-full px-4 py-2 shadow-xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5 + (index * 0.1), type: "spring" }}
                >
                  <span className="text-2xl font-black text-white flex items-center gap-1">
                    ✓ Done!
                  </span>
                </motion.div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                {/* Giant Emoji */}
                <motion.div
                  className="text-8xl md:text-9xl mb-4"
                  animate={{ 
                    scale: [1, 1.15, 1],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  {game.emoji}
                </motion.div>

                {/* Title */}
                <h2 
                  className="text-3xl md:text-4xl font-black text-white text-center mb-2"
                  style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
                >
                  {game.title}
                </h2>

                {/* Subtitle */}
                <p 
                  className="text-lg md:text-xl font-bold text-white text-center opacity-90"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  {game.subtitle}
                </p>

                {/* Question Count */}
                <motion.div
                  className="mt-4 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-xl font-black text-white">
                    {game.questionCount} Questions
                  </span>
                </motion.div>
              </div>

              {/* Shine Effect on Hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
                  transform: 'translateX(-100%)'
                }}
                whileHover={{
                  transform: 'translateX(100%)',
                  transition: { duration: 0.6 }
                }}
              />
            </motion.button>
          ))}
        </div>

        {/* Footer Message */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <p 
            className="text-2xl md:text-3xl font-bold text-white"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            Tap any game to start! ✨
          </p>
        </motion.div>
      </div>
    </div>
  );
}

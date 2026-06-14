import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mascot, WelcomeMascot } from './Mascot';
import { KidsButton, KidsIconButton } from './KidsButton';
import { KidsCard, ProgressCard, RewardCard } from './KidsCard';
import { AudioNarration, NarratedText } from './AudioNarration';
import { Confetti, Badge } from './Confetti';
import { LogOut, Trophy, Star, Book, Play, Settings, User as UserIcon } from 'lucide-react';
import { User } from '../../types/index';
import { soundManager } from './SoundFeedback';

interface KidsDashboardProps {
  user: User;
  onStartAssessment: (type: 'learning' | 'thinking' | 'decision' | 'problem-solving' | 'decision-making' | 'social-thinking' | 'motivation' | 'attention-behaviour') => void;
  onLogout: () => void;
  onViewRewards?: () => void;
  onViewProgress?: () => void;
  onParentAccess?: () => void;
  newlyCompletedAssessment?: {
    type: string;
    starsEarned: number;
    badgeTitle: string;
    badgeEmoji: string;
  } | null;
}

export function KidsDashboard({
  user,
  onStartAssessment,
  onLogout,
  onViewRewards,
  onViewProgress,
  onParentAccess,
  newlyCompletedAssessment
}: KidsDashboardProps) {
  const [showRewardAnimation, setShowRewardAnimation] = useState(!!newlyCompletedAssessment);
  const [rewardData, setRewardData] = useState(newlyCompletedAssessment);

  // Play welcome audio on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      soundManager.play('celebration');
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle new assessment completion
  useEffect(() => {
    if (newlyCompletedAssessment) {
      setShowRewardAnimation(true);
      setRewardData(newlyCompletedAssessment);
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowRewardAnimation(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [newlyCompletedAssessment]);

  // Calculate progress based on user's completed assessments
  const hasAssessment = (type: string) => {
    // Check assessmentsCompleted first (backend uses this)
    if (user.assessmentsCompleted?.includes(type)) {
      return true;
    }
    // Fallback to assessments array (legacy support)
    return user.assessments?.some(a => a.type === type) || false;
  };

  const assessments = [
    { name: 'Learning Style', completed: hasAssessment('kolb'), type: 'learning' as const, icon: '📚', color: '#667eea', isMain: true },
    { name: 'Thinking Style', completed: hasAssessment('sternberg'), type: 'thinking' as const, icon: '🧠', color: '#4ECDC4', isMain: true },
    { name: 'Decision Style', completed: hasAssessment('dual-process'), type: 'decision' as const, icon: '🎯', color: '#FF9800', isMain: true },
    { name: 'Problem Solving', completed: false, type: 'problem-solving' as const, icon: '🧩', color: '#9333ea', isMain: false },
    { name: 'Social Thinking', completed: false, type: 'social-thinking' as const, icon: '👥', color: '#ec4899', isMain: false }
  ];

  const mainAssessments = assessments.filter(a => a.isMain);
  const bonusGames = assessments.filter(a => !a.isMain);
  const mainCompletedCount = mainAssessments.filter(a => a.completed).length;
  const allMainComplete = mainCompletedCount === mainAssessments.length;

  const completedCount = assessments.filter(a => a.completed).length;
  const totalCount = assessments.length;
  const totalStars = completedCount * 5;

  // Find next quiz to take
  const nextQuiz = assessments.find(a => !a.completed);
  
  // Determine next assessment type
  const getNextAssessmentType = () => {
    if (nextQuiz) return nextQuiz.type;
    // If all complete, restart with first one
    return 'learning';
  };

  const handlePlayClick = () => {
    soundManager.play('next');
    const assessmentType = getNextAssessmentType();
    onStartAssessment(assessmentType);
  };

  const handleStarsClick = () => {
    soundManager.play('pop');
    if (onViewRewards) {
      onViewRewards();
    }
  };

  const handleParentClick = () => {
    soundManager.play('select');
    if (onParentAccess) {
      onParentAccess();
    } else {
      // Fallback to logout if no parent access handler
      onLogout();
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-8" 
      style={{ 
        background: 'linear-gradient(135deg, #FF6B9D 0%, #FFD700 50%, #667eea 100%)'
      }}
    >
      {/* All Completed Celebration Confetti */}
      {completedCount === totalCount && (
        <Confetti show={true} duration={0} density="heavy" />
      )}

      {/* NEW REWARD FLOATING ANIMATION - Post-Assessment Return */}
      {showRewardAnimation && rewardData && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Celebration Confetti */}
          <div className="pointer-events-none">
            <Confetti show={true} duration={3000} density="medium" />
          </div>

          {/* Floating Badge/Sticker */}
          <motion.div
            className="pointer-events-auto"
            initial={{ scale: 0, y: 100, rotate: -180 }}
            animate={{ 
              scale: 1, 
              y: 0, 
              rotate: 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              duration: 0.8
            }}
          >
            <motion.div
              className="bg-white rounded-full shadow-2xl p-8 relative"
              style={{
                border: '10px solid #FFD700',
                width: '320px',
                height: '320px'
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                y: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                rotate: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            >
              {/* Badge Content */}
              <div className="flex flex-col items-center justify-center h-full">
                {/* Badge Emoji */}
                <motion.div
                  className="text-9xl mb-4"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {rewardData.badgeEmoji}
                </motion.div>

                {/* Badge Title */}
                <p className="text-3xl font-black text-gray-800 text-center leading-tight">
                  {rewardData.badgeTitle}
                </p>

                {/* Stars Earned */}
                <motion.div
                  className="flex items-center gap-2 mt-4"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <span className="text-4xl">⭐</span>
                  <span className="text-2xl font-black text-gray-700">
                    +{rewardData.starsEarned}
                  </span>
                </motion.div>
              </div>

              {/* Sparkles Around Badge */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                  <motion.div
                    key={angle}
                    className="absolute text-4xl"
                    style={{
                      top: `${Math.sin((angle * Math.PI) / 180) * 180}px`,
                      left: `${Math.cos((angle * Math.PI) / 180) * 180}px`,
                    }}
                    animate={{
                      scale: [0, 1.3, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </motion.div>

              {/* Close Button */}
              <motion.button
                className="absolute -top-4 -right-4 w-16 h-16 bg-red-500 rounded-full text-white text-3xl font-black shadow-xl pointer-events-auto"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  soundManager.play('pop');
                  setShowRewardAnimation(false);
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.0 }}
              >
                ✕
              </motion.button>
            </motion.div>
          </motion.div>

          {/* "NEW!" Banner */}
          <motion.div
            className="absolute top-20 left-1/2 transform -translate-x-1/2"
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-12 py-4 rounded-full shadow-2xl"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-5xl font-black tracking-wider">
                NEW REWARD! 🎉
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-5xl w-full">
        {/* Large Mascot at Top */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <div className="flex justify-center mb-6">
            <WelcomeMascot />
          </div>
          
          <NarratedText text={`Hi ${user.name}! Tap PLAY to begin!`} autoPlay={true}>
            <h1 
              className="text-6xl md:text-7xl font-black text-white mb-4"
              style={{ 
                textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
                letterSpacing: '0.05em'
              }}
            >
              Hi, {user.name}! 👋
            </h1>
          </NarratedText>
          
          <p 
            className="text-3xl md:text-4xl font-bold text-white"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            {completedCount === totalCount 
              ? "Amazing! You finished all quizzes! 🎉"
              : nextQuiz 
              ? `Ready for ${nextQuiz.name}?`
              : "Let's play!"}
          </p>

          {/* Star Progress Indicator with New Stars Highlight */}
          <div className="flex justify-center gap-2 mt-6">
            {[...Array(totalCount)].map((_, i) => (
              <motion.div
                key={i}
                className="text-6xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.2, type: "spring" }}
              >
                {i < completedCount ? (
                  <motion.span
                    animate={showRewardAnimation && i === completedCount - 1 ? {
                      scale: [1, 1.5, 1],
                      rotate: [0, 360, 0]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: showRewardAnimation ? Infinity : 0,
                      ease: "easeInOut"
                    }}
                  >
                    ⭐
                  </motion.span>
                ) : '☆'}
              </motion.div>
            ))}
          </div>

          {/* NEW: Star Count Display */}
          {showRewardAnimation && rewardData && (
            <motion.div
              className="mt-8 bg-white rounded-full px-10 py-5 shadow-2xl inline-block"
              style={{ border: '6px solid #FFD700' }}
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="flex items-center gap-4"
                animate={{
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <span className="text-5xl">⭐</span>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-gray-800">
                    Total: {totalStars} Stars!
                  </span>
                  <motion.span
                    className="text-xl font-bold text-green-600"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    +{rewardData.starsEarned} NEW! 🎉
                  </motion.span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* 3 Large Square Buttons - Centered Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* PLAY BUTTON */}
          <motion.button
            className="relative aspect-square rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: completedCount === totalCount 
                ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                : 'linear-gradient(135deg, #4CAF50 0%, #45B7D1 100%)',
              border: '8px solid white',
              minHeight: '220px'
            }}
            whileHover={{ scale: 1.08, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayClick}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {completedCount === totalCount ? '🎮' : '▶️'}
              </motion.div>
              <h2 
                className="text-5xl font-black text-white"
                style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
              >
                PLAY
              </h2>
              <p className="text-xl font-bold text-white mt-2">
                {completedCount === totalCount ? 'Play Again!' : 'Start Quiz!'}
              </p>
            </div>
          </motion.button>

          {/* MY STARS BUTTON */}
          <motion.button
            className="relative aspect-square rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FF6B9D 100%)',
              border: '8px solid white',
              minHeight: '220px'
            }}
            whileHover={{ scale: 1.08, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStarsClick}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <motion.div
                className="text-8xl mb-4"
                animate={{ 
                  rotate: [0, 15, -15, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                ⭐
              </motion.div>
              <h2 
                className="text-5xl font-black text-white"
                style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
              >
                MY STARS
              </h2>
              <p className="text-3xl font-black text-white mt-2">
                {totalStars}
              </p>
            </div>
          </motion.button>

          {/* PARENT BUTTON */}
          <motion.button
            className="relative aspect-square rounded-3xl shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '8px solid white',
              minHeight: '220px'
            }}
            whileHover={{ scale: 1.08, y: -10 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleParentClick}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 150 }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <motion.div
                className="text-8xl mb-4"
                whileHover={{ rotate: 10 }}
              >
                👨‍👩‍👧
              </motion.div>
              <h2 
                className="text-5xl font-black text-white"
                style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
              >
                PARENT
              </h2>
              <p className="text-xl font-bold text-white mt-2">
                Teacher
              </p>
            </div>
          </motion.button>
        </div>

        {/* Small Exit Button - Bottom Right */}
        <motion.div
          className="fixed bottom-8 right-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.button
            className="bg-white rounded-full p-4 shadow-xl"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onLogout}
          >
            <LogOut className="w-8 h-8 text-gray-700" />
          </motion.button>
        </motion.div>

        {/* BONUS GAMES SECTION */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 100 }}
        >
          {/* Heading */}
          <div className="text-center mb-8"
          >
            {allMainComplete ? (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <h2 
                    className="text-5xl md:text-6xl font-black text-white mb-2"
                    style={{ 
                      textShadow: '4px 4px 8px rgba(0,0,0,0.3)',
                      background: 'linear-gradient(135deg, #FFD700 0%, #FF6B9D 50%, #9333ea 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    🎉 BONUS GAMES! 🎉
                  </h2>
                </motion.div>
                <p 
                  className="text-2xl font-bold text-white"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                >
                  You unlocked 2 special games!
                </p>
              </>
            ) : (
              <>
                <h2 
                  className="text-4xl md:text-5xl font-black text-white/80 mb-2"
                  style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.2)' }}
                >
                  🔒 BONUS GAMES 🔒
                </h2>
                <p 
                  className="text-xl font-bold text-white/80"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
                >
                  Complete all 3 quizzes to unlock!
                </p>
                <div className="flex justify-center gap-2 mt-4">
                  {mainAssessments.map((a, i) => (
                    <motion.div
                      key={i}
                      className="text-4xl"
                      animate={a.completed ? {} : {
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.3
                      }}
                    >
                      {a.completed ? '✅' : '⏳'}
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bonus Game Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {bonusGames.map((game, index) => {
              const isLocked = !allMainComplete;
              
              return (
                <motion.button
                  key={game.type}
                  className="relative aspect-video rounded-3xl shadow-2xl overflow-hidden"
                  style={{
                    background: isLocked 
                      ? 'linear-gradient(135deg, #999 0%, #666 100%)'
                      : `linear-gradient(135deg, ${game.color} 0%, ${game.color}dd 100%)`,
                    border: '6px solid white',
                    minHeight: '180px',
                    filter: isLocked ? 'grayscale(100%) brightness(0.7)' : 'none'
                  }}
                  whileHover={isLocked ? {} : { scale: 1.05, y: -5 }}
                  whileTap={isLocked ? {} : { scale: 0.95 }}
                  onClick={() => {
                    if (!isLocked) {
                      soundManager.play('next');
                      onStartAssessment(game.type);
                    } else {
                      soundManager.play('error');
                    }
                  }}
                  initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  transition={{ 
                    delay: 1.2 + (index * 0.2), 
                    type: "spring", 
                    stiffness: 150 
                  }}
                >
                  {/* Lock Overlay */}
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <motion.div
                        className="text-9xl"
                        animate={{
                          scale: [1, 1.1, 1],
                          rotate: [0, -5, 5, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        🔒
                      </motion.div>
                    </div>
                  )}

                  {/* Game Content */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 ${isLocked ? 'opacity-30' : ''}`}>
                    <motion.div
                      className="text-7xl mb-3"
                      animate={isLocked ? {} : { 
                        scale: [1, 1.15, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      {game.icon}
                    </motion.div>
                    <h3 
                      className="text-3xl font-black text-white text-center"
                      style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.4)' }}
                    >
                      {game.name}
                    </h3>
                    {game.completed && (
                      <motion.div
                        className="absolute top-4 right-4 text-5xl"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        ✅
                      </motion.div>
                    )}
                    {!isLocked && !game.completed && (
                      <p className="text-lg font-bold text-white mt-2">
                        Play Now! 🎮
                      </p>
                    )}
                  </div>

                  {/* "NEW!" Badge for unlocked but not completed */}
                  {!isLocked && !game.completed && (
                    <motion.div
                      className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-red-500 text-white px-4 py-2 rounded-full shadow-xl"
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [-5, 5, -5]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <span className="text-xl font-black">NEW!</span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Unlock Celebration - Shows when they just completed all 3 main games */}
          {allMainComplete && mainCompletedCount === 3 && !bonusGames.some(g => g.completed) && (
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="inline-block bg-white rounded-3xl px-8 py-4 shadow-2xl"
                style={{ border: '6px solid #FFD700' }}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <p className="text-3xl font-black text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                  🎊 Tap a bonus game to play! 🎊
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
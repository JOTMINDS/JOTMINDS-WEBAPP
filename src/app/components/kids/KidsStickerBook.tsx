import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Share2, Sparkles, Trophy, Lock } from 'lucide-react';
import { KidsButton, KidsIconButton } from './KidsButton';
import { Confetti } from './Confetti';
import { WelcomeMascot } from './Mascot';
import { soundManager } from './SoundFeedback';

// Badge categories
type BadgeCategory = 'all' | 'learning' | 'thinking' | 'decision' | 'special';

interface BadgeData {
  id: string;
  emoji: string;
  title: string;
  description: string;
  category: BadgeCategory;
  unlocked: boolean;
  starsEarned: number;
  unlockedDate?: Date;
  howToUnlock: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface KidsStickerBookProps {
  badges: BadgeData[];
  totalStars: number;
  onBack: () => void;
  onShare?: () => void;
}

// Sample badge data (should come from props in real app)
const SAMPLE_BADGES: BadgeData[] = [
  {
    id: 'learning-complete',
    emoji: '📚',
    title: 'Super Learner!',
    description: 'You love to learn new things!',
    category: 'learning',
    unlocked: true,
    starsEarned: 5,
    unlockedDate: new Date('2024-11-20'),
    howToUnlock: 'Complete the Learning Style quiz',
    rarity: 'common'
  },
  {
    id: 'thinking-complete',
    emoji: '🧠',
    title: 'Big Thinker!',
    description: 'Your brain is amazing!',
    category: 'thinking',
    unlocked: true,
    starsEarned: 5,
    unlockedDate: new Date('2024-11-22'),
    howToUnlock: 'Complete the Thinking Style quiz',
    rarity: 'common'
  },
  {
    id: 'decision-complete',
    emoji: '🎯',
    title: 'Smart Chooser!',
    description: 'You make great choices!',
    category: 'decision',
    unlocked: false,
    starsEarned: 0,
    howToUnlock: 'Complete the Decision Style quiz',
    rarity: 'common'
  },
  {
    id: 'all-complete',
    emoji: '🏆',
    title: 'Quiz Champion!',
    description: 'You completed EVERYTHING!',
    category: 'special',
    unlocked: false,
    starsEarned: 0,
    howToUnlock: 'Complete all three quizzes',
    rarity: 'legendary'
  },
  {
    id: 'perfect-learning',
    emoji: '⭐',
    title: 'Perfect Score!',
    description: 'All 5 stars in Learning!',
    category: 'learning',
    unlocked: true,
    starsEarned: 5,
    unlockedDate: new Date('2024-11-20'),
    howToUnlock: 'Get 5 stars in Learning quiz',
    rarity: 'rare'
  },
  {
    id: 'speed-demon',
    emoji: '⚡',
    title: 'Lightning Fast!',
    description: 'Finished super quick!',
    category: 'special',
    unlocked: false,
    starsEarned: 0,
    howToUnlock: 'Complete any quiz in under 2 minutes',
    rarity: 'epic'
  },
  {
    id: 'comeback-kid',
    emoji: '💪',
    title: 'Never Give Up!',
    description: 'You tried again and won!',
    category: 'special',
    unlocked: false,
    starsEarned: 0,
    howToUnlock: 'Retake a quiz and improve your score',
    rarity: 'rare'
  },
  {
    id: 'early-bird',
    emoji: '🌅',
    title: 'Early Bird!',
    description: 'You play in the morning!',
    category: 'special',
    unlocked: false,
    starsEarned: 0,
    howToUnlock: 'Complete a quiz before 9 AM',
    rarity: 'rare'
  },
  {
    id: 'night-owl',
    emoji: '🦉',
    title: 'Night Owl!',
    description: 'You play in the evening!',
    category: 'special',
    unlocked: false,
    starsEarned: 0,
    howToUnlock: 'Complete a quiz after 6 PM',
    rarity: 'rare'
  }
];

const CATEGORY_INFO = {
  all: { label: 'All Stickers', emoji: '🌟', color: 'bg-purple-100' },
  learning: { label: 'Learning', emoji: '📚', color: 'bg-blue-100' },
  thinking: { label: 'Thinking', emoji: '🧠', color: 'bg-green-100' },
  decision: { label: 'Decision', emoji: '🎯', color: 'bg-yellow-100' },
  special: { label: 'Special', emoji: '✨', color: 'bg-pink-100' }
};

const RARITY_COLORS = {
  common: 'border-gray-300',
  rare: 'border-blue-400',
  epic: 'border-purple-500',
  legendary: 'border-yellow-400'
};

const RARITY_GLOW = {
  common: '',
  rare: 'shadow-lg shadow-blue-200',
  epic: 'shadow-xl shadow-purple-300',
  legendary: 'shadow-2xl shadow-yellow-300'
};

export function KidsStickerBook({ 
  badges = SAMPLE_BADGES, 
  totalStars = 10,
  onBack,
  onShare 
}: KidsStickerBookProps) {
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>('all');
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Filter badges by category
  const filteredBadges = selectedCategory === 'all' 
    ? badges 
    : badges.filter(b => b.category === selectedCategory);

  // Count unlocked badges
  const unlockedCount = badges.filter(b => b.unlocked).length;
  const totalCount = badges.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Handle badge click
  const handleBadgeClick = (badge: BadgeData) => {
    soundManager.play('pop');
    setSelectedBadge(badge);
    
    if (badge.unlocked) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  };

  // Handle category change
  const handleCategoryChange = (category: BadgeCategory) => {
    soundManager.play('pop');
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 via-pink-50 to-blue-50 p-6 pb-20">
      {/* Confetti on badge view */}
      {showConfetti && <Confetti duration={2000} />}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <KidsIconButton 
              icon={<ArrowLeft className="w-12 h-12" />} 
              onClick={onBack}
              label="Back"
            />
            <div>
              <h1 className="text-5xl font-black text-gray-800">
                My Sticker Book 📖
              </h1>
              <p className="text-2xl text-gray-600 mt-1">
                {unlockedCount} of {totalCount} collected!
              </p>
            </div>
          </div>

          {/* Total stars display */}
          <motion.div
            className="bg-white rounded-full px-8 py-4 shadow-xl border-4 border-yellow-400"
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-6xl">⭐</div>
            <div className="text-3xl font-black text-gray-800 text-center">
              {totalStars}
            </div>
          </motion.div>
        </div>

        {/* Progress bar */}
        <motion.div 
          className="bg-white rounded-3xl p-6 mb-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl font-bold text-gray-700">Collection Progress</span>
            <span className="text-3xl font-black text-purple-600">{progressPercent}%</span>
          </div>
          
          <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="flex items-center gap-2 mt-3 justify-center">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span className="text-xl text-gray-600">
              {totalCount - unlockedCount} more to discover!
            </span>
          </div>
        </motion.div>

        {/* Mascot encouragement */}
        <div className="mb-6">
          <WelcomeMascot 
            message={
              unlockedCount === 0 
                ? "Let's start collecting stickers!" 
                : unlockedCount === totalCount
                ? "WOW! You collected EVERYTHING! 🎉"
                : `Great job! Keep going! 🌟`
            }
            mood="celebrating"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-3 mb-8 flex-wrap justify-center">
          {(Object.keys(CATEGORY_INFO) as BadgeCategory[]).map((category) => {
            const info = CATEGORY_INFO[category];
            const categoryCount = category === 'all' 
              ? unlockedCount 
              : badges.filter(b => b.category === category && b.unlocked).length;
            
            return (
              <motion.button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`
                  px-6 py-4 rounded-3xl font-bold text-xl
                  transition-all duration-200
                  ${selectedCategory === category 
                    ? `${info.color} scale-110 shadow-xl border-4 border-gray-800` 
                    : 'bg-white shadow-md border-4 border-gray-300 hover:scale-105'
                  }
                `}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-3xl mr-2">{info.emoji}</span>
                <span>{info.label}</span>
                <span className="ml-2 text-gray-600">({categoryCount})</span>
              </motion.button>
            );
          })}
        </div>

        {/* Sticker grid */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <AnimatePresence mode="wait">
            {filteredBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleBadgeClick(badge)}
                className={`
                  relative cursor-pointer
                  bg-white rounded-3xl p-6
                  border-8 ${badge.unlocked ? RARITY_COLORS[badge.rarity] : 'border-gray-300'}
                  ${badge.unlocked ? RARITY_GLOW[badge.rarity] : 'opacity-60'}
                  hover:scale-105 transition-all duration-200
                `}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Rarity indicator */}
                {badge.unlocked && badge.rarity !== 'common' && (
                  <div className="absolute top-2 right-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className={`
                        w-8 h-8
                        ${badge.rarity === 'rare' && 'text-blue-400'}
                        ${badge.rarity === 'epic' && 'text-purple-500'}
                        ${badge.rarity === 'legendary' && 'text-yellow-400'}
                      `} />
                    </motion.div>
                  </div>
                )}

                {/* Badge emoji/icon */}
                <div className="text-center mb-4">
                  <motion.div
                    className="text-9xl"
                    animate={badge.unlocked ? {
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.05, 1]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {badge.unlocked ? badge.emoji : '❓'}
                  </motion.div>
                </div>

                {/* Badge info */}
                <div className="text-center">
                  {badge.unlocked ? (
                    <>
                      <h3 className="text-2xl font-black text-gray-800 mb-2">
                        {badge.title}
                      </h3>
                      <p className="text-xl text-gray-600 mb-3">
                        {badge.description}
                      </p>
                      
                      {/* Stars earned */}
                      {badge.starsEarned > 0 && (
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-3xl">⭐</span>
                          <span className="text-2xl font-bold text-gray-700">
                            +{badge.starsEarned}
                          </span>
                        </div>
                      )}

                      {/* Date unlocked */}
                      {badge.unlockedDate && (
                        <p className="text-lg text-gray-500">
                          Earned {badge.unlockedDate.toLocaleDateString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <Lock className="w-8 h-8 text-gray-400" />
                        <h3 className="text-2xl font-bold text-gray-500">
                          Locked
                        </h3>
                      </div>
                      <p className="text-xl text-gray-500">
                        {badge.howToUnlock}
                      </p>
                    </>
                  )}
                </div>

                {/* NEW badge indicator */}
                {badge.unlocked && badge.unlockedDate && 
                 Date.now() - badge.unlockedDate.getTime() < 24 * 60 * 60 * 1000 && (
                  <motion.div
                    className="absolute -top-3 -right-3 bg-red-500 text-white px-4 py-2 rounded-full font-black text-lg"
                    animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    NEW!
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom actions */}
        <div className="flex gap-4 justify-center">
          {onShare && (
            <KidsButton
              size="large"
              onClick={() => {
                soundManager.play('celebration');
                onShare();
              }}
              className="bg-gradient-to-r from-green-400 to-blue-500"
            >
              <Share2 className="w-8 h-8 mr-3" />
              Show Parent/Teacher
            </KidsButton>
          )}

          <KidsButton
            size="large"
            onClick={onBack}
            variant="secondary"
          >
            <Trophy className="w-8 h-8 mr-3" />
            Back to Dashboard
          </KidsButton>
        </div>

        {/* Badge details modal */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedBadge(null)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className={`
                  bg-white rounded-3xl p-12 max-w-2xl w-full
                  border-8 ${selectedBadge.unlocked ? RARITY_COLORS[selectedBadge.rarity] : 'border-gray-300'}
                  ${selectedBadge.unlocked ? RARITY_GLOW[selectedBadge.rarity] : ''}
                `}
              >
                {/* Close button */}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 w-16 h-16 bg-red-500 rounded-full text-white text-3xl font-bold hover:scale-110 transition-transform"
                >
                  ✕
                </button>

                {/* Badge display */}
                <div className="text-center">
                  <motion.div
                    className="text-[200px] leading-none mb-6"
                    animate={{
                      rotate: [0, -10, 10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {selectedBadge.unlocked ? selectedBadge.emoji : '❓'}
                  </motion.div>

                  {selectedBadge.unlocked ? (
                    <>
                      <h2 className="text-5xl font-black text-gray-800 mb-4">
                        {selectedBadge.title}
                      </h2>
                      <p className="text-3xl text-gray-600 mb-6">
                        {selectedBadge.description}
                      </p>

                      {/* Rarity badge */}
                      <div className={`
                        inline-block px-6 py-3 rounded-full font-bold text-2xl mb-6
                        ${selectedBadge.rarity === 'common' && 'bg-gray-200 text-gray-700'}
                        ${selectedBadge.rarity === 'rare' && 'bg-blue-200 text-blue-700'}
                        ${selectedBadge.rarity === 'epic' && 'bg-purple-200 text-purple-700'}
                        ${selectedBadge.rarity === 'legendary' && 'bg-yellow-200 text-yellow-700'}
                      `}>
                        {selectedBadge.rarity.toUpperCase()}
                      </div>

                      {selectedBadge.starsEarned > 0 && (
                        <div className="flex items-center justify-center gap-3 mt-4">
                          <span className="text-6xl">⭐</span>
                          <span className="text-4xl font-black text-gray-800">
                            +{selectedBadge.starsEarned} Stars
                          </span>
                        </div>
                      )}

                      {selectedBadge.unlockedDate && (
                        <p className="text-2xl text-gray-500 mt-4">
                          Unlocked on {selectedBadge.unlockedDate.toLocaleDateString('en-US', { 
                            month: 'long', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <Lock className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                      <h2 className="text-4xl font-black text-gray-600 mb-4">
                        Mystery Sticker!
                      </h2>
                      <p className="text-3xl text-gray-500 mb-6">
                        {selectedBadge.howToUnlock}
                      </p>
                      <div className="bg-yellow-100 rounded-2xl p-6 border-4 border-yellow-400">
                        <p className="text-2xl font-bold text-gray-700">
                          💡 Complete the challenge to unlock this sticker!
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { KidsButton } from './KidsButton';
import { KidsCard } from './KidsCard';
import { Mascot } from './Mascot';
import { soundManager } from './SoundFeedback';
import { Brain, Palette, Zap, Target, Star, ArrowLeft } from 'lucide-react';

interface MiniGamesHubProps {
  onSelectGame: (gameType: string) => void;
  onBack: () => void;
}

const miniGames = [
  {
    id: 'memory-match',
    name: 'Memory Match',
    emoji: '🧠',
    icon: Brain,
    description: 'Find matching pairs!',
    color: 'from-blue-400 to-blue-600',
    skills: ['Memory', 'Attention']
  },
  {
    id: 'pattern-puzzle',
    name: 'Pattern Detective',
    emoji: '🔍',
    icon: Target,
    description: 'Complete the patterns!',
    color: 'from-purple-400 to-purple-600',
    skills: ['Logic', 'Analysis']
  },
  {
    id: 'story-builder',
    name: 'Story Builder',
    emoji: '📚',
    icon: Palette,
    description: 'Create your own adventure!',
    color: 'from-pink-400 to-pink-600',
    skills: ['Creativity', 'Imagination']
  },
  {
    id: 'speed-sort',
    name: 'Speed Sort',
    emoji: '⚡',
    icon: Zap,
    description: 'Sort things super fast!',
    color: 'from-yellow-400 to-orange-500',
    skills: ['Quick Thinking', 'Categories']
  },
  {
    id: 'emoji-feelings',
    name: 'Emoji Feelings',
    emoji: '😊',
    icon: Star,
    description: 'Match emotions and faces!',
    color: 'from-green-400 to-teal-500',
    skills: ['Emotions', 'Social']
  }
];

export function MiniGamesHub({ onSelectGame, onBack }: MiniGamesHubProps) {
  const handleGameClick = (gameId: string) => {
    soundManager.play('pop');
    onSelectGame(gameId);
  };

  const handleBackClick = () => {
    soundManager.play('back');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <KidsButton
            onClick={handleBackClick}
            variant="secondary"
            icon={<ArrowLeft className="w-6 h-6" />}
          >
            Back
          </KidsButton>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
          >
            <Mascot mode="excited" size="small" showThought={false} />
          </motion.div>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
            🎮 Mini-Games 🎮
          </h1>
          <p className="text-2xl text-gray-700">
            Play fun games to practice your brain skills!
          </p>
        </motion.div>
      </div>

      {/* Games Grid */}
      <div className="max-w-6xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {miniGames.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1, type: 'spring', bounce: 0.4 }}
          >
            <KidsCard
              className="cursor-pointer transform transition-all hover:scale-105 hover:shadow-2xl"
              onClick={() => handleGameClick(game.id)}
            >
              <div className="text-center space-y-4 p-4">
                {/* Game Icon */}
                <motion.div
                  className={`w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br ${game.color} flex items-center justify-center text-6xl shadow-lg`}
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {game.emoji}
                </motion.div>

                {/* Game Name */}
                <h3 className="text-2xl font-black text-gray-800">
                  {game.name}
                </h3>

                {/* Description */}
                <p className="text-lg text-gray-600">
                  {game.description}
                </p>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {game.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 bg-white rounded-full text-sm font-bold text-gray-700 border-2 border-gray-200"
                    >
                      ⭐ {skill}
                    </span>
                  ))}
                </div>

                {/* Play Button */}
                <div className="pt-2">
                  <div className="inline-block px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-2xl font-black text-xl shadow-lg">
                    ▶️ PLAY!
                  </div>
                </div>
              </div>
            </KidsCard>
          </motion.div>
        ))}
      </div>

      {/* Fun Footer */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-4xl mx-auto mt-12 text-center"
      >
        <div className="bg-white rounded-3xl shadow-xl p-6 border-4 border-yellow-300">
          <p className="text-xl text-gray-700">
            <span className="text-3xl mr-2">💡</span>
            <strong>Tip:</strong> Playing these games helps your brain get stronger! 
            Come back and play anytime you want!
          </p>
        </div>
      </motion.div>
    </div>
  );
}

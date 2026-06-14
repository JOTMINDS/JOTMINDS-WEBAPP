import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KidsButton } from '../KidsButton';
import { Mascot } from '../Mascot';
import { soundManager } from '../SoundFeedback';
import { Confetti } from '../Confetti';
import { ArrowLeft, Star, Trophy, Timer } from 'lucide-react';

interface SpeedSortProps {
  onBack: () => void;
}

interface Item {
  id: number;
  emoji: string;
  category: 'fruit' | 'animal' | 'vehicle';
}

const items: Item[] = [
  { id: 1, emoji: '🍎', category: 'fruit' },
  { id: 2, emoji: '🐶', category: 'animal' },
  { id: 3, emoji: '🚗', category: 'vehicle' },
  { id: 4, emoji: '🍌', category: 'fruit' },
  { id: 5, emoji: '🐱', category: 'animal' },
  { id: 6, emoji: '🚀', category: 'vehicle' },
  { id: 7, emoji: '🍇', category: 'fruit' },
  { id: 8, emoji: '🐼', category: 'animal' },
  { id: 9, emoji: '🚁', category: 'vehicle' },
  { id: 10, emoji: '🍊', category: 'fruit' },
  { id: 11, emoji: '🦁', category: 'animal' },
  { id: 12, emoji: '🚂', category: 'vehicle' }
];

const categoryInfo = {
  fruit: { name: 'Fruits', color: 'from-red-400 to-pink-500', emoji: '🍎' },
  animal: { name: 'Animals', color: 'from-green-400 to-teal-500', emoji: '🐶' },
  vehicle: { name: 'Vehicles', color: 'from-blue-400 to-purple-500', emoji: '🚗' }
};

export function SpeedSort({ onBack }: SpeedSortProps) {
  const [gameItems, setGameItems] = useState<Item[]>([]);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [timeLeft, isPlaying]);

  const startGame = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setGameItems(shuffled);
    setCurrentItem(shuffled[0]);
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsComplete(false);
    soundManager.play('next');
  };

  const endGame = () => {
    setIsPlaying(false);
    setIsComplete(true);
    soundManager.play('celebration');
  };

  const handleCategoryClick = (category: 'fruit' | 'animal' | 'vehicle') => {
    if (!currentItem || !isPlaying) return;

    if (currentItem.category === category) {
      // Correct!
      soundManager.play('correct');
      setScore(score + 10);
      setFeedback('correct');
      
      setTimeout(() => {
        setFeedback(null);
        const remaining = gameItems.filter(item => item.id !== currentItem.id);
        
        if (remaining.length === 0) {
          // All items sorted!
          endGame();
        } else {
          setGameItems(remaining);
          setCurrentItem(remaining[0]);
        }
      }, 500);
    } else {
      // Incorrect
      soundManager.play('incorrect');
      setFeedback('incorrect');
      setScore(Math.max(0, score - 5)); // Lose 5 points but never go below 0
      
      setTimeout(() => {
        setFeedback(null);
      }, 500);
    }
  };

  const handleBackClick = () => {
    soundManager.play('back');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-100 p-6">
      {isComplete && <Confetti duration={3000} />}
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <KidsButton
            onClick={handleBackClick}
            variant="secondary"
            icon={<ArrowLeft className="w-6 h-6" />}
          >
            Back
          </KidsButton>
          
          <Mascot mode="happy" size="sm" showThought={false} />
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-2">
            ⚡ Speed Sort ⚡
          </h1>
          <p className="text-xl text-gray-700">Sort things into groups as fast as you can!</p>
        </div>

        {/* Stats */}
        {isPlaying && (
          <div className="flex gap-4 justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-orange-300">
              <p className="text-sm text-gray-600 flex items-center gap-2">
                <Timer className="w-4 h-4" /> Time
              </p>
              <p className={`text-3xl font-black ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-orange-600'}`}>
                {timeLeft}s
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-yellow-300">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-3xl font-black text-yellow-600">{score}</p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-green-300">
              <p className="text-sm text-gray-600">Items Left</p>
              <p className="text-3xl font-black text-green-600">{gameItems.length}</p>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="max-w-3xl mx-auto">
        {!isPlaying && !isComplete ? (
          // Start Screen
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 text-center space-y-6"
          >
            <div className="text-6xl">⚡🎯⚡</div>
            <h2 className="text-3xl font-black text-gray-800">Ready to Sort?</h2>
            <p className="text-xl text-gray-600">
              You have 30 seconds to sort as many items as you can!
            </p>
            
            <div className="grid grid-cols-3 gap-4 py-6">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <div key={key} className="text-center">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${info.color} flex items-center justify-center text-4xl mb-2`}>
                    {info.emoji}
                  </div>
                  <p className="font-bold text-gray-700">{info.name}</p>
                </div>
              ))}
            </div>

            <KidsButton onClick={startGame} variant="primary" className="text-2xl">
              ▶️ Start Game!
            </KidsButton>
          </motion.div>
        ) : isPlaying && currentItem ? (
          // Playing
          <div className="space-y-8">
            {/* Current Item */}
            <motion.div
              key={currentItem.id}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-yellow-300 text-center"
            >
              <p className="text-2xl font-bold text-gray-700 mb-6">Where does this belong?</p>
              <motion.div
                animate={{
                  scale: feedback === 'correct' ? [1, 1.2, 1] : feedback === 'incorrect' ? [1, 0.9, 1] : 1,
                  rotate: feedback === 'incorrect' ? [0, -10, 10, -10, 0] : 0
                }}
                className={`text-9xl mx-auto w-40 h-40 flex items-center justify-center rounded-3xl ${
                  feedback === 'correct' 
                    ? 'bg-green-200' 
                    : feedback === 'incorrect' 
                    ? 'bg-red-200' 
                    : 'bg-gradient-to-br from-yellow-100 to-orange-100'
                }`}
              >
                {currentItem.emoji}
              </motion.div>
            </motion.div>

            {/* Category Buttons */}
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(categoryInfo).map(([key, info]) => (
                <motion.button
                  key={key}
                  className={`p-8 rounded-3xl bg-gradient-to-br ${info.color} shadow-xl transform hover:scale-105 transition-all`}
                  onClick={() => handleCategoryClick(key as any)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-6xl mb-3">{info.emoji}</div>
                  <p className="text-xl font-black text-white">{info.name}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : isComplete ? (
          // Results Screen
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 text-center space-y-6"
          >
            <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
            
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
              🎉 Great Job! 🎉
            </h2>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-3 border-yellow-300">
              <p className="text-xl text-gray-700 mb-2">Final Score</p>
              <p className="text-6xl font-black text-orange-600">{score}</p>
            </div>

            {/* Stars */}
            <div className="flex gap-2 justify-center">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Star
                    className={`w-12 h-12 ${
                      score >= i * 40
                        ? 'fill-yellow-400 text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <div className="space-y-3 pt-4">
              <KidsButton onClick={startGame} variant="primary">
                🔄 Play Again
              </KidsButton>
              <KidsButton onClick={handleBackClick} variant="secondary">
                ← Back to Games
              </KidsButton>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

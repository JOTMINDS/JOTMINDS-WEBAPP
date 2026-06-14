import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KidsButton } from '../KidsButton';
import { Mascot } from '../Mascot';
import { soundManager } from '../SoundFeedback';
import { Confetti } from '../Confetti';
import { ArrowLeft, Star, Trophy, Heart } from 'lucide-react';

interface EmojieelingsProps {
  onBack: () => void;
}

interface Scenario {
  id: number;
  situation: string;
  correctEmotion: string;
  emoji: string;
  options: { emotion: string; emoji: string }[];
}

const scenarios: Scenario[] = [
  {
    id: 1,
    situation: "Your best friend gives you a surprise birthday gift!",
    correctEmotion: "Happy",
    emoji: "🎁",
    options: [
      { emotion: "Happy", emoji: "😊" },
      { emotion: "Sad", emoji: "😢" },
      { emotion: "Angry", emoji: "😠" }
    ]
  },
  {
    id: 2,
    situation: "You can't find your favorite toy anywhere.",
    correctEmotion: "Sad",
    emoji: "🧸",
    options: [
      { emotion: "Excited", emoji: "🤩" },
      { emotion: "Sad", emoji: "😢" },
      { emotion: "Silly", emoji: "😜" }
    ]
  },
  {
    id: 3,
    situation: "Someone takes your turn without asking!",
    correctEmotion: "Angry",
    emoji: "🎮",
    options: [
      { emotion: "Happy", emoji: "😊" },
      { emotion: "Angry", emoji: "😠" },
      { emotion: "Sleepy", emoji: "😴" }
    ]
  },
  {
    id: 4,
    situation: "You're going to the park to play with friends!",
    correctEmotion: "Excited",
    emoji: "🎡",
    options: [
      { emotion: "Scared", emoji: "😨" },
      { emotion: "Bored", emoji: "😑" },
      { emotion: "Excited", emoji: "🤩" }
    ]
  },
  {
    id: 5,
    situation: "You see a big, loud thunder and lightning!",
    correctEmotion: "Scared",
    emoji: "⚡",
    options: [
      { emotion: "Scared", emoji: "😨" },
      { emotion: "Happy", emoji: "😊" },
      { emotion: "Proud", emoji: "😎" }
    ]
  },
  {
    id: 6,
    situation: "You finished a really hard puzzle all by yourself!",
    correctEmotion: "Proud",
    emoji: "🧩",
    options: [
      { emotion: "Sad", emoji: "😢" },
      { emotion: "Proud", emoji: "😎" },
      { emotion: "Confused", emoji: "😕" }
    ]
  },
  {
    id: 7,
    situation: "Your friend tells a super funny joke!",
    correctEmotion: "Silly",
    emoji: "🤣",
    options: [
      { emotion: "Silly", emoji: "😜" },
      { emotion: "Angry", emoji: "😠" },
      { emotion: "Tired", emoji: "😴" }
    ]
  },
  {
    id: 8,
    situation: "You helped someone who fell down.",
    correctEmotion: "Caring",
    emoji: "🤝",
    options: [
      { emotion: "Bored", emoji: "😑" },
      { emotion: "Caring", emoji: "🥰" },
      { emotion: "Worried", emoji: "😟" }
    ]
  }
];

export function EmojiFeelings({ onBack }: EmojieelingsProps) {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const currentScenario = scenarios[currentScenarioIndex];

  const handleEmotionClick = (emotion: string) => {
    if (selectedEmotion !== null) return; // Already answered

    soundManager.play('pop');
    setSelectedEmotion(emotion);

    if (emotion === currentScenario.correctEmotion) {
      soundManager.play('correct');
      setIsCorrect(true);
      setScore(score + 10);

      setTimeout(() => {
        if (currentScenarioIndex >= scenarios.length - 1) {
          // Completed all scenarios
          soundManager.play('celebration');
          setIsComplete(true);
        } else {
          // Next scenario
          setCurrentScenarioIndex(currentScenarioIndex + 1);
          setSelectedEmotion(null);
          setIsCorrect(null);
        }
      }, 1500);
    } else {
      soundManager.play('incorrect');
      setIsCorrect(false);

      setTimeout(() => {
        setSelectedEmotion(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const handleBackClick = () => {
    soundManager.play('back');
    onBack();
  };

  const handlePlayAgain = () => {
    soundManager.play('next');
    setCurrentScenarioIndex(0);
    setScore(0);
    setSelectedEmotion(null);
    setIsCorrect(null);
    setIsComplete(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-teal-100 to-blue-100 p-6">
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
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 mb-2">
            😊 Emoji Feelings 😊
          </h1>
          <p className="text-xl text-gray-700">How would you feel in each situation?</p>
        </div>

        {/* Stats */}
        {!isComplete && (
          <div className="flex gap-4 justify-center mb-6">
            <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-green-300">
              <p className="text-sm text-gray-600">Question</p>
              <p className="text-3xl font-black text-green-600">
                {currentScenarioIndex + 1}/{scenarios.length}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-teal-300">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-3xl font-black text-teal-600">{score}</p>
            </div>
          </div>
        )}
      </div>

      {/* Game Area */}
      <div className="max-w-3xl mx-auto">
        {!isComplete ? (
          <motion.div
            key={currentScenarioIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Scenario */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-300 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="text-8xl mb-6"
              >
                {currentScenario.emoji}
              </motion.div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border-2 border-green-200">
                <Heart className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <p className="text-2xl text-gray-800 leading-relaxed">
                  {currentScenario.situation}
                </p>
              </div>
            </div>

            {/* Emotion Options */}
            <div className="text-center mb-4">
              <h3 className="text-2xl font-black text-gray-800">
                How would you feel?
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {currentScenario.options.map((option, index) => (
                <motion.button
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-3xl shadow-xl transform transition-all ${
                    selectedEmotion === option.emotion
                      ? isCorrect
                        ? 'bg-gradient-to-br from-green-400 to-green-600 scale-110 border-4 border-green-700'
                        : 'bg-gradient-to-br from-red-400 to-red-600 scale-110 border-4 border-red-700'
                      : 'bg-white hover:scale-105 border-4 border-gray-200'
                  }`}
                  onClick={() => handleEmotionClick(option.emotion)}
                  disabled={selectedEmotion !== null}
                  whileHover={{ scale: selectedEmotion === null ? 1.05 : 1 }}
                  whileTap={{ scale: selectedEmotion === null ? 0.95 : 1 }}
                >
                  <div className="text-6xl mb-3">{option.emoji}</div>
                  <p className={`text-xl font-black ${
                    selectedEmotion === option.emotion && !isCorrect
                      ? 'text-white'
                      : selectedEmotion === option.emotion && isCorrect
                      ? 'text-white'
                      : 'text-gray-800'
                  }`}>
                    {option.emotion}
                  </p>
                </motion.button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {isCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <div className={`inline-block px-8 py-4 rounded-3xl text-2xl font-black ${
                    isCorrect
                      ? 'bg-green-100 text-green-700 border-4 border-green-400'
                      : 'bg-red-100 text-red-700 border-4 border-red-400'
                  }`}>
                    {isCorrect ? '🎉 Yes! That's right!' : '❌ Try again!'}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          // Completion Screen
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-yellow-300 text-center space-y-6"
          >
            <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
            
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500">
              🎉 Feelings Expert! 🎉
            </h2>
            
            <p className="text-2xl text-gray-700">
              You understand emotions so well!
            </p>

            <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-2xl p-6 border-3 border-green-300">
              <p className="text-xl text-gray-700 mb-2">Final Score</p>
              <p className="text-6xl font-black text-green-600">{score}</p>
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
                      score >= i * 25
                        ? 'fill-yellow-400 text-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-100 border-3 border-blue-300 rounded-2xl p-4">
              <p className="text-lg text-gray-700">
                <span className="text-2xl mr-2">💡</span>
                <strong>Great job!</strong> Understanding feelings helps us be better friends!
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <KidsButton onClick={handlePlayAgain} variant="primary">
                🔄 Play Again
              </KidsButton>
              <KidsButton onClick={handleBackClick} variant="secondary">
                ← Back to Games
              </KidsButton>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KidsButton } from '../KidsButton';
import { Mascot } from '../Mascot';
import { soundManager } from '../SoundFeedback';
import { Confetti } from '../Confetti';
import { ArrowLeft, Star, Trophy, HelpCircle } from 'lucide-react';

interface PatternPuzzleProps {
  onBack: () => void;
}

// Pattern types
const shapes = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠'];
const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'];
const fruits = ['🍎', '🍊', '🍋', '🍌', '🍇', '🍓'];

interface Pattern {
  sequence: string[];
  options: string[];
  correct: string;
  hint: string;
}

const generatePattern = (level: number): Pattern => {
  const sets = [shapes, animals, fruits];
  const set = sets[Math.floor(Math.random() * sets.length)];
  
  let sequence: string[] = [];
  let correct: string;
  let hint: string;

  if (level === 1) {
    // Simple ABAB pattern
    const a = set[0];
    const b = set[1];
    sequence = [a, b, a, b, a];
    correct = b;
    hint = "The pattern goes: A, B, A, B, A...";
  } else if (level === 2) {
    // ABC pattern
    const a = set[0];
    const b = set[1];
    const c = set[2];
    sequence = [a, b, c, a, b];
    correct = c;
    hint = "The pattern goes: A, B, C, A, B...";
  } else if (level === 3) {
    // AAB pattern
    const a = set[0];
    const b = set[1];
    sequence = [a, a, b, a, a];
    correct = b;
    hint = "Two of one, then one of another!";
  } else if (level === 4) {
    // ABBA pattern
    const a = set[0];
    const b = set[1];
    sequence = [a, b, b, a, a];
    correct = b;
    hint = "It goes A, B, B, A...";
  } else {
    // ABCC pattern
    const a = set[0];
    const b = set[1];
    const c = set[2];
    sequence = [a, b, c, c, a];
    correct = b;
    hint = "Look for the repeating parts!";
  }

  // Create options (correct + 2 wrong)
  const wrong1 = set.find(item => item !== correct && !sequence.includes(item)) || set[3];
  const wrong2 = set.find(item => item !== correct && item !== wrong1 && !sequence.includes(item)) || set[4];
  const options = [correct, wrong1, wrong2].sort(() => Math.random() - 0.5);

  return { sequence, options, correct, hint };
};

export function PatternPuzzle({ onBack }: PatternPuzzleProps) {
  const [level, setLevel] = useState(1);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setPattern(generatePattern(level));
  }, [level]);

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer !== null) return; // Already answered

    soundManager.play('pop');
    setSelectedAnswer(answer);

    if (answer === pattern?.correct) {
      soundManager.play('correct');
      setIsCorrect(true);
      setScore(score + (showHint ? 5 : 10)); // Less points if hint used

      setTimeout(() => {
        if (level >= 5) {
          // Completed all levels
          soundManager.play('celebration');
          setIsComplete(true);
        } else {
          // Next level
          setLevel(level + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
          setShowHint(false);
        }
      }, 1500);
    } else {
      soundManager.play('incorrect');
      setIsCorrect(false);

      setTimeout(() => {
        setSelectedAnswer(null);
        setIsCorrect(null);
      }, 1500);
    }
  };

  const handleShowHint = () => {
    soundManager.play('pop');
    setShowHint(true);
  };

  const handleBackClick = () => {
    soundManager.play('back');
    onBack();
  };

  const handlePlayAgain = () => {
    soundManager.play('next');
    setLevel(1);
    setScore(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    setIsComplete(false);
    setPattern(generatePattern(1));
  };

  if (!pattern) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 p-6">
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
          
          <Mascot mode="thinking" size="sm" showThought={false} />
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            🔍 Pattern Detective 🔍
          </h1>
          <p className="text-xl text-gray-700">What comes next in the pattern?</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 justify-center mb-6">
          <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-purple-300">
            <p className="text-sm text-gray-600">Level</p>
            <p className="text-3xl font-black text-purple-600">{level}/5</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-pink-300">
            <p className="text-sm text-gray-600">Score</p>
            <p className="text-3xl font-black text-pink-600">{score}</p>
          </div>
        </div>
      </div>

      {/* Pattern Display */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-purple-300 mb-8">
          {/* Pattern sequence */}
          <div className="flex gap-4 justify-center items-center mb-6 flex-wrap">
            {pattern.sequence.map((item, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-5xl shadow-lg"
              >
                {item}
              </motion.div>
            ))}
            
            {/* Question mark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: pattern.sequence.length * 0.1 }}
              className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-300 to-orange-300 flex items-center justify-center text-5xl shadow-lg border-4 border-dashed border-orange-500"
            >
              ❓
            </motion.div>
          </div>

          {/* Hint button and display */}
          <div className="text-center space-y-4">
            {!showHint ? (
              <KidsButton
                onClick={handleShowHint}
                variant="secondary"
                icon={<HelpCircle className="w-5 h-5" />}
              >
                Need a Hint?
              </KidsButton>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-100 border-3 border-blue-300 rounded-2xl p-4"
              >
                <p className="text-lg text-gray-700">
                  <span className="text-2xl mr-2">💡</span>
                  {pattern.hint}
                </p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Answer Options */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-black text-gray-800 mb-4">
            Pick the next one:
          </h3>
        </div>

        <div className="flex gap-6 justify-center">
          {pattern.options.map((option, index) => (
            <motion.button
              key={index}
              className={`w-28 h-28 rounded-3xl shadow-xl flex items-center justify-center text-6xl transition-all ${
                selectedAnswer === option
                  ? isCorrect
                    ? 'bg-gradient-to-br from-green-400 to-green-600 scale-110 border-4 border-green-700'
                    : 'bg-gradient-to-br from-red-400 to-red-600 scale-110 border-4 border-red-700'
                  : 'bg-white hover:scale-105 border-4 border-gray-200'
              }`}
              onClick={() => handleAnswerClick(option)}
              disabled={selectedAnswer !== null}
              whileHover={{ scale: selectedAnswer === null ? 1.05 : 1 }}
              whileTap={{ scale: selectedAnswer === null ? 0.95 : 1 }}
            >
              {option}
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
              className="text-center mt-8"
            >
              <div className={`inline-block px-8 py-4 rounded-3xl text-2xl font-black ${
                isCorrect
                  ? 'bg-green-100 text-green-700 border-4 border-green-400'
                  : 'bg-red-100 text-red-700 border-4 border-red-400'
              }`}>
                {isCorrect ? '🎉 Correct! Amazing!' : '❌ Try again!'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 border-4 border-yellow-300"
              initial={{ y: -50 }}
              animate={{ y: 0 }}
            >
              <div className="text-center space-y-6">
                <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                  🎉 You're a Pattern Master! 🎉
                </h2>
                
                <p className="text-2xl text-gray-700">
                  You completed all 5 levels!
                </p>

                <div className="bg-purple-100 border-3 border-purple-300 rounded-2xl p-4">
                  <p className="text-lg text-gray-700">
                    <strong>Final Score:</strong>
                  </p>
                  <p className="text-5xl font-black text-purple-600">{score}</p>
                </div>

                {/* Stars based on score */}
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
                          score >= i * 15
                            ? 'fill-yellow-400 text-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-3 pt-4">
                  <KidsButton onClick={handlePlayAgain} variant="primary">
                    🔄 Play Again
                  </KidsButton>
                  <KidsButton onClick={handleBackClick} variant="secondary">
                    ← Back to Games
                  </KidsButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

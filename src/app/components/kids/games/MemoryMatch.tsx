import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KidsButton } from '../KidsButton';
import { Mascot } from '../Mascot';
import { soundManager } from '../SoundFeedback';
import { Confetti } from '../Confetti';
import { ArrowLeft, Star, Trophy } from 'lucide-react';

interface MemoryMatchProps {
  onBack: () => void;
}

const emojis = ['🐶', '🐱', '🐼', '🦊', '🐸', '🦁', '🐯', '🐮'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryMatch({ onBack }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [stars, setStars] = useState(0);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    // Create pairs
    const gameEmojis = emojis.slice(0, 6); // Use 6 pairs (12 cards)
    const pairs = [...gameEmojis, ...gameEmojis];
    
    // Shuffle
    const shuffled = pairs
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false
      }))
      .sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setIsComplete(false);
    setStars(0);
  };

  const handleCardClick = (cardId: number) => {
    // Don't allow clicking if 2 cards already flipped
    if (flippedCards.length === 2) return;
    
    // Don't allow clicking already flipped or matched cards
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;

    soundManager.play('pop');

    // Flip the card
    const newCards = cards.map(c =>
      c.id === cardId ? { ...c, isFlipped: true } : c
    );
    setCards(newCards);
    
    const newFlipped = [...flippedCards, cardId];
    setFlippedCards(newFlipped);

    // Check for match when 2 cards are flipped
    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      
      const [first, second] = newFlipped;
      const firstCard = newCards.find(c => c.id === first);
      const secondCard = newCards.find(c => c.id === second);

      if (firstCard && secondCard && firstCard.emoji === secondCard.emoji) {
        // Match!
        soundManager.play('correct');
        
        setTimeout(() => {
          const matchedCards = newCards.map(c =>
            c.id === first || c.id === second
              ? { ...c, isMatched: true }
              : c
          );
          setCards(matchedCards);
          setFlippedCards([]);
          
          const newMatches = matches + 1;
          setMatches(newMatches);

          // Check if game is complete
          if (newMatches === 6) {
            soundManager.play('celebration');
            setIsComplete(true);
            
            // Calculate stars based on moves
            let earnedStars = 3;
            if (moves + 1 > 15) earnedStars = 1;
            else if (moves + 1 > 12) earnedStars = 2;
            setStars(earnedStars);
          }
        }, 500);
      } else {
        // No match
        soundManager.play('incorrect');
        
        setTimeout(() => {
          const unflippedCards = newCards.map(c =>
            c.id === first || c.id === second
              ? { ...c, isFlipped: false }
              : c
          );
          setCards(unflippedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleBackClick = () => {
    soundManager.play('back');
    onBack();
  };

  const handlePlayAgain = () => {
    soundManager.play('next');
    initializeGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
      {isComplete && <Confetti duration={3000} />}
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <KidsButton
            onClick={handleBackClick}
            variant="primary"
            icon={<ArrowLeft className="w-6 h-6" />}
          >
            Back
          </KidsButton>
          
          <Mascot mode="happy" size="small" showThought={false} />
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            🧠 Memory Match 🧠
          </h1>
          <p className="text-xl text-gray-700">Find all the matching pairs!</p>
        </div>

        {/* Stats */}
        <div className="flex gap-4 justify-center mb-6">
          <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-blue-300">
            <p className="text-sm text-gray-600">Moves</p>
            <p className="text-3xl font-black text-blue-600">{moves}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg px-6 py-3 border-3 border-purple-300">
            <p className="text-sm text-gray-600">Matches</p>
            <p className="text-3xl font-black text-purple-600">{matches}/6</p>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="max-w-3xl mx-auto">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              className="aspect-square cursor-pointer"
              whileHover={{ scale: card.isFlipped || card.isMatched ? 1 : 1.05 }}
              whileTap={{ scale: card.isFlipped || card.isMatched ? 1 : 0.95 }}
              onClick={() => handleCardClick(card.id)}
            >
              <motion.div
                className="w-full h-full relative"
                initial={false}
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card Back */}
                <div
                  className="absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center"
                  style={{
                    backfaceVisibility: 'hidden',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  <div className="text-6xl">❓</div>
                </div>

                {/* Card Front */}
                <div
                  className={`absolute inset-0 rounded-2xl shadow-lg flex items-center justify-center ${
                    card.isMatched
                      ? 'bg-gradient-to-br from-green-300 to-green-400'
                      : 'bg-white'
                  } border-4 ${
                    card.isMatched ? 'border-green-500' : 'border-gray-200'
                  }`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-6xl">{card.emoji}</div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Completion Modal */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 border-4 border-yellow-300"
                initial={{ y: -50 }}
                animate={{ y: 0 }}
              >
                <div className="text-center space-y-6">
                  <Trophy className="w-24 h-24 mx-auto text-yellow-500" />
                  
                  <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500">
                    🎉 You Did It! 🎉
                  </h2>
                  
                  <p className="text-2xl text-gray-700">
                    You found all the pairs in <strong>{moves}</strong> moves!
                  </p>

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
                            i <= stars
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
                    <KidsButton onClick={handleBackClick} variant="primary">
                      ← Back to Games
                    </KidsButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KidsButton } from '../KidsButton';
import { Mascot } from '../Mascot';
import { soundManager } from '../SoundFeedback';
import { Confetti } from '../Confetti';
import { ArrowLeft, BookOpen, Sparkles } from 'lucide-react';

interface StoryBuilderProps {
  onBack: () => void;
}

interface StoryChoice {
  text: string;
  emoji: string;
  next?: number;
}

interface StoryNode {
  id: number;
  text: string;
  image: string;
  choices: StoryChoice[];
  isEnding?: boolean;
}

const storyNodes: StoryNode[] = [
  {
    id: 0,
    text: "One sunny morning, you wake up and find a magical door in your bedroom! What do you do?",
    image: "🚪✨",
    choices: [
      { text: "Open the door and go inside!", emoji: "🚪", next: 1 },
      { text: "Look through the keyhole first", emoji: "👁️", next: 2 },
      { text: "Call your best friend", emoji: "📱", next: 3 }
    ]
  },
  {
    id: 1,
    text: "You step through the door and find yourself in a magical forest! A friendly unicorn and a talking fox appear. Who do you follow?",
    image: "🌳🦄🦊",
    choices: [
      { text: "Follow the unicorn", emoji: "🦄", next: 4 },
      { text: "Follow the talking fox", emoji: "🦊", next: 5 }
    ]
  },
  {
    id: 2,
    text: "You peek through the keyhole and see a rainbow bridge! You carefully open the door. Where does the bridge lead?",
    image: "🌈🌉",
    choices: [
      { text: "A castle in the clouds", emoji: "🏰", next: 6 },
      { text: "A beach with golden sand", emoji: "🏖️", next: 7 }
    ]
  },
  {
    id: 3,
    text: "Your friend arrives and you both decide to go through the door together! You find three paths. Which one do you choose?",
    image: "🛤️🛤️🛤️",
    choices: [
      { text: "The sparkly path", emoji: "✨", next: 8 },
      { text: "The flowery path", emoji: "🌸", next: 9 }
    ]
  },
  {
    id: 4,
    text: "The unicorn takes you to a magical garden where wishes come true! You can make ONE wish. What do you wish for?",
    image: "🌺💫",
    choices: [
      { text: "To fly like a bird", emoji: "🦅", next: 10 },
      { text: "To talk to animals", emoji: "🐾", next: 11 }
    ]
  },
  {
    id: 5,
    text: "The clever fox leads you to a treasure cave! Inside are three treasure chests. Pick one!",
    image: "💎🏆👑",
    choices: [
      { text: "The golden chest", emoji: "🏆", next: 12 },
      { text: "The sparkly chest", emoji: "💎", next: 13 }
    ]
  },
  {
    id: 6,
    text: "You reach the cloud castle and meet a friendly dragon who offers you a ride! Where do you want to fly?",
    image: "🐉☁️",
    choices: [
      { text: "To see the stars up close", emoji: "⭐", next: 14 },
      { text: "Around the rainbow", emoji: "🌈", next: 15 }
    ]
  },
  {
    id: 7,
    text: "On the golden beach, you find a message in a bottle! It's a treasure map! Do you follow it?",
    image: "🏴‍☠️🗺️",
    choices: [
      { text: "Yes! Follow the map", emoji: "🧭", next: 16 },
      { text: "Build a sandcastle first", emoji: "🏰", next: 17 }
    ]
  },
  {
    id: 8,
    text: "The sparkly path leads to a candy kingdom! Everything is made of sweets. What a sweet adventure!",
    image: "🍭🍬🍰",
    choices: [],
    isEnding: true
  },
  {
    id: 9,
    text: "The flowery path takes you to a butterfly garden where you learn to dance with the butterflies! What a beautiful day!",
    image: "🦋🌺🌸",
    choices: [],
    isEnding: true
  },
  {
    id: 10,
    text: "You grow beautiful wings and soar high in the sky! You can see the whole magical world below. What an amazing view!",
    image: "🦅☁️🌍",
    choices: [],
    isEnding: true
  },
  {
    id: 11,
    text: "Now you can talk to all animals! You make friends with birds, rabbits, and even a wise old owl. What fun conversations!",
    image: "🦉🐰🐦",
    choices: [],
    isEnding: true
  },
  {
    id: 12,
    text: "The golden chest contains a magic crown that makes you the ruler of fun! You declare every day is playtime!",
    image: "👑🎉🎊",
    choices: [],
    isEnding: true
  },
  {
    id: 13,
    text: "The sparkly chest has a magical paintbrush! Everything you paint becomes real. You create the coolest art ever!",
    image: "🎨🖌️✨",
    choices: [],
    isEnding: true
  },
  {
    id: 14,
    text: "You fly among the stars and discover they're actually friendly star creatures! They teach you a cosmic dance!",
    image: "⭐🌟💫",
    choices: [],
    isEnding: true
  },
  {
    id: 15,
    text: "Flying around the rainbow, you slide down each color and collect rainbow powers! Now you can create rainbows anywhere!",
    image: "🌈✨🎨",
    choices: [],
    isEnding: true
  },
  {
    id: 16,
    text: "The treasure map leads you to a chest full of magical shells! Each one grants you a special ocean power!",
    image: "🐚💎🌊",
    choices: [],
    isEnding: true
  },
  {
    id: 17,
    text: "While building your sandcastle, it magically grows into a real castle! You're now the beach king/queen!",
    image: "🏰👑🏖️",
    choices: [],
    isEnding: true
  }
];

export function StoryBuilder({ onBack }: StoryBuilderProps) {
  const [currentNode, setCurrentNode] = useState(0);
  const [storyPath, setStoryPath] = useState<number[]>([0]);
  const [showEnding, setShowEnding] = useState(false);

  const node = storyNodes[currentNode];

  const handleChoice = (choice: StoryChoice) => {
    soundManager.play('pop');
    
    if (choice.next !== undefined) {
      setCurrentNode(choice.next);
      setStoryPath([...storyPath, choice.next]);
      
      // Check if next node is an ending
      const nextNode = storyNodes[choice.next];
      if (nextNode.isEnding) {
        setTimeout(() => {
          soundManager.play('celebration');
          setShowEnding(true);
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
    setCurrentNode(0);
    setStoryPath([0]);
    setShowEnding(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      {showEnding && <Confetti duration={3000} />}
      
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
          
          <Mascot mode="excited" size="sm" showThought={false} />
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-2">
            📚 Story Builder 📚
          </h1>
          <p className="text-xl text-gray-700">Create your own magical adventure!</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 justify-center mb-6">
          {storyPath.map((_, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-500"
            />
          ))}
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-3xl mx-auto">
        <motion.div
          key={currentNode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-pink-300 mb-8"
        >
          {/* Story Image */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-8xl text-center mb-6"
          >
            {node.image}
          </motion.div>

          {/* Story Text */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
            <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <p className="text-2xl text-gray-800 leading-relaxed text-center">
              {node.text}
            </p>
          </div>

          {/* Choices */}
          {node.choices.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-black text-center text-gray-700 mb-4">
                What do you choose?
              </h3>
              
              {node.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-full bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white rounded-2xl p-4 shadow-lg transform hover:scale-105 transition-all"
                  onClick={() => handleChoice(choice)}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl">{choice.emoji}</span>
                    <span className="text-xl font-bold">{choice.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="bg-yellow-100 border-4 border-yellow-300 rounded-2xl p-6">
                <Sparkles className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                <p className="text-2xl font-black text-gray-800">
                  🎉 The End! 🎉
                </p>
                <p className="text-lg text-gray-600 mt-2">
                  What a wonderful story you created!
                </p>
              </div>

              <div className="space-y-3">
                <KidsButton onClick={handlePlayAgain} variant="primary">
                  📖 Create New Story
                </KidsButton>
                <KidsButton onClick={handleBackClick} variant="secondary">
                  ← Back to Games
                </KidsButton>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Fun fact about creativity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-100 border-3 border-blue-300 rounded-2xl p-4 text-center"
        >
          <p className="text-lg text-gray-700">
            <span className="text-2xl mr-2">💡</span>
            <strong>Did you know?</strong> Every choice you make creates a different adventure! 
            Try playing again to discover new endings!
          </p>
        </motion.div>
      </div>
    </div>
  );
}

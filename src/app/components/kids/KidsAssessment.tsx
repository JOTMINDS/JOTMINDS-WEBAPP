import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mascot, CelebratingMascot, EncouragingMascot } from './Mascot';
import { KidsButton } from './KidsButton';
import { KidsCard } from './KidsCard';
import { AudioNarration, NarratedText } from './AudioNarration';
import { Confetti, CelebrationEffect } from './Confetti';
import { useSound } from './SoundFeedback';
import { TimeRemaining, MotivationalProgress } from './ProgressFlow';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { submitAssessment } from '../../utils/api';
import { useAuth } from '../AuthContext';
import { createClient } from '../../utils/supabase/client';
import { setAuthToken } from '../../utils/api';

interface KidsQuestion {
  id: string;
  question: string;
  audioText: string;
  options: {
    id: string;
    text: string;
    emoji: string;
    image?: string;
  }[];
}

interface KidsAssessmentProps {
  type: 'learning' | 'thinking' | 'decision' | 'problem-solving' | 'social-thinking';
  onComplete: (results: any) => void;
  onBack: () => void;
}

// Kid-friendly questions for each assessment type - SUPER SIMPLE!
const kidsQuestions: Record<string, KidsQuestion[]> = {
  learning: [
    {
      id: 'L1',
      question: 'How do you learn best?',
      audioText: 'How do you learn best?',
      options: [
        { id: 'visual', text: 'Pictures', emoji: '👀' },
        { id: 'auditory', text: 'Sounds', emoji: '👂' },
        { id: 'kinesthetic', text: 'Doing', emoji: '✋' }
      ]
    },
    {
      id: 'L2',
      question: 'What do you like most?',
      audioText: 'What do you like most?',
      options: [
        { id: 'visual', text: 'Drawing', emoji: '🎨' },
        { id: 'auditory', text: 'Music', emoji: '🎵' },
        { id: 'kinesthetic', text: 'Playing', emoji: '⚽' }
      ]
    },
    {
      id: 'L3',
      question: 'How do you remember things?',
      audioText: 'How do you remember things?',
      options: [
        { id: 'visual', text: 'Seeing', emoji: '📷' },
        { id: 'auditory', text: 'Hearing', emoji: '🔊' },
        { id: 'kinesthetic', text: 'Doing', emoji: '🏃' }
      ]
    },
    {
      id: 'L4',
      question: 'What helps you focus?',
      audioText: 'What helps you focus?',
      options: [
        { id: 'visual', text: 'Colors', emoji: '🌈' },
        { id: 'auditory', text: 'Listening', emoji: '📖' },
        { id: 'kinesthetic', text: 'Moving', emoji: '🤸' }
      ]
    },
    {
      id: 'L5',
      question: 'When building something...',
      audioText: 'When building something, what do you do?',
      options: [
        { id: 'visual', text: 'Look', emoji: '📸' },
        { id: 'auditory', text: 'Listen', emoji: '💬' },
        { id: 'kinesthetic', text: 'Start!', emoji: '🔨' }
      ]
    }
  ],
  thinking: [
    {
      id: 'T1',
      question: 'How do you solve puzzles?',
      audioText: 'How do you solve puzzles?',
      options: [
        { id: 'analytical', text: 'Step by step', emoji: '🧩' },
        { id: 'creative', text: 'Try new ways', emoji: '💡' },
        { id: 'practical', text: 'What works', emoji: '✓' }
      ]
    },
    {
      id: 'T2',
      question: 'What games do you love?',
      audioText: 'What games do you love?',
      options: [
        { id: 'analytical', text: 'Brain games', emoji: '🎯' },
        { id: 'creative', text: 'Pretend', emoji: '🎭' },
        { id: 'practical', text: 'Sports', emoji: '⚽' }
      ]
    },
    {
      id: 'T3',
      question: 'When you have a problem...',
      audioText: 'When you have a problem, what do you do?',
      options: [
        { id: 'analytical', text: 'Think hard', emoji: '🤔' },
        { id: 'creative', text: 'Be creative', emoji: '💫' },
        { id: 'practical', text: 'Do it!', emoji: '👍' }
      ]
    },
    {
      id: 'T4',
      question: 'What do you like to make?',
      audioText: 'What do you like to make?',
      options: [
        { id: 'analytical', text: 'Organized', emoji: '📊' },
        { id: 'creative', text: 'Imaginary', emoji: '🎨' },
        { id: 'practical', text: 'Useful', emoji: '🔧' }
      ]
    },
    {
      id: 'T5',
      question: 'How do you learn?',
      audioText: 'How do you learn?',
      options: [
        { id: 'analytical', text: 'Know why', emoji: '❓' },
        { id: 'creative', text: 'Imagine', emoji: '🌟' },
        { id: 'practical', text: 'See how', emoji: '⚙️' }
      ]
    }
  ],
  decision: [
    {
      id: 'D1',
      question: 'Picking a game...',
      audioText: 'When picking a game, what do you do?',
      options: [
        { id: 'quick', text: 'Quick!', emoji: '⚡' },
        { id: 'careful', text: 'Think', emoji: '🤔' },
        { id: 'social', text: 'Ask friends', emoji: '👥' }
      ]
    },
    {
      id: 'D2',
      question: 'Something is hard...',
      audioText: 'When something is hard, what do you do?',
      options: [
        { id: 'quick', text: 'Try it!', emoji: '💪' },
        { id: 'careful', text: 'Make a plan', emoji: '📝' },
        { id: 'social', text: 'Get help', emoji: '🤝' }
      ]
    },
    {
      id: 'D3',
      question: 'Making a choice...',
      audioText: 'When making a choice, what do you do?',
      options: [
        { id: 'quick', text: 'My feeling', emoji: '❤️' },
        { id: 'careful', text: 'Think it out', emoji: '⚖️' },
        { id: 'social', text: 'Talk first', emoji: '💬' }
      ]
    },
    {
      id: 'D4',
      question: 'Starting a new game...',
      audioText: 'When starting a new game, what do you do?',
      options: [
        { id: 'quick', text: 'Jump in!', emoji: '🎮' },
        { id: 'careful', text: 'Learn rules', emoji: '📖' },
        { id: 'social', text: 'Play together', emoji: '👨‍👩‍👧' }
      ]
    },
    {
      id: 'D5',
      question: 'What matters most?',
      audioText: 'What matters most to you?',
      options: [
        { id: 'quick', text: 'Fun!', emoji: '😄' },
        { id: 'careful', text: 'Do it right', emoji: '✓' },
        { id: 'social', text: 'Friends!', emoji: '🎉' }
      ]
    }
  ],
  'problem-solving': [
    {
      id: 'PS1',
      question: 'I solve problems by...',
      audioText: 'I solve problems by...',
      options: [
        { id: 'logical', text: 'Thinking step by step', emoji: '🧩' },
        { id: 'creative', text: 'Trying fun ideas', emoji: '💡' },
        { id: 'trial', text: 'Testing things', emoji: '🔬' }
      ]
    },
    {
      id: 'PS2',
      question: 'I fix broken things by...',
      audioText: 'I fix broken things by...',
      options: [
        { id: 'logical', text: 'Finding the problem', emoji: '🔍' },
        { id: 'creative', text: 'Making it new', emoji: '✨' },
        { id: 'trial', text: 'Trying ways', emoji: '🔧' }
      ]
    },
    {
      id: 'PS3',
      question: 'I build puzzles by...',
      audioText: 'I build puzzles by...',
      options: [
        { id: 'logical', text: 'Using rules', emoji: '📐' },
        { id: 'creative', text: 'Being creative', emoji: '🎨' },
        { id: 'trial', text: 'Testing pieces', emoji: '🧩' }
      ]
    },
    {
      id: 'PS4',
      question: 'I play new games by...',
      audioText: 'I play new games by...',
      options: [
        { id: 'logical', text: 'Learning first', emoji: '📖' },
        { id: 'creative', text: 'Making up ways', emoji: '🌟' },
        { id: 'trial', text: 'Just trying!', emoji: '🎮' }
      ]
    },
    {
      id: 'PS5',
      question: 'I like challenges that...',
      audioText: 'I like challenges that...',
      options: [
        { id: 'logical', text: 'Make me think', emoji: '🤔' },
        { id: 'creative', text: 'Are different', emoji: '🎪' },
        { id: 'trial', text: 'I can do', emoji: '💪' }
      ]
    },
    {
      id: 'PS6',
      question: 'I help friends by...',
      audioText: 'I help friends by...',
      options: [
        { id: 'logical', text: 'Explaining it', emoji: '💬' },
        { id: 'creative', text: 'Finding new ways', emoji: '🌈' },
        { id: 'trial', text: 'Showing them', emoji: '👥' }
      ]
    },
    {
      id: 'PS7',
      question: 'I make decisions by...',
      audioText: 'I make decisions by...',
      options: [
        { id: 'logical', text: 'Thinking hard', emoji: '⚖️' },
        { id: 'creative', text: 'Imagining it', emoji: '💭' },
        { id: 'trial', text: 'Trying it out', emoji: '🚀' }
      ]
    },
    {
      id: 'PS8',
      question: 'I learn best by...',
      audioText: 'I learn best by...',
      options: [
        { id: 'logical', text: 'Understanding why', emoji: '❓' },
        { id: 'creative', text: 'Making it fun', emoji: '🎉' },
        { id: 'trial', text: 'Doing it myself', emoji: '✋' }
      ]
    },
    {
      id: 'PS9',
      question: 'I finish tasks by...',
      audioText: 'I finish tasks by...',
      options: [
        { id: 'logical', text: 'Following steps', emoji: '📝' },
        { id: 'creative', text: 'My own way', emoji: '🦋' },
        { id: 'trial', text: 'Trying until done', emoji: '✓' }
      ]
    },
    {
      id: 'PS10',
      question: 'I like problems that...',
      audioText: 'I like problems that...',
      options: [
        { id: 'logical', text: 'Need thinking', emoji: '🧠' },
        { id: 'creative', text: 'Are surprising', emoji: '🎁' },
        { id: 'trial', text: 'I can solve!', emoji: '🏆' }
      ]
    }
  ],
  'social-thinking': [
    {
      id: 'ST1',
      question: 'I play with friends by...',
      audioText: 'I play with friends by...',
      options: [
        { id: 'leader', text: 'Leading games', emoji: '👑' },
        { id: 'helper', text: 'Helping everyone', emoji: '🤝' },
        { id: 'follower', text: 'Joining in', emoji: '🎈' }
      ]
    },
    {
      id: 'ST2',
      question: 'I make friends by...',
      audioText: 'I make friends by...',
      options: [
        { id: 'leader', text: 'Being friendly!', emoji: '😊' },
        { id: 'helper', text: 'Being kind', emoji: '💝' },
        { id: 'follower', text: 'Being fun', emoji: '🎉' }
      ]
    },
    {
      id: 'ST3',
      question: 'I share toys by...',
      audioText: 'I share toys by...',
      options: [
        { id: 'leader', text: 'Organizing turns', emoji: '⏰' },
        { id: 'helper', text: 'Asking nicely', emoji: '🌟' },
        { id: 'follower', text: 'Waiting my turn', emoji: '⏳' }
      ]
    },
    {
      id: 'ST4',
      question: 'I help classmates by...',
      audioText: 'I help classmates by...',
      options: [
        { id: 'leader', text: 'Showing them', emoji: '👨‍🏫' },
        { id: 'helper', text: 'Listening first', emoji: '👂' },
        { id: 'follower', text: 'Working together', emoji: '👥' }
      ]
    },
    {
      id: 'ST5',
      question: 'I join groups by...',
      audioText: 'I join groups by...',
      options: [
        { id: 'leader', text: 'Starting ideas', emoji: '💡' },
        { id: 'helper', text: 'Making friends', emoji: '🤗' },
        { id: 'follower', text: 'Being part of it', emoji: '🎭' }
      ]
    },
    {
      id: 'ST6',
      question: 'I solve fights by...',
      audioText: 'I solve fights by...',
      options: [
        { id: 'leader', text: 'Finding solutions', emoji: '🎯' },
        { id: 'helper', text: 'Helping talk', emoji: '💬' },
        { id: 'follower', text: 'Being peaceful', emoji: '☮️' }
      ]
    },
    {
      id: 'ST7',
      question: 'I work in teams by...',
      audioText: 'I work in teams by...',
      options: [
        { id: 'leader', text: 'Giving ideas', emoji: '🗣️' },
        { id: 'helper', text: 'Helping out', emoji: '🤲' },
        { id: 'follower', text: 'Doing my part', emoji: '⭐' }
      ]
    },
    {
      id: 'ST8',
      question: 'I show care by...',
      audioText: 'I show care by...',
      options: [
        { id: 'leader', text: 'Checking on friends', emoji: '❤️' },
        { id: 'helper', text: 'Listening lots', emoji: '👀' },
        { id: 'follower', text: 'Being nice', emoji: '😇' }
      ]
    },
    {
      id: 'ST9',
      question: 'I understand others by...',
      audioText: 'I understand others by...',
      options: [
        { id: 'leader', text: 'Asking questions', emoji: '❓' },
        { id: 'helper', text: 'Feeling with them', emoji: '💖' },
        { id: 'follower', text: 'Watching them', emoji: '👁️' }
      ]
    },
    {
      id: 'ST10',
      question: 'I like being with...',
      audioText: 'I like being with...',
      options: [
        { id: 'leader', text: 'Everyone!', emoji: '🌍' },
        { id: 'helper', text: 'Close friends', emoji: '👭' },
        { id: 'follower', text: 'Small groups', emoji: '🧑‍🤝‍🧑' }
      ]
    }
  ]
};

export function KidsAssessment({ type, onComplete, onBack }: KidsAssessmentProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { refreshUser } = useAuth();
  const { play } = useSound();

  const questions = kidsQuestions[type] || [];
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const assessmentConfig = {
    learning: { 
      color: '#667eea', 
      icon: '📚', 
      title: 'Learning Style Quiz',
      mascotMessage: 'Let\'s play a brain game! 🎮'
    },
    thinking: { 
      color: '#4ECDC4', 
      icon: '🧠', 
      title: 'Thinking Style Quiz',
      mascotMessage: 'Time for a fun quiz! 🎉'
    },
    decision: { 
      color: '#FF9800', 
      icon: '🎯', 
      title: 'Decision Style Quiz',
      mascotMessage: 'Ready to play? Let\'s go! 🚀'
    },
    'problem-solving': {
      color: '#9333ea',
      icon: '🧩',
      title: 'Problem-Solving Quiz',
      mascotMessage: 'Let\'s solve puzzles! 🧩'
    },
    'social-thinking': {
      color: '#ec4899',
      icon: '👥',
      title: 'Social-Thinking Quiz',
      mascotMessage: 'Let\'s play together! 👥'
    }
  };

  const config = assessmentConfig[type];

  useEffect(() => {
    // Load existing answer for this question
    if (currentQuestion) {
      setSelectedOption(answers[currentQuestion.id] || null);
    }
  }, [currentQuestionIndex, currentQuestion, answers]);

  const handleSelectOption = (optionId: string) => {
    // Only show feedback if this is a NEW answer (not changing answer)
    const isNewAnswer = !answers[currentQuestion.id];
    
    // Play pop sound when selecting an option
    play('pop');
    
    setSelectedOption(optionId);
    setAnswers({ ...answers, [currentQuestion.id]: optionId });
    
    // Show feedback popup only for NEW answers
    if (isNewAnswer) {
      setShowFeedback(true);
      
      // Play celebration sound
      play('celebration');
      
      // Auto-advance after feedback (2 seconds)
      setTimeout(() => {
        setShowFeedback(false);
        
        // Wait a bit more then auto-advance
        setTimeout(() => {
          handleNext();
        }, 300);
      }, 1800);
    }
  };

  const handleNext = () => {
    if (!selectedOption) return;

    if (currentQuestionIndex < questions.length - 1) {
      // Play next sound when moving to next question
      play('next');
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Assessment complete!
      play('celebration');
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleComplete = async () => {
    setShowCelebration(true);

    // Calculate results based on most selected option type
    const scoreTally: Record<string, number> = {};
    Object.values(answers).forEach(optionId => {
      scoreTally[optionId] = (scoreTally[optionId] || 0) + 1;
    });

    const dominantStyle = Object.entries(scoreTally).sort((a, b) => b[1] - a[1])[0]?.[0] || 'balanced';

    // Map assessment type to backend type
    const assessmentTypeMap: Record<string, string> = {
      learning: 'kolb',
      thinking: 'sternberg',
      decision: 'dual-process'
    };

    const backendType = assessmentTypeMap[type];

    // Convert answers to array format for backend
    const answersArray = Object.entries(answers).map(([questionId, optionId]) => ({
      questionId,
      answerId: optionId
    }));

    // Save to backend
    try {
      // Ensure we have a valid session token before submitting
      console.log('[KidsAssessment] Getting current session for submission...');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        console.log('[KidsAssessment] Session found, setting auth token');
        setAuthToken(session.access_token);
        
        console.log('[KidsAssessment] Submitting assessment...');
        await submitAssessment(
          backendType,
          answersArray,
          { dominantStyle, scores: scoreTally },
          [], // strengths - empty for kids mode
          [], // weaknesses - empty for kids mode
          []  // recommendations - empty for kids mode
        );
        
        console.log('[KidsAssessment] Assessment submitted successfully');
        
        // Refresh user data to get updated assessmentsCompleted
        await refreshUser();
      } else {
        console.warn('[KidsAssessment] No active session found - skipping backend save');
        console.warn('[KidsAssessment] Kids experience will continue normally');
      }
    } catch (error) {
      console.error('[KidsAssessment] Failed to save assessment:', error);
      // Continue anyway - don't block the kids experience
    }

    // Wait for celebration animation
    setTimeout(() => {
      onComplete({
        results: { dominantStyle, scores: scoreTally },
        insights: `You're ${dominantStyle}! Great job completing the quiz!`
      });
    }, 3000);
  };

  // INTRO SCREEN - Shows before first question
  if (showIntro) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{ 
          background: `linear-gradient(135deg, ${config.color}20 0%, #FFD70020 50%, #FF6B9D20 100%)`
        }}
      >
        <div className="max-w-4xl w-full">
          {/* Back Button */}
          <motion.button
            className="mb-8 w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center"
            onClick={onBack}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-8 h-8 text-gray-700" />
          </motion.button>

          <div className="text-center">
            {/* Mascot at Top */}
            <motion.div
              className="flex justify-center mb-8"
              initial={{ scale: 0, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 120 }}
            >
              <EncouragingMascot message="" size="large" />
            </motion.div>

            {/* Speech Bubble Below Mascot */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                {/* Speech Bubble Tail (pointing UP to mascot) */}
                <div 
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: '30px solid transparent',
                    borderRight: '30px solid transparent',
                    borderBottom: `30px solid ${config.color}`
                  }}
                />

                {/* Speech Bubble */}
                <motion.div
                  className="bg-white rounded-3xl shadow-2xl px-12 py-8 relative"
                  style={{ border: `8px solid ${config.color}` }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  {/* Simple One-Line Message */}
                  <NarratedText text={config.mascotMessage} autoPlay={true}>
                    <h1 className="text-5xl md:text-6xl font-black" style={{ color: config.color }}>
                      {config.mascotMessage}
                    </h1>
                  </NarratedText>
                </motion.div>
              </div>
            </motion.div>

            {/* Animated Icon */}
            <motion.div
              className="mb-12"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.5 }}
            >
              <motion.div
                className="text-[200px] leading-none"
                animate={{ 
                  rotate: [0, -15, 15, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {config.icon}
              </motion.div>
            </motion.div>

            {/* Giant START Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: "spring", stiffness: 120 }}
            >
              <motion.button
                className="rounded-full shadow-2xl text-white mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
                  border: '10px solid white',
                  width: '280px',
                  height: '280px',
                }}
                whileHover={{ 
                  scale: 1.15, 
                  rotate: 5,
                  boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
                }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  play('celebration');
                  setShowIntro(false);
                }}
                animate={{
                  y: [0, -20, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-8xl mb-3">🚀</span>
                  <span className="text-5xl font-black">START!</span>
                </div>
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // CELEBRATION SCREEN - Shows after last question
  if (showCelebration) {
    // Badge titles by quiz type
    const badgeTitles: Record<string, string> = {
      learning: "Super Learner!",
      thinking: "Super Thinker!",
      decision: "Super Decider!",
      'problem-solving': "Puzzle Master!",
      'social-thinking': "Friendship Star!"
    };

    const badgeEmojis: Record<string, string> = {
      learning: "📚",
      thinking: "🧠",
      decision: "🎯",
      'problem-solving': "🧩",
      'social-thinking': "👥"
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #FF6B9D15 50%, #FEC16330 100%)' }}>
        {/* Heavy Confetti */}
        <Confetti show={true} duration={4000} density="heavy" />
        
        <div className="text-center relative max-w-4xl w-full">
          {/* Giant Animated Mascot */}
          <motion.div
            initial={{ scale: 0, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
          >
            <CelebratingMascot message="" size="xlarge" />
          </motion.div>

          {/* "You Did It!" Message */}
          <motion.h1
            className="text-7xl md:text-8xl font-black mt-8 mb-4"
            style={{ 
              color: config.color,
              textShadow: '4px 4px 0px rgba(0,0,0,0.1)'
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            YOU DID IT!
          </motion.h1>

          {/* Stars Earned Display */}
          <motion.div
            className="flex justify-center items-center gap-4 mb-8"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            {[...Array(questions.length)].map((_, i) => (
              <motion.span
                key={i}
                className="text-7xl"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: 0.8 + (i * 0.1),
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ scale: 1.2, rotate: 15 }}
              >
                ⭐
              </motion.span>
            ))}
          </motion.div>

          {/* Stars Count */}
          <motion.p
            className="text-4xl font-black text-gray-700 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            {questions.length} Stars Earned!
          </motion.p>

          {/* Badge Award - Big and Prominent */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 150, damping: 12 }}
          >
            <div 
              className="relative inline-block"
            >
              {/* Badge Background Circle */}
              <motion.div
                className="w-72 h-72 rounded-full flex flex-col items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
                  border: '12px solid white'
                }}
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* Badge Icon */}
                <motion.div
                  className="text-9xl mb-2"
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
                  {badgeEmojis[type]}
                </motion.div>

                {/* Badge Title */}
                <div className="text-white text-center px-4">
                  <p className="text-4xl font-black">
                    {badgeTitles[type]}
                  </p>
                </div>
              </motion.div>

              {/* Sparkle Effects Around Badge */}
              <motion.div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                  <motion.div
                    key={angle}
                    className="absolute text-5xl"
                    style={{
                      top: `${Math.sin((angle * Math.PI) / 180) * 180}px`,
                      left: `${Math.cos((angle * Math.PI) / 180) * 180}px`,
                    }}
                    animate={{
                      scale: [0, 1.2, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.25
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col md:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0 }}
          >
            {/* Play Again Button */}
            <motion.button
              className="rounded-full shadow-2xl text-white min-w-[280px] py-8 px-12"
              style={{
                background: `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`,
                border: '8px solid white'
              }}
              whileHover={{ 
                scale: 1.1, 
                rotate: 5,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                play('pop');
                setShowCelebration(false);
                setShowIntro(true);
                setCurrentQuestionIndex(0);
                setAnswers({});
                setSelectedOption(null);
              }}
            >
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl">🔄</span>
                <span className="text-4xl font-black">Play Again</span>
              </div>
            </motion.button>

            {/* Home Button */}
            <motion.button
              className="rounded-full shadow-2xl bg-white text-gray-800 min-w-[280px] py-8 px-12"
              style={{
                border: `8px solid ${config.color}`
              }}
              whileHover={{ 
                scale: 1.1, 
                rotate: -5,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                play('pop');
                onComplete(null);
              }}
            >
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl">🏠</span>
                <span className="text-4xl font-black">Home</span>
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(135deg, #667eea15 0%, #FF6B9D15 50%, #FEC16330 100%)' }}>
      <div className="max-w-6xl w-full">
        {/* Simple Header - Just back button and stars */}
        <div className="flex items-center justify-between mb-8">
          {/* Back Button */}
          <motion.button
            onClick={onBack}
            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowLeft className="w-8 h-8 text-gray-700" />
          </motion.button>

          {/* Stars Progress (1 of 5) */}
          <div className="flex items-center gap-3">
            {[...Array(questions.length)].map((_, i) => (
              <motion.div
                key={i}
                className="text-5xl"
                initial={{ scale: 0 }}
                animate={{ 
                  scale: i < currentQuestionIndex ? 1 : i === currentQuestionIndex ? 1.2 : 0.8,
                  rotate: i === currentQuestionIndex ? [0, -10, 10, 0] : 0
                }}
                transition={{ 
                  scale: { duration: 0.3 },
                  rotate: { duration: 2, repeat: i === currentQuestionIndex ? Infinity : 0 }
                }}
              >
                {i < currentQuestionIndex ? '⭐' : i === currentQuestionIndex ? '🌟' : '☆'}
              </motion.div>
            ))}
          </div>

          {/* Audio Button */}
          <AudioNarration
            text={currentQuestion?.audioText || ''}
            autoPlay={true}
          />
        </div>

        {/* Question - HUGE and prominent */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion?.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Question Text - ONE SENTENCE, HUGE */}
            <motion.div
              className="mb-12"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-800 mb-8">
                {currentQuestion?.question}
              </h1>
            </motion.div>

            {/* Answer Buttons - HUGE EMOJI BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {currentQuestion?.options.map((option, index) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, scale: 0.5, y: 50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    delay: 0.2 + (index * 0.15),
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectOption(option.id)}
                  className="relative rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden group"
                  style={{
                    background: selectedOption === option.id 
                      ? `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`
                      : 'white',
                    border: `8px solid ${selectedOption === option.id ? config.color : '#E5E7EB'}`,
                    minHeight: '280px'
                  }}
                >
                  {/* Selected Sparkle Effect */}
                  {selectedOption === option.id && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="absolute top-4 right-4 text-6xl"
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.2, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                          scale: { duration: 1, repeat: Infinity }
                        }}
                      >
                        ✨
                      </motion.div>
                    </motion.div>
                  )}

                  {/* GIANT Emoji */}
                  <motion.div
                    className="text-9xl mb-4"
                    animate={selectedOption === option.id ? {
                      scale: [1, 1.15, 1],
                      rotate: [0, -5, 5, 0]
                    } : {}}
                    transition={{
                      duration: 0.8,
                      repeat: selectedOption === option.id ? Infinity : 0,
                      repeatDelay: 0.2
                    }}
                  >
                    {option.emoji}
                  </motion.div>

                  {/* Minimal Text */}
                  <p 
                    className="text-2xl md:text-3xl font-black px-4"
                    style={{ 
                      color: selectedOption === option.id ? 'white' : '#374151'
                    }}
                  >
                    {option.text}
                  </p>

                  {/* Giant Checkmark */}
                  {selectedOption === option.id && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl"
                    >
                      <span className="text-4xl">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* NEXT Button - HUGE and obvious (hidden during feedback) */}
            {!showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.7 }}
              >
                <motion.button
                  className="rounded-full shadow-2xl text-white mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: selectedOption 
                      ? `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`
                      : '#D1D5DB',
                    border: '10px solid white',
                    width: '240px',
                    height: '240px',
                  }}
                  whileHover={selectedOption ? { 
                    scale: 1.1, 
                    rotate: 5,
                    boxShadow: '0 30px 60px rgba(0,0,0,0.4)'
                  } : {}}
                  whileTap={selectedOption ? { scale: 0.95 } : {}}
                  onClick={handleNext}
                  disabled={!selectedOption || showFeedback}
                  animate={selectedOption ? {
                    y: [0, -15, 0],
                  } : {}}
                  transition={{
                    y: {
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-7xl mb-2">
                      {currentQuestionIndex === questions.length - 1 ? '🎉' : '👉'}
                    </span>
                    <span className="text-4xl font-black">
                      {currentQuestionIndex === questions.length - 1 ? 'DONE!' : 'NEXT!'}
                    </span>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Answer Feedback Popup */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: 'rgba(0, 0, 0, 0.4)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Confetti Burst */}
              <Confetti show={true} duration={2000} density="medium" />

              {/* Feedback Card */}
              <motion.div
                className="relative bg-white rounded-[40px] shadow-2xl p-12 text-center max-w-2xl mx-4"
                style={{ border: `12px solid ${config.color}` }}
                initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {/* Celebrating Mascot */}
                <motion.div
                  className="mb-6"
                  initial={{ scale: 0, y: -30 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                >
                  <CelebratingMascot message="" size="large" />
                </motion.div>

                {/* Encouraging Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 
                    className="text-6xl md:text-7xl font-black mb-4"
                    style={{ color: config.color }}
                  >
                    {['Great job!', 'Awesome!', 'Amazing!', 'Fantastic!', 'You rock!'][Math.floor(Math.random() * 5)]}
                  </h2>
                </motion.div>

                {/* Star Award Animation */}
                <motion.div
                  className="flex justify-center items-center gap-2 mt-8"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
                >
                  <motion.span
                    className="text-8xl"
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.2, 1.1, 1.2, 1]
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatDelay: 0.5
                    }}
                  >
                    ⭐
                  </motion.span>
                  <motion.span
                    className="text-5xl font-black"
                    style={{ color: config.color }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    +1
                  </motion.span>
                </motion.div>

                {/* Sparkle Effects Around Star */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                >
                  {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                    <motion.div
                      key={angle}
                      className="absolute text-4xl"
                      style={{
                        top: `${Math.sin((angle * Math.PI) / 180) * 150}px`,
                        left: `${Math.cos((angle * Math.PI) / 180) * 150}px`,
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2
                      }}
                    >
                      ✨
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
/**
 * KIDS ASSESSMENT - APPROVED QUESTION SET
 * 
 * Uses the approved 500-question format:
 * - 1 short sentence ("I..." statement)
 * - 3-emoji response (😊 / 😐 / ☹)
 * - Simple, observable behaviors
 * - Age-appropriate for 6-10 years
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mascot, CelebratingMascot, EncouragingMascot } from './Mascot';
import { KidsButton } from './KidsButton';
import { AudioNarration, NarratedText } from './AudioNarration';
import { Confetti, CelebrationEffect } from './Confetti';
import { useSound } from './SoundFeedback';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { submitAssessment } from '../../utils/api';
import { useAuth } from '../AuthContext';
import { createClient } from '../../utils/supabase/client';
import { setAuthToken } from '../../utils/api';
import { 
  allApprovedQuestions, 
  EMOJI_RESPONSES, 
  calculateResults,
  getQuestionsByCategory,
  CATEGORY_INFO,
  ApprovedKidsQuestion
} from '../../utils/approvedKidsQuestions';

interface KidsAssessmentApprovedProps {
  category?: 'problem-solving' | 'decision-making' | 'social-thinking' | 'motivation' | 'attention-behaviour' | 'all';
  onComplete: (results: any) => void;
  onBack: () => void;
}

export function KidsAssessmentApproved({ 
  category = 'problem-solving', 
  onComplete, 
  onBack 
}: KidsAssessmentApprovedProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 1 | 2 | 3>>({});
  const [selectedOption, setSelectedOption] = useState<1 | 2 | 3 | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0); // Key to trigger reshuffle
  const { refreshUser } = useAuth();
  const { play } = useSound();

  // Get questions for selected category (or all)
  const baseQuestions = category === 'all' 
    ? allApprovedQuestions 
    : getQuestionsByCategory(category);

  // Shuffle questions - reshuffles when shuffleKey changes
  const [questions, setQuestions] = useState<ApprovedKidsQuestion[]>([]);
  
  useEffect(() => {
    // Fisher-Yates shuffle - proper implementation
    const shuffled = [...baseQuestions];
    
    // Shuffle the array in place
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    setQuestions(shuffled);
  }, [shuffleKey, category]); // Reshuffle when shuffleKey or category changes

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Get category config
  const categoryConfig = category === 'all'
    ? {
        emoji: '🎯',
        title: 'Complete Assessment',
        description: 'All categories!',
        color: 'from-purple-500 to-pink-500'
      }
    : CATEGORY_INFO[category];

  const primaryColor = categoryConfig.color.includes('purple') ? '#9333ea' :
                      categoryConfig.color.includes('blue') ? '#3b82f6' :
                      categoryConfig.color.includes('green') ? '#10b981' :
                      categoryConfig.color.includes('yellow') ? '#f59e0b' :
                      categoryConfig.color.includes('red') ? '#ef4444' :
                      '#8b5cf6';

  useEffect(() => {
    // Load existing answer for this question when question changes
    if (currentQuestion) {
      setSelectedOption(answers[currentQuestion.id] || null);
    }
  }, [currentQuestionIndex, currentQuestion]); // Removed 'answers' from dependency array

  const handleSelectOption = (value: 1 | 2 | 3) => {
    // Only show feedback if this is a NEW answer (not changing answer)
    const isNewAnswer = !answers[currentQuestion.id];
    
    // Play pop sound when selecting an option
    play('pop');
    
    setSelectedOption(value);
    setAnswers({ ...answers, [currentQuestion.id]: value });
    
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

    // Calculate results
    const results = calculateResults(answers);

    // Save to backend
    try {
      console.log('[KidsAssessmentApproved] Getting current session for submission...');
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        console.log('[KidsAssessmentApproved] Session found, setting auth token');
        setAuthToken(session.access_token);
        
        // Map to backend assessment type
        const backendType = 'children-thinking';
        
        // Convert answers to array format
        const answersArray = Object.entries(answers).map(([questionId, value]) => ({
          questionId: parseInt(questionId),
          answerId: value.toString()
        }));

        console.log('[KidsAssessmentApproved] Submitting assessment...');
        await submitAssessment(
          backendType,
          answersArray,
          results,
          [], // strengths - empty for now
          [], // weaknesses - empty for now
          []  // recommendations - empty for now
        );
        
        console.log('[KidsAssessmentApproved] Assessment submitted successfully');
        
        // Refresh user data
        await refreshUser();
      } else {
        console.warn('[KidsAssessmentApproved] No active session found - skipping backend save');
      }
    } catch (error) {
      console.error('[KidsAssessmentApproved] Failed to save assessment:', error);
      // Continue anyway - don't block the kids experience
    }

    // Wait for celebration animation
    setTimeout(() => {
      onComplete({
        results,
        insights: `You completed ${results.questionsAnswered} questions! Great job!`
      });
    }, 3000);
  };

  // INTRO SCREEN
  if (showIntro) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}20 0%, #FFD70020 50%, #FF6B9D20 100%)`
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

            {/* Speech Bubble */}
            <motion.div
              className="flex justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative">
                {/* Speech Bubble Tail */}
                <div 
                  className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-0 h-0"
                  style={{
                    borderLeft: '30px solid transparent',
                    borderRight: '30px solid transparent',
                    borderBottom: `30px solid ${primaryColor}`
                  }}
                />

                {/* Speech Bubble */}
                <motion.div
                  className="bg-white rounded-3xl shadow-2xl px-12 py-8 relative"
                  style={{ border: `8px solid ${primaryColor}` }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <NarratedText text={`Let's answer some questions! 🎮`} autoPlay={true}>
                    <h1 className="text-5xl md:text-6xl font-black" style={{ color: primaryColor }}>
                      Let's answer some questions! 🎮
                    </h1>
                  </NarratedText>
                </motion.div>
              </div>
            </motion.div>

            {/* Category Icon */}
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
                {categoryConfig.emoji}
              </motion.div>
            </motion.div>

            {/* Category Title */}
            <motion.h2
              className="text-4xl md:text-5xl font-black text-gray-800 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {categoryConfig.title}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-2xl md:text-3xl text-gray-600 mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {categoryConfig.description}
            </motion.p>

            {/* Question Count */}
            <motion.p
              className="text-3xl font-black text-gray-700 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {questions.length} Questions
            </motion.p>

            {/* Giant START Button */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9, type: "spring", stiffness: 120 }}
            >
              <motion.button
                className="rounded-full shadow-2xl text-white mx-auto"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
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

  // CELEBRATION SCREEN
  if (showCelebration) {
    const results = calculateResults(answers);

    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6" 
        style={{ background: 'linear-gradient(135deg, #667eea15 0%, #FF6B9D15 50%, #FEC16330 100%)' }}
      >
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
              color: primaryColor,
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
            className="flex justify-center items-center gap-4 mb-8 flex-wrap"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
          >
            {[...Array(Math.min(10, results.questionsAnswered))].map((_, i) => (
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
            {results.questionsAnswered > 10 && (
              <motion.span
                className="text-5xl font-black text-gray-700"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
              >
                +{results.questionsAnswered - 10} more!
              </motion.span>
            )}
          </motion.div>

          {/* Stars Count */}
          <motion.p
            className="text-4xl font-black text-gray-700 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            {results.questionsAnswered} Questions Answered!
          </motion.p>

          {/* Badge Award */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ delay: 1.5, type: "spring", stiffness: 150, damping: 12 }}
          >
            <div className="relative inline-block">
              {/* Badge Background Circle */}
              <motion.div
                className="w-72 h-72 rounded-full flex flex-col items-center justify-center shadow-2xl"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
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
                  {categoryConfig.emoji}
                </motion.div>

                {/* Badge Title */}
                <div className="text-white text-center px-4">
                  <p className="text-3xl font-black">
                    Amazing Work!
                  </p>
                </div>
              </motion.div>

              {/* Sparkle Effects */}
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
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
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
                setShuffleKey(shuffleKey + 1); // Trigger reshuffle
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
                border: `8px solid ${primaryColor}`
              }}
              whileHover={{ 
                scale: 1.1, 
                rotate: -5,
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                play('pop');
                onComplete(results);
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

  // QUESTION SCREEN
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6" 
      style={{ background: 'linear-gradient(135deg, #667eea15 0%, #FF6B9D15 50%, #FEC16330 100%)' }}
    >
      <div className="max-w-6xl w-full">
        {/* Simple Header */}
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

          {/* Progress Dots */}
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-gray-700">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>

          {/* Audio Button */}
          <AudioNarration
            text={currentQuestion?.text || ''}
            autoPlay={true}
          />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion?.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            {/* Question Text - HUGE */}
            <motion.div
              className="mb-12"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-8">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-800">
                  {currentQuestion?.text}
                </h1>
              </div>

              <p className="text-2xl md:text-3xl font-black text-gray-600">
                How much like you?
              </p>
            </motion.div>

            {/* 3 EMOJI BUTTONS - HUGE */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {/* YES Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectOption(3)}
                className="relative rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden group"
                style={{
                  background: selectedOption === 3
                    ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                    : 'white',
                  border: `8px solid ${selectedOption === 3 ? primaryColor : '#E5E7EB'}`,
                  minHeight: '280px'
                }}
              >
                {/* Selected Sparkle Effect */}
                {selectedOption === 3 && (
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
                  animate={selectedOption === 3 ? {
                    scale: [1, 1.15, 1],
                    rotate: [0, -5, 5, 0]
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: selectedOption === 3 ? Infinity : 0,
                    repeatDelay: 0.2
                  }}
                >
                  {EMOJI_RESPONSES.YES.emoji}
                </motion.div>

                {/* Text */}
                <p 
                  className="text-2xl md:text-3xl font-black px-4"
                  style={{ 
                    color: selectedOption === 3 ? 'white' : '#374151'
                  }}
                >
                  {EMOJI_RESPONSES.YES.label}
                </p>

                {/* Giant Checkmark */}
                {selectedOption === 3 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl"
                  >
                    <span className="text-4xl">✓</span>
                  </motion.div>
                )}
              </motion.button>

              {/* SOMETIMES Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: 0.35,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectOption(2)}
                className="relative rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden group"
                style={{
                  background: selectedOption === 2
                    ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                    : 'white',
                  border: `8px solid ${selectedOption === 2 ? primaryColor : '#E5E7EB'}`,
                  minHeight: '280px'
                }}
              >
                {selectedOption === 2 && (
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

                <motion.div
                  className="text-9xl mb-4"
                  animate={selectedOption === 2 ? {
                    scale: [1, 1.15, 1],
                    rotate: [0, -5, 5, 0]
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: selectedOption === 2 ? Infinity : 0,
                    repeatDelay: 0.2
                  }}
                >
                  {EMOJI_RESPONSES.SOMETIMES.emoji}
                </motion.div>

                <p 
                  className="text-2xl md:text-3xl font-black px-4"
                  style={{ 
                    color: selectedOption === 2 ? 'white' : '#374151'
                  }}
                >
                  {EMOJI_RESPONSES.SOMETIMES.label}
                </p>

                {selectedOption === 2 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl"
                  >
                    <span className="text-4xl">✓</span>
                  </motion.div>
                )}
              </motion.button>

              {/* NO Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  delay: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
                whileHover={{ 
                  scale: 1.1, 
                  rotate: 5,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectOption(1)}
                className="relative rounded-3xl shadow-2xl transition-all duration-300 overflow-hidden group"
                style={{
                  background: selectedOption === 1
                    ? `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`
                    : 'white',
                  border: `8px solid ${selectedOption === 1 ? primaryColor : '#E5E7EB'}`,
                  minHeight: '280px'
                }}
              >
                {selectedOption === 1 && (
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

                <motion.div
                  className="text-9xl mb-4"
                  animate={selectedOption === 1 ? {
                    scale: [1, 1.15, 1],
                    rotate: [0, -5, 5, 0]
                  } : {}}
                  transition={{
                    duration: 0.8,
                    repeat: selectedOption === 1 ? Infinity : 0,
                    repeatDelay: 0.2
                  }}
                >
                  {EMOJI_RESPONSES.NO.emoji}
                </motion.div>

                <p 
                  className="text-2xl md:text-3xl font-black px-4"
                  style={{ 
                    color: selectedOption === 1 ? 'white' : '#374151'
                  }}
                >
                  {EMOJI_RESPONSES.NO.label}
                </p>

                {selectedOption === 1 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-xl"
                  >
                    <span className="text-4xl">✓</span>
                  </motion.div>
                )}
              </motion.button>
            </div>

            {/* Feedback Popup */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  className="fixed inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="absolute inset-0 bg-black/30" />
                  <motion.div
                    className="relative bg-white rounded-3xl shadow-2xl p-12"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CelebrationEffect show={true} />
                    <div className="text-center">
                      <motion.div
                        className="text-9xl mb-4"
                        animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity }}
                      >
                        ⭐
                      </motion.div>
                      <h2 className="text-5xl font-black text-gray-800">
                        Great choice!
                      </h2>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
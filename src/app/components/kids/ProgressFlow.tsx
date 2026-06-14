import { motion } from 'motion/react';

interface ProgressFlowProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

/**
 * Simple Sequential Flow Indicator
 * Shows clear progress through assessment for attention span management
 */
export function ProgressFlow({ 
  currentStep, 
  totalSteps,
  stepLabels 
}: ProgressFlowProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {[...Array(totalSteps)].map((_, i) => (
        <div key={i} className="flex items-center">
          {/* Step Circle */}
          <motion.div
            className={`
              relative flex items-center justify-center
              w-12 h-12 rounded-full
              font-bold text-lg
              ${i < currentStep 
                ? 'bg-green-500 text-white' 
                : i === currentStep 
                  ? 'bg-blue-500 text-white ring-4 ring-blue-200' 
                  : 'bg-gray-300 text-gray-500'
              }
            `}
            initial={{ scale: 0 }}
            animate={{ 
              scale: i <= currentStep ? 1 : 0.8,
              rotate: i < currentStep ? 360 : 0
            }}
            transition={{ 
              delay: i * 0.1,
              type: "spring",
              stiffness: 200 
            }}
          >
            {/* Checkmark for completed */}
            {i < currentStep ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                ✓
              </motion.span>
            ) : (
              i + 1
            )}

            {/* Current step indicator */}
            {i === currentStep && (
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-blue-500"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [1, 0, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity
                }}
              />
            )}
          </motion.div>

          {/* Connector Line */}
          {i < totalSteps - 1 && (
            <motion.div
              className={`
                h-1 w-8
                ${i < currentStep ? 'bg-green-500' : 'bg-gray-300'}
              `}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: i * 0.1 + 0.2 }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Simple Mini Progress (for compact displays)
 */
export function MiniProgress({ 
  current, 
  total 
}: { 
  current: number; 
  total: number;
}) {
  const percentage = (current / total) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* Visual dots */}
      <div className="flex gap-2">
        {[...Array(total)].map((_, i) => (
          <motion.div
            key={i}
            className={`
              w-3 h-3 rounded-full
              ${i < current 
                ? 'bg-green-500' 
                : i === current 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300'
              }
            `}
            initial={{ scale: 0 }}
            animate={{ scale: i <= current ? 1 : 0.7 }}
            transition={{ delay: i * 0.05 }}
          />
        ))}
      </div>

      {/* Text indicator */}
      <span className="text-sm font-bold text-gray-700">
        {current + 1} of {total}
      </span>
    </div>
  );
}

/**
 * Time Remaining Indicator (helps with attention span)
 */
export function TimeRemaining({ 
  questionsLeft 
}: { 
  questionsLeft: number;
}) {
  return (
    <motion.div
      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="text-2xl">⏱️</span>
      <span className="font-bold text-blue-700">
        {questionsLeft === 1 
          ? "Last one!" 
          : `${questionsLeft} more to go!`
        }
      </span>
    </motion.div>
  );
}

/**
 * Motivational Progress Messages
 */
export function MotivationalProgress({ 
  current, 
  total 
}: { 
  current: number; 
  total: number;
}) {
  const messages = [
    { emoji: '🚀', text: "Let's start!", color: '#667eea' },
    { emoji: '⭐', text: "You're doing great!", color: '#4ECDC4' },
    { emoji: '🔥', text: "Keep it up!", color: '#FF9800' },
    { emoji: '💪', text: "Almost there!", color: '#4CAF50' },
    { emoji: '🎉', text: "Last one!", color: '#FF6B9D' },
  ];

  const message = current < messages.length ? messages[current] : messages[messages.length - 1];

  return (
    <motion.div
      key={current}
      className="text-center py-3"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -20 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center justify-center gap-3">
        <motion.span
          className="text-4xl"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 0.5
          }}
        >
          {message.emoji}
        </motion.span>
        <span 
          className="text-2xl font-bold"
          style={{ color: message.color }}
        >
          {message.text}
        </span>
      </div>
    </motion.div>
  );
}

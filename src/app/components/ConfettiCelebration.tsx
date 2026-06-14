import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfettiCelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({ 
  show, 
  onComplete 
}) => {
  const [confettiPieces] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      rotation: Math.random() * 360,
      color: ['#FF715B', '#6B4C9A', '#5B7DB1', '#FFD700', '#FF69B4', '#00CED1'][
        Math.floor(Math.random() * 6)
      ],
      size: 8 + Math.random() * 8
    }))
  );

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {confettiPieces.map((piece) => (
            <motion.div
              key={piece.id}
              initial={{
                top: -20,
                left: `${piece.left}%`,
                rotate: 0,
                opacity: 1,
                scale: 1
              }}
              animate={{
                top: '110vh',
                rotate: piece.rotation * 3,
                opacity: 0,
                scale: 0.5
              }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: 'easeIn'
              }}
              className="absolute"
              style={{
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0'
              }}
            />
          ))}
          
          {/* Celebration Message */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center border-4 border-purple-200">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 0.5, 
                  repeat: 3,
                  delay: 0.3
                }}
              >
                <span className="text-6xl">🎉</span>
              </motion.div>
              <h2 className="text-3xl font-bold text-purple-600 mt-4 mb-2">
                Amazing Work!
              </h2>
              <p className="text-lg text-gray-600">
                You've completed the assessment!
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

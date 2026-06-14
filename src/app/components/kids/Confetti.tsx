import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import soundManager from './SoundFeedback';

interface ConfettiProps {
  show?: boolean;
  duration?: number;
  density?: 'light' | 'medium' | 'heavy';
}

export function Confetti({ 
  show = true, 
  duration = 3000,
  density = 'heavy'
}: ConfettiProps) {
  const [isVisible, setIsVisible] = useState(show);

  const densityCount = {
    light: 30,
    medium: 50,
    heavy: 80
  };

  const confettiCount = densityCount[density];

  useEffect(() => {
    setIsVisible(show);
    
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, duration]);

  if (!isVisible) return null;

  const confettiShapes = ['🎉', '🎊', '⭐', '✨', '🌟', '💫', '🎈', '🎁', '🏆', '👏'];
  const colors = ['#FF6B9D', '#667eea', '#4ECDC4', '#FFD700', '#FF9800', '#4CAF50', '#E91E63', '#9C27B0'];

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(confettiCount)].map((_, i) => {
        const isEmoji = i % 3 === 0;
        const randomX = Math.random() * 100;
        const randomDelay = Math.random() * 0.5;
        const randomDuration = 2 + Math.random() * 2;
        const randomRotation = Math.random() * 720 - 360;
        const randomSize = isEmoji ? 20 + Math.random() * 30 : 10 + Math.random() * 15;

        return (
          <motion.div
            key={i}
            className={isEmoji ? 'text-2xl' : 'rounded-full'}
            style={{
              position: 'absolute',
              left: `${randomX}%`,
              top: '-20px',
              fontSize: isEmoji ? `${randomSize}px` : undefined,
              width: isEmoji ? 'auto' : `${randomSize}px`,
              height: isEmoji ? 'auto' : `${randomSize}px`,
              backgroundColor: isEmoji ? 'transparent' : colors[Math.floor(Math.random() * colors.length)],
            }}
            initial={{
              y: -50,
              x: 0,
              rotate: 0,
              opacity: 1
            }}
            animate={{
              y: window.innerHeight + 100,
              x: (Math.random() - 0.5) * 200,
              rotate: randomRotation,
              opacity: [1, 1, 0.7, 0]
            }}
            transition={{
              duration: randomDuration,
              delay: randomDelay,
              ease: "easeIn"
            }}
          >
            {isEmoji ? confettiShapes[Math.floor(Math.random() * confettiShapes.length)] : null}
          </motion.div>
        );
      })}
    </div>
  );
}

// Celebration effect with stars and badges
export function CelebrationEffect({ 
  type = 'stars',
  message,
  show = true 
}: { 
  type?: 'stars' | 'badges' | 'stickers' | 'trophy';
  message?: string;
  show?: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!show) return;

    let currentCount = 0;
    const interval = setInterval(() => {
      currentCount++;
      setCount(currentCount);
      // Play sparkle sound for each star
      soundManager.play('sparkle');
      if (currentCount >= 5) clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [show]);

  if (!show) return null;

  const icons = {
    stars: '⭐',
    badges: '🏅',
    stickers: '✨',
    trophy: '🏆'
  };

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      {/* Animated Icons */}
      <motion.div 
        className="flex gap-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
      >
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="text-6xl"
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ 
              opacity: i < count ? 1 : 0.3,
              scale: i < count ? [0, 1.3, 1] : 0.8,
              rotate: i < count ? 0 : -180
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.15
            }}
          >
            {icons[type]}
          </motion.div>
        ))}
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div
          className="text-3xl font-bold text-gray-800 text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {message}
        </motion.div>
      )}

      {/* Sparkle Effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 1.5,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: 1
            }}
          >
            ✨
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Badge component for achievements
export function Badge({ 
  icon, 
  label, 
  unlocked = false,
  size = 'medium'
}: { 
  icon: string; 
  label: string; 
  unlocked?: boolean;
  size?: 'small' | 'medium' | 'large';
}) {
  const sizes = {
    small: { container: 'w-24 h-24', icon: 'text-4xl', label: 'text-sm' },
    medium: { container: 'w-32 h-32', icon: 'text-5xl', label: 'text-base' },
    large: { container: 'w-40 h-40', icon: 'text-6xl', label: 'text-lg' }
  };

  const sizeClasses = sizes[size];

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      whileHover={{ scale: unlocked ? 1.1 : 1 }}
      whileTap={{ scale: unlocked ? 0.95 : 1 }}
    >
      <div
        className={`
          ${sizeClasses.container}
          rounded-full
          flex items-center justify-center
          relative
          ${unlocked 
            ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl' 
            : 'bg-gray-300 opacity-50'
          }
        `}
        style={{
          border: '4px solid white',
          boxShadow: unlocked ? '0 10px 30px rgba(255, 193, 7, 0.5)' : 'none'
        }}
      >
        {/* Icon */}
        <span className={`${sizeClasses.icon} ${unlocked ? 'grayscale-0' : 'grayscale'}`}>
          {icon}
        </span>

        {/* Sparkles for unlocked badges */}
        {unlocked && (
          <>
            <motion.div
              className="absolute -top-2 -right-2 text-2xl"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 2,
                repeat: Infinity
              }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2 text-2xl"
              animate={{
                scale: [1, 1.3, 1],
                rotate: [360, 180, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1
              }}
            >
              ⭐
            </motion.div>
          </>
        )}
      </div>

      {/* Label */}
      <div className={`${sizeClasses.label} font-bold text-gray-800 text-center max-w-[120px]`}>
        {label}
      </div>

      {/* Locked indicator */}
      {!unlocked && (
        <div className="text-xs text-gray-500">
          🔒 Locked
        </div>
      )}
    </motion.div>
  );
}

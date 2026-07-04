import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Search, Heart, Hammer } from 'lucide-react';

interface MascotProps {
  [key: string]: any;
  message?: string;
  emotion?: 'happy' | 'excited' | 'thinking' | 'celebrating' | 'encouraging';
  position?: 'left' | 'right' | 'center';
  size?: 'small' | 'medium' | 'large';
  animate?: boolean;
  showSpeechBubble?: boolean;
  onSpeak?: () => void;
}

// --- JOT ROBOT SVG COMPONENT ---
interface JotRobotProps {
  mode: 'detective' | 'spark' | 'heart' | 'builder';
  isTalking: boolean;
  size: 'small' | 'medium' | 'large';
}

function JotRobot({ mode, isTalking, size }: JotRobotProps) {
  // Configuration for the different modes
  const modeConfig = {
    detective: {
      primary: '#3B82F6', // Blue - for thinking/logic
      secondary: '#EFF6FF',
      eyeShape: 'squint',
      mouth: 'line',
      icon: <Search className="w-6 h-6 text-white" />
    },
    spark: {
      primary: '#EAB308', // Yellow - for excited/creative
      secondary: '#FEFCE8',
      eyeShape: 'star',
      mouth: 'smile',
      icon: <Sparkles className="w-6 h-6 text-white" />
    },
    heart: {
      primary: '#EC4899', // Pink - for celebrating
      secondary: '#FDF2F8',
      eyeShape: 'round',
      mouth: 'open',
      icon: <Heart className="w-6 h-6 text-white" />
    },
    builder: {
      primary: '#22C55E', // Green - for encouraging/action
      secondary: '#F0FDF4',
      eyeShape: 'round',
      mouth: 'grin',
      icon: <Hammer className="w-6 h-6 text-white" />
    }
  };

  const config = modeConfig[mode] || modeConfig.spark;

  // Size mapping
  const sizeMap = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <div className={`relative ${sizeMap[size]} transition-all duration-500`}>
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-xl">
        {/* Antenna */}
        <line x1="100" y1="40" x2="100" y2="10" stroke={config.primary} strokeWidth="4" />
        <circle 
          cx="100" 
          cy="10" 
          r="6" 
          fill={isTalking ? '#FF5555' : config.primary} 
          className="transition-colors duration-300"
        >
          {isTalking && (
            <animate 
              attributeName="r" 
              values="6;8;6" 
              dur="0.5s" 
              repeatCount="indefinite" 
            />
          )}
        </circle>

        {/* Head/Body Container */}
        <rect 
          x="40" y="40" width="120" height="100" rx="25" 
          fill="white" 
          stroke={config.primary} 
          strokeWidth="4"
          className="transition-colors duration-500"
        />

        {/* The Screen (Face) */}
        <rect 
          x="55" y="55" width="90" height="50" rx="10" 
          fill={config.primary} 
          className="transition-colors duration-500 opacity-20"
        />
        <rect 
          x="55" y="55" width="90" height="50" rx="10" 
          fill="none"
          stroke={config.primary} 
          strokeWidth="2"
        />

        {/* Eyes - Dynamic based on mode */}
        {config.eyeShape === 'squint' && (
          <g fill={config.primary}>
            <rect x="70" y="75" width="20" height="6" rx="2" />
            <rect x="110" y="75" width="20" height="6" rx="2" />
          </g>
        )}
        {config.eyeShape === 'round' && (
          <g fill={config.primary}>
            <circle cx="80" cy="78" r="8" />
            <circle cx="120" cy="78" r="8" />
            {/* Highlights */}
            <circle cx="82" cy="76" r="3" fill="white" />
            <circle cx="122" cy="76" r="3" fill="white" />
            {/* Blink animation when talking */}
            {isTalking && (
              <>
                <animate 
                  attributeName="opacity" 
                  values="1;0;1" 
                  dur="0.3s" 
                  repeatCount="indefinite" 
                />
              </>
            )}
          </g>
        )}
        {config.eyeShape === 'star' && (
          <g fill={config.primary} stroke={config.primary} strokeWidth="2">
            <path d="M80 68 L83 75 L90 75 L85 80 L87 88 L80 83 L73 88 L75 80 L70 75 L77 75 Z" />
            <path d="M120 68 L123 75 L130 75 L125 80 L127 88 L120 83 L113 88 L115 80 L110 75 L117 75 Z" />
          </g>
        )}

        {/* Mouth - Dynamic */}
        {config.mouth === 'line' && (
          <path 
            d="M85 95 Q100 95 115 95" 
            stroke={config.primary} 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
          />
        )}
        {config.mouth === 'smile' && (
          <path 
            d="M75 90 Q100 105 125 90" 
            stroke={config.primary} 
            strokeWidth="3" 
            fill="none" 
            strokeLinecap="round" 
          />
        )}
        {config.mouth === 'open' && (
          <circle cx="100" cy="95" r={isTalking ? "8" : "6"} fill={config.primary}>
            {isTalking && (
              <animate 
                attributeName="r" 
                values="6;8;6" 
                dur="0.3s" 
                repeatCount="indefinite" 
              />
            )}
          </circle>
        )}
        {config.mouth === 'grin' && (
          <path d="M75 92 Q100 102 125 92 Z" fill={config.primary} />
        )}

        {/* Chest Plate / Badge */}
        <circle cx="100" cy="120" r="14" fill={config.primary} className="transition-colors duration-500" />
        
        {/* Chest Symbol based on mode */}
        {mode === 'spark' && (
          <path 
            d="M100 110 L103 118 L108 118 L104 122 L106 128 L100 124 L94 128 L96 122 L92 118 L97 118 Z" 
            fill="white" 
          />
        )}
        {mode === 'detective' && (
          <circle cx="100" cy="120" r="6" stroke="white" strokeWidth="2" fill="none" />
        )}
        {mode === 'heart' && (
          <path d="M100 125 L95 120 A 3 3 0 0 1 100 116 A 3 3 0 0 1 105 120 Z" fill="white">
            {isTalking && (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1;1.2;1"
                dur="0.6s"
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </path>
        )}
        {mode === 'builder' && (
          <rect x="94" y="114" width="12" height="12" fill="white" rx="2" />
        )}

        {/* Arms */}
        <path 
          d="M40 90 Q20 100 25 120" 
          stroke="#94A3B8" 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round" 
        />
        <circle cx="25" cy="120" r="8" fill="#94A3B8" />
        
        <path 
          d="M160 90 Q180 100 175 120" 
          stroke="#94A3B8" 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round" 
        />
        <circle cx="175" cy="120" r="8" fill="#94A3B8" />
      </svg>
    </div>
  );
}

// --- MAIN MASCOT COMPONENT ---
export function Mascot({
  message,
  emotion = 'happy',
  position = 'left',
  size = 'medium',
  animate = true,
  showSpeechBubble = true,
  onSpeak
}: MascotProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTalking, setIsTalking] = useState(false);

  // Auto-animate on mount and when message changes
  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      setIsTalking(true);
      
      const animationTimer = setTimeout(() => setIsAnimating(false), 1000);
      const talkingTimer = setTimeout(() => setIsTalking(false), 2000);
      
      return () => {
        clearTimeout(animationTimer);
        clearTimeout(talkingTimer);
      };
    }
  }, [animate, message]);

  const positionClasses = {
    left: 'items-start',
    right: 'items-end',
    center: 'items-center'
  };

  // Map emotions to robot modes
  const emotionToMode = {
    excited: 'spark',      // Yellow sparkly robot
    thinking: 'detective',  // Blue analytical robot
    celebrating: 'heart',   // Pink celebratory robot
    encouraging: 'builder', // Green action robot
    happy: 'spark'          // Default: yellow sparkly robot
  } as const;

  const mode = emotionToMode[emotion];

  // Get color for speech bubble border
  const modeColors = {
    detective: '#3B82F6',
    spark: '#EAB308',
    heart: '#EC4899',
    builder: '#22C55E'
  };

  const bubbleColor = modeColors[mode];

  return (
    <div className={`flex flex-col ${positionClasses[position]} gap-3`}>
      {/* Mascot Character - Jot Robot */}
      <motion.div
        className="relative cursor-pointer"
        animate={isAnimating ? {
          y: [0, -15, 0],
          rotate: [0, 3, -3, 0],
          scale: [1, 1.05, 1]
        } : {
          y: [0, -8, 0]
        }}
        transition={{
          duration: isAnimating ? 0.8 : 3,
          ease: "easeInOut",
          repeat: isAnimating ? 0 : Infinity
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onSpeak}
      >
        <JotRobot mode={mode} isTalking={isTalking || isAnimating} size={size} />

        {/* Floating particles for celebrating */}
        {emotion === 'celebrating' && (
          <>
            <motion.div
              className="absolute -top-2 -right-2 text-2xl"
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 360],
                opacity: [1, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.5
              }}
            >
              ⭐
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2 text-2xl"
              animate={{ 
                y: [0, -15, 0],
                rotate: [0, -360],
                opacity: [1, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.8
              }}
            >
              ✨
            </motion.div>
          </>
        )}
      </motion.div>

      {/* Speech Bubble */}
      <AnimatePresence>
        {showSpeechBubble && message && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-xs"
          >
            <div 
              className="rounded-2xl px-4 py-3 shadow-lg"
              style={{ 
                background: 'white',
                border: `3px solid ${bubbleColor}`,
                color: '#1a1a1a'
              }}
            >
              <p className="font-bold" style={{ fontSize: '18px', color: '#1a1a1a' }}>
                {message}
              </p>
              
              {/* Speech bubble pointer */}
              <div 
                className="absolute -top-2 left-8 w-0 h-0"
                style={{
                  borderLeft: '10px solid transparent',
                  borderRight: '10px solid transparent',
                  borderBottom: `10px solid ${bubbleColor}`
                }}
              ></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- PRE-BUILT MASCOT VARIATIONS ---
export function WelcomeMascot({ ...props }: any) {
  return (
    <Mascot
      emotion="excited"
      message="Hi! I'm Jot! Let's have fun learning together! 🎉"
      size="large"
      position="center"
    />
  );
}

export function EncouragingMascot({ message, ...props }: any) {
  return (
    <Mascot
      emotion="encouraging"
      message={message}
      size="medium"
      position="left"
    />
  );
}

export function ThinkingMascot({ ...props }: any) {
  return (
    <Mascot
      emotion="thinking"
      message="Hmm... let me think about that! 🤔"
      size="medium"
      position="right"
    />
  );
}

export function CelebratingMascot({ message, ...props }: any) {
  return (
    <Mascot
      emotion="celebrating"
      message={message || "You did it! I'm so proud of you! 🎉"}
      size="large"
      position="center"
    />
  );
}

import { motion } from 'motion/react';
import { ReactNode } from 'react';
import soundManager from './SoundFeedback';

interface KidsButtonProps {
  [key: string]: any;
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'fun' | 'rainbow' | string;
  size?: 'small' | 'medium' | 'large' | 'huge';
  icon?: ReactNode;
  disabled?: boolean;
  animate?: boolean;
  sound?: boolean;
}

export function KidsButton({
  children,
  onClick,
  variant = 'primary',
  size = 'large',
  icon,
  disabled = false,
  animate = true,
  sound = true
}: KidsButtonProps) {
  
  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      shadowColor: '#667eea'
    },
    success: {
      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      shadowColor: '#4CAF50'
    },
    warning: {
      background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
      shadowColor: '#FF9800'
    },
    fun: {
      background: 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)',
      shadowColor: '#FF6B9D'
    },
    rainbow: {
      background: 'linear-gradient(135deg, #667eea 0%, #FF6B9D 50%, #FEC163 100%)',
      shadowColor: '#667eea'
    }
  };

  // Sizes optimized for children ages 6-10 (motor skills requirement: 120-140px)
  const sizes = {
    small: 'px-6 py-4 text-xl min-h-[100px] min-w-[160px]',
    medium: 'px-8 py-5 text-2xl min-h-[120px] min-w-[200px]',
    large: 'px-10 py-6 text-3xl min-h-[140px] min-w-[240px]',
    huge: 'px-12 py-8 text-4xl min-h-[160px] min-w-[280px]'
  };

  const handleClick = () => {
    if (!disabled) {
      // Play different sounds based on variant
      if (sound) {
        if (variant === 'success') {
          soundManager.play('success');
        } else if (variant === 'warning') {
          soundManager.play('progress');
        } else if (variant === 'rainbow') {
          soundManager.play('celebration');
        } else {
          soundManager.play('click');
        }
      }
      onClick?.();
    }
  };

  const buttonStyle = variants[variant as keyof typeof variants] || variants['primary'];

  return (
    <motion.button
      className={`
        ${sizes[size]}
        rounded-3xl
        font-bold
        text-white
        shadow-xl
        relative
        overflow-hidden
        flex items-center justify-center gap-3
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      style={{
        background: buttonStyle.background,
        boxShadow: `0 8px 20px ${buttonStyle.shadowColor}40`,
        border: '4px solid white'
      }}
      whileHover={!disabled && animate ? { 
        scale: 1.05,
        boxShadow: `0 12px 30px ${buttonStyle.shadowColor}60`
      } : {}}
      whileTap={!disabled && animate ? { 
        scale: 0.95 
      } : {}}
      animate={animate && !disabled ? {
        y: [0, -2, 0],
      } : {}}
      transition={{
        y: {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      onClick={handleClick}
      disabled={disabled}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 -translate-x-full animate-[shimmer_3s_infinite]"></div>
      
      {icon && <span className="text-3xl">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}

// Icon Button for Kids
export function KidsIconButton({
  icon,
  onClick,
  label,
  color = '#667eea',
  size = 'medium'
}: {
  icon: ReactNode;
  onClick?: () => void;
  label?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}) {
  // Icon button sizes for children ages 6-10 (motor skills requirement: 120-140px)
  const sizes = {
    small: 'w-[100px] h-[100px] text-3xl',
    medium: 'w-[120px] h-[120px] text-4xl',
    large: 'w-[140px] h-[140px] text-5xl'
  };

  return (
    <motion.button
      className={`
        ${sizes[size]}
        rounded-2xl
        flex flex-col items-center justify-center
        shadow-lg
        text-white
        font-bold
      `}
      style={{
        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
        border: '3px solid white'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
    >
      <div>{icon}</div>
      {label && <div className="text-xs mt-1">{label}</div>}
    </motion.button>
  );
}

// Add shimmer animation to global styles if needed
const style = document.createElement('style');
style.textContent = `
  @keyframes shimmer {
    100% {
      transform: translateX(200%);
    }
  }
`;
document.head.appendChild(style);

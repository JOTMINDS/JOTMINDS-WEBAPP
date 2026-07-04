import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface KidsCardProps {
  [key: string]: any;
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  icon?: ReactNode;
  title?: string;
  interactive?: boolean;
  selected?: boolean;
}

export function KidsCard({
  children,
  onClick,
  color = '#667eea',
  icon,
  title,
  interactive = true,
  selected = false
}: KidsCardProps) {
  return (
    <motion.div
      className={`
        rounded-3xl
        p-6
        shadow-xl
        relative
        overflow-hidden
        ${interactive ? 'cursor-pointer' : ''}
        ${selected ? 'ring-4 ring-yellow-400' : ''}
      `}
      style={{
        background: `linear-gradient(135deg, ${color}15 0%, ${color}30 100%)`,
        border: `4px solid ${color}`
      }}
      whileHover={interactive ? { 
        scale: 1.05,
        boxShadow: `0 15px 35px ${color}40`
      } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      onClick={onClick}
    >
      {/* Decorative corner stars */}
      <div className="absolute top-2 right-2 text-2xl opacity-30">✨</div>
      
      {/* Header with icon and title */}
      {(icon || title) && (
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-4xl">{icon}</div>}
          {title && <h3 className="text-2xl font-bold" style={{ color }}>{title}</h3>}
        </div>
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Selected indicator */}
      {selected && (
        <motion.div
          className="absolute top-4 right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-2xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
}

// Progress Card with Stars
export function ProgressCard({
  title,
  current,
  total,
  icon,
  color = '#4CAF50'
}: {
  title: string;
  current: number;
  total: number;
  icon?: ReactNode;
  color?: string;
}) {
  const percentage = (current / total) * 100;
  const stars = Math.floor((current / total) * 5);

  return (
    <KidsCard color={color} icon={icon} title={title} interactive={false}>
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="relative h-8 bg-white rounded-full overflow-hidden border-3 border-gray-200">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)` }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-700">
            {current} / {total}
          </div>
        </div>

        {/* Stars */}
        <div className="flex gap-2 justify-center">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="text-3xl"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: i * 0.1, type: "spring" }}
            >
              {i < stars ? '⭐' : '☆'}
            </motion.div>
          ))}
        </div>
      </div>
    </KidsCard>
  );
}

// Reward Card
export function RewardCard({
  title,
  icon,
  description,
  unlocked = false,
  onClick
}: {
  title: string;
  icon: ReactNode;
  description: string;
  unlocked?: boolean;
  onClick?: () => void;
}) {
  return (
    <KidsCard
      color={unlocked ? '#FFD700' : '#999999'}
      interactive={unlocked}
      onClick={unlocked ? onClick : undefined}
    >
      <div className="text-center space-y-3">
        {/* Icon */}
        <div className={`text-6xl ${!unlocked ? 'grayscale opacity-50' : ''}`}>
          {icon}
        </div>

        {/* Title */}
        <h4 className="text-xl font-bold">{title}</h4>

        {/* Description */}
        <p className="text-sm text-gray-600">{description}</p>

        {/* Lock/Unlock indicator */}
        <div className="text-3xl">
          {unlocked ? '✓' : '🔒'}
        </div>
      </div>
    </KidsCard>
  );
}

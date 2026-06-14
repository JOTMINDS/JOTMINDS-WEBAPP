import { Award, Star } from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileBadgeProps {
  style: string;
  level: number;
  totalScore: number;
  maxScore: number;
}

export function ProfileBadge({ style, level, totalScore, maxScore }: ProfileBadgeProps) {
  // Calculate level based on score (1-5)
  const calculateLevel = (score: number, max: number): number => {
    const percentage = (score / max) * 100;
    if (percentage >= 90) return 5;
    if (percentage >= 75) return 4;
    if (percentage >= 60) return 3;
    if (percentage >= 45) return 2;
    return 1;
  };

  const actualLevel = level || calculateLevel(totalScore, maxScore);
  
  // Badge colors based on level
  const badgeColors = {
    1: { bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600', text: 'text-gray-700 dark:text-gray-300', icon: 'text-gray-500' },
    2: { bg: 'bg-green-100 dark:bg-green-900', border: 'border-green-300 dark:border-green-600', text: 'text-green-700 dark:text-green-300', icon: 'text-green-500' },
    3: { bg: 'bg-blue-100 dark:bg-blue-900', border: 'border-blue-300 dark:border-blue-600', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-500' },
    4: { bg: 'bg-purple-100 dark:bg-purple-900', border: 'border-purple-300 dark:border-purple-600', text: 'text-purple-700 dark:text-purple-300', icon: 'text-purple-500' },
    5: { bg: 'bg-amber-100 dark:bg-amber-900', border: 'border-amber-300 dark:border-amber-600', text: 'text-amber-700 dark:text-amber-300', icon: 'text-amber-500' },
  };

  const colors = badgeColors[actualLevel as keyof typeof badgeColors] || badgeColors[1];
  
  // Level descriptions
  const levelDescriptions = {
    1: 'Emerging',
    2: 'Developing',
    3: 'Proficient',
    4: 'Advanced',
    5: 'Expert'
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        ${colors.bg} ${colors.border} border-2 rounded-xl p-6
        flex items-center gap-4 shadow-sm
      `}
    >
      {/* Badge Icon */}
      <div className={`${colors.icon} relative`}>
        <Award className="w-16 h-16" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-sm">
            {actualLevel}
          </span>
        </div>
      </div>

      {/* Badge Content */}
      <div className="flex-1">
        <div className={`text-sm font-medium ${colors.text} opacity-80`}>
          {levelDescriptions[actualLevel as keyof typeof levelDescriptions]}
        </div>
        <div className={`text-xl font-bold ${colors.text}`}>
          {style}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < actualLevel 
                  ? `${colors.icon} fill-current` 
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
          <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">
            Level {actualLevel}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

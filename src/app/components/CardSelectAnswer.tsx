import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface CardSelectAnswerProps {
  value: number;
  label: string;
  icon: string;
  selected: boolean;
  onSelect: () => void;
}

export function CardSelectAnswer({ value, label, icon, selected, onSelect }: CardSelectAnswerProps) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={`
        relative w-full p-4 rounded-lg border-2 transition-all
        ${selected 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 shadow-md' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 hover:shadow-sm'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`
          text-2xl flex-shrink-0 transition-transform
          ${selected ? 'scale-110' : ''}
        `}>
          {icon}
        </div>
        
        {/* Label */}
        <div className={`
          flex-1 text-left transition-colors
          ${selected ? 'font-semibold text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}
        `}>
          {label}
        </div>
        
        {/* Check icon */}
        {selected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex-shrink-0"
          >
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

interface CardSelectGroupProps {
  question: string;
  microIntro?: string;
  value: number | null;
  onChange: (value: number) => void;
}

export function CardSelectGroup({ question, microIntro, value, onChange }: CardSelectGroupProps) {
  const options = [
    { value: 1, label: 'Strongly Disagree', icon: '🚫' },
    { value: 2, label: 'Disagree', icon: '❌' },
    { value: 3, label: 'Neutral', icon: '⚪' },
    { value: 4, label: 'Agree', icon: '✔' },
    { value: 5, label: 'Strongly Agree', icon: '⭐' },
  ];

  return (
    <div className="space-y-4">
      {microIntro && (
        <div className="text-sm text-blue-600 dark:text-blue-400 italic">
          {microIntro}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
        {question}
      </h3>
      
      <div className="space-y-2">
        {options.map((option) => (
          <CardSelectAnswer
            key={option.value}
            value={option.value}
            label={option.label}
            icon={option.icon}
            selected={value === option.value}
            onSelect={() => onChange(option.value)}
          />
        ))}
      </div>
    </div>
  );
}

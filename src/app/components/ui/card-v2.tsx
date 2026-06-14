import { ReactNode } from 'react';
import { cn } from './utils';
import { LucideIcon } from 'lucide-react';

interface CardV2Props {
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  stats?: { label: string; value: string | number }[];
  children?: ReactNode;
  cta?: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'default' | 'gradient' | 'outlined';
}

/**
 * Card v2 Component - Optimized for Ages 11-14
 * 
 * Specifications:
 * - 16px padding (p-4)
 * - Icon alignment: left
 * - Structure: Title → Subtitle → Stats
 * - CTA placement: bottom-right
 * - 12-column layout support
 * - Consistent spacing and visual hierarchy
 */
export function CardV2({
  icon: Icon,
  iconColor = 'text-[#6B4C9A]',
  iconBgColor = 'bg-[#6B4C9A]/10',
  title,
  subtitle,
  stats,
  children,
  cta,
  onClick,
  className,
  variant = 'default'
}: CardV2Props) {
  const baseStyles = 'rounded-xl p-4 transition-all duration-200';
  
  const variantStyles = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md',
    gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-gradient-primary hover:shadow-lg',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600 hover:border-[#6B4C9A] hover:bg-white/50 dark:hover:bg-gray-800/50'
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        onClick && 'cursor-pointer hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      {/* Header Section: Icon + Title */}
      <div className="flex items-start gap-3 mb-3">
        {Icon && (
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBgColor)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {stats.map((stat, index) => (
            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Children Content */}
      {children && (
        <div className="mb-3">
          {children}
        </div>
      )}

      {/* CTA Section - Always Bottom Right */}
      {cta && (
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {cta}
        </div>
      )}
    </div>
  );
}

/**
 * Card v2 Grid Container - 12-column layout system
 */
interface CardV2GridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function CardV2Grid({ children, className, columns = 3 }: CardV2GridProps) {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-4', columnStyles[columns], className)}>
      {children}
    </div>
  );
}

/**
 * Card v2 Stat Badge - For displaying stats inline
 */
interface StatBadgeProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

export function StatBadge({ icon: Icon, label, value, color = 'blue' }: StatBadgeProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    orange: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    red: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  };

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold', colorStyles[color])}>
      {Icon && <Icon className="w-4 h-4" />}
      <span className="text-xs opacity-80">{label}:</span>
      <span>{value}</span>
    </div>
  );
}
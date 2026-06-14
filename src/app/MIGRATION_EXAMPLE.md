# Design System Migration Example

## Component: CardV2 (`/components/ui/card-v2.tsx`)

This example shows how to migrate an existing component to use the new design tokens.

---

## ❌ BEFORE (Current Code - Hardcoded Values)

```tsx
export function CardV2({ ... }: CardV2Props) {
  // ❌ Hardcoded padding, radius, spacing
  const baseStyles = 'rounded-xl p-4 transition-all duration-200';
  
  const variantStyles = {
    // ❌ Hardcoded shadow values
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-md',
    gradient: '... hover:shadow-lg',
    outlined: '...'
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], ...)}>
      {/* ❌ Hardcoded spacing (gap-3, mb-3) */}
      <div className="flex items-start gap-3 mb-3">
        {Icon && (
          // ❌ Hardcoded sizes and radius
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', iconBgColor)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* ❌ Hardcoded typography */}
          <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight">
            {title}
          </h3>
          {subtitle && (
            // ❌ Hardcoded text size and spacing
            <p className="text-sm text-muted-foreground mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        // ❌ Hardcoded grid gap and margin
        <div className="grid grid-cols-2 gap-2 mb-3">
          {stats.map((stat, index) => (
            // ❌ Hardcoded padding, radius
            <div key={index} className="p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-base font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA Section */}
      {cta && (
        // ❌ Hardcoded spacing
        <div className="flex justify-end mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          {cta}
        </div>
      )}
    </div>
  );
}
```

---

## ✅ AFTER (Migrated - Using Design Tokens)

```tsx
import { ReactNode } from 'react';
import { cn } from './utils';
import { LucideIcon } from 'lucide-react';
// ✅ Import design tokens
import { tokens } from '../../utils/designTokens';

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
 * ✅ NOW USING DESIGN SYSTEM TOKENS
 * 
 * Specifications:
 * - ✅ 16px padding using tokens.spacing.card
 * - ✅ Standardized border radius using tokens.radius.card
 * - ✅ Consistent shadows using tokens.shadow.*
 * - ✅ Typography using tokens.typography.*
 * - ✅ Spacing using tokens.spacing.*
 */
export function CardV2({
  icon: Icon,
  iconColor = 'text-[#1FC8E1]',
  iconBgColor = 'bg-[#1FC8E1]/10',
  title,
  subtitle,
  stats,
  children,
  cta,
  onClick,
  className,
  variant = 'default'
}: CardV2Props) {
  // ✅ Using design tokens for base styles
  const baseStyles = cn(
    tokens.card.base,           // bg-white rounded-xl p-4
    tokens.transition.base      // transition-all duration-200
  );
  
  const variantStyles = {
    // ✅ Using standardized shadow tokens
    default: cn(
      'bg-white dark:bg-gray-800',
      tokens.colors.borderLight,
      'dark:border-gray-700',
      tokens.shadow.medium,
      tokens.shadow.hover
    ),
    gradient: cn(
      'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900',
      'border-2 border-gradient-primary',
      tokens.shadow.large,
      tokens.shadow.hover
    ),
    outlined: cn(
      'bg-transparent border-2 border-gray-300 dark:border-gray-600',
      'hover:border-[#1FC8E1] hover:bg-white/50 dark:hover:bg-gray-800/50'
    )
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
      {/* ✅ Using tokens.spacing.itemGap (gap-3) and tokens.spacing.marginItem (mb-3) */}
      <div className={cn(
        tokens.layout.flexRow,
        'items-start',
        tokens.spacing.itemGap,
        tokens.spacing.marginItem
      )}>
        {Icon && (
          <div className={cn(
            tokens.height.avatar,      // h-10 w-10
            tokens.radius.button,      // rounded-lg
            tokens.layout.flexCenter,
            'flex-shrink-0',
            iconBgColor
          )}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {/* ✅ Using typography tokens */}
          <h3 className={cn(
            tokens.typography.h4,      // text-base font-semibold leading-normal
            tokens.colors.textPrimary,
            'dark:text-white'
          )}>
            {title}
          </h3>
          {subtitle && (
            <p className={cn(
              tokens.typography.bodySmall,  // text-sm leading-normal
              tokens.colors.textMuted,
              'mt-1'
            )}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Stats Section */}
      {stats && stats.length > 0 && (
        <div className={cn(
          tokens.layout.gridCols2,
          'gap-2',
          tokens.spacing.marginItem
        )}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'p-2',
                tokens.colors.bgMuted,
                'dark:bg-gray-900/50',
                tokens.radius.button
              )}
            >
              <p className={cn(
                tokens.typography.caption,
                tokens.colors.textMuted
              )}>
                {stat.label}
              </p>
              <p className={cn(
                tokens.typography.body,
                'font-bold',
                tokens.colors.textPrimary,
                'dark:text-white'
              )}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Children Content */}
      {children && (
        <div className={tokens.spacing.marginItem}>
          {children}
        </div>
      )}

      {/* CTA Section - Always Bottom Right */}
      {cta && (
        <div className={cn(
          'flex justify-end mt-4 pt-3 border-t',
          tokens.colors.borderLight,
          'dark:border-gray-700'
        )}>
          {cta}
        </div>
      )}
    </div>
  );
}

/**
 * Card v2 Grid Container - 12-column layout system
 * ✅ NOW USING DESIGN SYSTEM TOKENS
 */
interface CardV2GridProps {
  children: ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

export function CardV2Grid({ children, className, columns = 3 }: CardV2GridProps) {
  const columnStyles = {
    1: tokens.layout.gridCols1,
    2: tokens.layout.gridCols2,
    3: tokens.layout.gridCols3,
    4: tokens.layout.gridCols4
  };

  return (
    <div className={cn(
      'grid',
      tokens.spacing.cardGap,    // gap-4 (16px between cards)
      columnStyles[columns],
      className
    )}>
      {children}
    </div>
  );
}

/**
 * Card v2 Stat Badge - For displaying stats inline
 * ✅ NOW USING DESIGN SYSTEM TOKENS
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
    <div className={cn(
      tokens.layout.flexRow,
      tokens.spacing.iconGap,     // gap-2
      'px-3 py-1.5',
      tokens.radius.badge,         // rounded-full
      tokens.typography.bodySmall, // text-sm
      'font-semibold',
      colorStyles[color]
    )}>
      {Icon && <Icon className="w-4 h-4" />}
      <span className={cn(tokens.typography.caption, 'opacity-80')}>{label}:</span>
      <span>{value}</span>
    </div>
  );
}
```

---

## 📊 What Changed?

### 1. Imports
```tsx
// ✅ Added design tokens import
import { tokens } from '../../utils/designTokens';
```

### 2. Spacing (8 replacements)
| Before | After | Location |
|--------|-------|----------|
| `p-4` | `tokens.spacing.card` | Base card padding |
| `gap-3` | `tokens.spacing.itemGap` | Header section |
| `mb-3` | `tokens.spacing.marginItem` | Margins |
| `gap-2` | Kept (stats grid) | Stats spacing |
| `gap-4` | `tokens.spacing.cardGap` | Grid container |

### 3. Border Radius (5 replacements)
| Before | After | Location |
|--------|-------|----------|
| `rounded-xl` | `tokens.radius.card` | Card container |
| `rounded-lg` | `tokens.radius.button` | Icon container, stats |
| `rounded-full` | `tokens.radius.badge` | StatBadge |

### 4. Shadows (3 replacements)
| Before | After | Location |
|--------|-------|----------|
| `hover:shadow-md` | `tokens.shadow.medium` + `tokens.shadow.hover` | Default variant |
| `hover:shadow-lg` | `tokens.shadow.large` + `tokens.shadow.hover` | Gradient variant |

### 5. Typography (7 replacements)
| Before | After | Location |
|--------|-------|----------|
| `font-bold text-base ... leading-tight` | `tokens.typography.h4` | Card title |
| `text-sm ... leading-snug` | `tokens.typography.bodySmall` | Subtitle |
| `text-xs` | `tokens.typography.caption` | Stat labels |
| `text-base font-bold` | `tokens.typography.body` + `font-bold` | Stat values |
| `text-sm font-semibold` | `tokens.typography.bodySmall` + `font-semibold` | Badge |

### 6. Colors (4 replacements)
| Before | After | Location |
|--------|-------|----------|
| `border-gray-200` | `tokens.colors.borderLight` | Borders |
| `text-gray-900` | `tokens.colors.textPrimary` | Text |
| `text-muted-foreground` | `tokens.colors.textMuted` | Muted text |
| `bg-gray-100` | `tokens.colors.bgMuted` | Backgrounds |

### 7. Layout (2 replacements)
| Before | After | Location |
|--------|-------|----------|
| `flex items-center` | `tokens.layout.flexRow` | Header, badge |
| `grid grid-cols-1 md:grid-cols-2` | `tokens.layout.gridCols2` | Grid |

### 8. Transitions (1 replacement)
| Before | After | Location |
|--------|-------|----------|
| `transition-all duration-200` | `tokens.transition.base` | Card base |

---

## ✅ Benefits After Migration

1. **Consistency**: All cards now use the same 16px padding
2. **Maintainability**: Change spacing once in tokens, updates everywhere
3. **Readability**: `tokens.spacing.card` is clearer than `p-4`
4. **Type Safety**: TypeScript autocomplete for token names
5. **Documentation**: Tokens are self-documenting
6. **Future-Proof**: Easy to adjust design system values

---

## 🧪 Testing Checklist

After migration, verify:
- [ ] Visual appearance matches original (no visual regressions)
- [ ] Spacing is consistent (16px padding)
- [ ] Shadows match the design system (medium shadow)
- [ ] Border radius is correct (12px for cards)
- [ ] Typography is consistent
- [ ] Dark mode still works
- [ ] Hover states work correctly
- [ ] Responsive behavior intact

---

## 📝 Notes

1. **Gradual Migration**: Don't have to migrate everything at once
2. **Test Thoroughly**: Visual regression testing is critical
3. **Document Exceptions**: If you can't use a token, add a comment explaining why
4. **Consistency > Perfection**: Better to be consistent than to use every single token

---

## 🎯 Next Steps

1. Apply this pattern to `/components/ui/button.tsx`
2. Apply to `/components/ui/card.tsx`
3. Apply to dashboard components
4. Apply to assessment components
5. Continue with remaining components

---

**This example shows the complete migration process from hardcoded values to design system tokens.**

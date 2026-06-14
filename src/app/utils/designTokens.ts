/**
 * JotMinds Design System Tokens
 * 
 * Centralized design tokens for consistent styling across the entire application.
 * All components should reference these tokens instead of hardcoded values.
 * 
 * Usage:
 * import { tokens } from './designTokens';
 * className={`${tokens.spacing.card} ${tokens.shadow.medium}`}
 */

export const tokens = {
  /**
   * SPACING TOKENS
   * Standardized spacing values for consistent layout
   */
  spacing: {
    // Card & Container Padding
    card: 'p-4',              // 16px - Standard card padding
    cardLg: 'p-6',            // 24px - Large card padding
    cardSm: 'p-3',            // 12px - Small card padding
    
    // Section Spacing
    sectionGap: 'space-y-6',  // 24px - Between major sections
    cardGap: 'gap-4',         // 16px - Between cards in a grid
    itemGap: 'gap-3',         // 12px - Between items in a list
    contentGap: 'space-y-4',  // 16px - Between content blocks
    
    // Margins
    marginSection: 'mb-6',    // 24px - Bottom margin for sections
    marginCard: 'mb-4',       // 16px - Bottom margin for cards
    marginItem: 'mb-3',       // 12px - Bottom margin for items
    
    // Element Spacing
    buttonGap: 'gap-2',       // 8px - Gap between button icon and text
    iconGap: 'gap-2',         // 8px - Gap next to icons
    badgeGap: 'gap-1.5',      // 6px - Gap in badges
  },

  /**
   * BORDER RADIUS TOKENS
   * Standardized corner radius for consistent rounded corners
   */
  radius: {
    button: 'rounded-lg',     // 8px - Standard button radius
    card: 'rounded-xl',       // 12px - Standard card radius
    badge: 'rounded-full',    // Fully rounded badges
    input: 'rounded-lg',      // 8px - Input fields
    avatar: 'rounded-full',   // Fully rounded avatars
    modal: 'rounded-2xl',     // 16px - Modal dialogs
  },

  /**
   * SHADOW TOKENS
   * Standardized box shadows for depth and elevation
   */
  shadow: {
    none: '',                                                           // No shadow
    soft: 'shadow-[0_2px_8px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]',      // Subtle elevation
    medium: 'shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)]',   // Standard card shadow
    large: 'shadow-[0_10px_24px_rgba(0,0,0,0.12),0_4px_8px_rgba(0,0,0,0.08)]',   // Modal/dialog shadow
    hover: 'hover:shadow-[0_8px_16px_rgba(0,0,0,0.1),0_3px_6px_rgba(0,0,0,0.08)]', // Hover state
  },

  /**
   * COLOR TOKENS
   * Brand colors and semantic color values
   */
  colors: {
    // JotMinds Brand Colors
    brand: {
      indigo: '#5B7DB1',      // Primary brand color
      aqua: '#6B4C9A',        // Secondary brand color
      coral: '#FF715B',       // Accent color
      violet: '#7B61FF',      // Purple accent
    },
    
    // Semantic Colors
    primary: 'bg-[#5B7DB1]',
    primaryText: 'text-[#5B7DB1]',
    primaryHover: 'hover:bg-[#232063]',
    
    // Background Colors
    bgLight: 'bg-gray-50',
    bgWhite: 'bg-white',
    bgMuted: 'bg-gray-100',
    
    // Text Colors
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-600',
    textMuted: 'text-gray-500',
    
    // Border Colors
    borderLight: 'border-gray-200',
    borderMedium: 'border-gray-300',
    
    // Status Colors
    success: 'text-green-600',
    successBg: 'bg-green-50',
    warning: 'text-amber-600',
    warningBg: 'bg-amber-50',
    error: 'text-red-600',
    errorBg: 'bg-red-50',
    info: 'text-blue-600',
    infoBg: 'bg-blue-50',
  },

  /**
   * TYPOGRAPHY TOKENS
   * Standardized font sizes and line heights
   */
  typography: {
    // Headings
    h1: 'text-2xl font-semibold leading-tight',      // 24px
    h2: 'text-xl font-semibold leading-tight',       // 20px
    h3: 'text-lg font-semibold leading-normal',      // 18px
    h4: 'text-base font-semibold leading-normal',    // 16px
    
    // Body Text
    bodyLarge: 'text-lg leading-relaxed',            // 18px
    body: 'text-base leading-normal',                // 16px
    bodySmall: 'text-sm leading-normal',             // 14px
    
    // Special Text
    label: 'text-sm font-medium leading-normal',     // 14px - Form labels
    caption: 'text-xs leading-normal',               // 12px - Captions
    
    // Line Height (use with custom text sizes)
    lineNormal: 'leading-normal',     // 1.5
    lineRelaxed: 'leading-relaxed',   // 1.625
    lineTight: 'leading-tight',       // 1.25
  },

  /**
   * COMPONENT HEIGHT TOKENS
   * Standardized heights for interactive elements
   */
  height: {
    buttonSm: 'h-9',         // 36px - Small button
    button: 'h-10',          // 40px - Standard button
    buttonLg: 'h-12',        // 48px - Large button
    input: 'h-10',           // 40px - Input field
    inputLg: 'h-12',         // 48px - Large input
    avatar: 'h-10 w-10',     // 40px - Standard avatar
    avatarSm: 'h-8 w-8',     // 32px - Small avatar
    avatarLg: 'h-12 w-12',   // 48px - Large avatar
  },

  /**
   * LAYOUT TOKENS
   * Standardized layout patterns
   */
  layout: {
    // Grid Layouts
    gridCols2: 'grid grid-cols-1 md:grid-cols-2',
    gridCols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    gridCols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    
    // Flex Layouts
    flexRow: 'flex items-center',
    flexCol: 'flex flex-col',
    flexBetween: 'flex items-center justify-between',
    flexCenter: 'flex items-center justify-center',
    
    // Container Widths
    containerSm: 'max-w-2xl mx-auto',      // 672px
    containerMd: 'max-w-4xl mx-auto',      // 896px
    containerLg: 'max-w-6xl mx-auto',      // 1152px
    containerFull: 'max-w-7xl mx-auto',    // 1280px
  },

  /**
   * TRANSITION TOKENS
   * Standardized transitions and animations
   */
  transition: {
    base: 'transition-all duration-200 ease-in-out',
    fast: 'transition-all duration-150 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
  },

  /**
   * BADGE TOKENS
   * Standardized badge styles
   */
  badge: {
    base: 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium',
    primary: 'bg-blue-100 text-blue-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    error: 'bg-red-100 text-red-700',
    neutral: 'bg-gray-100 text-gray-700',
  },

  /**
   * BUTTON TOKENS
   * Standardized button styles (base classes)
   */
  button: {
    base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
    primary: 'bg-[#5B7DB1] text-white hover:bg-[#232063]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
    
    // Sizes
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-base',
  },

  /**
   * CARD TOKENS
   * Standardized card styles
   */
  card: {
    base: 'bg-white rounded-xl p-4',
    withShadow: 'bg-white rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)]',
    interactive: 'bg-white rounded-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.08),0_2px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_16px_rgba(0,0,0,0.1),0_3px_6px_rgba(0,0,0,0.08)] transition-all duration-200',
    borderOnly: 'bg-white rounded-xl p-4 border border-gray-200',
  },
};

/**
 * HELPER FUNCTIONS
 * Utility functions for combining tokens
 */

/**
 * Combines multiple token classes into a single string
 * Usage: cn(tokens.card.base, tokens.shadow.medium, 'custom-class')
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Card component class builder
 * Usage: cardClass({ shadow: 'medium', padding: 'lg' })
 */
export function cardClass(options?: {
  shadow?: 'none' | 'soft' | 'medium' | 'large';
  padding?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
}): string {
  const classes = ['bg-white', tokens.radius.card];
  
  // Padding
  if (options?.padding === 'sm') classes.push(tokens.spacing.cardSm);
  else if (options?.padding === 'lg') classes.push(tokens.spacing.cardLg);
  else classes.push(tokens.spacing.card);
  
  // Shadow
  if (options?.shadow === 'soft') classes.push(tokens.shadow.soft);
  else if (options?.shadow === 'medium') classes.push(tokens.shadow.medium);
  else if (options?.shadow === 'large') classes.push(tokens.shadow.large);
  
  // Interactive
  if (options?.interactive) {
    classes.push(tokens.shadow.hover, tokens.transition.base);
  }
  
  return classes.join(' ');
}

/**
 * Button component class builder
 * Usage: buttonClass({ variant: 'primary', size: 'lg' })
 */
export function buttonClass(options?: {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}): string {
  const classes = [tokens.button.base];
  
  // Variant
  if (options?.variant === 'primary') classes.push(tokens.button.primary);
  else if (options?.variant === 'secondary') classes.push(tokens.button.secondary);
  else if (options?.variant === 'outline') classes.push(tokens.button.outline);
  else if (options?.variant === 'ghost') classes.push(tokens.button.ghost);
  else classes.push(tokens.button.primary); // default
  
  // Size
  if (options?.size === 'sm') classes.push(tokens.button.sm);
  else if (options?.size === 'lg') classes.push(tokens.button.lg);
  else classes.push(tokens.button.md); // default
  
  return classes.join(' ');
}

/**
 * Badge component class builder
 * Usage: badgeClass({ variant: 'success' })
 */
export function badgeClass(variant?: 'primary' | 'success' | 'warning' | 'error' | 'neutral'): string {
  const classes = [tokens.badge.base];
  
  if (variant === 'primary') classes.push(tokens.badge.primary);
  else if (variant === 'success') classes.push(tokens.badge.success);
  else if (variant === 'warning') classes.push(tokens.badge.warning);
  else if (variant === 'error') classes.push(tokens.badge.error);
  else classes.push(tokens.badge.neutral);
  
  return classes.join(' ');
}

export default tokens;

/**
 * LEGACY COMPATIBILITY LAYER
 * These exports provide backwards compatibility for components using the old design token structure.
 * TODO: Migrate components to use the new `tokens` structure above.
 */

// Legacy colors structure
export const colors: {
  primary: { main: string; light: string; dark: string; bg: string; border: string };
  success: { main: string; light: string; dark: string; bg: string; border: string };
  warning: { main: string; light: string; dark: string; bg: string; border: string };
  error: { main: string; light: string; dark: string; bg: string; border: string };
  info: { main: string; light: string; dark: string; bg: string; border: string };
  neutral: { white: string; gray50: string; gray100: string; gray200: string; gray300: string; gray400: string; gray500: string; gray600: string; gray700: string; gray800: string; gray900: string };
  gradients: { primary: string; success: string; warning: string; info: string };
} = {
  primary: {
    main: '#5B7DB1',
    light: '#4147A3',
    dark: '#1F2063',
    bg: '#EEF2FF',
    border: '#C7D2FE',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    bg: '#D1FAE5',
    border: '#6EE7B7',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    bg: '#FEE2E2',
    border: '#FECACA',
  },
  info: {
    main: '#6B4C9A',
    light: '#67E8F9',
    dark: '#0891B2',
    bg: '#E0F8FB',
    border: '#A5F3FC',
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #6B4C9A 0%, #7B61FF 100%)',
    success: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    warning: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    info: 'linear-gradient(135deg, #E0F8FB 0%, #FFFFFF 100%)',
  },
};

// Legacy component spacing structure
export const componentSpacing: {
  cardPadding: number;
  cardPaddingLg: number;
  cardPaddingSm: number;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; '2xl': number; '3xl': number };
  results: { contentGap: number; sectionGap: number };
} = {
  cardPadding: 16,
  cardPaddingLg: 24,
  cardPaddingSm: 12,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  },
  results: {
    contentGap: 16,
    sectionGap: 24,
  },
};

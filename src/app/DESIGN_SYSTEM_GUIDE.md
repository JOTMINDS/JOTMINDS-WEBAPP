# JotMinds Design System Implementation Guide

## Overview

This document provides comprehensive guidance on implementing the JotMinds Design System tokens across all components to ensure consistency in spacing, shadows, colors, radii, and typography.

## 📦 Design System Files

- **`/utils/designTokens.ts`** - TypeScript tokens and helper functions
- **`/styles/globals.css`** - CSS custom properties and utility classes

## 🎯 Critical Issues Fixed

### ✅ Completed (Section 3)
- ✅ Date formatting inconsistencies - ALL FIXED
- ✅ Card padding standardized to 16px
- ✅ Centralized date utility (`/utils/dateFormat.ts`)

### 🔧 To Fix (Section 9 - Global Issues)

1. **Spacing inconsistencies** (most common issue)
2. **Repeated text blocks** in results section
3. **Line-height inconsistencies** in questions
4. **Color shades** not standardized
5. **Card shadows** vary in intensity
6. **Button corner radius** inconsistent (some 8px, some 12px)

## 🚀 Implementation Strategy

### Phase 1: High-Traffic Components (Priority)
1. Assessment components (`AssessmentTaking.tsx`, `AssessmentReport.tsx`)
2. Dashboard components (`StudentDashboard.tsx`, `TeacherDashboard.tsx`, `ParentDashboard.tsx`)
3. Profile components (`CognitiveProfile.tsx`, `CombinedCognitiveProfile.tsx`)

### Phase 2: Supporting Components
4. Card components (`card.tsx`, `card-v2.tsx`)
5. Button components (`button.tsx`)
6. Form components (inputs, selects, textareas)

### Phase 3: Feature Components
7. Gamification system
8. Brain Gym components
9. Reflection components

## 📐 Token Usage Guide

### 1. Spacing Tokens

#### Before (Inconsistent):
```tsx
<div className="p-6">         // Some cards
<div className="p-4">         // Other cards
<div className="p-5">         // More cards
<div className="space-y-8">   // Some sections
<div className="space-y-4">   // Other sections
```

#### After (Consistent):
```tsx
import { tokens } from '../utils/designTokens';

<div className={tokens.spacing.card}>        // Standard: p-4 (16px)
<div className={tokens.spacing.cardLg}>      // Large: p-6 (24px)
<div className={tokens.spacing.sectionGap}>  // Standard: space-y-6 (24px)
<div className={tokens.spacing.contentGap}>  // Standard: space-y-4 (16px)
```

### 2. Border Radius Tokens

#### Before (Inconsistent):
```tsx
<button className="rounded-md">    // 6px
<button className="rounded-lg">    // 8px
<div className="rounded-xl">       // 12px
<div className="rounded-2xl">      // 16px
```

#### After (Consistent):
```tsx
import { tokens } from '../utils/designTokens';

<button className={tokens.radius.button}>  // 8px - ALL buttons
<div className={tokens.radius.card}>       // 12px - ALL cards
<div className={tokens.radius.modal}>      // 16px - ALL modals
```

### 3. Shadow Tokens

#### Before (Inconsistent):
```tsx
<div className="shadow">
<div className="shadow-md">
<div className="shadow-lg">
<div className="shadow-[0_4px_6px_rgba(0,0,0,0.1)]">
```

#### After (Consistent):
```tsx
import { tokens } from '../utils/designTokens';

<div className={tokens.shadow.soft}>      // Subtle elevation
<div className={tokens.shadow.medium}>    // Standard cards
<div className={tokens.shadow.large}>     // Modals/dialogs
<div className={tokens.shadow.hover}>     // Interactive hover
```

### 4. Typography Tokens

#### Before (Inconsistent):
```tsx
<h2 className="text-xl font-bold">
<h2 className="text-2xl font-semibold">
<p className="text-base leading-6">
<p className="text-sm leading-relaxed">
```

#### After (Consistent):
```tsx
import { tokens } from '../utils/designTokens';

<h1 className={tokens.typography.h1}>    // 24px, semibold, tight
<h2 className={tokens.typography.h2}>    // 20px, semibold, tight
<h3 className={tokens.typography.h3}>    // 18px, semibold, normal
<p className={tokens.typography.body}>   // 16px, normal, 1.5 line-height
<p className={tokens.typography.bodySmall}>  // 14px
```

### 5. Color Tokens

#### Before (Inconsistent):
```tsx
<div className="bg-indigo-600">
<div className="bg-[#2C2E83]">
<div className="text-blue-600">
```

#### After (Consistent):
```tsx
import { tokens } from '../utils/designTokens';

<div className={tokens.colors.primary}>      // bg-[#2C2E83]
<div className={tokens.colors.primaryText}>  // text-[#2C2E83]
<div className={tokens.colors.textMuted}>    // text-gray-500
```

## 🛠 Helper Functions

### cardClass() - Smart Card Builder

```tsx
import { cardClass } from '../utils/designTokens';

// Basic card
<div className={cardClass()}>

// Card with medium shadow
<div className={cardClass({ shadow: 'medium' })}>

// Large padding card
<div className={cardClass({ padding: 'lg' })}>

// Interactive card (hover effect)
<div className={cardClass({ shadow: 'medium', interactive: true })}>
```

### buttonClass() - Smart Button Builder

```tsx
import { buttonClass } from '../utils/designTokens';

// Primary button
<button className={buttonClass({ variant: 'primary', size: 'md' })}>

// Large secondary button
<button className={buttonClass({ variant: 'secondary', size: 'lg' })}>

// Small outline button
<button className={buttonClass({ variant: 'outline', size: 'sm' })}>
```

### badgeClass() - Smart Badge Builder

```tsx
import { badgeClass } from '../utils/designTokens';

<span className={badgeClass('success')}>Completed</span>
<span className={badgeClass('warning')}>In Progress</span>
<span className={badgeClass('error')}>Incomplete</span>
```

### cn() - Class Name Combiner

```tsx
import { tokens, cn } from '../utils/designTokens';

<div className={cn(
  tokens.card.base,
  tokens.shadow.medium,
  'hover:scale-105',
  isActive && 'ring-2 ring-blue-500'
)}>
```

## 📋 Migration Checklist

### Per Component:

- [ ] Import design tokens: `import { tokens } from '../utils/designTokens';`
- [ ] Replace hardcoded spacing with `tokens.spacing.*`
- [ ] Replace hardcoded border radius with `tokens.radius.*`
- [ ] Replace hardcoded shadows with `tokens.shadow.*`
- [ ] Replace inconsistent typography with `tokens.typography.*`
- [ ] Replace color values with `tokens.colors.*`
- [ ] Use helper functions where applicable
- [ ] Test component visually
- [ ] Verify responsive behavior

## 🎨 Design System Standards

### Card Padding
- **Standard**: `p-4` (16px) - Default for all cards
- **Large**: `p-6` (24px) - Feature cards, important content
- **Small**: `p-3` (12px) - Compact cards, list items

### Button Radius
- **All buttons**: `rounded-lg` (8px) - NO EXCEPTIONS

### Card Radius
- **All cards**: `rounded-xl` (12px) - NO EXCEPTIONS

### Card Shadows
- **Soft**: Subtle elevation (info cards, metrics)
- **Medium**: Standard cards (content cards, forms)
- **Large**: Modals, dialogs, important UI
- **Hover**: Interactive cards on hover

### Section Spacing
- **Major sections**: `space-y-6` (24px)
- **Content blocks**: `space-y-4` (16px)
- **List items**: `gap-3` (12px)

### Line Heights
- **Headings**: `leading-tight` (1.25)
- **Body text**: `leading-normal` (1.5)
- **Readable text**: `leading-relaxed` (1.625)

## 🔍 Common Patterns

### Dashboard Cards
```tsx
<div className={cn(
  tokens.card.base,
  tokens.shadow.medium,
  tokens.spacing.cardGap
)}>
  <h3 className={tokens.typography.h3}>Card Title</h3>
  <div className={tokens.spacing.contentGap}>
    {/* Card content */}
  </div>
</div>
```

### Section Headers
```tsx
<div className={tokens.spacing.marginSection}>
  <h2 className={tokens.typography.h2}>Section Title</h2>
  <p className={cn(tokens.typography.bodySmall, tokens.colors.textMuted)}>
    Section description
  </p>
</div>
```

### Button Groups
```tsx
<div className={cn(tokens.layout.flexRow, tokens.spacing.buttonGap)}>
  <button className={buttonClass({ variant: 'primary' })}>
    Primary Action
  </button>
  <button className={buttonClass({ variant: 'secondary' })}>
    Secondary Action
  </button>
</div>
```

### Status Badges
```tsx
<div className={cn(tokens.layout.flexRow, tokens.spacing.iconGap)}>
  <CheckCircle className="h-4 w-4" />
  <span className={badgeClass('success')}>Completed</span>
</div>
```

## 🎯 Priority Components for Migration

### CRITICAL (Do First):
1. `/components/ui/card.tsx` - Base card component
2. `/components/ui/card-v2.tsx` - Enhanced card component
3. `/components/ui/button.tsx` - Base button component
4. `/components/AssessmentTaking.tsx` - Main assessment interface
5. `/components/AssessmentReport.tsx` - Results display

### HIGH PRIORITY:
6. `/components/StudentDashboard.tsx`
7. `/components/TeacherDashboard.tsx`
8. `/components/ParentDashboard.tsx`
9. `/components/CognitiveProfile.tsx`
10. `/components/CombinedCognitiveProfile.tsx`

### MEDIUM PRIORITY:
11. All gamification components
12. All Brain Gym components
13. All reflection components
14. All form components

## 🚫 What NOT to Change

### Keep Exactly As Is (Section 10 of Audit):
- ✅ Assessment question structure
- ✅ Progress bar concept
- ✅ Executive Summary layout
- ✅ Strengths → Development Areas → Key Actions structure
- ✅ Clean typography (just standardize the values)
- ✅ Bar charts (with improvements)
- ✅ Track Record card layout
- ✅ Top navigation icons

## 📊 Success Metrics

After migration, verify:
- [ ] All cards use consistent padding (16px default)
- [ ] All buttons use consistent radius (8px)
- [ ] All cards use consistent radius (12px)
- [ ] All shadows match the 3-tier system (soft/medium/large)
- [ ] All section spacing is consistent (24px between sections)
- [ ] All line heights are standardized
- [ ] No hardcoded spacing values (except special cases)
- [ ] No hardcoded shadow values
- [ ] No hardcoded radius values

## 💡 Tips

1. **Start small**: Migrate one component at a time
2. **Test visually**: Check before/after screenshots
3. **Use helper functions**: They prevent mistakes
4. **Be consistent**: If you use `tokens.spacing.card`, use it everywhere
5. **Document exceptions**: If you deviate, add a comment explaining why

## 🔗 Related Files

- `/utils/designTokens.ts` - Token definitions
- `/styles/globals.css` - CSS custom properties
- `/utils/dateFormat.ts` - Date formatting utilities
- `/DESIGN_SYSTEM_GUIDE.md` - This guide

---

**Last Updated**: December 3, 2024
**Status**: Design system created, ready for migration
**Next Steps**: Begin Phase 1 component migration

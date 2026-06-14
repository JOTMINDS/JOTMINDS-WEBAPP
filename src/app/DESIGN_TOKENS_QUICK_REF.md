# JotMinds Design Tokens - Quick Reference Card

## 🚀 Quick Import
```tsx
import { tokens, cn, cardClass, buttonClass, badgeClass } from '../utils/designTokens';
```

---

## 📏 SPACING (Replace ALL hardcoded padding/margin/gap)

| Token | Class | Value | Use For |
|-------|-------|-------|---------|
| `tokens.spacing.card` | `p-4` | 16px | **Standard card padding** |
| `tokens.spacing.cardLg` | `p-6` | 24px | Large card padding |
| `tokens.spacing.cardSm` | `p-3` | 12px | Small card padding |
| `tokens.spacing.sectionGap` | `space-y-6` | 24px | **Between major sections** |
| `tokens.spacing.contentGap` | `space-y-4` | 16px | **Between content blocks** |
| `tokens.spacing.cardGap` | `gap-4` | 16px | Between cards in grid |
| `tokens.spacing.itemGap` | `gap-3` | 12px | Between items in list |
| `tokens.spacing.buttonGap` | `gap-2` | 8px | Button icon + text |

---

## 🔘 BORDER RADIUS (NO MORE INCONSISTENCY!)

| Token | Class | Value | Use For |
|-------|-------|-------|---------|
| `tokens.radius.button` | `rounded-lg` | 8px | **ALL BUTTONS** ⚠️ |
| `tokens.radius.card` | `rounded-xl` | 12px | **ALL CARDS** ⚠️ |
| `tokens.radius.input` | `rounded-lg` | 8px | Input fields |
| `tokens.radius.modal` | `rounded-2xl` | 16px | Modals/dialogs |
| `tokens.radius.badge` | `rounded-full` | Full | Badges/pills |
| `tokens.radius.avatar` | `rounded-full` | Full | Avatars |

**⚠️ CRITICAL**: All buttons = `rounded-lg`, All cards = `rounded-xl`

---

## 🌑 SHADOWS (3-Tier System)

| Token | CSS Value | Use For |
|-------|-----------|---------|
| `tokens.shadow.soft` | `0 2px 8px rgba(0,0,0,0.04)...` | Subtle elevation, info cards |
| `tokens.shadow.medium` | `0 4px 12px rgba(0,0,0,0.08)...` | **Standard cards** ⭐ |
| `tokens.shadow.large` | `0 10px 24px rgba(0,0,0,0.12)...` | Modals, dialogs |
| `tokens.shadow.hover` | `0 8px 16px rgba(0,0,0,0.1)...` | Interactive hover state |

---

## 📝 TYPOGRAPHY (Headings & Body)

| Token | Result | Use For |
|-------|--------|---------|
| `tokens.typography.h1` | `text-2xl font-semibold leading-tight` | Main page titles |
| `tokens.typography.h2` | `text-xl font-semibold leading-tight` | Section headers |
| `tokens.typography.h3` | `text-lg font-semibold leading-normal` | Subsection headers |
| `tokens.typography.h4` | `text-base font-semibold leading-normal` | Card titles |
| `tokens.typography.body` | `text-base leading-normal` | **Standard text** |
| `tokens.typography.bodySmall` | `text-sm leading-normal` | Secondary text |
| `tokens.typography.label` | `text-sm font-medium leading-normal` | Form labels |
| `tokens.typography.caption` | `text-xs leading-normal` | Captions, metadata |

---

## 🎨 COLORS (Brand & Semantic)

### Brand Colors
```tsx
tokens.colors.brand.indigo   // #2C2E83 - Primary
tokens.colors.brand.aqua     // #1FC8E1 - Secondary
tokens.colors.brand.coral    // #FF715B - Accent
tokens.colors.brand.violet   // #7B61FF - Purple
```

### Common Classes
| Token | Result | Use For |
|-------|--------|---------|
| `tokens.colors.primary` | `bg-[#2C2E83]` | Primary buttons |
| `tokens.colors.primaryText` | `text-[#2C2E83]` | Brand text |
| `tokens.colors.textPrimary` | `text-gray-900` | Main text |
| `tokens.colors.textSecondary` | `text-gray-600` | Secondary text |
| `tokens.colors.textMuted` | `text-gray-500` | Subtle text |
| `tokens.colors.borderLight` | `border-gray-200` | Borders |

---

## 🛠 HELPER FUNCTIONS

### cardClass() - Smart Card Builder
```tsx
// Default card
<div className={cardClass()}>

// With shadow
<div className={cardClass({ shadow: 'medium' })}>

// Large padding + interactive
<div className={cardClass({ padding: 'lg', interactive: true })}>
```

### buttonClass() - Smart Button Builder
```tsx
// Primary button (default)
<button className={buttonClass({ variant: 'primary', size: 'md' })}>

// Secondary large
<button className={buttonClass({ variant: 'secondary', size: 'lg' })}>

// Outline small
<button className={buttonClass({ variant: 'outline', size: 'sm' })}>
```

### badgeClass() - Badge Builder
```tsx
<span className={badgeClass('success')}>Completed</span>
<span className={badgeClass('warning')}>In Progress</span>
<span className={badgeClass('error')}>Failed</span>
<span className={badgeClass('neutral')}>Pending</span>
```

### cn() - Combine Classes
```tsx
<div className={cn(
  tokens.card.base,
  tokens.shadow.medium,
  'custom-class',
  isActive && 'ring-2'
)}>
```

---

## 📦 COMPLETE COMPONENT PATTERNS

### Dashboard Card (Standard)
```tsx
<div className={cn(
  tokens.card.base,           // bg-white rounded-xl p-4
  tokens.shadow.medium,       // Standard shadow
  tokens.spacing.sectionGap   // Internal spacing
)}>
  <h3 className={tokens.typography.h3}>Card Title</h3>
  <p className={tokens.typography.bodySmall}>Description</p>
</div>
```

### Interactive Card (Hover Effect)
```tsx
<div className={cardClass({ shadow: 'medium', interactive: true })}>
  <h3 className={tokens.typography.h3}>Hover Me</h3>
</div>
```

### Button Group
```tsx
<div className={cn(tokens.layout.flexRow, tokens.spacing.buttonGap)}>
  <button className={buttonClass({ variant: 'primary' })}>
    Save
  </button>
  <button className={buttonClass({ variant: 'secondary' })}>
    Cancel
  </button>
</div>
```

### Section Header
```tsx
<div className={tokens.spacing.marginSection}>
  <h2 className={tokens.typography.h2}>Section Title</h2>
  <p className={cn(
    tokens.typography.bodySmall,
    tokens.colors.textMuted
  )}>
    Section description text
  </p>
</div>
```

### Status Badge
```tsx
<div className={cn(tokens.layout.flexRow, tokens.spacing.iconGap)}>
  <CheckCircle className="h-4 w-4" />
  <span className={badgeClass('success')}>
    Completed
  </span>
</div>
```

---

## ⚠️ CRITICAL RULES

1. **Card Padding**: ALWAYS use `tokens.spacing.card` (16px) unless exception documented
2. **Button Radius**: ALWAYS use `tokens.radius.button` (8px) - NO EXCEPTIONS
3. **Card Radius**: ALWAYS use `tokens.radius.card` (12px) - NO EXCEPTIONS
4. **Shadows**: Use ONLY the 3-tier system (soft/medium/large)
5. **Section Spacing**: ALWAYS use `tokens.spacing.sectionGap` between major sections
6. **Line Heights**: NEVER hardcode - use `tokens.typography.*`

---

## 🔄 BEFORE → AFTER Examples

### ❌ Before (Inconsistent)
```tsx
<div className="bg-white rounded-2xl p-6 shadow-md space-y-8">
  <h2 className="text-xl font-bold">Title</h2>
  <button className="rounded-md px-4 py-2">Click</button>
</div>
```

### ✅ After (Consistent)
```tsx
<div className={cn(
  tokens.card.base,          // bg-white rounded-xl p-4
  tokens.shadow.medium,
  tokens.spacing.sectionGap
)}>
  <h2 className={tokens.typography.h2}>Title</h2>
  <button className={buttonClass({ variant: 'primary' })}>
    Click
  </button>
</div>
```

---

## 📋 Migration Checklist (Per Component)

- [ ] Import tokens at top
- [ ] Replace hardcoded padding → `tokens.spacing.*`
- [ ] Replace hardcoded radius → `tokens.radius.*`
- [ ] Replace hardcoded shadows → `tokens.shadow.*`
- [ ] Replace typography classes → `tokens.typography.*`
- [ ] Use helper functions where applicable
- [ ] Test visually
- [ ] Verify responsive behavior

---

**Print this page and keep it visible while coding!** 📌

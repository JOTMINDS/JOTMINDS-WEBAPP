# JotMinds Design System Tokens
**Version 1.0 - December 2025**

This document outlines the standardized design tokens used across the JotMinds Thinking Styles Assessment platform.

---

## 🎨 Design Principles

1. **Consistency First** - All components use the same spacing, shadows, and radii
2. **Accessibility** - WCAG 2.1 AA compliant color contrasts and readable typography
3. **Scalability** - Token-based system allows easy updates across the entire platform
4. **International Ready** - Designed for ages 6-18 across multiple countries

---

## 📏 Spacing System

Based on an **8px base unit** for mathematical consistency:

```css
--space-0: 0         /* 0px */
--space-1: 0.25rem   /* 4px */
--space-2: 0.5rem    /* 8px */
--space-3: 0.75rem   /* 12px */
--space-4: 1rem      /* 16px - STANDARD CARD PADDING */
--space-5: 1.25rem   /* 20px */
--space-6: 1.5rem    /* 24px */
--space-8: 2rem      /* 32px */
--space-10: 2.5rem   /* 40px */
--space-12: 3rem     /* 48px */
--space-16: 4rem     /* 64px */
```

### Usage Rules
- **All cards** must use `--space-4` (16px) padding on all sides
- **Section gaps** should use `--space-6` (24px) or `--space-8` (32px)
- **Element spacing** should use values from the scale only

---

## 🔤 Typography

### Font Sizes
```css
--text-xs: 0.75rem    /* 12px */
--text-sm: 0.875rem   /* 14px */
--text-base: 1rem     /* 16px - DEFAULT */
--text-lg: 1.125rem   /* 18px */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px */
--text-3xl: 1.875rem  /* 30px */
--text-4xl: 2.25rem   /* 36px */
```

### Font Weights
```css
--font-weight-normal: 400
--font-weight-medium: 600
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Line Heights - **STANDARDIZED**
```css
--line-height-tight: 1.25    /* Headings */
--line-height-normal: 1.5    /* Body text, questions */
--line-height-relaxed: 1.6   /* Long-form content */
--line-height-loose: 1.75    /* Special cases */
```

### Typography Rules
- **All assessment questions** must use `line-height: var(--line-height-normal)` (1.5)
- **Body text** defaults to `--text-base` (16px) with `--line-height-normal` (1.5)
- **Maximum line length** for readability: `--line-length-max` (60 characters)
- Do NOT use custom font sizes - always use tokens

---

## 🎨 Colors

### Brand Colors
```css
--jotminds-indigo: #2C2E83  /* Primary brand color */
--jotminds-aqua: #1FC8E1    /* Secondary - energy, innovation */
--jotminds-coral: #FF715B   /* Accent - warmth, engagement */
--jotminds-violet: #7B61FF  /* Accent - creativity */
```

### Semantic Colors
- `--primary`: #2C2E83 (JotMinds Indigo)
- `--background`: #f8fafc (Slate 50)
- `--foreground`: #0f172a (Slate 900)
- `--muted-foreground`: #64748b (Slate 500)
- `--border`: #e2e8f0 (Slate 200)

### Chart Colors (Recharts)
```css
--chart-1: #1FC8E1  /* Aqua */
--chart-2: #7B61FF  /* Violet */
--chart-3: #FF715B  /* Coral */
--chart-4: #2C2E83  /* Indigo */
--chart-5: #6366f1  /* Indigo 500 */
```

### Color Usage Rules
- **All colors** must come from the token system
- **Do NOT use custom hex codes** in components
- Ensure WCAG AA contrast ratios (4.5:1 for text, 3:1 for large text)

---

## 🔲 Border Radius

**STANDARDIZED TO 8px (0.5rem)** for consistency across all buttons and cards:

```css
--radius-none: 0
--radius-sm: 0.375rem   /* 6px - Small elements */
--radius-base: 0.5rem   /* 8px - STANDARD for buttons, inputs */
--radius-md: 0.5rem     /* 8px - STANDARD for cards, dialogs */
--radius-lg: 0.75rem    /* 12px - Large cards */
--radius-xl: 1rem       /* 16px - Hero sections */
--radius-2xl: 1.5rem    /* 24px - Special cases */
--radius-full: 9999px   /* Fully rounded (badges, avatars) */
```

### Border Radius Rules
- **All buttons** must use `--radius-base` (8px)
- **All cards** must use `--radius-md` (8px)
- **All inputs** must use `--radius-base` (8px)
- **No custom border-radius values** allowed

---

## 🌑 Shadows

**STANDARDIZED TO 5 LEVELS** with consistent intensity:

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-base: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.10), 0 2px 4px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)
--shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.14), 0 8px 16px rgba(0, 0, 0, 0.10)

/* SPECIAL: Card shadow - use this for all cards */
--shadow-card: var(--shadow-base)
```

### Shadow Usage Rules
- **All cards** must use `--shadow-card` (equivalent to `--shadow-base`)
- **Elevated elements** use `--shadow-md`
- **Modals/Dialogs** use `--shadow-lg`
- **No custom box-shadow values** allowed
- Use utility classes: `.shadow-card`, `.shadow-medium`, `.shadow-large`

---

## 📐 Component Heights

Standardized heights for form elements and interactive components:

```css
--height-input: 2.5rem      /* 40px - Input fields */
--height-button-sm: 2rem    /* 32px - Small buttons */
--height-button: 2.5rem     /* 40px - Default buttons */
--height-button-lg: 3rem    /* 48px - Large buttons */
--height-header: 4rem       /* 64px - Header bar */
--height-footer: 3rem       /* 48px - Footer */
```

### Component Height Rules
- **All text inputs** must use `--height-input` (40px)
- **Default buttons** must use `--height-button` (40px)
- **Large CTAs** can use `--height-button-lg` (48px)

---

## ⚡ Transitions

Standardized animation durations:

```css
--transition-fast: 150ms
--transition-base: 200ms
--transition-slow: 300ms
--transition-slower: 500ms
```

---

## 🎯 Z-Index Scale

Standardized z-index values for layering:

```css
--z-base: 0
--z-dropdown: 1000
--z-sticky: 1020
--z-fixed: 1030
--z-modal-backdrop: 1040
--z-modal: 1050
--z-popover: 1060
--z-tooltip: 1070
```

---

## 📱 Breakpoints

Reference breakpoints (used in Tailwind):

```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
--breakpoint-2xl: 1536px
```

---

## 🛠️ Utility Classes

### Spacing
```css
.space-card-padding { padding: var(--space-4); /* 16px all sides */ }
```

### Typography
```css
.readable-width { max-width: var(--line-length-max); }
.text-readable { font-size: var(--text-base); line-height: var(--line-height-relaxed); }
.question-text { font-size: var(--text-base); line-height: var(--line-height-normal); }
```

### Shadows
```css
.shadow-card { box-shadow: var(--shadow-card); }
.shadow-soft { box-shadow: var(--shadow-base); }
.shadow-medium { box-shadow: var(--shadow-md); }
.shadow-large { box-shadow: var(--shadow-lg); }
```

### Border Radius
```css
.radius-standard { border-radius: var(--radius-base); /* 8px */ }
.radius-card { border-radius: var(--radius-md); /* 8px */ }
.radius-button { border-radius: var(--radius-base); /* 8px */ }
```

### Components
```css
.input-standard { height: var(--height-input); border-radius: var(--radius-base); }
.button-standard { height: var(--height-button); border-radius: var(--radius-base); padding: 0 var(--space-4); }
.button-sm { height: var(--height-button-sm); border-radius: var(--radius-base); padding: 0 var(--space-3); }
.button-lg { height: var(--height-button-lg); border-radius: var(--radius-base); padding: 0 var(--space-6); }
```

---

## ✅ Implementation Checklist

Before releasing any component, verify:

- [ ] Uses spacing tokens from the scale (no magic numbers)
- [ ] Uses `--space-4` (16px) padding for all cards
- [ ] Uses `--shadow-card` for all card shadows
- [ ] Uses `--radius-base` (8px) for buttons
- [ ] Uses `--radius-md` (8px) for cards
- [ ] Uses `--line-height-normal` (1.5) for question text
- [ ] Uses standardized color tokens (no custom hex codes)
- [ ] Uses standardized font sizes (no custom rem values)
- [ ] Uses component height tokens for inputs/buttons
- [ ] Date formatting uses `formatDate()` utility (Dec 1, 2025 – 1:38 PM)

---

## 🚫 What NOT to Do

1. ❌ **Do NOT use inline `style` attributes** for spacing, shadows, or radii
2. ❌ **Do NOT use custom border-radius values** (e.g., `rounded-[14px]`)
3. ❌ **Do NOT use custom box-shadow values** (use tokens only)
4. ❌ **Do NOT use hardcoded spacing** (e.g., `mt-[23px]`)
5. ❌ **Do NOT use custom line-heights** for questions (always use `--line-height-normal`)
6. ❌ **Do NOT use custom font sizes** (use tokens only)
7. ❌ **Do NOT use magic numbers** (use the spacing scale)

---

## 📚 Resources

- **Token File**: `/styles/globals.css`
- **Date Utility**: `/utils/dateFormat.ts`
- **Tailwind Config**: Uses Tailwind v4.0 (no config file needed)

---

## 🔄 Version History

- **v1.0 (Dec 2025)**: Initial design system tokens created during UI/UX audit
  - Standardized spacing to 8px base unit
  - Standardized shadows to 5 levels
  - Standardized border radius to 8px
  - Standardized line heights
  - Created comprehensive utility classes

---

**Questions?** Refer to this document when implementing any new components or making design decisions.

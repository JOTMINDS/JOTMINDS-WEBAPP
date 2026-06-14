# Card v2 Component Specifications
## JotMinds Ages 11-14 UI/UX Standards

### ✅ Implemented Features

#### 1. **Consistent Padding**
- **16px padding (p-4)** on all cards
- Reduced whitespace for better content density
- Age-appropriate spacing for 11-14 year olds

#### 2. **Icon Alignment**
- **Icons always aligned LEFT**
- 40px × 40px icon container (w-10 h-10)
- Rounded corners (rounded-lg)
- Background color matches category
- Icons use 20px × 20px size (w-5 h-5)

#### 3. **Content Hierarchy**
```
┌─────────────────────────────────┐
│ [Icon] Title                    │  ← Header Section
│        Subtitle                 │
│                                 │
│ [Stat 1]    [Stat 2]           │  ← Stats Section (optional)
│ Label       Label               │
│ Value       Value               │
│                                 │
│ {Custom Content}                │  ← Children (optional)
│                                 │
│ ─────────────────────────────  │
│                        [CTA] → │  ← CTA Bottom-Right
└─────────────────────────────────┘
```

#### 4. **CTA Placement**
- **Always bottom-right**
- Separated by top border (border-t)
- Padding-top for breathing room (pt-3)
- Flex justify-end for alignment

#### 5. **12-Column Layout System**
- Grid-based responsive layout
- CardV2Grid component handles columns
- Responsive breakpoints:
  - Mobile: 1 column
  - Tablet: 2 columns (md:grid-cols-2)
  - Desktop: 3-4 columns (lg:grid-cols-3/4)

### 📐 Component API

```tsx
<CardV2
  icon={LucideIcon}              // Optional icon component
  iconColor="text-blue-600"      // Icon color class
  iconBgColor="bg-blue-100"      // Icon background class
  title="Card Title"             // Required: Main title
  subtitle="Description"         // Optional: Subtitle text
  stats={[                       // Optional: Array of stats
    { label: 'Status', value: 'Done' },
    { label: 'Score', value: '95%' }
  ]}
  cta={<Button>Action</Button>}  // Optional: CTA element
  onClick={() => {}}             // Optional: Click handler
  variant="default|gradient|outlined"
  className="custom-classes"
/>
```

### 🎨 Variants

1. **Default**
   - White background
   - Gray border
   - Subtle hover shadow

2. **Gradient**
   - Gradient background (white to gray-50)
   - Gradient border (primary colors)
   - Enhanced hover shadow

3. **Outlined**
   - Transparent background
   - Thick border (2px)
   - Hover state changes border to brand color

### 📊 Stats Display

Stats are displayed in a 2-column grid:
- Light gray background (bg-gray-50)
- Rounded corners (rounded-lg)
- Label: Small muted text (text-xs text-muted-foreground)
- Value: Bold primary text (text-base font-bold)

### 🎯 Usage Examples

#### Assessment Card
```tsx
<CardV2
  icon={BookOpen}
  iconColor="text-blue-600"
  iconBgColor="bg-blue-100"
  title="Learning Style"
  subtitle="Discover how you learn best"
  stats={[{ label: 'Status', value: '✓ Done' }]}
  cta={
    <Button size="sm" className="gradient-primary">
      View Report →
    </Button>
  }
  variant="gradient"
/>
```

#### Profile Section Card
```tsx
<CardV2
  icon={FileText}
  iconColor="text-purple-600"
  iconBgColor="bg-purple-100"
  title="My Reflections"
  subtitle="View and manage your assessment reflections"
  stats={[{ label: 'Saved', value: 12 }]}
  cta={
    <Button size="sm" variant="outline">
      View All →
    </Button>
  }
  onClick={() => navigate('/reflections')}
  variant="gradient"
/>
```

### 🔧 Helper Components

#### CardV2Grid
Responsive grid container for Card v2 components:
```tsx
<CardV2Grid columns={3}>
  <CardV2 {...props1} />
  <CardV2 {...props2} />
  <CardV2 {...props3} />
</CardV2Grid>
```

#### StatBadge
Inline stat display with icon:
```tsx
<StatBadge
  icon={Flame}
  label="Streak"
  value="7 days"
  color="orange"
/>
```

### ✅ Benefits for Ages 11-14

1. **Reduced Cognitive Load**
   - Consistent layout reduces mental effort
   - Predictable information hierarchy
   - Clear visual patterns

2. **Improved Scannability**
   - Icons provide quick visual anchors
   - Stats highlighted in dedicated section
   - CTA always in same location

3. **Better Touch Targets**
   - Consistent padding improves clickability
   - Larger interactive areas
   - Clear hover states

4. **Professional Appearance**
   - Consistent design language
   - Age-appropriate visual sophistication
   - Clean, modern aesthetic

### 📱 Responsive Behavior

- **Mobile (< 768px)**: Single column, full width
- **Tablet (768px - 1024px)**: 2 columns
- **Desktop (> 1024px)**: 3-4 columns based on configuration

### 🎨 Color System

Cards use the JotMinds brand colors:
- **Primary Blue**: #1FC8E1 (Aqua)
- **Secondary Purple**: #7B61FF (Violet)
- **Accent Blue**: #2C2E83 (Deep Blue)
- **Success Green**: For completed states
- **Warning Orange**: For in-progress states

---

## Migration Checklist

- [x] Create Card v2 component
- [x] Update core assessment cards (Learning, Thinking, Decision)
- [x] Update Profile section cards (Reflections, Parent Access, Feedback)
- [ ] Update Brain Gym card
- [ ] Update Thinking Styles Adventure card
- [ ] Update Track Record cards
- [ ] Update Mood Meter cards
- [ ] Update Discovery cards

---

**Last Updated**: December 1, 2025
**Status**: ✅ Core Implementation Complete

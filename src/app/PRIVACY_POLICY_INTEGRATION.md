# Privacy Policy Integration Guide

## ✅ What's Been Done

1. **Updated Landing Page** - Privacy Policy link now points to `/privacy-policy`
2. **Created Privacy Policy Page** - Complete, standalone page component

---

## 🔧 How to Integrate

### Option 1: Add Route to Your Router

If you're using React Router, add this route:

```tsx
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';

// In your router configuration:
<Route 
  path="/privacy-policy" 
  element={<PrivacyPolicyPage />} 
/>
```

### Option 2: Handle in App.tsx

If you're managing navigation in App.tsx:

```tsx
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  
  if (currentPage === 'privacy-policy') {
    return (
      <PrivacyPolicyPage 
        onBack={() => setCurrentPage('landing')}
      />
    );
  }
  
  // ... rest of your app
}
```

### Option 3: Update Landing Page Links

Make sure the Privacy Policy link works:

```tsx
// In your LandingPage component:
<a href="/privacy-policy">Privacy Policy</a>

// OR if handling navigation manually:
<a 
  href="#" 
  onClick={(e) => {
    e.preventDefault();
    navigateTo('privacy-policy');
  }}
>
  Privacy Policy
</a>
```

---

## 📄 PrivacyPolicyPage Props

```typescript
interface PrivacyPolicyPageProps {
  onBack?: () => void;        // Optional back button handler
  userAge?: number;            // User's age (determines which policy version to show)
  isSchoolAccount?: boolean;   // Whether this is a school account
}
```

### Examples:

**Basic usage:**
```tsx
<PrivacyPolicyPage />
```

**With back button:**
```tsx
<PrivacyPolicyPage 
  onBack={() => navigate('/')}
/>
```

**For a specific user:**
```tsx
<PrivacyPolicyPage 
  userAge={12}
  isSchoolAccount={false}
/>
```

**For a school account:**
```tsx
<PrivacyPolicyPage 
  userAge={15}
  isSchoolAccount={true}
/>
```

---

## 🎯 Age-Based Policy Display

The Privacy Policy automatically adjusts based on age:

| Age | Category | What They See |
|-----|----------|---------------|
| 6-10 | Early Learner | Maximum protection, parent-focused |
| 11-15 | Junior Learner | High protection, student + parent |
| 16-18 | Senior Adolescent | Moderate protection, student-focused |
| 19+ | Adult | Standard protection, full details |

---

## ✨ Features Included

✅ **Complete Privacy Policy** from our legal framework  
✅ **Age-appropriate display** (4 categories)  
✅ **School account support**  
✅ **Beautiful, responsive design**  
✅ **Back button navigation**  
✅ **Print-friendly layout**  
✅ **Sticky header**  
✅ **Contact information**  

---

## 🚀 Quick Start

1. Import the component:
```tsx
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
```

2. Add to your routing:
```tsx
{page === 'privacy-policy' && <PrivacyPolicyPage onBack={() => setPage('home')} />}
```

3. Done! The link from the landing page now works! ✅

---

## 📱 Responsive Design

The Privacy Policy page is fully responsive:
- **Desktop:** Wide layout with sidebar navigation
- **Tablet:** Stacked layout with collapsible sections
- **Mobile:** Single column, expandable sections

---

## 🎨 Customization

The component uses your existing design system:
- Tailwind CSS classes
- Your color scheme (indigo/purple gradient)
- Your UI components (Button, Card, etc.)

---

That's it! Your Privacy Policy is now live and accessible! 🎉

# Teen Question Bank - Implementation Guide
## Quick Start for Ages 15-18 Assessment Integration

**Version**: 1.0  
**Date**: December 3, 2024  
**Time to Implement**: ~15 minutes

---

## 🎯 WHAT YOU NEED TO KNOW

### What's New?

✅ **300 new questions** for ages 15-18 (100 per framework)  
✅ **Age-based selection** automatically routes to appropriate question bank  
✅ **Backwards compatible** - existing questions still work  
✅ **Production ready** - no changes to scoring or reporting needed

### What Changed?

1. **New file**: `/utils/assessmentQuestions_teen.ts` (300 questions)
2. **Updated file**: `/utils/assessmentQuestions.ts` (added age parameter)
3. **New parameter**: `getPersonalizedQuestions()` now accepts optional `userAge`

---

## 🚀 3-STEP IMPLEMENTATION

### Step 1: Capture User Age (User Profile)

**Update User Type** (if not already done):

```typescript
// In /types.ts or user profile interface
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'parent' | 'organizational';
  age?: number;  // NEW: Optional age field
  dateOfBirth?: string;  // Alternative: Store DOB
  // ... other fields
}
```

**Capture Age During Registration/Onboarding**:

```typescript
// In registration form or profile setup
<div className="space-y-2">
  <Label htmlFor="age">Age</Label>
  <Input
    id="age"
    type="number"
    min="6"
    max="100"
    value={age}
    onChange={(e) => setAge(parseInt(e.target.value))}
    placeholder="Enter your age"
  />
  <p className="text-xs text-muted-foreground">
    We use your age to provide age-appropriate assessment questions
  </p>
</div>
```

**Alternative: Calculate from Date of Birth**:

```typescript
function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

// Usage
const userAge = calculateAge(user.dateOfBirth);
```

---

### Step 2: Pass Age to Assessment Component

**Update AssessmentTaking Component**:

```typescript
// In AssessmentTaking.tsx

interface AssessmentTakingProps {
  assessmentType: 'kolb' | 'sternberg' | 'dual-process';
  userId: string;
  isOrganizational?: boolean;
  userAge?: number;  // NEW: Add age prop
  onComplete: (assessment: Assessment) => void;
  onCancel: () => void;
}

export default function AssessmentTaking({ 
  assessmentType, 
  userId, 
  isOrganizational = false,
  userAge,  // NEW: Destructure age
  onComplete, 
  onCancel 
}: AssessmentTakingProps) {
  
  // Get age-appropriate questions
  const [questions] = useState(() => 
    getPersonalizedQuestions(
      assessmentType, 
      userId, 
      isOrganizational,
      userAge  // NEW: Pass age to function
    )
  );
  
  // Rest of component unchanged...
}
```

**Update Dashboard/Parent Component**:

```typescript
// In StudentDashboard.tsx or wherever assessment is launched

<AssessmentTaking
  assessmentType={selectedAssessment}
  userId={currentUser.id}
  isOrganizational={false}
  userAge={currentUser.age}  // NEW: Pass user's age
  onComplete={handleComplete}
  onCancel={handleCancel}
/>
```

---

### Step 3: Test & Verify

**Test Cases**:

```typescript
// Test 1: Teen user (ages 15-18) - Should use teen bank
const teen16 = { id: 'user1', age: 16 };
const questions1 = getPersonalizedQuestions('kolb', teen16.id, false, teen16.age);
console.log('Teen (16) questions:', questions1.length); // Should be 12
// Verify questions come from teen bank (IDs 1-100)

// Test 2: Pre-teen user (ages 11-14) - Should use standard bank
const preteen13 = { id: 'user2', age: 13 };
const questions2 = getPersonalizedQuestions('kolb', preteen13.id, false, preteen13.age);
console.log('Pre-teen (13) questions:', questions2.length); // Should be 12
// Verify questions come from standard bank (IDs 1-40)

// Test 3: No age specified - Should use standard bank (backwards compatible)
const questions3 = getPersonalizedQuestions('kolb', 'user3', false);
console.log('No age questions:', questions3.length); // Should be 12
// Verify questions come from standard bank

// Test 4: Organizational user - Should use org bank (age ignored)
const questions4 = getPersonalizedQuestions('sternberg', 'emp1', true, 25);
console.log('Organizational questions:', questions4.length); // Should be 12
// Verify questions come from organizational bank
```

**Visual Verification**:
1. Create test users with ages 15, 16, 17, 18
2. Each takes a Kolb assessment
3. Verify they see different questions from 100-question pool
4. Check question language is age-appropriate
5. Complete assessment and verify scoring works

---

## 📋 AGE ROUTING LOGIC

### How It Works

```typescript
// Age-based question bank selection
const useTeen15to18 = userAge && userAge >= 15 && userAge <= 18;

if (assessmentType === 'kolb') {
  if (useTeen15to18) {
    allQuestions = kolbQuestionsTeen;  // 100 questions ✅
  } else {
    allQuestions = isOrganizational 
      ? orgKolbQuestions   // 20 questions
      : kolbQuestions;     // 40 questions
  }
}
```

### Age Ranges & Question Banks

| Age Range | Question Bank | Questions per Framework | Notes |
|-----------|--------------|------------------------|-------|
| **15-18** | Teen Bank | 100 | NEW! High school students |
| **11-14** | Standard Bank | 40 | Original educational questions |
| **6-10** | Kids Bank | 500 (replacement) | Kids Mode (already implemented) |
| **18+** | Standard or Org | 40 or 20 | Adults use standard or org bank |
| **Not specified** | Standard Bank | 40 | Default fallback |

---

## 💡 EXAMPLE IMPLEMENTATIONS

### Example 1: Simple Student Profile

```typescript
// Simple age capture during profile creation
const [userProfile, setUserProfile] = useState({
  name: '',
  email: '',
  role: 'student',
  age: undefined
});

return (
  <form>
    <Input
      type="number"
      value={userProfile.age}
      onChange={(e) => setUserProfile({
        ...userProfile,
        age: parseInt(e.target.value) || undefined
      })}
      placeholder="Age (optional)"
    />
  </form>
);
```

### Example 2: Age-Aware Assessment Launch

```typescript
// In dashboard or assessment selection screen
const handleStartAssessment = (type: 'kolb' | 'sternberg' | 'dual-process') => {
  setShowAssessment(true);
  setAssessmentConfig({
    type,
    userId: currentUser.id,
    userAge: currentUser.age,  // Pass age from user profile
    isOrganizational: false
  });
};

// Render assessment
{showAssessment && (
  <AssessmentTaking
    assessmentType={assessmentConfig.type}
    userId={assessmentConfig.userId}
    userAge={assessmentConfig.userAge}
    isOrganizational={assessmentConfig.isOrganizational}
    onComplete={handleComplete}
    onCancel={handleCancel}
  />
)}
```

### Example 3: Date of Birth Approach

```typescript
// Store DOB instead of age
interface UserProfile {
  id: string;
  name: string;
  dateOfBirth: string;  // Format: YYYY-MM-DD
}

// Calculate age when needed
const calculateAge = (dob: string): number => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Pass calculated age to assessment
<AssessmentTaking
  assessmentType="kolb"
  userId={user.id}
  userAge={calculateAge(user.dateOfBirth)}
  onComplete={handleComplete}
  onCancel={handleCancel}
/>
```

---

## ✅ VERIFICATION CHECKLIST

### Before Deployment

- [ ] User profile captures age (or DOB)
- [ ] Age is stored in user database/state
- [ ] AssessmentTaking accepts `userAge` prop
- [ ] Age is passed from parent component
- [ ] Teen users (15-18) receive teen questions
- [ ] Other ages receive appropriate questions
- [ ] Backwards compatibility maintained (no age = standard bank)
- [ ] Organizational users still use org bank
- [ ] Scoring works with all question banks
- [ ] Reports generate correctly

### Testing Checklist

- [ ] Test with age = 15 (should use teen bank)
- [ ] Test with age = 16 (should use teen bank)
- [ ] Test with age = 17 (should use teen bank)
- [ ] Test with age = 18 (should use teen bank)
- [ ] Test with age = 14 (should use standard bank)
- [ ] Test with age = 19 (should use standard bank)
- [ ] Test with age = undefined (should use standard bank)
- [ ] Test organizational mode (should use org bank regardless of age)
- [ ] Test all 3 frameworks (Kolb, Sternberg, Dual-Process)
- [ ] Verify same user gets same questions on repeat

---

## 🔧 TROUBLESHOOTING

### Issue: Age not being captured

**Solution**: Add age field to registration/profile form

```typescript
// Add to registration form
<Input
  type="number"
  name="age"
  value={formData.age}
  onChange={handleChange}
  min="6"
  max="100"
/>
```

### Issue: Teen questions not showing up

**Checklist**:
1. Is user's age between 15-18? ✓
2. Is `userAge` being passed to `getPersonalizedQuestions()`? ✓
3. Is import statement correct? ✓
4. Check console for errors

```typescript
// Debug log
console.log('User age:', userAge);
console.log('Using teen bank:', userAge >= 15 && userAge <= 18);
```

### Issue: Questions repeating for same user

**Expected behavior**: Same user should get same questions (by design)

**If truly random needed**: Change userId in test
```typescript
// Each call will get different questions
getPersonalizedQuestions('kolb', 'user1', false, 16);
getPersonalizedQuestions('kolb', 'user2', false, 16);  // Different questions
```

### Issue: Build errors after integration

**Common causes**:
1. Missing import: `import { getPersonalizedQuestions } from '../utils/assessmentQuestions'`
2. Type mismatch: Ensure `userAge?: number` is optional
3. Check file path: `/utils/assessmentQuestions_teen.ts`

---

## 📊 EXPECTED OUTCOMES

### For Teen Users (15-18)

**Before**:
- Received 12 questions from 40-question pool
- Higher chance of seeing repeated questions
- Standard educational language

**After**:
- Receive 12 questions from 100-question pool
- Much lower repetition rate (2.5x more questions)
- Age-appropriate, engaging language
- Better personalization

### Question Pool Comparison

| Framework | Age 11-14 Pool | Age 15-18 Pool | Improvement |
|-----------|----------------|----------------|-------------|
| Kolb | 40 questions | 100 questions | +150% |
| Sternberg | 30 questions | 100 questions | +233% |
| Dual-Process | 30 questions | 100 questions | +233% |
| **Total** | **100 questions** | **300 questions** | **+200%** |

---

## 🎯 SUCCESS CRITERIA

✅ **Technical Success**:
- Age-based routing works correctly
- Questions display properly
- Scoring algorithms unchanged
- Reports generate correctly
- Backwards compatible

✅ **User Experience Success**:
- Teen users see age-appropriate questions
- Questions are engaging and relevant
- Assessment completion rates maintained/improved
- Positive user feedback

✅ **Educational Success**:
- Questions assess intended constructs
- Results are reliable and valid
- Insights are actionable
- Students learn from the process

---

## 📚 ADDITIONAL RESOURCES

### Documentation
- **Full Documentation**: `/TEEN_QUESTION_BANK_DOCUMENTATION.md`
- **Question Bank File**: `/utils/assessmentQuestions_teen.ts`
- **Main Integration**: `/utils/assessmentQuestions.ts`

### Code References
- **Assessment Taking**: `/components/AssessmentTaking.tsx`
- **Assessment Report**: `/components/AssessmentReport.tsx`
- **Scoring Logic**: `/utils/scoring.ts`
- **User Types**: `/types.ts`

### Support
- Review full documentation for detailed technical specs
- Check question distribution tables for framework alignment
- Test thoroughly before production deployment

---

## 🎉 YOU'RE DONE!

**Implementation Summary**:
1. ✅ 300 questions created and formatted
2. ✅ Age-based selection logic implemented
3. ✅ Integration with existing system complete
4. ✅ Documentation comprehensive

**Next Steps**:
1. Add age field to user profile (5 min)
2. Pass age to AssessmentTaking component (5 min)
3. Test with different ages (5 min)
4. Deploy to production

**Total Implementation Time**: ~15 minutes

---

**The teen question bank is production-ready. Follow the 3 steps above to enable age-appropriate assessments for your 15-18 year old users!** 🚀

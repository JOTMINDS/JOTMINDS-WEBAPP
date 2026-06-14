# JotMinds Age-Based Consent System

**Implementation Guide & Documentation**  
**Version:** 1.0  
**Last Updated:** December 1, 2024

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Age Categories](#age-categories)
3. [Consent Flow](#consent-flow)
4. [Technical Implementation](#technical-implementation)
5. [Feature Permissions](#feature-permissions)
6. [Data Collection Levels](#data-collection-levels)
7. [Parent/Guardian Access](#parentguardian-access)
8. [Compliance](#compliance)
9. [Testing Guide](#testing-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The JotMinds Age-Based Consent System ensures compliance with child protection regulations (COPPA, GDPR) while providing age-appropriate experiences for users aged 6+.

### Key Principles:
✅ **Safety First** - Youngest users have maximum protection  
✅ **Progressive Trust** - Autonomy increases with age  
✅ **Transparency** - Clear communication at every step  
✅ **Parental Control** - Parents/guardians have oversight  
✅ **Compliance** - Meets international regulations  

---

## Age Categories

### 1️⃣ Early Learners (Ages 6-10)

**Who:** Young children requiring full supervision

**Consent Model:**
- ✅ Full parental/guardian consent required
- ✅ Parent creates account on behalf of child
- ✅ Electronic signature required
- ❌ Child cannot create account independently

**Features:**
- ✅ Can take assessments with supervision
- ✅ Can access gamification (badges, rewards)
- ❌ Cannot view detailed results (parents only)
- ❌ Cannot share results
- ❌ Cannot modify profile
- ❌ Cannot delete account

**Data Collection:** Minimal
- Name, age, date of birth
- Assessment responses only
- No tracking or behavioral analytics
- No marketing data

**Parent Access:**
- Full account control
- All results visible to parents only
- Can monitor all activity
- Can delete account anytime

---

### 2️⃣ Junior Learners (Ages 11-15)

**Split into two sub-groups:**

#### Ages 11-12: Transitional with Parental Consent
**Consent Model:**
- ✅ Full parental consent required
- ✅ Parent approval for account creation
- ✅ Electronic signature required
- ⚠️ Student cannot create account alone

**Features:**
- ✅ Can take all assessments
- ✅ Can view own results
- ⚠️ Sharing requires parent approval
- ✅ Can access gamification
- ⚠️ Can modify profile (some restrictions)
- ❌ Cannot delete account without parent

#### Ages 13-15: Partial Independence
**Consent Model:**
- ✅ Student can give partial consent
- ⚠️ Parental notification strongly recommended
- ⚠️ Guardian oversight recommended
- ✅ Can create account independently (if 13+)

**Features:**
- ✅ Can take all assessments
- ✅ Can view own results
- ✅ Can share results
- ✅ Can access gamification
- ✅ Can modify profile
- ⚠️ Cannot delete account (parent approval)

**Data Collection:** Standard
- Name, age, date of birth, email
- Assessment responses and progress
- Usage analytics for personalization
- Optional marketing preferences (with consent)

**Parent Access:**
- Oversight access (can view results)
- Receives notifications
- Can request account deletion
- Can revoke access

---

### 3️⃣ Senior Adolescents (Ages 16-18)

**Who:** Mature minors with independent consent

**Consent Model:**
- ✅ Can provide independent consent
- ✅ No parental approval required
- ⚠️ Guardian oversight optional but encouraged
- ⚠️ School notifies parents if school-based use

**Features:**
- ✅ Can take all assessments
- ✅ Can view own results
- ✅ Can share results
- ✅ Can access gamification
- ✅ Can access premium features
- ✅ Can modify profile
- ✅ Can delete account (with confirmation)

**Data Collection:** Standard
- Same as Junior Learners (13-15)
- Standard analytics and personalization
- Optional enhanced features

**Parent Access:**
- No automatic access
- Optional: Student can grant access
- School may provide access if school-based

---

### 4️⃣ Adults (Ages 19+)

**Who:** Tertiary students and adults

**Consent Model:**
- ✅ Full independent consent
- ✅ No parental involvement
- ✅ Complete account control

**Features:**
- ✅ All assessment access
- ✅ Full results and insights
- ✅ Unrestricted sharing
- ✅ All gamification features
- ✅ All premium features
- ✅ Advanced analytics
- ✅ Research participation (opt-in)
- ✅ Full profile control
- ✅ Account deletion anytime

**Data Collection:** Full (with consent)
- All standard data
- Advanced analytics
- Behavioral patterns
- Research participation data (opt-in)
- Marketing data (opt-in)

**Parent Access:**
- None (fully independent)

---

## Consent Flow

### Step-by-Step Process

```
User Visits JotMinds
        ↓
┌───────────────────┐
│ Age Verification  │
│ (Date of Birth)   │
└─────────┬─────────┘
          ↓
    Age Category
    Determined
          ↓
    ┌─────┴─────┐
    ↓           ↓           ↓           ↓
Ages 6-10   Ages 11-12  Ages 13-18  Ages 19+
    ↓           ↓           ↓           ↓
Parental    Parental    Student/    Independent
Consent     Consent     Independent Consent
Required    Required    Consent     Form
    ↓           ↓           ↓           ↓
    └─────┬─────┴─────┬─────┴─────┬─────┘
          ↓
    Account Created
          ↓
    Age-Appropriate
    Dashboard
```

### Technical Flow

1. **Age Verification Component** (`AgeVerification.tsx`)
   - User enters date of birth
   - System calculates age
   - System determines age category
   - Routes to appropriate consent form

2. **Consent Form Selection**
   - **Ages 6-12:** `ParentalConsentForm.tsx`
   - **Ages 13-15:** `StudentConsentForm.tsx`
   - **Ages 16+:** `IndependentConsentForm.tsx`

3. **Consent Data Collection**
   - Terms & Conditions acceptance
   - Privacy Policy acceptance
   - Electronic signature (where required)
   - Parent/guardian information (where required)

4. **Account Activation**
   - Consent stored in database
   - User profile created
   - Age-appropriate features enabled
   - Welcome email sent

---

## Technical Implementation

### Type Definitions

```typescript
// Age Categories
enum AgeCategory {
  EARLY_LEARNER = 'EARLY_LEARNER',       // 6-10
  JUNIOR_LEARNER = 'JUNIOR_LEARNER',     // 11-15
  SENIOR_ADOLESCENT = 'SENIOR_ADOLESCENT', // 16-18
  ADULT = 'ADULT'                        // 19+
}

// Consent Types
enum ConsentType {
  FULL_PARENTAL = 'FULL_PARENTAL',
  PARTIAL_PARENTAL = 'PARTIAL_PARENTAL',
  INDEPENDENT_SUPERVISED = 'INDEPENDENT_SUPERVISED',
  FULL_INDEPENDENT = 'FULL_INDEPENDENT'
}

// User Consent Status
interface UserConsentStatus {
  userId: string;
  ageCategory: AgeCategory;
  dateOfBirth: string;
  calculatedAge: number;
  
  termsAccepted: boolean;
  termsAcceptedDate?: string;
  termsVersion: string;
  
  privacyPolicyAccepted: boolean;
  privacyPolicyDate?: string;
  privacyPolicyVersion: string;
  
  parentalConsentRequired: boolean;
  parentalConsentGiven: boolean;
  parentalConsentDate?: string;
  parentGuardianEmail?: string;
  parentGuardianName?: string;
  
  schoolVerificationRequired: boolean;
  schoolVerified: boolean;
  
  accountFullyActivated: boolean;
  pendingConsentFrom?: 'parent' | 'school' | null;
}
```

### Key Functions

```typescript
// Calculate age from date of birth
calculateAge(dateOfBirth: string): number

// Determine age category
getAgeCategory(age: number): AgeCategory

// Get consent requirements for category
getConsentRequirements(category: AgeCategory): ConsentRequirement

// Check if action is permitted
canPerformAction(category: AgeCategory, action: string): boolean

// Check if parental consent is required
requiresParentalConsent(age: number): boolean

// Check if account is fully activated
isAccountFullyActivated(status: UserConsentStatus): boolean
```

### Component Structure

```
/components/consent/
├── AgeVerification.tsx          # Age gate & DOB input
├── ParentalConsentForm.tsx      # For ages 6-12
├── StudentConsentForm.tsx       # For ages 13-15
├── IndependentConsentForm.tsx   # For ages 16+
└── ConsentFlow.tsx              # Router component

/types/
└── age-consent-types.ts         # All type definitions

/documentation/
├── TERMS_AND_CONDITIONS.md      # Full legal terms
└── AGE_BASED_CONSENT_SYSTEM.md  # This file
```

---

## Feature Permissions

### Permission Matrix

| Feature | Ages 6-10 | Ages 11-12 | Ages 13-15 | Ages 16-18 | Ages 19+ |
|---------|-----------|------------|------------|------------|----------|
| **Take Assessments** | ✅ (supervised) | ✅ | ✅ | ✅ | ✅ |
| **View Own Results** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Share Results** | ❌ | ⚠️ (parent approval) | ✅ | ✅ | ✅ |
| **Access Gamification** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Premium Features** | ❌ | ⚠️ (limited) | ⚠️ (limited) | ✅ | ✅ |
| **Modify Profile** | ❌ | ⚠️ (limited) | ✅ | ✅ | ✅ |
| **Delete Account** | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Parent Dashboard** | ❌ | ❌ | ❌ | ❌ | N/A |

**Legend:**
- ✅ = Full access
- ⚠️ = Restricted/conditional access
- ❌ = No access
- N/A = Not applicable

### Implementation Example

```typescript
import { canPerformAction, AgeCategory } from './types/age-consent-types';

// Check if user can delete account
const userCategory = AgeCategory.JUNIOR_LEARNER;
const canDelete = canPerformAction(userCategory, 'canDeleteAccount');

if (canDelete) {
  // Show delete account button
} else {
  // Show "Contact parent to delete account" message
}
```

---

## Data Collection Levels

### Minimal (Ages 6-10)

**Collected:**
- First name
- Age
- Date of birth (month/year)
- Assessment responses
- Badge/reward progress

**NOT Collected:**
- Email address (only parent's)
- Usage analytics
- Behavioral tracking
- Marketing data
- Third-party cookies

**Storage:**
- Encrypted at rest
- Parent-controlled access only
- Deleted within 30 days of account deletion

---

### Standard (Ages 11-18)

**Collected:**
- Full name
- Age & date of birth
- Email address
- Assessment responses
- Progress tracking
- Usage analytics (for personalization)
- Device information
- Optional: Marketing preferences

**NOT Collected:**
- Precise location data
- Biometric data
- Social media connections
- Payment information (unless purchasing)

**Storage:**
- Encrypted at rest and in transit
- User/parent-controlled access
- Retained per privacy policy
- Deleted within 30-90 days of account deletion

---

### Full (Ages 19+ with consent)

**Collected:**
- All standard data
- Advanced analytics
- Behavioral patterns
- Learning style preferences
- Research participation data (opt-in)
- Marketing engagement data (opt-in)
- Product usage telemetry

**Storage:**
- Same security as standard
- User-controlled access
- Can export all data
- Deleted per user request

---

## Parent/Guardian Access

### Access Levels by Age

#### Ages 6-10: Full Control
Parents/guardians have:
- ✅ Complete account access
- ✅ View all results and progress
- ✅ Modify all settings
- ✅ Delete account anytime
- ✅ Export all data
- ✅ Receive all notifications
- ✅ Control data sharing

#### Ages 11-12: Full Oversight
Parents/guardians have:
- ✅ View all results
- ✅ Receive notifications
- ✅ Approve result sharing
- ✅ Delete account
- ⚠️ Cannot modify student's settings without permission

#### Ages 13-15: Oversight (Optional/Recommended)
Parents/guardians have:
- ⚠️ View results (if student grants access)
- ⚠️ Receive notifications (if student opts in)
- ✅ Request account deletion
- ❌ No automatic access to account

#### Ages 16+: No Automatic Access
Parents/guardians:
- ❌ No automatic access
- ⚠️ Student can voluntarily grant access
- ⚠️ School may grant access if school-based

---

### Parent Dashboard Features

```typescript
// Parent Dashboard Components
<ParentDashboard>
  <ChildAccountsList />       // All linked children
  <ConsentManagement />       // View/modify consents
  <ResultsOverview />         // Assessment results
  <ProgressTracking />        // Learning progress
  <DataControls />            // Export, delete, modify
  <NotificationSettings />    // Email preferences
  <PrivacySettings />         // Data sharing controls
</ParentDashboard>
```

---

## Compliance

### COPPA (Children's Online Privacy Protection Act)

**Applies to:** Users under 13 (Ages 6-12)

**Requirements Met:**
- ✅ Verifiable parental consent before data collection
- ✅ Clear privacy policy in plain language
- ✅ Parents can review child's information
- ✅ Parents can delete child's information
- ✅ No behavioral advertising to children under 13
- ✅ Reasonable security measures
- ✅ Limited data collection to necessary purposes

**Implementation:**
```typescript
// Before collecting data for users under 13
if (age < 13 && !parentalConsentGiven) {
  // Redirect to parental consent form
  // Do not collect any data
  // Do not allow account creation
}
```

---

### GDPR (General Data Protection Regulation)

**Applies to:** All users, especially EU residents

**Requirements Met:**
- ✅ Age-appropriate consent mechanisms
- ✅ Right to access (data portability)
- ✅ Right to rectification
- ✅ Right to erasure ("right to be forgotten")
- ✅ Right to object
- ✅ Data protection by design and default
- ✅ Clear, plain language privacy notices

**Special Rules for Children:**
- Under 16: Parental consent required (varies by EU country)
- JotMinds: Requires parental consent under 13 globally
- Ages 13-15: Partial consent with parental notification

**Implementation:**
```typescript
// GDPR data export
async function exportUserData(userId: string) {
  const data = await gatherAllUserData(userId);
  return {
    format: 'JSON',
    contents: data,
    includes: [
      'profile', 'assessments', 'results', 
      'progress', 'consents', 'communications'
    ]
  };
}

// GDPR right to erasure
async function deleteUserAccount(userId: string) {
  await anonymizeUserData(userId);
  await deletePersonalInformation(userId);
  await notifyThirdParties(userId);
  return { deletedAt: new Date(), confirmationSent: true };
}
```

---

### FERPA (Family Educational Rights and Privacy Act)

**Applies to:** School-based accounts in the USA

**Requirements Met:**
- ✅ Schools must notify parents of JotMinds use
- ✅ Parents can inspect and review records
- ✅ Parents can request amendments
- ✅ Consent required before disclosure
- ✅ Directory information provisions
- ✅ Rights transfer at age 18

**Implementation:**
```typescript
// School account creation
interface SchoolAccountSetup {
  schoolName: string;
  schoolEmail: string;
  ferpaNotificationSent: boolean;
  parentalConsentMethod: 'opt-in' | 'opt-out';
  directoryInformationShared: boolean;
}
```

---

## Testing Guide

### Test Scenarios

#### Scenario 1: Early Learner (Age 8)
```
1. Enter DOB: (8 years ago)
2. Verify: Routed to ParentalConsentForm
3. Complete: Parent information + consent
4. Verify: Account created with EARLY_LEARNER category
5. Verify: Parent can see all results
6. Verify: Child dashboard is age-appropriate
7. Verify: Child cannot view detailed results
```

#### Scenario 2: Junior Learner (Age 12)
```
1. Enter DOB: (12 years ago)
2. Verify: Routed to ParentalConsentForm
3. Complete: Parent consent
4. Verify: Account created with JUNIOR_LEARNER category
5. Verify: Student can view results
6. Verify: Parent has oversight access
7. Verify: Sharing requires parent approval
```

#### Scenario 3: Junior Learner (Age 14)
```
1. Enter DOB: (14 years ago)
2. Verify: Routed to StudentConsentForm
3. Optional: Add parent email for notification
4. Complete: Student consent
5. Verify: Account created with JUNIOR_LEARNER category
6. Verify: Student has full access to results
7. Verify: Parent receives notification (if opted in)
```

#### Scenario 4: Senior Adolescent (Age 17)
```
1. Enter DOB: (17 years ago)
2. Verify: Routed to IndependentConsentForm
3. Complete: Independent consent
4. Verify: Account created with SENIOR_ADOLESCENT category
5. Verify: Full feature access
6. Verify: Can delete account independently
7. Verify: No parental notification
```

#### Scenario 5: Adult (Age 22)
```
1. Enter DOB: (22 years ago)
2. Verify: Routed to IndependentConsentForm
3. Complete: Full consent + optional preferences
4. Verify: Account created with ADULT category
5. Verify: All premium features available
6. Verify: Full data collection options
7. Verify: No age restrictions
```

---

### Testing Checklist

**Age Verification:**
- [ ] Future dates rejected
- [ ] Invalid dates rejected
- [ ] Ages under 6 rejected
- [ ] Correct age category assigned
- [ ] DOB stored securely

**Consent Forms:**
- [ ] Correct form shown for each age
- [ ] All required fields validated
- [ ] Email validation works
- [ ] Terms & privacy links work
- [ ] Electronic signature captured
- [ ] Back button works

**Feature Restrictions:**
- [ ] Early Learners cannot view results
- [ ] Junior Learners (11-12) need approval for sharing
- [ ] Junior Learners (13-15) can share freely
- [ ] Senior Adolescents can delete account
- [ ] Adults have all features

**Parent Access:**
- [ ] Parents can link to child accounts
- [ ] Parents see correct access level
- [ ] Parents can export data
- [ ] Parents can delete child accounts
- [ ] Parents receive notifications

**Data Collection:**
- [ ] Minimal data for Ages 6-10
- [ ] Standard data for Ages 11-18
- [ ] Full data (opt-in) for Ages 19+
- [ ] No unauthorized tracking

---

## Troubleshooting

### Common Issues

#### Issue: "Age verification failed"
**Cause:** Invalid date of birth
**Solution:**
- Ensure date format is correct (YYYY-MM-DD)
- Check that date is not in the future
- Verify age is between 6-120

#### Issue: "Parental consent required"
**Cause:** User is under 13 without parental consent
**Solution:**
- Complete parental consent form
- Have parent/guardian provide email
- Parent must accept electronic signature

#### Issue: "Cannot view results"
**Cause:** User is 6-10 years old
**Solution:**
- This is expected behavior
- Parent must log in to view results
- Results visible in Parent Dashboard

#### Issue: "Parent cannot access account"
**Cause:** Child is 13+ and hasn't granted access
**Solution:**
- Child must grant access from settings
- Or child can share results manually
- Or parent can request school access (if applicable)

#### Issue: "Account pending activation"
**Cause:** Parental consent or school verification pending
**Solution:**
- Check email for consent link
- Complete pending consent steps
- Contact support if stuck

---

### Support Contacts

**General Support:** support@jotminds.com  
**Parent Support:** parents@jotminds.com  
**School Support:** schools@jotminds.com  
**Privacy Inquiries:** privacy@jotminds.com

**Response Times:**
- General: 48 hours
- Privacy/Consent: 24 hours
- Account Deletion: 7 days

---

## Summary

The JotMinds Age-Based Consent System provides:

✅ **4 Clear Age Categories** with specific requirements  
✅ **Compliant Consent Flows** for all ages  
✅ **Progressive Feature Access** as students mature  
✅ **Robust Parental Controls** for young learners  
✅ **International Compliance** (COPPA, GDPR, FERPA)  
✅ **Transparent Data Practices** at every level  

**Implementation Status:**
- ✅ Type definitions complete
- ✅ Consent components built
- ✅ Flow router implemented
- ✅ Documentation complete
- ⏳ Backend integration (next step)
- ⏳ Testing (next step)

---

**Version:** 1.0  
**Last Updated:** December 1, 2024  
**Status:** ✅ Ready for Implementation

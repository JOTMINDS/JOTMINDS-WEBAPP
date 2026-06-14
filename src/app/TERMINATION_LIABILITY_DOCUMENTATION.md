# JotMinds Account Termination & Liability Framework

**Complete Documentation for Account Management & Legal Protections**  
**Version:** 1.0  
**Last Updated:** December 1, 2024

---

## 📋 Table of Contents

1. [Account Termination Overview](#account-termination-overview)
2. [Suspension vs. Termination](#suspension-vs-termination)
3. [Termination Permissions by Age](#termination-permissions-by-age)
4. [School Account Management](#school-account-management)
5. [Notice Periods & Data Retention](#notice-periods--data-retention)
6. [Liability Framework](#liability-framework)
7. [Warranty Disclaimers](#warranty-disclaimers)
8. [Responsibilities by Role](#responsibilities-by-role)
9. [Indemnification](#indemnification)
10. [Technical Implementation](#technical-implementation)

---

## Account Termination Overview

JotMinds implements **age-appropriate account termination rules** that balance user control with child protection requirements.

### Key Principles:

✅ **Age-Based Authority** - Different age groups have different termination rights  
✅ **Parent Protection** - Parents can manage minor accounts  
✅ **School Rights** - Schools can revoke accounts they onboarded  
✅ **Data Protection** - Notice periods and data retention before deletion  
✅ **User Independence** - Adults (19+) manage their own accounts  

---

## Suspension vs. Termination

### Account Suspension 🟡

**Definition:** Temporary disabling of account access while preserving all data

**Characteristics:**
- Account is inactive but data is preserved
- Can be reactivated by authorized party
- No data deletion
- No notice period required
- Immediate effect

**Use Cases:**
- Parent requests temporary break
- School requests suspension pending investigation
- User wants to take a break
- Inactivity timeout
- Policy violation (pending review)

---

### Account Termination 🔴

**Definition:** Permanent deletion of account with data retention period

**Characteristics:**
- Account is marked for deletion
- Data retained for specified period
- Notice period may apply
- All authorized parties notified
- Can be canceled during notice period
- Permanent after retention period

**Use Cases:**
- Parent/guardian requests permanent deletion
- School revokes account for graduated/transferred student
- User wants to permanently delete account
- Regulatory requirement
- Account closure

---

## Termination Permissions by Age

### Ages 6-10: Parent Control Only 👨‍👩‍👧

**Who Can Terminate:**
- ✅ Parent/Guardian (anytime)
- ✅ School (if they onboarded the child)
- ❌ Child (cannot self-terminate)

**Who Can Suspend:**
- ✅ Parent/Guardian
- ✅ School (if applicable)
- ❌ Child

**Who Can Reactivate:**
- ✅ Parent/Guardian
- ✅ School (if they suspended)
- ❌ Child

**Notice Requirements:**
- **To Parent:** ✅ Required
- **To School:** ✅ If school-based account
- **To Child:** ❌ Not directly notified
- **Notice Period:** 0 days (immediate if requested)

**Data Handling:**
- **Retention Period:** 30 days after termination
- **Parent Can Export:** ✅ Yes
- **Child Can Export:** ❌ No

**Rationale:**
- Children ages 6-10 require full parental supervision
- Parents have complete account control
- Child safety is paramount
- COPPA compliance requires parental authority

---

### Ages 11-15: Parent/Guardian Authority 👨‍👩‍👦

**Who Can Terminate:**
- ✅ Parent/Guardian (anytime)
- ✅ School (if they onboarded)
- ❌ Student (cannot self-terminate)

**Who Can Suspend:**
- ✅ Parent/Guardian
- ✅ School
- ✅ Student (can request suspension)

**Who Can Reactivate:**
- ✅ Parent/Guardian
- ✅ School
- ❌ Student (requires parent approval)

**Notice Requirements:**
- **To Parent:** ✅ Required
- **To School:** ✅ If school-based account
- **To Student:** ✅ Yes
- **Notice Period:** 7 days

**Data Handling:**
- **Retention Period:** 30 days after notice period
- **Parent Can Export:** ✅ Yes
- **Student Can Export:** ✅ Yes

**Rationale:**
- Students have limited autonomy
- Parent/guardian maintains ultimate authority
- Student awareness is important
- Allows time to reconsider deletion

---

### Ages 16-18: Partial Independence 🎓

**Who Can Terminate:**
- ❌ Parent/Guardian (no forced termination)
- ✅ School (if they onboarded - school-based only)
- ✅ Student (can self-terminate)

**Who Can Suspend:**
- ❌ Parent/Guardian
- ✅ School (if applicable)
- ✅ Student

**Who Can Reactivate:**
- ❌ Parent/Guardian
- ✅ School (if they suspended)
- ✅ Student

**Notice Requirements:**
- **To Parent:** ⚠️ Optional (student choice)
- **To School:** ✅ If school-based account
- **To Student:** ✅ Required
- **Notice Period:** 14 days

**Data Handling:**
- **Retention Period:** 60 days after notice period
- **Parent Can Export:** ❌ No (unless granted access)
- **Student Can Export:** ✅ Yes

**Rationale:**
- Mature minors have significant autonomy
- Parents cannot force account closure
- Schools maintain authority for school accounts
- Longer notice period for mature decision-making

---

### Ages 19+: Full Independence ✨

**Who Can Terminate:**
- ❌ Parent/Guardian (no authority)
- ❌ School (no authority for adult accounts)
- ✅ User (complete control)

**Who Can Suspend:**
- ❌ Parent/Guardian
- ❌ School
- ✅ User

**Who Can Reactivate:**
- ❌ Parent/Guardian
- ❌ School
- ✅ User

**Notice Requirements:**
- **To Parent:** ❌ Not applicable
- **To School:** ❌ Not applicable
- **To User:** ✅ Yes
- **Notice Period:** 30 days

**Data Handling:**
- **Retention Period:** 90 days after notice period
- **User Can Export:** ✅ Yes

**Rationale:**
- Adults have complete account independence
- No parental or school oversight
- Standard data protection practices
- User has full control

---

## School Account Management

### School-Onboarded Accounts

**School Rights:**

✅ **Can Terminate:** Accounts they onboarded (all ages except 19+)  
✅ **Can Suspend:** School-based accounts  
✅ **Can Reactivate:** Accounts they suspended  
✅ **Must Notify:** Parents (for minors) and users  

**School Responsibilities:**

1. **Obtain Consent:**
   - Ages 6-10: Verifiable parental consent required
   - Ages 11-12: Parental consent required
   - Ages 13-15: Parental notification recommended
   - Ages 16-18: Student consent with parent notification

2. **Data Management:**
   - Comply with FERPA requirements
   - Maintain student data confidentiality
   - Use data for educational purposes only
   - Delete data when student leaves school

3. **Account Revocation:**
   - Graduate: Offer account conversion to personal
   - Transfer: Notify receiving school if requested
   - Withdraw: Terminate account or convert
   - Parent Request: Honor termination requests

**Use Cases:**

### Graduated Students:
```
1. School marks account for graduation transition
2. Student offered choice:
   a. Convert to personal account (if 16+)
   b. Delete account
   c. Keep for alumni access (if school allows)
3. If minor (under 19), parent must approve choice
4. School data access revoked
```

### Transferred Students:
```
1. School marks account for transfer
2. Options:
   a. Transfer to new school (with consent)
   b. Convert to personal account
   c. Terminate account
3. Parent approval required for minors
```

### Withdrawn/Expelled Students:
```
1. School can revoke account
2. Parent/student notified
3. Standard notice period applies
4. Data export offered before deletion
```

---

## Notice Periods & Data Retention

### Notice Period Purpose:

- Allows time to reconsider deletion
- Enables data export
- Provides opportunity to cancel
- Ensures informed decision

### By Age Group:

| Age Group | Notice Period | Data Retention | Total Time to Deletion |
|-----------|---------------|----------------|----------------------|
| **6-10** | 0 days | 30 days | 30 days |
| **11-15** | 7 days | 30 days | 37 days |
| **16-18** | 14 days | 60 days | 74 days |
| **19+** | 30 days | 90 days | 120 days |

### During Notice Period:

✅ **Can Cancel:** Deletion request can be canceled  
✅ **Can Export:** All data can be exported  
✅ **Account Locked:** Cannot log in during notice  
⚠️ **Notifications Sent:** Reminders at 50% and 90% of period  

### During Retention Period:

✅ **Data Preserved:** All data retained securely  
✅ **Can Recover:** Account can be reactivated (with approval)  
❌ **No Access:** Cannot log in  
⚠️ **Final Warning:** Notification sent 7 days before permanent deletion  

### After Retention Period:

❌ **Permanent Deletion:** All data permanently deleted  
❌ **Cannot Recover:** No recovery possible  
✅ **Confirmation Sent:** Deletion confirmation email  

---

## Liability Framework

### Core Principle:

**JotMinds provides educational insights, not professional advice or guarantees.**

---

### JotMinds Is NOT Liable For:

#### 1. Misuse of Insights ❌
- Using assessment results for purposes beyond education
- Making major life decisions solely based on results
- Commercial use of insights
- Sharing results inappropriately

#### 2. Misrepresentation of Results ❌
- Incorrect interpretation by users
- Overstating or understating results
- Using results out of context
- Claiming results as professional evaluations

#### 3. Lack of Supervision ❌
- **Ages 6-10:** Parent/guardian failure to supervise
- **Ages 11-15:** Guardian failure to provide oversight
- **Ages 16-18:** Lack of guidance when needed
- Allowing unauthorized users

#### 4. School Misuse ❌
- Using dashboard data for non-educational purposes
- Violating student privacy
- Making placement decisions based solely on results
- Sharing data without consent

#### 5. Use Outside Educational Purpose ❌
- Employment screening (not designed for hiring)
- Clinical diagnosis (not psychological evaluation)
- Legal proceedings (not expert testimony)
- Financial decisions
- Relationship counseling

#### 6. Outcomes & Performance ❌
- Academic performance
- Career success
- College admissions
- Job placement
- Skill development
- Personal growth

#### 7. Third-Party Actions ❌
- How others interpret shared results
- Decisions made by schools based on data
- Parent/guardian choices
- Employer or institution use

---

## Warranty Disclaimers

### 1. No Guarantee of Outcomes ⚠️

**Disclaimer:**  
"Assessment results do not guarantee any educational, academic, career, or personal outcomes."

**Applies To:**
- Academic performance
- Career success
- College admissions
- Job offers
- Skill development
- Personal development

---

### 2. No Guarantee of Accuracy ⚠️

**Disclaimer:**  
"Assessment results are guidance based on self-reported responses, not absolute truth or scientific fact."

**Limitations:**
- Self-reporting bias
- Context dependency
- Time-specific snapshots
- Development changes
- Situational factors

---

### 3. Educational Purpose Only ⚠️

**Disclaimer:**  
"JotMinds is designed for educational self-discovery and learning support, not professional evaluation or clinical use."

**Not A Substitute For:**
- Psychological evaluation
- Career counseling
- Educational testing (IQ, achievement)
- Clinical diagnosis
- Professional therapy
- Medical advice

---

### 4. Not Professional Advice ⚠️

**Disclaimer:**  
"Results do not constitute professional psychological, educational, career, or medical advice."

**Users Should:**
- Consult professionals for important decisions
- Seek career counselors for career planning
- Use licensed psychologists for evaluations
- Get educational testing for placement
- Obtain medical advice for health concerns

---

### 5. Requires Supervision (Minors) ⚠️

**Disclaimer (Ages 6-15):**  
"Minor accounts require adult supervision. Results must be interpreted by parents/guardians with appropriate context and judgment."

**Supervision Requirements:**
- **Ages 6-10:** Full supervision required
- **Ages 11-12:** Oversight required
- **Ages 13-15:** Oversight recommended
- **Ages 16-18:** Guidance available
- **Ages 19+:** Not applicable

---

## Responsibilities by Role

### User Responsibilities

#### Ages 6-10:
```
N/A - Not responsible for account management
Parent/guardian manages all aspects
```

#### Ages 11-15:
```
✓ Use platform responsibly for educational purposes
✓ Do not share account credentials
✓ Report issues to parent/guardian
✓ Use insights with adult guidance
✓ Do not misrepresent results
✓ Maintain account security
```

#### Ages 16-18:
```
✓ Use platform responsibly
✓ Maintain account security
✓ Interpret insights appropriately
✓ Seek adult guidance for major decisions
✓ Do not misrepresent results
✓ Use insights as guidance, not absolute truth
✓ Protect personal data
```

#### Ages 19+:
```
✓ Use platform responsibly
✓ Maintain account security
✓ Interpret insights with professional judgment
✓ Seek professional advice for important decisions
✓ Do not misrepresent results
✓ Use insights as guidance, not absolute truth
✓ Protect personal data
✓ Comply with terms of service
```

---

### Parent/Guardian Responsibilities

#### Ages 6-10:
```
✓ Provide FULL supervision during all platform use
✓ Review and understand ALL assessment results
✓ Use insights for educational support ONLY
✓ Do NOT use results for commercial purposes
✓ Do NOT share child's results without consent
✓ Maintain account security
✓ Monitor ALL activity
✓ Use age-appropriate interpretation
```

#### Ages 11-15:
```
✓ Provide oversight and guidance
✓ Review assessment results regularly
✓ Help student interpret insights appropriately
✓ Monitor sharing of results
✓ Use insights for educational support only
✓ Do NOT use results for commercial purposes
✓ Maintain account security oversight
```

#### Ages 16-18:
```
⚠️ Provide guidance if student requests
⚠️ Support responsible use of insights
⚠️ Encourage educational application
```

#### Ages 19+:
```
N/A - No parental responsibility
```

---

### School Responsibilities

#### For All Minor Accounts:
```
✓ Use dashboard data for educational purposes ONLY
✓ Maintain student data confidentiality
✓ Obtain appropriate consent before onboarding
✓ Notify parents of data access (minors)
✓ Comply with FERPA requirements
✓ Provide appropriate staff training
✓ Do NOT misuse or misrepresent data
✓ Do NOT use data for non-educational purposes
✓ Revoke access when student leaves school
```

---

## Indemnification

### Indemnification Agreement

By using JotMinds, the following parties agree to **indemnify and hold harmless** JotMinds, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, or expenses arising from:

1. **Misuse or Misinterpretation:**
   - Misuse of assessment results
   - Misinterpretation of insights
   - Incorrect application of results

2. **Decision-Making:**
   - Educational decisions based on results
   - Career decisions influenced by insights
   - Personal choices informed by assessments

3. **Unauthorized Actions:**
   - Unauthorized sharing of results
   - Sharing account credentials
   - Allowing unauthorized access

4. **Compliance Failures:**
   - Failure to comply with terms of service
   - Violation of privacy policies
   - Breach of usage guidelines

5. **Supervision Failures:**
   - Lack of required supervision (ages 6-10)
   - Insufficient oversight (ages 11-15)
   - Inappropriate use by minors

---

### Indemnifying Parties by Age:

| Age Group | Indemnifying Parties |
|-----------|---------------------|
| **6-10** | • Parent/Guardian<br>• School (if applicable) |
| **11-15** | • Parent/Guardian<br>• School (if applicable)<br>• Student (with guardian) |
| **16-18** | • Student<br>• School (if applicable)<br>• Parent/Guardian (optional) |
| **19+** | • User |

---

## Technical Implementation

### Permission Checking

```typescript
import { 
  getTerminationPermissions,
  canParentTerminate,
  canSchoolTerminate,
  canUserSelfTerminate
} from './types/age-account-termination';

// Check if parent can terminate
const parentCan = canParentTerminate(user.ageCategory);
// Ages 6-15: true
// Ages 16+: false

// Check if school can terminate
const schoolCan = canSchoolTerminate(user.ageCategory);
// Ages 6-18 (if school account): true
// Ages 19+: false

// Check if user can self-terminate
const userCan = canUserSelfTerminate(user.ageCategory);
// Ages 6-15: false
// Ages 16+: true
```

---

### Termination Flow

```typescript
async function terminateAccount(
  userId: string,
  requestedBy: 'parent' | 'school' | 'user',
  reason: string
) {
  const user = await getUser(userId);
  const permissions = getTerminationPermissions(user.ageCategory);
  
  // Validate permission
  if (requestedBy === 'parent' && !permissions.parentCanTerminate) {
    throw new Error('Parent cannot terminate this account');
  }
  
  // Get notice period
  const noticeDays = permissions.noticePeriodDays;
  const deletionDate = new Date();
  deletionDate.setDate(deletionDate.getDate() + noticeDays);
  
  // Mark for deletion
  await markAccountForDeletion(userId, deletionDate, reason);
  
  // Send notifications
  if (permissions.noticeToParent) {
    await notifyParent(user.parentEmail, noticeDays);
  }
  if (permissions.noticeToSchool && user.isSchoolAccount) {
    await notifySchool(user.schoolId, noticeDays);
  }
  if (permissions.noticeToUser) {
    await notifyUser(user.email, noticeDays);
  }
  
  return {
    noticePeriod: noticeDays,
    deletionDate,
    canCancel: true
  };
}
```

---

### Data Retention Flow

```typescript
async function handleDataRetention(userId: string) {
  const user = await getUser(userId);
  const permissions = getTerminationPermissions(user.ageCategory);
  
  // After notice period expires
  const retentionEndDate = new Date();
  retentionEndDate.setDate(
    retentionEndDate.getDate() + permissions.dataRetentionDays
  );
  
  // Schedule permanent deletion
  await scheduleDataDeletion(userId, retentionEndDate);
  
  // Send final warning 7 days before
  const warningDate = new Date(retentionEndDate);
  warningDate.setDate(warningDate.getDate() - 7);
  await scheduleFinalWarning(userId, warningDate);
  
  return {
    retentionDays: permissions.dataRetentionDays,
    permanentDeletionDate: retentionEndDate
  };
}
```

---

## Summary Tables

### Quick Reference: Who Can Terminate?

| Age Group | Parent | School | User |
|-----------|--------|--------|------|
| **6-10** | ✅ Yes | ✅ Yes* | ❌ No |
| **11-15** | ✅ Yes | ✅ Yes* | ❌ No |
| **16-18** | ❌ No | ✅ Yes* | ✅ Yes |
| **19+** | ❌ No | ❌ No | ✅ Yes |

*If school-onboarded account

---

### Quick Reference: Notice & Retention

| Age Group | Notice Period | Data Retention | Total Time |
|-----------|--------------|----------------|------------|
| **6-10** | 0 days | 30 days | 30 days |
| **11-15** | 7 days | 30 days | 37 days |
| **16-18** | 14 days | 60 days | 74 days |
| **19+** | 30 days | 90 days | 120 days |

---

**End of Termination & Liability Documentation**  
**Version:** 1.0  
**Last Updated:** December 1, 2024

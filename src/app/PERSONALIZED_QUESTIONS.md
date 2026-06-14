# Personalized Questions Feature

## Overview

Each assessment now uses a personalized question selection system that generates a unique set of 12 questions for each user based on their user ID.

## How It Works

### Question Selection
- **Total Questions**: Each user receives exactly 12 questions per assessment
- **Distribution**:
  - **Learning Style Assessment**: 3 questions from each of 4 dimensions (CE, RO, AC, AE) = 12 total
  - **Thinking Style Assessment**: 4 questions from each of 3 dimensions (Analytical, Creative, Practical) = 12 total
  - **Decision Style Assessment**: 6 questions from each of 2 dimensions (Intuitive, Reflective) = 12 total

### Consistency
- Questions are generated using a **seeded random algorithm** based on the user ID
- The same user will always receive the same questions for each assessment type
- Questions are saved with assessment progress to maintain consistency if a user pauses and resumes

### Benefits
1. **Reduced Assessment Time**: ~3-5 minutes instead of 8-10 minutes
2. **Personalization**: Each user gets a unique set of questions
3. **Consistency**: Same questions on retakes and resume
4. **Balanced**: Equal representation from each dimension
5. **Fair Scoring**: Works with the same scoring algorithms

## Technical Implementation

### Function: `getPersonalizedQuestions()`
Location: `/utils/assessmentQuestions.ts`

```typescript
getPersonalizedQuestions(
  assessmentType: 'kolb' | 'sternberg' | 'dual-process',
  userId: string,
  isOrganizational: boolean = false
): Question[]
```

### Seeded Random Algorithm
- Uses the user ID + dimension to generate a consistent seed
- Shuffles questions deterministically based on the seed
- Selects the required number of questions from each dimension

### Progress Saving
- Assessment progress now includes the `questions` array
- When resuming, the exact same questions are restored
- Ensures continuity even if the algorithm changes in the future

## User Experience

### Information Displayed
- Assessment intro screens show "12 personalized questions"
- Estimated time updated to "3-5 minutes"
- Users are informed about the personalization in the description

### Resume Functionality
- If a user starts an assessment and leaves, their specific questions are saved
- On resume, they continue with the exact same questions in the same order
- No confusion or inconsistency when returning to incomplete assessments

## Data Integrity

- All dimensions are still equally represented
- Scoring algorithms work identically
- Results are comparable across users
- Assessment reliability is maintained

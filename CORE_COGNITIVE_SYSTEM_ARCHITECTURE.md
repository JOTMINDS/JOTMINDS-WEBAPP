# Core Cognitive System - Architecture & Implementation Plan

## Overview

Enhanced cognitive assessment system with adaptive intelligence, confidence tracking, and career alignment.

## Feature Set

### 1. Confidence Scoring ⭐ (Priority 1 - EASIEST)
**What:** Users rate their confidence in each answer (1-5 scale)
**Why:** Reveals metacognitive awareness and answer certainty
**Impact:** High - immediate insight into self-awareness

**Implementation:**
- Add confidence slider to each question (optional or required)
- Store confidence scores with each answer
- Calculate confidence metrics:
  - Average confidence per dimension
  - Confidence-accuracy alignment (high confidence + wrong style = overconfidence)
  - Low confidence areas = growth opportunities
- Display confidence insights in results

**Data Model:**
```typescript
{
  questionId: string;
  selectedValue: number;      // Likert 1-5
  confidenceLevel: number;    // 1-5 (1=guessing, 5=very confident)
  responseTime: number;       // milliseconds
}
```

### 2. Thinking-Style Profiling ⭐ (Priority 2 - MEDIUM)
**What:** Deeper analysis layer combining all three assessments
**Why:** Holistic cognitive fingerprint beyond individual frameworks
**Impact:** High - unique value proposition

**Implementation:**
- Aggregate all assessment results into unified profile
- Identify cross-framework patterns:
  - Creative + Diverging + Intuitive = "Innovative Explorer"
  - Analytical + Assimilating + Reflective = "Systematic Analyzer"
- Generate meta-insights about cognitive tendencies
- Create visual "cognitive fingerprint" radar chart

**Profile Dimensions:**
```typescript
{
  learningAgility: number;      // Kolb adaptability
  analyticalDepth: number;      // Sternberg analytical
  creativeCapacity: number;     // Sternberg creative
  practicalExecution: number;   // Sternberg practical
  intuitiveSpeed: number;       // Dual-process system1
  reflectiveDepth: number;      // Dual-process system2
  metacognitiveAwareness: number; // Derived from confidence scores
}
```

### 3. Cognitive-Career Alignment Scoring ⭐⭐ (Priority 3 - HIGH IMPACT)
**What:** Match cognitive profiles to career paths and roles
**Why:** Actionable guidance for students/professionals
**Impact:** Very High - differentiating feature

**Implementation:**
- Career database with required cognitive profiles
- Matching algorithm based on profile similarity
- Top 10 career recommendations with match scores
- Gap analysis: "To excel in [Career], strengthen [Dimension]"
- Integration with Skill Builder (auto-suggest plans for career goals)

**Career Database Schema:**
```typescript
{
  careerId: string;
  title: string;
  category: string; // "STEM", "Creative", "Business", etc.
  requiredProfile: {
    analyticalDepth: number;
    creativeCapacity: number;
    practicalExecution: number;
    // ... other dimensions
  };
  learningStyle: string[]; // ["Visual", "Kinesthetic"]
  thinkingStyle: string[]; // ["Analytical", "Practical"]
  decisionStyle: string;   // "Reflective" or "Intuitive"
}
```

**Example Careers:**
- Software Engineer: High analytical, high reflective, medium creative
- Product Designer: High creative, high intuitive, medium practical
- Data Scientist: High analytical, high reflective, low intuitive
- Entrepreneur: High creative, high practical, high intuitive
- Researcher: High analytical, high reflective, high creative
- Project Manager: High practical, medium analytical, medium reflective

### 4. Adaptive Assessment Engine ⭐⭐⭐ (Priority 4 - COMPLEX)
**What:** Questions adapt based on previous answers and confidence
**Why:** More accurate profiling with fewer questions
**Impact:** Medium - UX improvement, but complex

**Implementation:**
- Item Response Theory (IRT) for question difficulty calibration
- Bayesian updating of dimension scores after each answer
- Dynamic question selection:
  - High confidence + correct style → harder questions in that dimension
  - Low confidence + ambiguous → easier clarifying questions
  - Uncertain area → more questions to narrow down
- Termination criteria: confidence interval threshold reached

**Algorithm:**
```typescript
function selectNextQuestion(
  currentScores: DimensionScores,
  answeredQuestions: string[],
  confidenceLevels: number[]
): Question {
  // 1. Calculate uncertainty for each dimension
  const uncertainty = calculateUncertainty(currentScores, confidenceLevels);
  
  // 2. Select dimension with highest uncertainty
  const targetDimension = getHighestUncertainty(uncertainty);
  
  // 3. Get question pool for that dimension
  const questions = getQuestionsForDimension(targetDimension, answeredQuestions);
  
  // 4. Select question with optimal information gain
  return selectOptimalQuestion(questions, currentScores);
}
```

### 5. Dynamic Question Branching ⭐⭐⭐ (Priority 5 - COMPLEX)
**What:** Different question paths based on user persona
**Why:** Age-appropriate, role-appropriate questions
**Impact:** Medium - already have some age-gating

**Implementation:**
- Branching logic based on:
  - User age (children, teens, adults)
  - User role (student, professional, teacher)
  - Previous assessment results
  - Detected cognitive style
- Question pools per persona
- Scenario-based questions for different contexts

**Example Branches:**
- Teen + Creative + Diverging → Art/Design scenario questions
- Adult + Analytical + Reflective → Business strategy scenarios
- Child + Kinesthetic → Game-based interactive questions

## Implementation Priority & Timeline

### Phase 1: Foundation (Week 1)
1. ✅ Skill Builder auto-generation (DONE)
2. **Confidence Scoring** - Add to AssessmentTaking component
3. **Data models** - Extend schemas for new fields

### Phase 2: Profiling (Week 2)
4. **Thinking-Style Profiling** - Aggregate analysis component
5. **Profile visualization** - Radar chart, cognitive fingerprint
6. **Meta-insights generator** - Pattern detection across frameworks

### Phase 3: Career Alignment (Week 3)
7. **Career database** - 50+ careers with cognitive profiles
8. **Matching algorithm** - Similarity scoring
9. **Career recommendations** - Results component
10. **Skill Builder integration** - Career-driven plan suggestions

### Phase 4: Adaptive Intelligence (Week 4+)
11. **Adaptive engine** - IRT-based question selection
12. **Bayesian scoring** - Real-time profile updating
13. **Dynamic branching** - Persona-based paths
14. **Question pool expansion** - More questions per dimension

## Technical Considerations

### Database (KV Store Patterns)
```
confidence:{userId}:{assessmentType} → confidence metrics
profile:{userId} → unified cognitive profile
career-match:{userId} → career recommendations
adaptive-state:{userId}:{assessmentType} → real-time assessment state
```

### API Endpoints
```
POST /profile/generate → Create unified profile
GET  /profile/{userId} → Fetch profile
POST /career/match → Get career recommendations
POST /assessment/adaptive/next → Get next adaptive question
POST /assessment/confidence → Submit answer with confidence
```

### Frontend Components
```
- ConfidenceSlider.tsx
- CognitiveProfile.tsx (unified)
- CognitiveFingerprint.tsx (radar chart)
- CareerRecommendations.tsx
- CareerMatchCard.tsx
- AdaptiveAssessment.tsx
```

## Growth Loop Foundations (Future)

Based on the Core Cognitive System, build growth loops:

1. **Assessment → Profile → Career Match → Skill Gap → Skill Builder Plan**
2. **Skill Builder Completion → Re-assessment → Progress Tracking**
3. **Confidence Growth Tracking** - Show confidence improvements over time
4. **Career Readiness Score** - Track how close user is to target career profile
5. **Adaptive Learning Path** - AI-driven curriculum based on cognitive profile

## Success Metrics

- **Confidence Scoring:** % of users with high metacognitive awareness
- **Profile Accuracy:** User feedback on profile relevance
- **Career Match:** % of users who find recommendations helpful
- **Skill Builder Engagement:** Completion rates for career-driven plans
- **Adaptive Efficiency:** Questions needed to reach confidence threshold (target: 50% reduction)

## Next Steps

Start with **Confidence Scoring** - it's the foundation for everything else and can be shipped quickly.

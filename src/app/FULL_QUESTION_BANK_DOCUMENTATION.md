# Full Question Bank Documentation (300 Questions)

## 📊 Overview

The JotMinds platform now includes a comprehensive **300-question assessment bank** distributed across three cognitive frameworks:

- **100 Learning Style Questions** (Kolb)
- **100 Thinking Style Questions** (Sternberg)  
- **100 Decision Style Questions** (Dual-Process)

All questions use a **5-point Likert scale** for nuanced assessment:
1. Strongly Disagree
2. Disagree
3. Neutral
4. Agree
5. Strongly Agree

---

## 🎓 A. LEARNING STYLE QUESTIONS (100 Total)

**Framework:** Kolb Learning Styles  
**Quadrants:** Diverging, Assimilating, Converging, Accommodating  
**Distribution:** 25 questions per quadrant (perfectly balanced)

### Question Distribution:
- **Diverging** (Q1-25): Reflective observation, imaginative thinking
- **Assimilating** (Q26-50): Abstract conceptualization, logical analysis
- **Converging** (Q51-75): Active experimentation, practical problem-solving
- **Accommodating** (Q76-100): Concrete experience, hands-on learning

### Scoring:
- Responses are summed using Likert values (1-5)
- Each quadrant gets a total score out of 125 (25 questions × 5 max)
- Percentages calculated across all four quadrants
- Dominant style = highest percentage

### Example Questions:
```
Diverging:
- "I enjoy exploring ideas from multiple angles."
- "I prefer group discussions over lectures."
- "I enjoy brainstorming sessions."

Assimilating:
- "I prefer learning through reading and listening."
- "I enjoy organizing information."
- "I like charts, graphs, and models."

Converging:
- "I like finding practical solutions."
- "I enjoy hands-on experiments."
- "I prefer technical tasks."

Accommodating:
- "I enjoy learning by doing."
- "I like trying new things."
- "I prefer hands-on experiences."
```

---

## 🧠 B. THINKING STYLE QUESTIONS (100 Total)

**Framework:** Sternberg Triarchic Theory  
**Styles:** Analytical, Creative, Practical  
**Distribution:** 34 Analytical, 33 Creative, 33 Practical (balanced)

### Question Distribution:
- **Analytical** (Q1-34): Logic, evaluation, comparison, analysis
- **Creative** (Q35-67): Imagination, innovation, originality, divergent thinking
- **Practical** (Q68-100): Real-life problem solving, adaptability, common sense

### Scoring:
- Responses summed using Likert values (1-5)
- Analytical max: 170 (34 × 5)
- Creative max: 165 (33 × 5)
- Practical max: 165 (33 × 5)
- Percentages calculated across all three styles
- Dominant style = highest percentage

### Example Questions:
```
Analytical:
- "I enjoy solving problems with clear right or wrong answers."
- "I like finding mistakes and fixing them."
- "I question information to see if it makes sense."
- "I enjoy comparing two ideas to see which is better."

Creative:
- "I enjoy coming up with new ideas."
- "I like imagining different possibilities."
- "I enjoy drawing, writing, or creating things."
- "I ask 'What if?' questions often."

Practical:
- "I like solving real-life problems."
- "I use common sense to figure things out."
- "I enjoy fixing things around me."
- "I organize my tasks to get things done easily."
```

---

## ⚖️ C. DECISION STYLE QUESTIONS (100 Total)

**Framework:** Dual-Process Theory  
**Systems:** Intuitive (System 1), Reflective (System 2)  
**Distribution:** 50 questions per system (perfectly balanced)

### Question Distribution:
- **Intuitive/System 1** (Q1-50): Fast, automatic, gut-feeling decisions
- **Reflective/System 2** (Q51-100): Slow, deliberate, analytical decisions

### Scoring:
- Responses summed using Likert values (1-5)
- Each system gets total out of 250 (50 × 5)
- Percentages calculated across both systems
- Dominant style = highest percentage

### Example Questions:
```
Intuitive (System 1):
- "I often make decisions quickly."
- "I trust my first instinct."
- "I choose answers based on what feels right."
- "I enjoy fast-paced challenges."

Reflective (System 2):
- "I take time to think before making decisions."
- "I like checking information before acting."
- "I consider all options carefully."
- "I weigh the pros and cons before deciding."
```

---

## 🔧 Technical Implementation

### Backend Files:
```
/supabase/functions/server/
├── full-question-bank.tsx       # Complete 300-question dataset
├── assessment-routes.tsx        # API endpoints + scoring logic
└── index.tsx                    # Routes mounted here
```

### Question Storage Format:
```typescript
{
  id: number,              // 1-100 per framework
  question: string,        // Question text
  style: string,          // Style classification
  points: number          // Always 1 (for counting)
}
```

### API Response Format:
```json
{
  "success": true,
  "framework": "kolb",
  "version": "v1",
  "description": "Full Kolb Learning Styles Assessment...",
  "questionCount": 100,
  "createdAt": "2024-12-01T00:00:00.000Z",
  "distribution": {
    "Diverging": 25,
    "Assimilating": 25,
    "Converging": 25,
    "Accommodating": 25
  },
  "questions": [
    {
      "id": "kolb-1",
      "question": "I enjoy exploring ideas from multiple angles.",
      "options": [
        { "text": "Strongly Disagree", "value": 1 },
        { "text": "Disagree", "value": 2 },
        { "text": "Neutral", "value": 3 },
        { "text": "Agree", "value": 4 },
        { "text": "Strongly Agree", "value": 5 }
      ],
      "style": "Diverging",
      "points": 1
    }
    // ... 99 more questions
  ]
}
```

---

## 📈 Scoring Algorithm

### Likert Scale Summation:
```typescript
// For each style/quadrant:
1. Sum all Likert values (1-5) for questions tagged with that style
2. Calculate total across all styles
3. Calculate percentage: (styleScore / totalScore) × 100
4. Identify dominant style: max(percentages)
```

### Example Calculation (Kolb):
```
User answers:
- Diverging: 25 questions, avg response = 4.2
- Assimilating: 25 questions, avg response = 3.5
- Converging: 25 questions, avg response = 2.8
- Accommodating: 25 questions, avg response = 3.1

Scores:
- Diverging: 25 × 4.2 = 105
- Assimilating: 25 × 3.5 = 87.5
- Converging: 25 × 2.8 = 70
- Accommodating: 25 × 3.1 = 77.5
Total: 340

Percentages:
- Diverging: 31%
- Assimilating: 26%
- Converging: 21%
- Accommodating: 23%

Dominant Style: Diverging (31%)
```

---

## 🎯 Question Quality Standards

### All 300 questions meet these criteria:
✅ **Clear and unambiguous** - No double negatives  
✅ **Age-appropriate** - Suitable for students 11-14+  
✅ **Culturally neutral** - Applicable across contexts  
✅ **Style-specific** - Each targets one clear style  
✅ **Balanced difficulty** - Mix of obvious and subtle  
✅ **Action-oriented** - Focus on behaviors, not labels  
✅ **Research-based** - Aligned with framework theory  

---

## 🚀 Usage Examples

### 1. Fetch All Kolb Questions:
```bash
GET https://{projectId}.supabase.co/functions/v1/make-server-fc8eb847/assessment/kolb/v1
```

### 2. Fetch All Sternberg Questions:
```bash
GET https://{projectId}.supabase.co/functions/v1/make-server-fc8eb847/assessment/sternberg/v1
```

### 3. Fetch All Dual-Process Questions:
```bash
GET https://{projectId}.supabase.co/functions/v1/make-server-fc8eb847/assessment/dual-process/v1
```

### 4. Submit for Server-Side Scoring:
```bash
POST https://{projectId}.supabase.co/functions/v1/make-server-fc8eb847/assessment/kolb/score

Body:
{
  "answers": [
    {
      "questionId": "kolb-1",
      "selectedStyle": "Diverging",
      "selectedValue": 5
    },
    // ... 99 more answers
  ],
  "version": "v1"
}
```

---

## 📊 Assessment Duration Estimates

Based on 100 questions per framework:

| Framework | Questions | Est. Time | Recommended Breaks |
|-----------|-----------|-----------|-------------------|
| Kolb Learning | 100 | 15-20 min | Every 25 questions |
| Sternberg Thinking | 100 | 15-20 min | Every 25 questions |
| Dual-Process Decision | 100 | 12-15 min | Every 25 questions |

**Total for all 3:** 42-55 minutes (with breaks)

---

## 🔄 Versioning System

Questions are versioned to allow updates without breaking existing assessments:

```
questions:kolb:v1       # Initial 100-question set
questions:kolb:v2       # Future updated version
questions:sternberg:v1  # Initial 100-question set
questions:dual-process:v1
```

**Benefits:**
- Can deploy new questions without affecting in-progress assessments
- Users can retake with same version for consistency
- Can A/B test question effectiveness

---

## 📝 Future Enhancements

### Planned Features:
1. **Question Randomization** - Randomize order per user (maintain style balance)
2. **Adaptive Testing** - Reduce to 50 questions based on early responses
3. **Item Response Theory (IRT)** - Weight questions by difficulty
4. **Translation Support** - Multi-language versions
5. **Question Analytics** - Track which questions discriminate best
6. **Custom Question Sets** - Organizations can create branded versions

---

## 🎓 Psychometric Properties

### Reliability:
- **Internal Consistency:** Cronbach's α target > 0.80
- **Test-Retest:** Correlation target > 0.75
- **Inter-Rater:** N/A (self-report)

### Validity:
- **Content Validity:** Questions map to theoretical constructs
- **Construct Validity:** Scores align with framework definitions
- **Criterion Validity:** Results predict learning/working preferences

### Statistical Balance:
- ✅ Equal questions per style (Kolb, Dual-Process)
- ✅ Near-equal questions per style (Sternberg: 34/33/33)
- ✅ All styles can achieve 0-100% range
- ✅ No ceiling/floor effects

---

## 🔐 Data Privacy & Ethics

### GDPR/Data Protection:
- Questions contain no personal identifiers
- Responses stored with user consent
- Can be anonymized for research
- Users can request deletion

### Ethical Considerations:
- No questions about sensitive topics
- No stereotype reinforcement
- Results presented as preferences, not abilities
- Encourage growth mindset language

---

## 📞 Support & Maintenance

### For Developers:
- Question bank located in: `/supabase/functions/server/full-question-bank.tsx`
- To add questions: Update arrays, re-run initialization
- To modify scoring: Edit calculation functions in `assessment-routes.tsx`

### For Administrators:
- Questions auto-initialize on server start
- Check logs for: `[Questions] Full 300-question bank initialized successfully`
- Manual initialization: Call `initializeQuestionSets()` function

---

## 📚 References

**Kolb Learning Styles:**
- Kolb, D. A. (1984). *Experiential Learning: Experience as the Source of Learning and Development*

**Sternberg Thinking Styles:**
- Sternberg, R. J. (1997). *Thinking Styles*

**Dual-Process Theory:**
- Kahneman, D. (2011). *Thinking, Fast and Slow*

---

**Version:** 1.0  
**Last Updated:** December 1, 2024  
**Status:** ✅ Production Ready  
**Total Questions:** 300
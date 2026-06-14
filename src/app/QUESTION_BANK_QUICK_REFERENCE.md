# 300-Question Bank Quick Reference

## 📊 At a Glance

| Framework | Total Questions | Distribution | Styles |
|-----------|----------------|--------------|---------|
| **Kolb** | 100 | 25 per style | Diverging, Assimilating, Converging, Accommodating |
| **Sternberg** | 100 | 34/33/33 | Analytical, Creative, Practical |
| **Dual-Process** | 100 | 50 per style | Intuitive (System 1), Reflective (System 2) |
| **TOTAL** | **300** | - | - |

---

## 🔢 Question ID Ranges

### Kolb (100 Questions)
- **Diverging:** Q1-25
- **Assimilating:** Q26-50
- **Converging:** Q51-75
- **Accommodating:** Q76-100

### Sternberg (100 Questions)
- **Analytical:** Q1-34
- **Creative:** Q35-67
- **Practical:** Q68-100

### Dual-Process (100 Questions)
- **Intuitive:** Q1-50
- **Reflective:** Q51-100

---

## 🎯 Sample Questions

### Kolb Samples:
```
Q1 (Diverging): "I enjoy exploring ideas from multiple angles."
Q26 (Assimilating): "I prefer learning through reading and listening."
Q51 (Converging): "I like finding practical solutions."
Q76 (Accommodating): "I enjoy learning by doing."
```

### Sternberg Samples:
```
Q1 (Analytical): "I enjoy solving problems with clear right or wrong answers."
Q35 (Creative): "I enjoy coming up with new ideas."
Q68 (Practical): "I like solving real-life problems."
```

### Dual-Process Samples:
```
Q1 (Intuitive): "I often make decisions quickly."
Q51 (Reflective): "I take time to think before making decisions."
```

---

## 🌟 Likert Scale (All Questions)

| Value | Label |
|-------|-------|
| 1 | Strongly Disagree |
| 2 | Disagree |
| 3 | Neutral |
| 4 | Agree |
| 5 | Strongly Agree |

---

## 🚀 API Endpoints

### Get Questions:
```
GET /assessment/{framework}/{version}

Frameworks: kolb, sternberg, dual-process
Versions: v1, v2, v3, etc.

Example:
GET /assessment/kolb/v1
```

### Score Assessment:
```
POST /assessment/{framework}/score

Body: { answers: [...], version: "v1" }

Example:
POST /assessment/sternberg/score
```

### List Versions:
```
GET /assessment/{framework}/versions

Example:
GET /assessment/dual-process/versions
```

---

## 💯 Scoring Formula

```
For each style:
  styleScore = Σ(Likert responses for that style)
  
Total = Σ(all styleScores)

Percentage = (styleScore / Total) × 100

Dominant Style = style with max percentage
```

---

## ⏱️ Time Estimates

- **Per Question:** 8-10 seconds
- **Per 25 Questions:** 3-5 minutes
- **Full 100-Question Assessment:** 15-20 minutes
- **All 3 Assessments (300 total):** 45-60 minutes

**Recommendation:** Breaks every 25 questions

---

## 📂 File Locations

```
Backend:
/supabase/functions/server/full-question-bank.tsx       # 300 questions
/supabase/functions/server/assessment-routes.tsx        # API + scoring
/supabase/functions/server/index.tsx                    # Route mounting

Frontend:
/utils/assessmentApi.ts                                 # API client
/components/Assessment.tsx                              # Assessment UI

Documentation:
/FULL_QUESTION_BANK_DOCUMENTATION.md                    # Complete docs
/BACKEND_ASSESSMENT_IMPLEMENTATION.md                   # Backend docs
/QUESTION_BANK_QUICK_REFERENCE.md                       # This file
```

---

## ✅ Quality Checklist

- [x] 300 questions total (100 per framework)
- [x] Evenly distributed across styles
- [x] 5-point Likert scale for all
- [x] Server-side scoring implemented
- [x] Auto-sync every 3 seconds
- [x] Versioning system in place
- [x] All questions clear and unambiguous
- [x] Age-appropriate for 11-14+
- [x] Culturally neutral
- [x] Backend initialized on startup
- [x] API endpoints tested
- [x] Documentation complete

---

## 🎓 Quick Start for Developers

### 1. View All Kolb Questions:
```bash
curl https://{projectId}.supabase.co/functions/v1/make-server-fc8eb847/assessment/kolb/v1
```

### 2. Submit Kolb Answers for Scoring:
```bash
curl -X POST https://{projectId}.supabase.co/functions/v1/make-server-fc8eb847/assessment/kolb/score \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "kolb-1", "selectedStyle": "Diverging", "selectedValue": 5},
      ...
    ],
    "version": "v1"
  }'
```

### 3. Check Server Logs:
```
[Questions] Full 300-question bank initialized successfully
[Questions] - Kolb: 100 questions (25 per quadrant)
[Questions] - Sternberg: 100 questions (34/33/33 distribution)
[Questions] - Dual-Process: 100 questions (50 per style)
```

---

## 🔧 Troubleshooting

### Questions Not Loading?
1. Check: `[Questions] ... initialized successfully` in server logs
2. Verify: KV store has keys `questions:kolb:v1`, etc.
3. Restart server to re-run initialization

### Scoring Mismatch?
1. Ensure `selectedValue` is 1-5
2. Verify `selectedStyle` matches question style
3. Check server logs for `[Scoring] Calculated ...`

### Version Not Found?
1. Confirm version format: `v1`, `v2`, etc. (lowercase v + number)
2. Check available versions: `GET /assessment/{framework}/versions`

---

## 📊 Expected Score Distributions

### Balanced User (All Styles Equal):
```
Kolb: 25% / 25% / 25% / 25%
Sternberg: 33% / 33% / 33%
Dual-Process: 50% / 50%
```

### Highly Specialized User:
```
Kolb: 60% / 15% / 15% / 10% (Strong Diverging preference)
Sternberg: 10% / 80% / 10% (Strong Creative preference)
Dual-Process: 20% / 80% (Strong Reflective preference)
```

---

## 🎉 Success Metrics

- ✅ **300 questions** deployed
- ✅ **3 frameworks** covered
- ✅ **100% balance** within each framework
- ✅ **5-point scale** for nuance
- ✅ **Server-side scoring** for consistency
- ✅ **Auto-sync** every 3 seconds
- ✅ **Versioning** for updates
- ✅ **Full documentation** provided

---

**Status:** ✅ Production Ready  
**Version:** 1.0  
**Date:** December 1, 2024
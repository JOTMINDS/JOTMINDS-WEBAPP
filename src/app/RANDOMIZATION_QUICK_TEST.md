# 🧪 Question Randomization - Quick Test Guide

> **5-minute test to verify randomization is working**

---

## ⚡ Quick Test (2 minutes)

### Step 1: Start Your App
```bash
npm run dev
```

### Step 2: Take Assessment as User A
1. Sign in as any user (or create new account)
2. Start any assessment (Learning, Thinking, or Decision)
3. **Write down the first 5 questions** you see
4. Complete or exit the assessment

### Step 3: Take Assessment as User B
1. Sign out
2. Sign in as a **different user** (or create new account)
3. Start the **same assessment type**
4. **Write down the first 5 questions**

### Step 4: Compare
**✅ Success:** The questions are in **different order**
**❌ Failure:** The questions are in the **same order**

---

## 🔍 Detailed Test (5 minutes)

### Test 1: Different Users, Same Day

**Expected:** Different question order

```
User A (user-123):
Q1: "I learn best by doing hands-on activities"
Q2: "I prefer to analyze data before making decisions"
Q3: "I enjoy brainstorming creative solutions"
...

User B (user-456):
Q1: "I prefer to analyze data before making decisions"  ← Different!
Q2: "I enjoy working with abstract concepts"           ← Different!
Q3: "I learn best by doing hands-on activities"        ← Different!
...
```

**How to test:**
1. Sign in as User A
2. Start assessment
3. Note first 5 questions
4. Sign out
5. Sign in as User B
6. Start same assessment
7. Compare first 5 questions

**✅ Pass:** Questions are in different order
**❌ Fail:** Questions are in same order

---

### Test 2: Same User, Same Day

**Expected:** Same question order (for progress tracking)

```
Attempt 1 (10:00 AM):
Q1: "I learn best by doing hands-on activities"
Q2: "I prefer to analyze data before making decisions"
Q3: "I enjoy brainstorming creative solutions"
...

Attempt 2 (2:00 PM):
Q1: "I learn best by doing hands-on activities"  ← Same!
Q2: "I prefer to analyze data before making decisions"  ← Same!
Q3: "I enjoy brainstorming creative solutions"   ← Same!
...
```

**How to test:**
1. Sign in as User A
2. Start assessment
3. Note first 5 questions
4. Abandon assessment (close browser or refresh)
5. Sign in again as User A
6. Start same assessment
7. Compare first 5 questions

**✅ Pass:** Questions are in same order
**❌ Fail:** Questions are in different order

---

### Test 3: Same User, Different Days

**Expected:** Different question order

```
Day 1 (Dec 9):
Q1: "I learn best by doing hands-on activities"
Q2: "I prefer to analyze data before making decisions"
Q3: "I enjoy brainstorming creative solutions"
...

Day 2 (Dec 10):
Q1: "I enjoy working with abstract concepts"     ← Different!
Q2: "I trust my gut instincts"                   ← Different!
Q3: "I prefer structured learning environments"  ← Different!
...
```

**How to test:**
1. Sign in as User A
2. Start assessment
3. Note first 5 questions
4. **Wait until tomorrow** (or change system date)
5. Sign in again as User A
6. Start same assessment
7. Compare first 5 questions

**✅ Pass:** Questions are in different order
**❌ Fail:** Questions are in same order

---

## 🛠️ Debug Mode Test

### Enable Console Logging

Open browser DevTools (F12) → Console tab

Look for these logs:

```javascript
[AssessmentAPI] Fetched kolb v1 questions: {
  questionCount: 100,
  randomized: true,
  seed: "user-abc123-kolb-v1-2024-12-09"
}

[Assessment] Loaded 100 questions for kolb {
  randomized: true,
  seed: "user-abc123-kolb-v1-2024-12-09"
}
```

**Check:**
- ✅ `randomized: true` appears
- ✅ `seed` contains user ID
- ✅ `seed` contains today's date
- ✅ Question count is correct (100)

---

## 🌐 API Test (Advanced)

### Direct API Call

```bash
# Test 1: User A
curl "http://localhost:54321/functions/v1/make-server-fc8eb847/assessment/kolb/v1?randomize=true&userId=userA" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Save response to file1.json

# Test 2: User B (same day)
curl "http://localhost:54321/functions/v1/make-server-fc8eb847/assessment/kolb/v1?randomize=true&userId=userB" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Save response to file2.json

# Compare
diff file1.json file2.json
```

**✅ Expected:** Files are different (different question order)

---

## 📊 Visual Test

### Record Question IDs

Create a spreadsheet:

| User | Attempt | Q1 ID | Q2 ID | Q3 ID | Q4 ID | Q5 ID |
|------|---------|-------|-------|-------|-------|-------|
| A    | 1       | Q45   | Q12   | Q89   | Q3    | Q67   |
| A    | 2       | Q45   | Q12   | Q89   | Q3    | Q67   |
| B    | 1       | Q72   | Q5    | Q33   | Q91   | Q18   |
| B    | 2       | Q72   | Q5    | Q33   | Q91   | Q18   |

**Check:**
- ✅ User A Attempt 1 = User A Attempt 2 (same day)
- ✅ User A ≠ User B (different users)

---

## ✅ Success Criteria

Randomization is working if:

1. ✅ **Different users** get **different question orders** (same day)
2. ✅ **Same user** gets **same question order** (same day, multiple attempts)
3. ✅ **Same user** gets **different question order** (different days)
4. ✅ Console logs show `randomized: true`
5. ✅ Console logs show seed with format: `user-{id}-{framework}-v1-{YYYY-MM-DD}`
6. ✅ Assessment still completes successfully
7. ✅ Results are calculated correctly
8. ✅ Progress saving still works

---

## 🚨 Troubleshooting

### Issue: All users get same questions

**Check:**
1. Is `randomized: false` in console logs?
   - **Fix:** Check frontend code passes `randomize: true`
2. Is seed null in console logs?
   - **Fix:** Check userId is being passed to API
3. Are you testing with same user?
   - **Fix:** Use different user accounts

### Issue: Same user gets different questions (same day)

**Check:**
1. Is seed changing between attempts?
   - **Fix:** Check date portion of seed is same
2. Did you clear cache?
   - **Fix:** Don't clear cache between attempts
3. Is backend caching disabled?
   - **Fix:** Backend should use consistent seed

### Issue: Questions not randomized at all

**Check:**
1. Open browser console (F12)
2. Look for `[Questions] Randomized kolb v1 with seed: ...` in Network tab
3. If not present, backend shuffle is not running
   - **Fix:** Restart backend server
   - **Fix:** Check backend code deployed

### Issue: API errors

**Check:**
1. Network tab in DevTools
2. Look for 400/500 errors
3. Read error message
   - **Common:** Invalid framework name
   - **Common:** Invalid version format
   - **Common:** Missing auth token

---

## 🎯 Quick Checklist

Before considering randomization "working":

- [ ] Tested with 2+ different users
- [ ] Confirmed different question order for different users
- [ ] Tested same user twice (same day)
- [ ] Confirmed same question order for same user (same day)
- [ ] Checked console logs show `randomized: true`
- [ ] Checked seed format is correct
- [ ] Assessment completes successfully
- [ ] Results are calculated
- [ ] Progress auto-saves

---

## 📸 Screenshot Evidence

Take screenshots showing:

1. **User A - First 5 questions**
2. **User B - First 5 questions** (different order)
3. **Console log** showing randomization
4. **Completed assessment** with results

---

## 💡 Pro Tips

### Tip 1: Use Browser Profiles
Create separate browser profiles for each test user to avoid logout/login repeatedly.

### Tip 2: Network Tab
Keep Network tab open to see actual API requests and responses.

### Tip 3: Console Logs
Filter console for `[Assessment]` or `[AssessmentAPI]` to see only relevant logs.

### Tip 4: Take Notes
Write down which questions you see for easy comparison.

### Tip 5: Screenshot Everything
Visual evidence helps debugging if something doesn't work.

---

## 🎉 You're Done!

If all tests pass, randomization is working correctly! 

**Next steps:**
- Deploy to production
- Monitor user feedback
- Track analytics on question exposure
- Celebrate! 🎊

---

**Last Updated:** December 9, 2024
**Testing Time:** ~5 minutes
**Status:** Ready for Testing ✅

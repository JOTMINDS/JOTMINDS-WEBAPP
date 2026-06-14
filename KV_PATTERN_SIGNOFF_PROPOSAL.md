# KV Pattern Sign-Off Proposal — Mobile v1.1 Gap-Closure

**Status:** ✅ RESOLVED 2026-05-18 — decisions: 1A (new `skillplan:` pattern), 2B (nest under settings), 3C (dedicated Postgres tables outside KV). See `JOTMINDS_MOBILE_APP_SPECIFICATION.md` v1.1.1 for the final spec.
**Owner:** Mobile workstream
**Date:** 2026-05-18
**Decision needed by:** before Skill Builder, Teacher Growth, or Counsellor implementation begins
**Related:** `JOTMINDS_MOBILE_APP_SPECIFICATION.md` §17, `DATABASE_SCHEMA_COMPLETE.md`

---

## 1. Context

The KV store currently exposes **12 canonical key patterns**. The v1.1 gap-closure modules (Skill Builder, Teacher Growth, Counsellor support) introduce data shapes that do not cleanly fit any of the 12. We need an explicit decision from the platform team on **how to persist them** before we cut implementation tickets.

For each of the three new data shapes we present:
- The minimal data we must store.
- **Option A:** add a new canonical pattern (raises total to 13/14/15).
- **Option B:** nest inside an existing pattern (preserves the 12).
- Recommendation + trade-offs.

A single yes/no per item is enough; inline-comment this doc.

---

## 2. Decision 1 — Skill Builder plan

### Data we must persist
```ts
{
  planId: string,            // uuid
  userId: string,
  dimensionId: string,       // e.g. "metacognition"
  tier: 'kids_jr'|...|'adult',
  lengthDays: 7 | 14,
  currentDay: number,
  status: 'active'|'completed'|'abandoned',
  activities: [{day, gameId, promptId, challengeId, completed, completedAt?}],
  sourceResultId: string,    // assessment this plan was generated from
  createdAt: ISOString,
  updatedAt: ISOString
}
```
- Cardinality: ~2 active plans per user, lifetime ~10–30 plans per user.
- Access patterns: list by user, get by planId, update by planId (one activity flip per day).

### Option A — new pattern `skillplan:{userId}:{planId}`
- ✅ Clean RLS (mirrors `assessment:` pattern).
- ✅ Efficient list-by-user via prefix scan.
- ❌ Bumps canonical count to 13.

### Option B — nest under `assessment:{userId}:{tier}:{resultId}.skillPlan`
- ✅ Stays at 12 patterns.
- ❌ Couples plan lifecycle to the result row (a plan can outlive its source result; users may have plans from multiple results active).
- ❌ Every plan-activity completion rewrites the entire result object → write amplification, race risk on concurrent edits.

### Recommendation
**Option A.** Mirrors `assessment:` pattern exactly; lifecycle is independent; write costs are bounded. The "12 patterns" rule was a complexity ceiling, not a hard cap — Skill Builder is a first-class user feature and deserves its own namespace.

**☐ Approve A   ☐ Approve B   ☐ Reject — alternative: __________**

---

## 3. Decision 2 — Teacher Growth plan

### Data we must persist
```ts
{
  quarter: 'YYYY-Q1'|...,
  goals: [{ styleId, target: number, progress: number }],
  completedLessons: string[],   // lessonId list
  reassessmentDue: ISOString,
  updatedAt: ISOString
}
```
- Cardinality: 1 row per teacher per quarter (~4/yr).
- Access patterns: get current quarter, list history.

### Option A — new pattern `growthplan:{userId}:{quarter}`
- ✅ Symmetric with Skill Builder.
- ❌ Bumps count further (to 14 if Skill Builder also approved).

### Option B — nest under `user:{userId}:settings.growth`
- ✅ Stays at 12.
- ✅ Low write frequency (once per lesson completion, ~weekly).
- ❌ `settings` becomes a grab-bag; harder to query history (no prefix scan, must read full settings blob).

### Recommendation
**Option B.** Volume is genuinely low (~4 rows/yr/teacher), no realtime collaboration, no cross-user reads. Nesting is acceptable. If we later need analytics on teacher growth across the cohort, we can promote it then.

**☐ Approve A   ☐ Approve B   ☐ Reject — alternative: __________**

---

## 4. Decision 3 — Counsellor support (chat threads + messages)

### Data we must persist
```ts
// Thread
{
  threadId: string,
  userId: string,
  counsellorId: string,
  topic: string,
  urgency: 'low'|'med'|'high'|'crisis',
  status: 'open'|'closed',
  scopeGrants: [{ key, grantedAt }],   // which result/reflection keys user shared
  lastMessageAt: ISOString,
  createdAt: ISOString
}

// Message (append-only)
{
  msgId: string,
  threadId: string,
  senderId: string,
  body: string,
  attachments?: [{ url, mime, sizeBytes }],
  createdAt: ISOString
}
```
- Cardinality: low thread count per user (<5 lifetime expected for MVP), but message count can grow (10–100 per thread).
- Access patterns: list threads by user, list threads by counsellor, list messages by thread (time-ordered), realtime subscribe per thread.
- **Compliance:** messages are confidential clinical comms — separate audit logging, retention policy may differ from the rest of KV.

### Option A — two new patterns
- `support:thread:{threadId}` (single object)
- `support:msg:{threadId}:{ts}` (one per message)

- ✅ Clean realtime subscribe per thread (prefix on `support:msg:{threadId}:`).
- ✅ Append-only message log = simple write semantics.
- ✅ Lets us apply a distinct retention/audit policy at the pattern level.
- ❌ Two more canonical patterns (total 14 or 15 depending on Decisions 1 & 2).

### Option B — nest messages inside thread row
- ✅ One pattern (`support:thread:{threadId}`).
- ❌ Every new message rewrites the entire thread row → write amplification scales with conversation length; high race risk during active chat.
- ❌ Row size can blow past KV value-size limits for long threads.

### Option C — escape hatch: a dedicated table outside KV
- ✅ Native to clinical-data requirements (encryption, retention, audit).
- ✅ Avoids stretching the KV store beyond its design.
- ❌ Breaks the "single-table KV" architecture — needs platform-team buy-in for a real schema change.

### Recommendation
**Option A for MVP**, **migrate to Option C before public counsellor launch.** Rationale: A unblocks shipping; C is the right long-term home for clinical PHI but requires real migration design (encryption-at-rest keys, retention jobs, audit trail). Treat this as a known tech-debt item we accept in writing.

**☐ Approve A (MVP) + plan C   ☐ Approve A only   ☐ Approve B   ☐ Approve C now   ☐ Reject — alternative: __________**

---

## 5. Cross-cutting concerns (please confirm)

1. **RLS enforcement:** for any new pattern, the `kv` Edge Function must extend its allowlist. Owner: platform. Estimate: ~1 day per pattern.
2. **Prefix-scan cost:** are there pagination guards in place for `list(prefix)` calls? Skill Builder list-by-user is expected to return ≤30 rows, but counsellor message lists could exceed 100.
3. **Realtime channel subscription patterns:** confirm `kv_store` Postgres-changes publication is wide enough to include any new keys (it should be, since it's a single table — sanity check only).
4. **Audit logging:** Counsellor messages need a separate audit stream. Does platform have a standard for this, or do we build it?
5. **Backup/export:** confirm new patterns are picked up by existing user-data-export and account-deletion paths automatically (they should be, but verify the `delete_account` function's prefix list).

---

## 6. If all decisions land as recommended

- KV canonical patterns: **12 → 15** (Skill Builder, support thread, support msg).
- Settings blob gains a `growth` sub-object.
- One known tech-debt: migrate Counsellor data to dedicated table before public launch.
- Mobile workstream can begin §17.1, §17.3, §17.5 implementation in parallel.

---

## 7. Action requested

1. Platform lead: review §2–§4, mark approvals, comment on §5.
2. Reply by **EOD Friday 2026-05-22** so we can lock the v1.1 implementation plan.
3. After sign-off, I will update `JOTMINDS_MOBILE_APP_SPECIFICATION.md` to remove the ⚠️ flags and reflect the final patterns.

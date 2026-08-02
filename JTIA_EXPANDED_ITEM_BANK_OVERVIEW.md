# JTIA Expanded Master Item Bank – Architecture & Developer Reference

> **IMPORTANT COMPLIANCE & VALIDATION NOTICE:**  
> All items described in this expanded item bank (`JTIA-CI001`–`JTIA-CI200` and `JTIA-CL001`–`JTIA-CL200`) are **draft assessment content** designed for implementation, expert review, pilot testing, and psychometric calibration. They **must not be represented as validated** until the required review and pilot testing process has been completed.

---

## 1. Executive Summary

The **JotMinds Teacher Intelligence Assessment (JTIA)** Expanded Master Item Bank provides a comprehensive 400-question draft repository across two primary domains:
1. **Cognitive Intelligence (CI)** – 200 items (`JTIA-CI001` to `JTIA-CI200`)
2. **Classroom Leadership (CL)** – 200 items (`JTIA-CL001` to `JTIA-CL200`)

Each competency within a domain contains precisely **20 assessment items** structured across four distinct psychometric item formats:
- **12 Standard Scenarios** (Basic, Intermediate, Advanced, and Expert difficulties)
- **4 Priority Ranking Items** (Ranking actions 1 to 4)
- **2 Forced-Choice Items** (Selecting Most/Least like the teacher)
- **2 Longitudinal Scenarios** (2-stage evolving classroom situations)

---

## 2. Domain 1: Cognitive Intelligence (CI)
**Total Items:** 200 (`JTIA-CI001` – `JTIA-CI200`)  
**Core Purpose:** Evaluates how teachers think, analyze evidence, adapt pedagogical approaches, and make structured professional decisions.

### Competency & ID Mapping
| Competency | Question ID Range | Item Count | Primary Evidence Contexts |
| :--- | :--- | :--- | :--- |
| **Analytical Thinking** | `JTIA-CI001` – `JTIA-CI020` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Critical Thinking** | `JTIA-CI021` – `JTIA-CI040` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Adaptive Thinking** | `JTIA-CI041` – `JTIA-CI060` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Creative Thinking** | `JTIA-CI061` – `JTIA-CI080` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Reflective Practice** | `JTIA-CI081` – `JTIA-CI100` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Decision-Making** | `JTIA-CI101` – `JTIA-CI120` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Problem Solving** | `JTIA-CI121` – `JTIA-CI140` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Systems Thinking** | `JTIA-CI141` – `JTIA-CI160` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Data Interpretation** | `JTIA-CI161` – `JTIA-CI180` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Strategic Thinking** | `JTIA-CI181` – `JTIA-CI200` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |

---

## 3. Domain 2: Classroom Leadership (CL)
**Total Items:** 200 (`JTIA-CL001` – `JTIA-CL200`)  
**Core Purpose:** Evaluates how teachers manage learning environments, guide student behavior, resolve classroom conflict, and lead inclusively under pressure.

### Competency & ID Mapping
| Competency | Question ID Range | Item Count | Primary Evidence Contexts |
| :--- | :--- | :--- | :--- |
| **Classroom Management** | `JTIA-CL001` – `JTIA-CL020` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Behaviour Management** | `JTIA-CL021` – `JTIA-CL040` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Student Motivation** | `JTIA-CL041` – `JTIA-CL060` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Classroom Presence** | `JTIA-CL061` – `JTIA-CL080` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Time & Learning Management** | `JTIA-CL081` – `JTIA-CL100` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Conflict Resolution** | `JTIA-CL101` – `JTIA-CL120` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Positive Classroom Culture** | `JTIA-CL121` – `JTIA-CL140` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Inclusive Leadership** | `JTIA-CL141` – `JTIA-CL160` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |
| **Expectations & Accountability** | `JTIA-CL161` – `JTIA-CL180` | 20 | Classroom Instruction, Assessment & Feedback, Student Engagement, Professional Collaboration |
| **Leadership Under Pressure** | `JTIA-CL181` – `JTIA-CL200` | 20 | School Improvement, Parent Engagement, Student Wellbeing, Professional Reflection |

---

## 4. Item Structure & Developer Metadata Standard

Every item in the expansion bank conforms to the following metadata schema:
```json
{
  "id": "JTIA-CI001",
  "domain": "Cognitive Intelligence",
  "competency": "Analytical Thinking",
  "type": "Standard Scenario | Priority Ranking | Forced Choice | Longitudinal Scenario",
  "difficulty": "Basic | Intermediate | Advanced | Expert",
  "evidenceContext": "Classroom Instruction | Assessment and Feedback | Student Engagement | Professional Collaboration | School Improvement | Parent Engagement | Student Wellbeing | Professional Reflection",
  "developerMetadata": {
    "version": "Assessment Version 2.0 Expansion Bank",
    "status": "Draft",
    "validationNote": "Scoring mapping to be calibrated during implementation and validation."
  }
}
```

---

## 5. Psychometric Implementation Guidelines

1. **Scoring Weight Calibration:** During pilot testing, raw responses should be mapped against the existing `jtiaScoring.ts` algorithm to establish item-level discrimination indexes and difficulty weights.
2. **AI Recommendation Grounding:** AI suggestions generated via `/generate-jtia-insights` and `/generate-school-jtia-insights` must cite specific competency growth areas (e.g., `"Strategic Thinking"`, `"Leadership Under Pressure"`) without altering the mathematical domain scores.
3. **Pilot Labeling:** All UI reports displaying items from the expansion bank during pilot phases must include a subtle disclaimer: *"Pilot Assessment Content — Undergoing Psychometric Calibration."*

import { Question } from '../types';
import { jtiaExpandedItemBank } from './jtiaExpandedItemBank';

export type JTIADomain = 
  | 'Cognitive Intelligence'
  | 'Instructional Intelligence'
  | 'Classroom Leadership'
  | 'Relationship Intelligence'
  | 'Professional Intelligence';

export interface JTIAQuestion extends Question {
  domain: JTIADomain;
  subCompetency: string;
  itemType: 'scenario' | 'preference';
  scenarioContext?: string;
}

// 100 Teaching Scenario Questions (Authentic classroom decisions & dilemmas)
// + 20 Cognitive Preference Items (Natural working styles)
// Total: 120 Items
export const jtiaQuestions: JTIAQuestion[] = [
  // ─── DOMAIN 1: COGNITIVE INTELLIGENCE (Questions 1 - 24) ────────────────────
  // Critical Thinking
  {
    id: 1,
    text: "When a widely recommended new teaching framework fails to improve student comprehension in my class after two weeks, I evaluate its underlying assumptions against my students' specific learning gaps before modifying it.",
    domain: "Cognitive Intelligence",
    subCompetency: "Critical Thinking",
    itemType: "scenario",
    scenarioContext: "Evaluating curriculum effectiveness under underperforming classroom metrics."
  },
  {
    id: 2,
    text: "Before adopting a standardized departmental reading strategy, I analyze both diagnostic test data and informal observational evidence to determine if it suits my learners' profiles.",
    domain: "Cognitive Intelligence",
    subCompetency: "Critical Thinking",
    itemType: "scenario"
  },
  {
    id: 3,
    text: "When students present conflicting interpretations of a complex historical or scientific text, I use structured questioning to help them examine the validity of their evidence.",
    domain: "Cognitive Intelligence",
    subCompetency: "Critical Thinking",
    itemType: "scenario"
  },
  {
    id: 4,
    text: "I regularly audit my own assessment questions to ensure they measure higher-order analytical synthesis rather than mere factual recall.",
    domain: "Cognitive Intelligence",
    subCompetency: "Critical Thinking",
    itemType: "scenario"
  },
  // Decision Making
  {
    id: 5,
    text: "During a live lesson where 40% of the class demonstrates confusion on a prerequisite concept, I immediately pause the planned progression to execute an alternative scaffolding activity.",
    domain: "Cognitive Intelligence",
    subCompetency: "Decision Making",
    itemType: "scenario",
    scenarioContext: "Real-time pacing adjustment when formative checks signal widespread confusion."
  },
  {
    id: 6,
    text: "When choosing between completing the scheduled curriculum syllabus and deepening understanding of a struggling mastery concept, I prioritize foundational mastery with clear justification.",
    domain: "Cognitive Intelligence",
    subCompetency: "Decision Making",
    itemType: "scenario"
  },
  {
    id: 7,
    text: "In moments of sudden technological failure or room change, I make calm, decisive adjustments that maintain instructional continuity without loss of learning time.",
    domain: "Cognitive Intelligence",
    subCompetency: "Decision Making",
    itemType: "scenario"
  },
  {
    id: 8,
    text: "When balancing competing requests from parents, administrators, and students, I use clear educational principles to determine immediate priorities.",
    domain: "Cognitive Intelligence",
    subCompetency: "Decision Making",
    itemType: "scenario"
  },
  // Reflective Practice
  {
    id: 9,
    text: "After teaching a challenging unit, I systematically review student work samples to identify where my instructional delivery could have been clearer.",
    domain: "Cognitive Intelligence",
    subCompetency: "Reflective Practice",
    itemType: "scenario"
  },
  {
    id: 10,
    text: "I actively solicit anonymous feedback from students about their classroom learning experience to refine my pedagogical methods.",
    domain: "Cognitive Intelligence",
    subCompetency: "Reflective Practice",
    itemType: "scenario"
  },
  {
    id: 11,
    text: "When an individual student repeatedly struggles despite my interventions, I reflect on my own unconscious assumptions or biases regarding their learning style.",
    domain: "Cognitive Intelligence",
    subCompetency: "Reflective Practice",
    itemType: "scenario"
  },
  {
    id: 12,
    text: "I maintain a dedicated teaching reflection journal or portfolio to track my long-term pedagogical evolution across academic terms.",
    domain: "Cognitive Intelligence",
    subCompetency: "Reflective Practice",
    itemType: "scenario"
  },
  // Problem Solving
  {
    id: 13,
    text: "When faced with persistent attendance or disengagement issues in a subgroup of learners, I collaborate to uncover root environmental causes rather than applying generic penalties.",
    domain: "Cognitive Intelligence",
    subCompetency: "Problem Solving",
    itemType: "scenario"
  },
  {
    id: 14,
    text: "If classroom resources or lab equipment are unexpectedly limited, I design innovative low-cost alternatives that achieve the exact same learning outcomes.",
    domain: "Cognitive Intelligence",
    subCompetency: "Problem Solving",
    itemType: "scenario"
  },
  {
    id: 15,
    text: "When a recurring scheduling conflict disrupts instructional minutes, I redesign classroom transitions to recover productive learning time.",
    domain: "Cognitive Intelligence",
    subCompetency: "Problem Solving",
    itemType: "scenario"
  },
  {
    id: 16,
    text: "I approach unexpected classroom bottlenecks as diagnostic design challenges rather than disciplinary failures.",
    domain: "Cognitive Intelligence",
    subCompetency: "Problem Solving",
    itemType: "scenario"
  },
  // Strategic Thinking
  {
    id: 17,
    text: "At the beginning of the semester, I map out backwards-designed unit milestones that connect daily lessons to end-of-year real-world competencies.",
    domain: "Cognitive Intelligence",
    subCompetency: "Strategic Thinking",
    itemType: "scenario"
  },
  {
    id: 18,
    text: "I anticipate potential cognitive misconceptions in upcoming lessons and embed targeted pre-assessments to disarm them proactively.",
    domain: "Cognitive Intelligence",
    subCompetency: "Strategic Thinking",
    itemType: "scenario"
  },
  {
    id: 19,
    text: "When preparing students for major examinations, I balance short-term test strategy with long-term conceptual retention.",
    domain: "Cognitive Intelligence",
    subCompetency: "Strategic Thinking",
    itemType: "scenario"
  },
  {
    id: 20,
    text: "I structure multi-week group projects with intermediate checkpoints to prevent procrastination and ensure equitable team contribution.",
    domain: "Cognitive Intelligence",
    subCompetency: "Strategic Thinking",
    itemType: "scenario"
  },
  // Adaptability
  {
    id: 21,
    text: "When teaching a concept that fails to resonate with tactile learners, I spontaneously shift to a physical or spatial modeling activity.",
    domain: "Cognitive Intelligence",
    subCompetency: "Adaptability",
    itemType: "scenario"
  },
  {
    id: 22,
    text: "I comfortably adjust my instructional tone and vocabulary when transitioning between introductory support groups and advanced inquiry cohorts.",
    domain: "Cognitive Intelligence",
    subCompetency: "Adaptability",
    itemType: "scenario"
  },
  {
    id: 23,
    text: "When institutional policies or schedules shift mid-year, I re-align my classroom routines quickly while maintaining student stability.",
    domain: "Cognitive Intelligence",
    subCompetency: "Adaptability",
    itemType: "scenario"
  },
  {
    id: 24,
    text: "I embrace constructive feedback from instructional coaches and immediately integrate suggested pedagogical adjustments into my next lesson.",
    domain: "Cognitive Intelligence",
    subCompetency: "Adaptability",
    itemType: "scenario"
  },

  // ─── DOMAIN 2: INSTRUCTIONAL INTELLIGENCE (Questions 25 - 48) ─────────────────
  // Differentiated Instruction
  {
    id: 25,
    text: "When introducing a rigorous new topic, I provide tiered reading selections and scaffolded graphic organizers so all learners access core ideas.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  {
    id: 26,
    text: "I use flexible grouping strategies that rotate students between homogeneous skill-building pods and heterogeneous discussion teams based on current needs.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  {
    id: 27,
    text: "I allow students multiple pathways to demonstrate mastery (e.g., analytical essay, multimedia presentation, interactive prototype) aligned to rubric criteria.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  {
    id: 28,
    text: "I proactively modify lesson complexity for neurodivergent learners without diluting the underlying intellectual challenge.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  // Formative Assessment
  {
    id: 29,
    text: "I embed quick 2-minute diagnostic checks (such as exit tickets or digital polls) daily to measure comprehension before moving to independent practice.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },
  {
    id: 30,
    text: "When a formative assessment reveals split understanding across the room, I immediately form a small intervention group while peers work on enrichment tasks.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },
  {
    id: 31,
    text: "I use student error patterns in quizzes as diagnostic clues to improve my future instructional modeling.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },
  {
    id: 32,
    text: "I train students to use self-assessment rubrics so they can accurately identify their own learning gaps before submitting work.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },
  // Feedback
  {
    id: 33,
    text: "I ensure my feedback focuses on actionable next steps and specific strategy adjustments rather than general praise or critique.",
    domain: "Instructional Intelligence",
    subCompetency: "Feedback",
    itemType: "scenario"
  },
  {
    id: 34,
    text: "I provide prompt feedback within 48 hours on formative assignments so students can apply corrections while the task context is fresh.",
    domain: "Instructional Intelligence",
    subCompetency: "Feedback",
    itemType: "scenario"
  },
  {
    id: 35,
    text: "During one-on-one conferences, I ask students to explain their reasoning aloud before offering corrective feedback.",
    domain: "Instructional Intelligence",
    subCompetency: "Feedback",
    itemType: "scenario"
  },
  {
    id: 36,
    text: "I design structured peer-feedback protocols that enable students to critique each other's drafts constructively and kindly.",
    domain: "Instructional Intelligence",
    subCompetency: "Feedback",
    itemType: "scenario"
  },
  // Questioning Techniques
  {
    id: 37,
    text: "I use intentional wait time (at least 3-5 seconds) after asking complex analytical questions to encourage thoughtful participation from quieter students.",
    domain: "Instructional Intelligence",
    subCompetency: "Questioning Techniques",
    itemType: "scenario"
  },
  {
    id: 38,
    text: "When a student gives an incomplete answer, I use probing follow-up questions ('What evidence led you to that conclusion?') rather than jumping to correct them.",
    domain: "Instructional Intelligence",
    subCompetency: "Questioning Techniques",
    itemType: "scenario"
  },
  {
    id: 39,
    text: "I sequence classroom discussions using Socratic questioning to guide students toward discovering underlying themes themselves.",
    domain: "Instructional Intelligence",
    subCompetency: "Questioning Techniques",
    itemType: "scenario"
  },
  {
    id: 40,
    text: "I balance convergent recall questions with divergent open-ended inquiries that admit multiple defensible viewpoints.",
    domain: "Instructional Intelligence",
    subCompetency: "Questioning Techniques",
    itemType: "scenario"
  },
  // Curriculum Alignment
  {
    id: 41,
    text: "I verify that every instructional activity and homework assignment maps explicitly to national or institutional learning standards.",
    domain: "Instructional Intelligence",
    subCompetency: "Curriculum Alignment",
    itemType: "scenario"
  },
  {
    id: 42,
    text: "When adapting textbook chapters, I prune non-essential trivia to preserve instructional focus on core conceptual standards.",
    domain: "Instructional Intelligence",
    subCompetency: "Curriculum Alignment",
    itemType: "scenario"
  },
  {
    id: 43,
    text: "I collaborate with colleagues across grade levels to ensure vertical articulation and prevent curriculum redundancy.",
    domain: "Instructional Intelligence",
    subCompetency: "Curriculum Alignment",
    itemType: "scenario"
  },
  {
    id: 44,
    text: "I integrate interdisciplinary literacy and numeracy standards into my subject domain instruction intentionally.",
    domain: "Instructional Intelligence",
    subCompetency: "Curriculum Alignment",
    itemType: "scenario"
  },
  // Learning Transfer
  {
    id: 45,
    text: "I design performance tasks that require students to apply theoretical concepts to solve authentic community or workplace problems.",
    domain: "Instructional Intelligence",
    subCompetency: "Learning Transfer",
    itemType: "scenario"
  },
  {
    id: 46,
    text: "I use explicit analogies and contrasting cases to help students recognize how a strategy learned in one context transfers to unfamiliar problems.",
    domain: "Instructional Intelligence",
    subCompetency: "Learning Transfer",
    itemType: "scenario"
  },
  {
    id: 47,
    text: "I encourage metacognitive reflection by asking students to explain how they would use today's learning outside of school.",
    domain: "Instructional Intelligence",
    subCompetency: "Learning Transfer",
    itemType: "scenario"
  },
  {
    id: 48,
    text: "I incorporate authentic artifacts and real-world datasets into classroom practice so learning feels immediately functional.",
    domain: "Instructional Intelligence",
    subCompetency: "Learning Transfer",
    itemType: "scenario"
  },

  // ─── DOMAIN 3: CLASSROOM LEADERSHIP (Questions 49 - 72) ────────────────────────
  // Classroom Management
  {
    id: 49,
    text: "I establish clear, transparent classroom routines and transitions on day one so that learning time is maximized without continuous prompting.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Management",
    itemType: "scenario"
  },
  {
    id: 50,
    text: "When low-level chatter occurs during independent work, I use subtle non-verbal proximity cues rather than interrupting the entire class.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Management",
    itemType: "scenario"
  },
  {
    id: 51,
    text: "I organize physical classroom space and material distribution so students can access learning tools autonomously.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Management",
    itemType: "scenario"
  },
  {
    id: 52,
    text: "I maintain consistent, fair expectations for classroom behavior across all activities and times of day.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Management",
    itemType: "scenario"
  },
  // Behaviour Management
  {
    id: 53,
    text: "When a student exhibits emotional dysregulation or defiance, I de-escalate with calm dignity rather than engaging in a power struggle.",
    domain: "Classroom Leadership",
    subCompetency: "Behaviour Management",
    itemType: "scenario"
  },
  {
    id: 54,
    text: "I use restorative justice conversations to help students understand the impact of their actions on the classroom community.",
    domain: "Classroom Leadership",
    subCompetency: "Behaviour Management",
    itemType: "scenario"
  },
  {
    id: 55,
    text: "I distinguish between malicious misbehavior and skill deficits, providing behavioral coaching where executive function is lacking.",
    domain: "Classroom Leadership",
    subCompetency: "Behaviour Management",
    itemType: "scenario"
  },
  {
    id: 56,
    text: "I celebrate positive behavioral improvements privately and publicly to reinforce constructive classroom norms.",
    domain: "Classroom Leadership",
    subCompetency: "Behaviour Management",
    itemType: "scenario"
  },
  // Learner Motivation
  {
    id: 57,
    text: "I foster intrinsic motivation by giving students meaningful autonomy over topic selection or product formats in key assignments.",
    domain: "Classroom Leadership",
    subCompetency: "Learner Motivation",
    itemType: "scenario"
  },
  {
    id: 58,
    text: "When students show Signs of learned helplessness, I use micro-success scaffolding to rebuild their academic self-efficacy.",
    domain: "Classroom Leadership",
    subCompetency: "Learner Motivation",
    itemType: "scenario"
  },
  {
    id: 59,
    text: "I explicitly connect daily effort to personal growth rather than innate intellectual talent.",
    domain: "Classroom Leadership",
    subCompetency: "Learner Motivation",
    itemType: "scenario"
  },
  {
    id: 60,
    text: "I create an environment where intellectual curiosity is celebrated even when student hypotheses prove incorrect.",
    domain: "Classroom Leadership",
    subCompetency: "Learner Motivation",
    itemType: "scenario"
  },
  // Positive Classroom Culture
  {
    id: 61,
    text: "I cultivate psychological safety so students feel comfortable asking questions or making mistakes without fear of embarrassment.",
    domain: "Classroom Leadership",
    subCompetency: "Positive Classroom Culture",
    itemType: "scenario"
  },
  {
    id: 62,
    text: "I build structured peer-celebration rituals where students regularly recognize each other's kindness and academic effort.",
    domain: "Classroom Leadership",
    subCompetency: "Positive Classroom Culture",
    itemType: "scenario"
  },
  {
    id: 63,
    text: "I greet students at the door warmly each day to establish a supportive, welcoming relational atmosphere.",
    domain: "Classroom Leadership",
    subCompetency: "Positive Classroom Culture",
    itemType: "scenario"
  },
  {
    id: 64,
    text: "I address microaggressions or unkind humor immediately and constructively to protect community belonging.",
    domain: "Classroom Leadership",
    subCompetency: "Positive Classroom Culture",
    itemType: "scenario"
  },
  // Inclusive Leadership
  {
    id: 65,
    text: "I ensure every student's cultural background and lived experience is positively reflected in classroom displays and discussion prompts.",
    domain: "Classroom Leadership",
    subCompetency: "Inclusive Leadership",
    itemType: "scenario"
  },
  {
    id: 66,
    text: "I actively monitor classroom discussion participation to ensure quiet or marginalized voices are invited into the dialogue.",
    domain: "Classroom Leadership",
    subCompetency: "Inclusive Leadership",
    itemType: "scenario"
  },
  {
    id: 67,
    text: "I adapt leadership styles to support students with diverse sensory, physical, or neurodevelopmental requirements.",
    domain: "Classroom Leadership",
    subCompetency: "Inclusive Leadership",
    itemType: "scenario"
  },
  {
    id: 68,
    text: "I partner with special education coordinators to ensure full classroom equity and inclusion for IEP learners.",
    domain: "Classroom Leadership",
    subCompetency: "Inclusive Leadership",
    itemType: "scenario"
  },
  // Leadership Under Pressure
  {
    id: 69,
    text: "When an unexpected school emergency or crisis alert occurs, I maintain composure to anchor student anxiety and ensure safety.",
    domain: "Classroom Leadership",
    subCompetency: "Leadership Under Pressure",
    itemType: "scenario"
  },
  {
    id: 70,
    text: "During intense exam periods or institutional audits, I protect classroom culture from stress leakage by keeping routines positive.",
    domain: "Classroom Leadership",
    subCompetency: "Leadership Under Pressure",
    itemType: "scenario"
  },
  {
    id: 71,
    text: "When facing heavy grading backlogs, I prioritize quality formative feedback over administrative perfection.",
    domain: "Classroom Leadership",
    subCompetency: "Leadership Under Pressure",
    itemType: "scenario"
  },
  {
    id: 72,
    text: "I navigate emotionally charged parent or guardian conferences with professional poise and empathetic boundaries.",
    domain: "Classroom Leadership",
    subCompetency: "Leadership Under Pressure",
    itemType: "scenario"
  },

  // ─── DOMAIN 4: RELATIONSHIP INTELLIGENCE (Questions 73 - 96) ──────────────────
  // Empathy
  {
    id: 73,
    text: "When a student's academic performance suddenly drops, I initiate a private check-in to understand underlying personal or family factors.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  {
    id: 74,
    text: "I listen actively to student grievances without defensiveness, acknowledging their emotional experience before discussing rules.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  {
    id: 75,
    text: "I remember personal details about my students' interests and milestones, referring to them to build trust and rapport.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  {
    id: 76,
    text: "I demonstrate compassionate patience when students experience anxiety over public speaking or test taking.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  // Inclusive Communication
  {
    id: 77,
    text: "I use clear, jargon-free communication when messaging families from diverse linguistic and socio-economic backgrounds.",
    domain: "Relationship Intelligence",
    subCompetency: "Inclusive Communication",
    itemType: "scenario"
  },
  {
    id: 78,
    text: "I ensure my non-verbal body language conveys openness and respect across all student interactions.",
    domain: "Relationship Intelligence",
    subCompetency: "Inclusive Communication",
    itemType: "scenario"
  },
  {
    id: 79,
    text: "I provide multiple communication channels (email, phone, digital portals) so families can engage comfortably.",
    domain: "Relationship Intelligence",
    subCompetency: "Inclusive Communication",
    itemType: "scenario"
  },
  {
    id: 80,
    text: "I validate bilingual and multilingual students' home languages as intellectual strengths rather than barriers.",
    domain: "Relationship Intelligence",
    subCompetency: "Inclusive Communication",
    itemType: "scenario"
  },
  // Collaboration
  {
    id: 81,
    text: "I actively share effective lesson resources and instructional strategies with departmental colleagues without hesitation.",
    domain: "Relationship Intelligence",
    subCompetency: "Collaboration",
    itemType: "scenario"
  },
  {
    id: 82,
    text: "During grade-level team meetings, I contribute constructive solutions and support joint curriculum initiatives.",
    domain: "Relationship Intelligence",
    subCompetency: "Collaboration",
    itemType: "scenario"
  },
  {
    id: 83,
    text: "I invite peer observation and welcome collaborative planning to improve instructional cohesion across the school.",
    domain: "Relationship Intelligence",
    subCompetency: "Collaboration",
    itemType: "scenario"
  },
  {
    id: 84,
    text: "I partner effectively with school counselors and learning support specialists to coordinate wrap-around student support.",
    domain: "Relationship Intelligence",
    subCompetency: "Collaboration",
    itemType: "scenario"
  },
  // Family Engagement
  {
    id: 85,
    text: "I contact parents and guardians early in the semester to share positive student achievements before any academic concerns arise.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },
  {
    id: 86,
    text: "When meeting with parents about behavioral or academic challenges, I frame the conversation around shared problem-solving.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },
  {
    id: 87,
    text: "I provide families with practical, home-friendly strategies to support their children's learning outside school hours.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },
  {
    id: 88,
    text: "I respect diverse family structures and cultural schedules when organizing parent-teacher check-ins.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },
  // Conflict Resolution
  {
    id: 89,
    text: "When disagreements occur between students during group projects, I facilitate restorative dialogue that teaches conflict negotiation.",
    domain: "Relationship Intelligence",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 90,
    text: "If a misunderstanding arises with a colleague, I address it calmly in a private 1-on-1 discussion to restore professional trust.",
    domain: "Relationship Intelligence",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 91,
    text: "I model calm de-escalation vocabulary when tension elevates during heated classroom debates.",
    domain: "Relationship Intelligence",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 92,
    text: "I separate personal ego from professional conflict, focusing exclusively on student well-being and mutual resolution.",
    domain: "Relationship Intelligence",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  // Respect for Diversity
  {
    id: 93,
    text: "I actively inspect my curriculum for culturally diverse voices and perspectives across historical, scientific, and literary themes.",
    domain: "Relationship Intelligence",
    subCompetency: "Respect for Diversity",
    itemType: "scenario"
  },
  {
    id: 94,
    text: "I ensure students from all racial, religious, and socio-economic backgrounds feel equal ownership of our classroom community.",
    domain: "Relationship Intelligence",
    subCompetency: "Respect for Diversity",
    itemType: "scenario"
  },
  {
    id: 95,
    text: "I challenge stereotypes respectfully whenever they surface in textbook materials or casual student conversations.",
    domain: "Relationship Intelligence",
    subCompetency: "Respect for Diversity",
    itemType: "scenario"
  },
  {
    id: 96,
    text: "I celebrate cultural heritage months and inclusive milestones through authentic learning activities rather than superficial gestures.",
    domain: "Relationship Intelligence",
    subCompetency: "Respect for Diversity",
    itemType: "scenario"
  },

  // ─── DOMAIN 5: PROFESSIONAL INTELLIGENCE (Questions 97 - 100 + 20 PREF ITEMS = 24 items total)
  // Professional Ethics
  {
    id: 97,
    text: "I strictly safeguard student confidentiality across all grading, disciplinary records, and conversational exchanges with external parties.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },
  {
    id: 98,
    text: "I uphold academic integrity standards transparently, modeling honest attribution and ethical scholarship in all presentations.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },
  {
    id: 99,
    text: "I report any student safety, protection, or equity concerns immediately in accordance with institutional policy and ethical duty.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },
  {
    id: 100,
    text: "I treat all students with impartial fairness regardless of personal affinity, family background, or previous academic record.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },

  // ─── 20 COGNITIVE PREFERENCE ITEMS (Questions 101 - 120) ──────────────────────
  // Identifying natural cognitive tendencies and working styles
  {
    id: 101,
    text: "I prefer mapping out detailed semester lesson plans well in advance rather than improvising week-to-week.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "preference"
  },
  {
    id: 102,
    text: "When implementing new educational research, I prefer to test small pilot iterations before adopting whole-unit changes.",
    domain: "Professional Intelligence",
    subCompetency: "Innovation",
    itemType: "preference"
  },
  {
    id: 103,
    text: "In faculty committee work, I naturally step up to coordinate timelines, agendas, and consensus building.",
    domain: "Professional Intelligence",
    subCompetency: "Educational Leadership",
    itemType: "preference"
  },
  {
    id: 104,
    text: "I learn best by observing peer teachers demonstrate techniques in real classrooms rather than reading theoretical manuals.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "preference"
  },
  {
    id: 105,
    text: "I am energized by testing emerging educational technologies and AI tools even if they require troubleshooting.",
    domain: "Professional Intelligence",
    subCompetency: "Innovation",
    itemType: "preference"
  },
  {
    id: 106,
    text: "When mentoring junior teachers, I focus on building their self-reflection and confidence rather than prescribing rules.",
    domain: "Professional Intelligence",
    subCompetency: "Coaching and Mentoring",
    itemType: "preference"
  },
  {
    id: 107,
    text: "I prefer open, collaborative communication channels where team members share works-in-progress continuously.",
    domain: "Professional Intelligence",
    subCompetency: "Coaching and Mentoring",
    itemType: "preference"
  },
  {
    id: 108,
    text: "When institutional change occurs, I look for strategic opportunities to innovate rather than resisting new protocols.",
    domain: "Professional Intelligence",
    subCompetency: "Change Management",
    itemType: "preference"
  },
  {
    id: 109,
    text: "I regularly seek out professional development workshops, webinars, or literature to expand my pedagogical repertoire.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "preference"
  },
  {
    id: 110,
    text: "I am willing to take calculated pedagogical risks with new project designs if they promise deeper student engagement.",
    domain: "Professional Intelligence",
    subCompetency: "Innovation",
    itemType: "preference"
  },
  {
    id: 111,
    text: "I prefer structured, data-informed discussions during professional learning community (PLC) sessions.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "preference"
  },
  {
    id: 112,
    text: "When guiding school-wide initiatives, I prioritize consensus and empathetic listening over executive mandates.",
    domain: "Professional Intelligence",
    subCompetency: "Educational Leadership",
    itemType: "preference"
  },
  {
    id: 113,
    text: "I actively participate in professional education networks to share insights across schools and communities.",
    domain: "Professional Intelligence",
    subCompetency: "Educational Leadership",
    itemType: "preference"
  },
  {
    id: 114,
    text: "I view teacher evaluation observations as collaborative coaching opportunities rather than judgmental inspections.",
    domain: "Professional Intelligence",
    subCompetency: "Coaching and Mentoring",
    itemType: "preference"
  },
  {
    id: 115,
    text: "When managing curriculum transitions, I create clear milestones so peers feel supported throughout the change.",
    domain: "Professional Intelligence",
    subCompetency: "Change Management",
    itemType: "preference"
  },
  {
    id: 116,
    text: "I reflect on my own cognitive biases regularly to ensure my grading rubrics remain completely objective.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "preference"
  },
  {
    id: 117,
    text: "I encourage fellow teachers to celebrate pedagogical experiments that didn't go as planned as valuable learning moments.",
    domain: "Professional Intelligence",
    subCompetency: "Innovation",
    itemType: "preference"
  },
  {
    id: 118,
    text: "I dedicate regular time each month to updating my teaching methods based on modern neuroscience and educational psychology.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "preference"
  },
  {
    id: 119,
    text: "I willingly mentor student-teachers or new faculty members to contribute to the growth of the teaching profession.",
    domain: "Professional Intelligence",
    subCompetency: "Coaching and Mentoring",
    itemType: "preference"
  },
  {
    id: 120,
    text: "I advocate constructively for teacher wellness and resource equity within school leadership forums.",
    domain: "Professional Intelligence",
    subCompetency: "Educational Leadership",
    itemType: "preference"
  }
];

export const jtiaDomainDescriptions: Record<JTIADomain, {
  title: string;
  description: string;
  color: string;
  subCompetencies: string[];
}> = {
  "Cognitive Intelligence": {
    title: "Cognitive Intelligence",
    description: "Measures how teachers think, analyse information, solve problems, adapt to changing situations, and make professional decisions.",
    color: "hsl(var(--chart-1))",
    subCompetencies: [
      "Critical Thinking",
      "Decision Making",
      "Reflective Practice",
      "Problem Solving",
      "Strategic Thinking",
      "Adaptability"
    ]
  },
  "Instructional Intelligence": {
    title: "Instructional Intelligence",
    description: "Measures the ability to design, deliver and assess effective learning experiences.",
    color: "hsl(var(--chart-2))",
    subCompetencies: [
      "Differentiated Instruction",
      "Formative Assessment",
      "Feedback",
      "Questioning Techniques",
      "Curriculum Alignment",
      "Learning Transfer"
    ]
  },
  "Classroom Leadership": {
    title: "Classroom Leadership",
    description: "Measures how teachers create productive, safe and engaging learning environments.",
    color: "hsl(var(--chart-3))",
    subCompetencies: [
      "Classroom Management",
      "Behaviour Management",
      "Learner Motivation",
      "Positive Classroom Culture",
      "Inclusive Leadership",
      "Leadership Under Pressure"
    ]
  },
  "Relationship Intelligence": {
    title: "Relationship Intelligence",
    description: "Measures interpersonal effectiveness and the ability to build trust, collaboration and belonging.",
    color: "hsl(var(--chart-4))",
    subCompetencies: [
      "Empathy",
      "Inclusive Communication",
      "Collaboration",
      "Family Engagement",
      "Conflict Resolution",
      "Respect for Diversity"
    ]
  },
  "Professional Intelligence": {
    title: "Professional Intelligence",
    description: "Measures professional behaviours that influence long-term effectiveness and leadership.",
    color: "hsl(var(--chart-5))",
    subCompetencies: [
      "Professional Ethics",
      "Continuous Learning",
      "Innovation",
      "Coaching and Mentoring",
      "Change Management",
      "Educational Leadership"
    ]
  }
};

/**
 * Get the full master JTIA question bank (Core 120 + Expanded Item Bank 120 = 240 items)
 */
export function getFullJTIAQuestionBank(): JTIAQuestion[] {
  return [...jtiaQuestions, ...jtiaExpandedItemBank];
}

/**
 * Generate a randomized, domain-balanced JTIA assessment session.
 * - Groups questions by domain (Cognitive, Instructional, Classroom Leadership, Relationship, Professional Intelligence)
 * - Uses Fisher-Yates shuffle to randomize items within each domain
 * - Selects an equal number of items per domain (default: 24 per domain = 120 questions)
 */
export function getShuffledJTIAQuestionSet(options?: {
  countPerDomain?: number;
  totalQuestions?: number;
  useFullBank?: boolean;
}): JTIAQuestion[] {
  const { countPerDomain, totalQuestions = 120, useFullBank = true } = options || {};
  const sourceBank = useFullBank ? getFullJTIAQuestionBank() : jtiaQuestions;

  const domains: JTIADomain[] = [
    "Cognitive Intelligence",
    "Instructional Intelligence",
    "Classroom Leadership",
    "Relationship Intelligence",
    "Professional Intelligence"
  ];

  let itemsPerDomain = countPerDomain || Math.floor(totalQuestions / domains.length);
  if (itemsPerDomain < 2) itemsPerDomain = 2;

  const shuffledSession: JTIAQuestion[] = [];

  domains.forEach((domain, idx) => {
    // If totalQuestions is e.g. 12, distribute 3, 3, 2, 2, 2
    let domainTarget = itemsPerDomain;
    if (totalQuestions === 12) {
      domainTarget = idx < 2 ? 3 : 2;
    }

    const domainQuestions = sourceBank.filter(q => q.domain === domain);
    const shuffled = [...domainQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    shuffledSession.push(...shuffled.slice(0, domainTarget));
  });

  return shuffledSession;
}

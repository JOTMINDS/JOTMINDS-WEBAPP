import { JTIAQuestion } from './jtiaQuestions';

/**
 * JTIA Expanded Master Item Bank (Assessment Version 2.0 Expansion Bank)
 * 
 * Developer Metadata:
 * - Status: Developer-Ready Drafts for Implementation, Expert Review, and Psychometric Calibration.
 * - Competencies Covered:
 *   1. Cognitive Intelligence: Analytical Thinking, Critical Thinking, Adaptive Thinking, Creative Thinking,
 *      Reflective Practice, Decision-Making, Problem Solving, Systems Thinking, Data Interpretation, Strategic Thinking.
 *   2. Classroom Leadership: Classroom Management, Behaviour Management, Student Motivation, Classroom Presence,
 *      Time & Learning Management, Conflict Resolution, Positive Classroom Culture, Inclusive Leadership,
 *      Expectations & Accountability, Leadership Under Pressure.
 *   3. Instructional Intelligence: Differentiated Instruction, Formative Assessment, Feedback, Questioning Techniques,
 *      Curriculum Alignment, Learning Transfer.
 *   4. Relationship Intelligence: Empathy, Inclusive Communication, Collaboration, Family Engagement,
 *      Conflict Resolution, Respect for Diversity.
 *   5. Professional Intelligence: Professional Ethics, Continuous Learning, Innovation, Coaching and Mentoring,
 *      Change Management, Educational Leadership.
 */

export const jtiaExpandedItemBank: JTIAQuestion[] = [
  // ─── DOMAIN 1: COGNITIVE INTELLIGENCE (Expanded Items 201 - 230) ────────────────────
  // Analytical Thinking
  {
    id: 201,
    text: "When evaluating a new grade-level reading curriculum, I break down student literacy metrics across phonetic decoding and reading comprehension before deciding on intervention groups.",
    domain: "Cognitive Intelligence",
    subCompetency: "Analytical Thinking",
    itemType: "scenario",
    scenarioContext: "Curriculum evaluation under varying student literacy profiles."
  },
  {
    id: 202,
    text: "When classroom test scores decline suddenly after a holiday break, I systematically isolate variables such as attendance, test difficulty, and instructional pacing to identify the root cause.",
    domain: "Cognitive Intelligence",
    subCompetency: "Analytical Thinking",
    itemType: "scenario"
  },
  {
    id: 203,
    text: "Before introducing a complex science experiment, I deconstruct each step to identify potential cognitive bottlenecks where neurodivergent learners might experience overload.",
    domain: "Cognitive Intelligence",
    subCompetency: "Analytical Thinking",
    itemType: "scenario"
  },
  // Critical Thinking
  {
    id: 204,
    text: "When departmental guidelines recommend an instructional strategy that conflicts with recent educational research, I bring empirical classroom evidence to the next faculty meeting for debate.",
    domain: "Cognitive Intelligence",
    subCompetency: "Critical Thinking",
    itemType: "scenario"
  },
  {
    id: 205,
    text: "I regularly challenge my own assumptions about which students are 'high-achieving' by auditing classroom participation patterns and formative assessment rubrics.",
    domain: "Cognitive Intelligence",
    subCompetency: "Critical Thinking",
    itemType: "scenario"
  },
  {
    id: 206,
    text: "When analyzing educational technology software for my classroom, I independently evaluate the pedagogical claims rather than relying solely on publisher marketing metrics.",
    domain: "Cognitive Intelligence",
    subCompetency: "Critical Thinking",
    itemType: "scenario"
  },
  // Adaptive Thinking
  {
    id: 207,
    text: "When a planned digital presentation fails due to a school-wide internet outage, I seamlessly transition my lesson into an interactive white-board seminar without losing instructional momentum.",
    domain: "Cognitive Intelligence",
    subCompetency: "Adaptive Thinking",
    itemType: "scenario"
  },
  {
    id: 208,
    text: "If a class discussion moves toward an unexpected but academically valuable real-world connection, I adjust my lesson plan in real-time to capitalize on student curiosity.",
    domain: "Cognitive Intelligence",
    subCompetency: "Adaptive Thinking",
    itemType: "scenario"
  },
  {
    id: 209,
    text: "When teaching a concept to an inclusion class with varied readiness levels, I switch between three different explanations and metaphors until every subgroup demonstrates mastery.",
    domain: "Cognitive Intelligence",
    subCompetency: "Adaptive Thinking",
    itemType: "scenario"
  },
  // Creative Thinking
  {
    id: 210,
    text: "To help students grasp abstract algebraic or grammar rules, I invent interactive classroom analogies that connect mathematical logic to popular music or games.",
    domain: "Cognitive Intelligence",
    subCompetency: "Creative Thinking",
    itemType: "scenario"
  },
  {
    id: 211,
    text: "When school budget restrictions limit hands-on laboratory supplies, I design low-cost simulation activities using everyday classroom items that deliver identical learning outcomes.",
    domain: "Cognitive Intelligence",
    subCompetency: "Creative Thinking",
    itemType: "scenario"
  },
  {
    id: 212,
    text: "I encourage students to express their mastery of historical events through multi-modal formats such as podcasts, graphic novels, or theatrical debates.",
    domain: "Cognitive Intelligence",
    subCompetency: "Creative Thinking",
    itemType: "scenario"
  },
  // Reflective Practice
  {
    id: 213,
    text: "After delivering a unit assessment, I examine the specific questions where students struggled most to determine whether my explanation or the assessment wording caused the difficulty.",
    domain: "Cognitive Intelligence",
    subCompetency: "Reflective Practice",
    itemType: "scenario"
  },
  {
    id: 214,
    text: "I maintain a weekly professional teaching log where I document one lesson that succeeded and one lesson that underperformed, identifying specific adjustments for future semesters.",
    domain: "Cognitive Intelligence",
    subCompetency: "Reflective Practice",
    itemType: "scenario"
  },
  {
    id: 215,
    text: "I actively seek informal peer observation feedback from colleagues outside my department to uncover blind spots in my questioning techniques.",
    domain: "Cognitive Intelligence",
    subCompetency: "Reflective Practice",
    itemType: "scenario"
  },
  // Decision-Making
  {
    id: 216,
    text: "When choosing between covering the remaining chapters of a textbook or deepening understanding of a foundational topic, I prioritize mastery of core competencies over pacing checklists.",
    domain: "Cognitive Intelligence",
    subCompetency: "Decision-Making",
    itemType: "scenario"
  },
  {
    id: 217,
    text: "When two students present conflicting accounts of a classroom incident, I suspend judgment and gather calm observations before deciding on a restorative intervention.",
    domain: "Cognitive Intelligence",
    subCompetency: "Decision-Making",
    itemType: "scenario"
  },
  {
    id: 218,
    text: "I use clear, transparent criteria when assigning roles for group projects so that every student has an equitable opportunity to develop leadership skills.",
    domain: "Cognitive Intelligence",
    subCompetency: "Decision-Making",
    itemType: "scenario"
  },
  // Problem Solving
  {
    id: 219,
    text: "When an experienced student consistently disrupts group tasks out of boredom, I co-create an advanced challenge track that channels their energy into peer mentorship.",
    domain: "Cognitive Intelligence",
    subCompetency: "Problem Solving",
    itemType: "scenario"
  },
  {
    id: 220,
    text: "When homework completion rates drop significantly in my class, I survey students on their home learning environments and redesign assignments to be achievable in 15-minute intervals.",
    domain: "Cognitive Intelligence",
    subCompetency: "Problem Solving",
    itemType: "scenario"
  },
  {
    id: 221,
    text: "When classroom technology consistently fails during transition periods, I establish a reliable low-tech backup protocol so lesson momentum is never disrupted.",
    domain: "Cognitive Intelligence",
    subCompetency: "Problem Solving",
    itemType: "scenario"
  },
  // Systems Thinking
  {
    id: 222,
    text: "I coordinate my science curriculum milestones with the mathematics department so that students learn statistical graphing skills just before our lab report unit.",
    domain: "Cognitive Intelligence",
    subCompetency: "Systems Thinking",
    itemType: "scenario"
  },
  {
    id: 223,
    text: "When addressing recurring hallway discipline issues, I analyze school-wide bell schedules and student traffic flow rather than treating individual incidents in isolation.",
    domain: "Cognitive Intelligence",
    subCompetency: "Systems Thinking",
    itemType: "scenario"
  },
  {
    id: 224,
    text: "I view student classroom engagement as an interconnected ecosystem involving home support, classroom culture, and instructional clarity.",
    domain: "Cognitive Intelligence",
    subCompetency: "Systems Thinking",
    itemType: "scenario"
  },
  // Data Interpretation
  {
    id: 225,
    text: "I triangulate standardized exam results with daily exit tickets and classroom discussion contributions to form a holistic profile of each learner.",
    domain: "Cognitive Intelligence",
    subCompetency: "Data Interpretation",
    itemType: "scenario"
  },
  {
    id: 226,
    text: "When reading assessment score reports, I look beyond the class average to identify standard deviation spreads and subgroup performance trends.",
    domain: "Cognitive Intelligence",
    subCompetency: "Data Interpretation",
    itemType: "scenario"
  },
  {
    id: 227,
    text: "I use longitudinal attendance and submission data to proactively identify students at risk of falling behind before their grades drop.",
    domain: "Cognitive Intelligence",
    subCompetency: "Data Interpretation",
    itemType: "scenario"
  },
  // Strategic Thinking
  {
    id: 228,
    text: "I map my semester learning outcomes against real-world problem solving competencies so that students understand how classroom skills transfer to future careers.",
    domain: "Cognitive Intelligence",
    subCompetency: "Strategic Thinking",
    itemType: "scenario"
  },
  {
    id: 229,
    text: "When planning my professional development goals for the school year, I choose training areas that directly address my school's multi-year strategic improvement plan.",
    domain: "Cognitive Intelligence",
    subCompetency: "Strategic Thinking",
    itemType: "scenario"
  },
  {
    id: 230,
    text: "I structure unit timelines with built-in buffer days for review and reteaching, ensuring that core concepts are mastered before end-of-year exams.",
    domain: "Cognitive Intelligence",
    subCompetency: "Strategic Thinking",
    itemType: "scenario"
  },

  // ─── DOMAIN 2: CLASSROOM LEADERSHIP (Expanded Items 231 - 260) ────────────────────
  // Classroom Management
  {
    id: 231,
    text: "I establish clear, student-generated classroom norms during the first week of school so that learners feel personal ownership over our learning environment.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Management",
    itemType: "scenario"
  },
  {
    id: 232,
    text: "I use subtle, non-verbal cues and physical proximity to redirect off-task behaviour without interrupting the flow of direct instruction.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Management",
    itemType: "scenario"
  },
  {
    id: 233,
    text: "My classroom transitions between independent work, small groups, and whole-class discussions are practiced until they take under 60 seconds.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Management",
    itemType: "scenario"
  },
  // Behaviour Management
  {
    id: 234,
    text: "When a student exhibits defiant behaviour, I separate the behaviour from the student's dignity, addressing the issue privately rather than in front of peers.",
    domain: "Classroom Leadership",
    subCompetency: "Behaviour Management",
    itemType: "scenario"
  },
  {
    id: 235,
    text: "I use positive behavioural reinforcement, specifically praising effort and collaborative conduct to model expectations for the rest of the class.",
    domain: "Classroom Leadership",
    subCompetency: "Behaviour Management",
    itemType: "scenario"
  },
  {
    id: 236,
    text: "When a classroom rule is broken, I ensure consequences are logical, predictable, and focused on repairing harm rather than punitive retaliation.",
    domain: "Classroom Leadership",
    subCompetency: "Behaviour Management",
    itemType: "scenario"
  },
  // Student Motivation
  {
    id: 237,
    text: "I design project rubrics that allow students choice in how they demonstrate mastery, tapping into intrinsic motivation and personal interests.",
    domain: "Classroom Leadership",
    subCompetency: "Student Motivation",
    itemType: "scenario"
  },
  {
    id: 238,
    text: "I celebrate incremental progress and effort growth rather than only high final test scores, building a growth mindset across all achievement tiers.",
    domain: "Classroom Leadership",
    subCompetency: "Student Motivation",
    itemType: "scenario"
  },
  {
    id: 239,
    text: "When introducing a difficult concept, I explicitly connect the lesson to authentic challenges that students care about in their everyday lives.",
    domain: "Classroom Leadership",
    subCompetency: "Student Motivation",
    itemType: "scenario"
  },
  // Classroom Presence
  {
    id: 240,
    text: "I modulate my vocal tone, pacing, and classroom movement to project calm confidence and sustain student attention throughout the entire block.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Presence",
    itemType: "scenario"
  },
  {
    id: 241,
    text: "When unexpected disruptions occur, my composed demeanor serves as an emotional anchor that restores focus to the room.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Presence",
    itemType: "scenario"
  },
  {
    id: 242,
    text: "I make eye contact and greet every student by name as they enter my classroom, establishing immediate rapport and presence.",
    domain: "Classroom Leadership",
    subCompetency: "Classroom Presence",
    itemType: "scenario"
  },
  // Time and Learning Management
  {
    id: 243,
    text: "I display a visual lesson agenda with approximate time allocations at the start of each class so students can self-monitor their task pacing.",
    domain: "Classroom Leadership",
    subCompetency: "Time and Learning Management",
    itemType: "scenario"
  },
  {
    id: 244,
    text: "I use timer protocols during small-group discussions to ensure that every group member has equal speaking time and tasks conclude on schedule.",
    domain: "Classroom Leadership",
    subCompetency: "Time and Learning Management",
    itemType: "scenario"
  },
  {
    id: 245,
    text: "When an instructional activity takes longer than planned, I make a deliberate decision on whether to compress the remaining agenda or defer it to the next day.",
    domain: "Classroom Leadership",
    subCompetency: "Time and Learning Management",
    itemType: "scenario"
  },
  // Conflict Resolution
  {
    id: 246,
    text: "I teach students structured conflict resolution frameworks so they can independently mediate minor peer disagreements during collaborative projects.",
    domain: "Classroom Leadership",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 247,
    text: "When tense discussions arise around controversial academic topics, I guide students to critique ideas with evidence while maintaining respect for individuals.",
    domain: "Classroom Leadership",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 248,
    text: "If I make an error in grading or classroom discipline, I openly acknowledge it to the student and correct it, modeling integrity and accountability.",
    domain: "Classroom Leadership",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  // Positive Classroom Culture
  {
    id: 249,
    text: "I foster a culture of psychological safety where students feel comfortable making mistakes and viewing errors as essential steps toward mastery.",
    domain: "Classroom Leadership",
    subCompetency: "Positive Classroom Culture",
    itemType: "scenario"
  },
  {
    id: 250,
    text: "I incorporate brief community-building check-ins during homeroom or opening moments to strengthen peer relationships and empathy.",
    domain: "Classroom Leadership",
    subCompetency: "Positive Classroom Culture",
    itemType: "scenario"
  },
  {
    id: 251,
    text: "I ensure that classroom displays, literature, and examples represent diverse cultures, backgrounds, and learning identities.",
    domain: "Classroom Leadership",
    subCompetency: "Positive Classroom Culture",
    itemType: "scenario"
  },
  // Inclusive Leadership
  {
    id: 252,
    text: "I adapt my leadership style to support quiet or introverted students, ensuring their ideas are heard through written reflection and structured turn-taking.",
    domain: "Classroom Leadership",
    subCompetency: "Inclusive Leadership",
    itemType: "scenario"
  },
  {
    id: 253,
    text: "I proactively review Individualized Education Programs (IEPs) and language accommodation plans before launching any new collaborative unit.",
    domain: "Classroom Leadership",
    subCompetency: "Inclusive Leadership",
    itemType: "scenario"
  },
  {
    id: 254,
    text: "I challenge peer exclusionary behaviour immediately, reinforcing that every student belongs and contributes value to our learning community.",
    domain: "Classroom Leadership",
    subCompetency: "Inclusive Leadership",
    itemType: "scenario"
  },
  // Expectations and Accountability
  {
    id: 255,
    text: "I hold every student to high academic expectations while providing individualized scaffolding to help them reach those benchmarks.",
    domain: "Classroom Leadership",
    subCompetency: "Expectations and Accountability",
    itemType: "scenario"
  },
  {
    id: 256,
    text: "I use transparent grading rubrics and provide students with exemplars before an assignment begins so success criteria are unmistakable.",
    domain: "Classroom Leadership",
    subCompetency: "Expectations and Accountability",
    itemType: "scenario"
  },
  {
    id: 257,
    text: "When students miss assignment deadlines, I work with them to create an actionable completion contract rather than lowering standards.",
    domain: "Classroom Leadership",
    subCompetency: "Expectations and Accountability",
    itemType: "scenario"
  },
  // Leadership Under Pressure
  {
    id: 258,
    text: "During high-stress testing weeks or end-of-term grading periods, I maintain emotional equilibrium and project reassurance to anxious students.",
    domain: "Classroom Leadership",
    subCompetency: "Leadership Under Pressure",
    itemType: "scenario"
  },
  {
    id: 259,
    text: "When facing unexpected school emergencies or safety drills, I execute protocols with calm precision while keeping students informed and secure.",
    domain: "Classroom Leadership",
    subCompetency: "Leadership Under Pressure",
    itemType: "scenario"
  },
  {
    id: 260,
    text: "When balancing multiple administrative demands and classroom instruction, I compartmentalize tasks so my classroom presence remains focused and present.",
    domain: "Classroom Leadership",
    subCompetency: "Leadership Under Pressure",
    itemType: "scenario"
  },

  // ─── DOMAIN 3: INSTRUCTIONAL INTELLIGENCE (Expanded Items 261 - 280) ────────────────────
  {
    id: 261,
    text: "I use tiered assignment prompts so that struggling readers, on-level students, and advanced scholars can engage the same core text at their optimal depth.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  {
    id: 262,
    text: "I check for understanding every 10 to 15 minutes using non-verbal thumb checks, whiteboards, or digital polls before moving to the next instructional concept.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },
  {
    id: 263,
    text: "When providing feedback on student essays, I focus on two specific actionable improvement steps rather than overwhelming the student with excessive markup.",
    domain: "Instructional Intelligence",
    subCompetency: "Feedback",
    itemType: "scenario"
  },
  {
    id: 264,
    text: "I use open-ended, higher-order probing questions that require students to justify their reasoning with evidence rather than giving single-word answers.",
    domain: "Instructional Intelligence",
    subCompetency: "Questioning Techniques",
    itemType: "scenario"
  },
  {
    id: 265,
    text: "I align all daily lesson activities directly with unit assessment objectives so no classroom time is wasted on disconnected tasks.",
    domain: "Instructional Intelligence",
    subCompetency: "Curriculum Alignment",
    itemType: "scenario"
  },
  {
    id: 266,
    text: "I create explicit opportunities for students to apply classroom math or literacy skills to real-world community problems and career scenarios.",
    domain: "Instructional Intelligence",
    subCompetency: "Learning Transfer",
    itemType: "scenario"
  },
  {
    id: 267,
    text: "I incorporate multimodal learning strategies—combining visual diagrams, spoken dialogue, and tactile practice—in every foundational unit.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  {
    id: 268,
    text: "I invite students to self-assess their work against the official rubric before submitting assignments, promoting metacognitive reflection.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },
  {
    id: 269,
    text: "I provide immediate verbal coaching during guided practice so errors are corrected before they become ingrained habits.",
    domain: "Instructional Intelligence",
    subCompetency: "Feedback",
    itemType: "scenario"
  },
  {
    id: 270,
    text: "I use intentional wait time of at least 5 seconds after asking a complex question to allow introverted and multilingual learners time to formulate answers.",
    domain: "Instructional Intelligence",
    subCompetency: "Questioning Techniques",
    itemType: "scenario"
  },
  {
    id: 271,
    text: "I review curriculum standards across adjacent grade levels so my instruction builds smoothly on prior knowledge and prepares students for next year.",
    domain: "Instructional Intelligence",
    subCompetency: "Curriculum Alignment",
    itemType: "scenario"
  },
  {
    id: 272,
    text: "I design capstone projects where students synthesize knowledge from multiple academic subjects to solve an authentic interdisciplinary challenge.",
    domain: "Instructional Intelligence",
    subCompetency: "Learning Transfer",
    itemType: "scenario"
  },
  {
    id: 273,
    text: "I create flexible grouping structures that change regularly based on formative assessment data rather than locking students into permanent ability tiers.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  {
    id: 274,
    text: "I use peer-assessment protocols where students provide constructive feedback to classmates using structured sentence stems.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },
  {
    id: 275,
    text: "I celebrate revision by grading the final product after students have incorporated feedback, reinforcing that excellence is an iterative process.",
    domain: "Instructional Intelligence",
    subCompetency: "Feedback",
    itemType: "scenario"
  },
  {
    id: 276,
    text: "I encourage students to ask questions of one another during classroom seminars rather than routing all dialogue through the teacher.",
    domain: "Instructional Intelligence",
    subCompetency: "Questioning Techniques",
    itemType: "scenario"
  },
  {
    id: 277,
    text: "I audit my lesson materials annually to ensure alignment with updated state or national curriculum frameworks.",
    domain: "Instructional Intelligence",
    subCompetency: "Curriculum Alignment",
    itemType: "scenario"
  },
  {
    id: 278,
    text: "I teach students memory-retention and retrieval practice strategies so they can independently transfer learning from short-term to long-term memory.",
    domain: "Instructional Intelligence",
    subCompetency: "Learning Transfer",
    itemType: "scenario"
  },
  {
    id: 279,
    text: "I adjust reading texts and supplementary materials so English Language Learners can access rigorous grade-level ideas with vocabulary scaffolding.",
    domain: "Instructional Intelligence",
    subCompetency: "Differentiated Instruction",
    itemType: "scenario"
  },
  {
    id: 280,
    text: "I use diagnostic pre-assessments before starting a new unit so I can skip material students already know and focus on actual learning gaps.",
    domain: "Instructional Intelligence",
    subCompetency: "Formative Assessment",
    itemType: "scenario"
  },

  // ─── DOMAIN 4: RELATIONSHIP INTELLIGENCE (Expanded Items 281 - 300) ────────────────────
  {
    id: 281,
    text: "When a student appears emotionally distressed or withdrawn, I check in with them privately using empathetic, non-judgmental listening.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  {
    id: 282,
    text: "I use gender-neutral, culturally affirming language in all classroom instructions, newsletters, and communications with families.",
    domain: "Relationship Intelligence",
    subCompetency: "Inclusive Communication",
    itemType: "scenario"
  },
  {
    id: 283,
    text: "I actively collaborate with special education teachers and counselors, treating them as co-equal partners in student development.",
    domain: "Relationship Intelligence",
    subCompetency: "Collaboration",
    itemType: "scenario"
  },
  {
    id: 284,
    text: "I send positive postcards or phone home early in the semester to build trust with families before any academic or disciplinary issues arise.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },
  {
    id: 285,
    text: "When parents express frustration during parent-teacher conferences, I validate their concern for their child before sharing data and collaborative solutions.",
    domain: "Relationship Intelligence",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 286,
    text: "I design lessons that honor diverse cultural histories and indigenous knowledge systems, ensuring all students see themselves reflected in the curriculum.",
    domain: "Relationship Intelligence",
    subCompetency: "Respect for Diversity",
    itemType: "scenario"
  },
  {
    id: 287,
    text: "I practice active listening by paraphrasing student statements to confirm understanding before offering my own perspective.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  {
    id: 288,
    text: "I ensure classroom signage, handouts, and online portals are accessible to students and parents with linguistic or visual differences.",
    domain: "Relationship Intelligence",
    subCompetency: "Inclusive Communication",
    itemType: "scenario"
  },
  {
    id: 289,
    text: "I share successful lesson plans and instructional resources openly with grade-level team members without territoriality.",
    domain: "Relationship Intelligence",
    subCompetency: "Collaboration",
    itemType: "scenario"
  },
  {
    id: 290,
    text: "I provide parents with clear, jargon-free explanations of standardized test results and practical ways to support learning at home.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },
  {
    id: 291,
    text: "When disagreements arise in department meetings, I focus on shared educational goals rather than personal defensiveness.",
    domain: "Relationship Intelligence",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 292,
    text: "I intervene constructively when I observe subtle microaggressions or exclusionary remarks among students, turning them into teachable moments.",
    domain: "Relationship Intelligence",
    subCompetency: "Respect for Diversity",
    itemType: "scenario"
  },
  {
    id: 293,
    text: "I recognize that student behavioral changes often stem from outside stress, responding with trauma-informed compassion rather than automatic penalties.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  {
    id: 294,
    text: "I use inclusive pronouns and encourage students to share their preferred names and communication styles at the beginning of each term.",
    domain: "Relationship Intelligence",
    subCompetency: "Inclusive Communication",
    itemType: "scenario"
  },
  {
    id: 295,
    text: "I co-plan cross-curricular units with colleagues in other departments to show students the unity of knowledge across subjects.",
    domain: "Relationship Intelligence",
    subCompetency: "Collaboration",
    itemType: "scenario"
  },
  {
    id: 296,
    text: "I accommodate diverse working schedules by offering virtual conference options and asynchronous updates for busy working families.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },
  {
    id: 297,
    text: "I mediate peer conflicts by helping students identify underlying needs and agree on mutually fair behavioral commitments.",
    domain: "Relationship Intelligence",
    subCompetency: "Conflict Resolution",
    itemType: "scenario"
  },
  {
    id: 298,
    text: "I celebrate heritage months and cultural awareness milestones not as isolated add-ons, but as authentic threads woven throughout the school year.",
    domain: "Relationship Intelligence",
    subCompetency: "Respect for Diversity",
    itemType: "scenario"
  },
  {
    id: 299,
    text: "I check my own unconscious biases when evaluating student behavior or grading subjective open-ended assignments.",
    domain: "Relationship Intelligence",
    subCompetency: "Empathy",
    itemType: "scenario"
  },
  {
    id: 300,
    text: "I communicate student progress consistently and transparently so that no family ever experiences an unwelcome surprise on report card day.",
    domain: "Relationship Intelligence",
    subCompetency: "Family Engagement",
    itemType: "scenario"
  },

  // ─── DOMAIN 5: PROFESSIONAL INTELLIGENCE (Expanded Items 301 - 320) ────────────────────
  {
    id: 301,
    text: "I uphold the highest standards of confidentiality regarding student academic records, IEP details, and family backgrounds.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },
  {
    id: 302,
    text: "I dedicate time each semester to read peer-reviewed educational journals or attend workshops to stay current on cognitive science and pedagogy.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "scenario"
  },
  {
    id: 303,
    text: "I pilot innovative educational technologies and AI-assisted lesson tools in my classroom, assessing their impact on student learning with an open mind.",
    domain: "Professional Intelligence",
    subCompetency: "Innovation",
    itemType: "scenario"
  },
  {
    id: 304,
    text: "I mentor early-career teachers by opening my classroom for observations, sharing lesson templates, and offering supportive feedback.",
    domain: "Professional Intelligence",
    subCompetency: "Coaching and Mentoring",
    itemType: "scenario"
  },
  {
    id: 305,
    text: "When my school introduces a new curriculum or scheduling model, I approach the change with adaptability and constructive problem-solving.",
    domain: "Professional Intelligence",
    subCompetency: "Change Management",
    itemType: "scenario"
  },
  {
    id: 306,
    text: "I actively participate in school improvement committees and accreditation reviews to contribute to the long-term vision of our school.",
    domain: "Professional Intelligence",
    subCompetency: "Educational Leadership",
    itemType: "scenario"
  },
  {
    id: 307,
    text: "I ensure my online presence and social media communications reflect the integrity and professionalism expected of an educator.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },
  {
    id: 308,
    text: "I invite instructional coaches into my classroom regularly and apply their recommendations with an attitude of continuous self-improvement.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "scenario"
  },
  {
    id: 309,
    text: "I experiment with new classroom seating arrangements and project formats based on emerging research in student neurodiversity.",
    domain: "Professional Intelligence",
    subCompetency: "Innovation",
    itemType: "scenario"
  },
  {
    id: 310,
    text: "I serve as a peer coach during professional learning communities (PLCs), guiding data-driven discussions that elevate team teaching practices.",
    domain: "Professional Intelligence",
    subCompetency: "Coaching and Mentoring",
    itemType: "scenario"
  },
  {
    id: 311,
    text: "When policy changes create uncertainty, I help colleagues stay focused on student learning and constructive dialogue.",
    domain: "Professional Intelligence",
    subCompetency: "Change Management",
    itemType: "scenario"
  },
  {
    id: 312,
    text: "I advocate for equity and student resources at faculty meetings and district forums, putting learner welfare at the center of school policy.",
    domain: "Professional Intelligence",
    subCompetency: "Educational Leadership",
    itemType: "scenario"
  },
  {
    id: 313,
    text: "I strictly avoid conflicts of interest and treat all students and families with fairness and impartial support.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },
  {
    id: 314,
    text: "I reflect on my annual teacher evaluations to set 2 to 3 measurable, evidence-based goals for the upcoming academic year.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "scenario"
  },
  {
    id: 315,
    text: "I share successful classroom innovations at regional educational conferences or district teacher-sharing seminars.",
    domain: "Professional Intelligence",
    subCompetency: "Innovation",
    itemType: "scenario"
  },
  {
    id: 316,
    text: "I support substitute teachers and guest educators by preparing comprehensive lesson folders and welcoming them into our school community.",
    domain: "Professional Intelligence",
    subCompetency: "Coaching and Mentoring",
    itemType: "scenario"
  },
  {
    id: 317,
    text: "I view educational change as an opportunity to discard outdated practices and better serve evolving student demographics.",
    domain: "Professional Intelligence",
    subCompetency: "Change Management",
    itemType: "scenario"
  },
  {
    id: 318,
    text: "I organize or support school-wide initiatives such as science fairs, literacy nights, or community service drives that enrich campus life.",
    domain: "Professional Intelligence",
    subCompetency: "Educational Leadership",
    itemType: "scenario"
  },
  {
    id: 319,
    text: "I model ethical digital citizenship and intellectual property respect when curating online materials for my students.",
    domain: "Professional Intelligence",
    subCompetency: "Professional Ethics",
    itemType: "scenario"
  },
  {
    id: 320,
    text: "I view myself as a lifelong student of the teaching profession, continuously curious about how human beings learn and thrive.",
    domain: "Professional Intelligence",
    subCompetency: "Continuous Learning",
    itemType: "scenario"
  }
];

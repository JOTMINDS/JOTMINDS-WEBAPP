/**
 * Cross-Domain Play Activity Bank for JotMinds Preschool Developmental Assessment Framework (JM-PDAF v1.0)
 * Allows teachers to observe multiple competencies across domains in a single natural play routine.
 */

import { DevelopmentalActivity } from '../types/preschoolDevelopmental';

export const MASTER_PRESCHOOL_ACTIVITIES: DevelopmentalActivity[] = [
  {
    id: 'act-bridge-builder',
    title: 'Build a Bridge',
    ageBands: ['P2', 'P3', 'P4'],
    durationMinutes: 20,
    category: 'Construction & Math',
    description:
      'Children use wooden blocks, cardboard tubes, and small toy animals to construct a bridge that can support weight across a "river" tape line.',
    materialsNeeded: [
      'Wooden building blocks',
      'Cardboard rolls or flat planks',
      'Small animal figurines or toy cars',
      'Blue painter tape for river line',
    ],
    teacherInstructions: [
      'Set down the blue river line and say: "Our animal friends need to get across the river. Can you build a bridge for them?"',
      'Observe how the child balances and positions the materials.',
      'Test the bridge gently with a toy animal. If it falls, prompt: "What else could we try to make it stronger?"',
      'Ask the child: "Tell me about how your bridge works."',
    ],
    behaviourToObserve:
      'Observe structural problem-solving (CD-032/033), fine motor positioning (PM-017/018), construction purpose (CE-018/020), and ability to explain ideas verbally (LC-014/015).',
    mappedIndicatorIds: [
      'JM-CD-032', // Finds a solution to an age-appropriate practical problem
      'JM-CD-033', // Tries another strategy when the first attempt does not work
      'JM-PM-018', // Uses construction/manipulative materials accurately
      'JM-CE-018', // Builds with an identifiable purpose
      'JM-LC-014', // Communicates ideas using increasingly complete sentences
    ],
    culturalAdaptationNotes: 'In Ghana, local building materials or wooden offcuts can be substituted for blocks.',
  },
  {
    id: 'act-mystery-bag',
    title: 'Mystery Bag Guessing Game',
    ageBands: ['P1', 'P2', 'P3', 'P4'],
    durationMinutes: 15,
    category: 'Sensory & Science',
    description:
      'A tactile sensory game where children reach inside an opaque cloth bag, feel an everyday object without looking, describe its attributes, and guess what it is.',
    materialsNeeded: [
      'Cloth drawstring bag',
      'Everyday objects (sponge, wooden spoon, pinecone/seed, orange, toy car, seashell)',
    ],
    teacherInstructions: [
      'Have the child reach into the bag with one hand.',
      'Prompt: "Keep your hand inside! How does it feel? Is it smooth, rough, hard, or soft?"',
      'Encourage descriptive vocabulary before pulling the item out.',
      'When the object is revealed, ask: "What do we use this for? Which group of things does it belong to?"',
    ],
    behaviourToObserve:
      'Observe sensory discrimination (CD-012/013), descriptive vocabulary usage (LC-018/020), conversational turn-taking (LC-023), and object classification (CD-013/014).',
    mappedIndicatorIds: [
      'JM-LC-018', // Uses descriptive words for colour, size, action or feeling
      'JM-LC-020', // Selects increasingly precise words when explaining ideas
      'JM-LC-023', // Takes turns speaking and listening
      'JM-CD-013', // Sorts objects by colour, shape or size
      'JM-CD-014', // Explains why objects have been grouped together
    ],
    culturalAdaptationNotes: 'Use familiar regional items such as a small wooden mortar pestle, seed pods, or local fruits.',
  },
  {
    id: 'act-teddys-picnic',
    title: "Teddy's Sharing Picnic",
    ageBands: ['P2', 'P3', 'P4'],
    durationMinutes: 20,
    category: 'Games & Movement',
    description:
      'A playful dramatic picnic where stuffed toys or friends need equal snacks and plates, creating natural counting and sharing moments.',
    materialsNeeded: [
      '3-4 stuffed animals or dolls',
      'Small plates and cups',
      'Counters or plastic fruit pieces (8–12 items)',
      'Picnic mat',
    ],
    teacherInstructions: [
      'Arrange 3 dolls on the picnic mat. Say: "Teddy and his friends are hungry! Can we give each friend a plate?"',
      'Hand the child a bowl with 6 fruit pieces: "Can you make sure every friend gets 2 apples so it is fair?"',
      'Observe one-to-one correspondence as the child distributes items.',
      'Ask: "How many fruits do they have altogether? What happens if one friend eats an apple?"',
    ],
    behaviourToObserve:
      'Observe one-to-one correspondence (EN-008/009), small quantity addition/subtraction (EN-017/018), turn-taking and sharing (SE-022/023), and pretend play involvement (CE-003/004).',
    mappedIndicatorIds: [
      'JM-EN-008', // Counts objects using one-to-one correspondence
      'JM-EN-009', // Understands that the final count represents the total
      'JM-EN-017', // Combines small groups and determines the new total
      'JM-SE-023', // Shares materials during structured activities with decreasing support
      'JM-CE-004', // Develops scenarios during pretend play
    ],
    culturalAdaptationNotes: 'Can be framed as sharing bananas, groundnuts, or mangoes at a family gathering.',
  },
  {
    id: 'act-picture-story',
    title: 'Picture Story Sequencing & Retelling',
    ageBands: ['P2', 'P3', 'P4'],
    durationMinutes: 15,
    category: 'Story & Drama',
    description:
      'Children examine 3 to 4 sequential illustration cards, place them in chronological order, and narrate the storyline using connecting words.',
    materialsNeeded: [
      'Sets of 3-4 illustrated cards depicting a familiar sequence (e.g. planting a seed, baking bread, getting ready for school)',
    ],
    teacherInstructions: [
      'Present the cards shuffled on the table.',
      'Say: "These pictures tell a story, but they got mixed up! Can you show what happened first, next, and at the end?"',
      'Listen carefully as the child arranges and narrates the events.',
      'Ask: "Why do you think that happened at the end? What might happen the next day?"',
    ],
    behaviourToObserve:
      'Observe chronological sequencing (CD-018/020), temporal explanation (CD-019), narrative structure (LC-029/030), and expressive storytelling details (LC-015).',
    mappedIndicatorIds: [
      'JM-CD-018', // Arranges three related events in sequence
      'JM-CD-019', // Explains what happened first and next
      'JM-CD-020', // Organises four or more events into a logical sequence
      'JM-LC-029', // Organises events using beginning, middle and end
      'JM-LC-030', // Creates or retells a coherent short story using relevant details
    ],
    culturalAdaptationNotes: 'Ensure sequence cards reflect relatable West African daily experiences, school routines, and family life.',
  },
  {
    id: 'act-flexible-sorting',
    title: 'Multiple Ways to Sort',
    ageBands: ['P2', 'P3', 'P4'],
    durationMinutes: 15,
    category: 'Construction & Math',
    description:
      'Children receive a collection of multi-attribute objects (differing in color, shape, and size) and are challenged to find at least two distinct grouping systems.',
    materialsNeeded: [
      'Set of geometric sorting shapes or colored buttons varying in 3 colors, 3 shapes, and 2 sizes (big/small)',
      'Sorting bowls or trays',
    ],
    teacherInstructions: [
      'Place the objects in a single mixed pile.',
      'Ask: "Put together the ones you think belong together."',
      'After the child completes the first grouping: "Great job! Now can you find another completely different way to sort them?"',
      'Ask: "Why did you put these together this time?"',
    ],
    behaviourToObserve:
      'Observe initial categorization (CD-013), flexible reclassification (CD-015), verbal justification of sorting rules (CD-014), and shape awareness (EN-023).',
    mappedIndicatorIds: [
      'JM-CD-013', // Sorts objects by colour, shape or size
      'JM-CD-014', // Explains why objects have been grouped together
      'JM-CD-015', // Reclassifies the same objects using a different characteristic
      'JM-EN-023', // Describes basic characteristics of shapes
      'JM-CE-021', // Explores more than one way of using familiar materials
    ],
    culturalAdaptationNotes: 'Can use a mix of local fabrics (kente vs batakari scraps), buttons, and seeds.',
  },
  {
    id: 'act-obstacle-adventure',
    title: 'Obstacle Course Adventure',
    ageBands: ['P2', 'P3', 'P4'],
    durationMinutes: 25,
    category: 'Games & Movement',
    description:
      'A safe, dynamic indoor or outdoor pathway involving balancing along a taped beam, stepping through hoops, jumping over low foam blocks, and crawling under arches.',
    materialsNeeded: [
      'Floor tape for balance beam',
      'Hula hoops or rope circles',
      'Low foam cushions or cones',
      'Child tunnel or low table arch',
    ],
    teacherInstructions: [
      'Walk through the course with the group first, demonstrating safe movement.',
      'Prompt: "Step carefully along the line, jump into the two circles, and crawl under the arch!"',
      'Observe child balance, coordination, spatial navigation, and waiting for turns.',
    ],
    behaviourToObserve:
      'Observe physical stability and balance (PM-003/004), jump coordination (PM-007/009), following multi-step instructions (IL-019), and waiting for turns (SE-014).',
    mappedIndicatorIds: [
      'JM-PM-004', // Balances briefly on one foot or along a simple pathway
      'JM-PM-009', // Jumps over or between age-appropriate obstacles
      'JM-PM-033', // Navigates a simple obstacle course
      'JM-IL-019', // Completes a multi-step familiar task with decreasing assistance
      'JM-SE-014', // Waits for short periods when required during familiar activities
    ],
    culturalAdaptationNotes: 'Can incorporate traditional Ghanaian childhood games such as "Ampe" or rhythmic clapping games.',
  },
  {
    id: 'act-rhythm-rhyme-parade',
    title: 'Rhythm, Rhyme & Sound Parade',
    ageBands: ['P1', 'P2', 'P3', 'P4'],
    durationMinutes: 20,
    category: 'Art & Expression',
    description:
      'A musical circle time activity where children clap syllables in their names, echo rhyming words, and move rhythmically to traditional drums and percussion.',
    materialsNeeded: [
      'Small hand drums, shakers, or clap sticks',
      'Illustrated song cards for familiar nursery rhymes and Ghanaian folk songs',
    ],
    teacherInstructions: [
      'Sing a familiar rhyme: "Humpty Dumpty sat on a wall... Which word sounds like wall?"',
      'Have each child clap the beats (syllables) in their own name: "Kwe-ku (clap-clap)!"',
      'Play a rhythm on the drum and invite children to reproduce the tempo with their shakers.',
    ],
    behaviourToObserve:
      'Observe phonological rhyming recognition (LC-032), syllable division (LC-034), rhythm reproduction (CE-013/014), and group participation (SE-033).',
    mappedIndicatorIds: [
      'JM-LC-031', // Participates in rhymes and sound-play activities
      'JM-LC-032', // Recognises words that rhyme
      'JM-LC-034', // Breaks simple spoken words into parts or syllables
      'JM-CE-013', // Reproduces simple rhythms or movement patterns
      'JM-SE-033', // Participates in group activities with increasing confidence
    ],
    culturalAdaptationNotes: 'Include beloved songs in English and local languages (e.g. Twi, Ga, Ewe) with traditional percussion.',
  },
  {
    id: 'act-classroom-helper',
    title: 'Daily Helper & Snack Setup Routine',
    ageBands: ['P2', 'P3', 'P4'],
    durationMinutes: 15,
    category: 'Games & Movement',
    description:
      'Practical life skill activity where student helpers set out lunch mats, wash hands independently, prepare snack napkins, and tidy materials after eating.',
    materialsNeeded: [
      'Handwashing station (water, soap, clean towel)',
      'Snack mats, napkins, water cups',
      'Tidy bins for scraps and recycling',
    ],
    teacherInstructions: [
      'Assign helper tasks: "Today, Kwame and Ama are our snack monitors."',
      'Prompt them to check that hands are clean before touching food.',
      'Allow children to set the table and return items without immediate intervention unless safety requires.',
    ],
    behaviourToObserve:
      'Observe independent personal care (IL-003/005), classroom responsibility (IL-008/010), safety adherence (IL-028/030), and cooperative work (SE-024).',
    mappedIndicatorIds: [
      'JM-IL-003', // Completes selected personal-care routines with limited assistance
      'JM-IL-008', // Moves through familiar routines with decreasing prompting
      'JM-IL-013', // Takes responsibility for selected personal/classroom belongings
      'JM-IL-028', // Identifies obvious safe and unsafe behaviours in familiar contexts
      'JM-SE-024', // Cooperates toward a simple group goal
    ],
    culturalAdaptationNotes: 'Emphasizes respect for communal cleanliness, proper hygiene before food, and courteous peer communication.',
  },
];

export const ACTIVITIES_BY_ID: Record<string, DevelopmentalActivity> = MASTER_PRESCHOOL_ACTIVITIES.reduce(
  (acc, act) => {
    acc[act.id] = act;
    return acc;
  },
  {} as Record<string, DevelopmentalActivity>
);

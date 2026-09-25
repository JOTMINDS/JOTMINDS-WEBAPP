import React, { useState } from 'react';
import { User } from '../../types';
import { EvidenceEvent, DEVELOPMENTAL_DOMAINS } from '../../types/preschoolDevelopmental';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  BookOpen, Sparkles, Compass, Lightbulb, CheckCircle2,
  Layers, Users, ShieldAlert, Heart, GraduationCap, Globe, Clock
} from 'lucide-react';

interface PreschoolTeachingInsightsViewProps {
  childrenList: User[];
  events: EvidenceEvent[];
  currentUser: User;
  onRefresh: () => void;
}

export function PreschoolTeachingInsightsView({
  childrenList,
  events,
  currentUser,
  onRefresh,
}: PreschoolTeachingInsightsViewProps) {
  const [activeTab, setActiveTab] = useState<'moves' | 'stations' | 'differentiation' | 'training'>(
    'moves'
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-200/50 dark:border-violet-900/30 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-violet-600 text-white font-medium">Instructional Practice</Badge>
            <Badge variant="outline" className="text-xs">Professional Pedagogy</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Teaching Insights & Classroom Pedagogy
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
            Practical strategies, classroom station designs, differentiation pathways, and professional development resources to support continuous early childhood development.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'moves', label: 'Daily Pedagogical Moves', icon: Lightbulb },
          { id: 'stations', label: 'Classroom Station Blueprints', icon: Compass },
          { id: 'differentiation', label: 'Domain Differentiation', icon: Layers },
          { id: 'training', label: 'In-Service Modules', icon: GraduationCap },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAILY PEDAGOGICAL MOVES */}
      {activeTab === 'moves' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Dialogic Questioning & Extended Pauses',
              badge: 'Language & Thinking',
              description:
                'Instead of closed yes/no questions, use open-ended inquiries that invite children to explain their thinking. Allow a 5-second silence before prompting.',
              examples: [
                '"What do you think will happen if we add one more block?"',
                '"How did you decide where to put the blue triangle?"',
                '"Tell me more about what your animal is looking for."',
              ],
              impact: 'Strengthens verbal reasoning, sentence complexity, and cognitive confidence.',
            },
            {
              title: 'Language Expansion & Recasting',
              badge: 'Multilingual & Communication',
              description:
                'Affirm the child’s utterance and repeat it back with expanded grammatical detail and enriched vocabulary without direct criticism.',
              examples: [
                'Child: "Big car go!" → Teacher: "Yes! The huge red lorry is zooming rapidly down the road!"',
                'Child (in Twi): "Me pɛ aduane" → Teacher: "You want nutritious food! Let us see what is on your plate."',
              ],
              impact: 'Normalizes expressive vocabulary and bridges home languages with classroom language.',
            },
            {
              title: 'Tiered Scaffolding in Problem Solving',
              badge: 'Cognitive & Persistence',
              description:
                'When a child encounters difficulty (e.g. puzzle piece not fitting), resist solving it for them. Offer verbal cues first, then gestural hints, and physical hand-over-hand only when necessary.',
              examples: [
                'Level 1: "Look closely at the corner shape."',
                'Level 2: Point to the matching space without rotating it.',
                'Level 3: "Try turning it once to see if the straight edge matches."',
              ],
              impact: 'Builds resilience, trial-and-error problem solving, and intrinsic agency.',
            },
            {
              title: 'Intentional Co-Play & Modelling',
              badge: 'Social & Emotional',
              description:
                'Join child-led play as a co-player rather than an instructor. Model cooperative sharing, negotiating roles, and emotional self-regulation organically.',
              examples: [
                '"May I be the customer at your bakery? I would like to buy two warm buns please."',
                '"Oh no, our tower tipped over! That’s okay, we can laugh and try a wider base together."',
              ],
              impact: 'Fosters reciprocal peer relationships and healthy emotional self-regulation.',
            },
          ].map((move, i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] font-semibold text-violet-700 dark:text-violet-300 border-violet-200">
                    {move.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {move.title}
                </CardTitle>
                <CardDescription className="text-xs">
                  {move.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="p-3 bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-xl space-y-1.5">
                  <span className="font-semibold text-violet-900 dark:text-violet-200 text-[11px]">
                    Classroom Verbal Prompts:
                  </span>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {move.examples.map((ex, j) => (
                      <li key={j} className="flex items-start gap-1.5">
                        <span className="text-violet-500 font-bold">•</span>
                        <span>{ex}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  <span>{move.impact}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: CLASSROOM STATIONS */}
      {activeTab === 'stations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'Sensory & Discovery Table',
              focus: 'Tactile discrimination, curiosity & classification',
              materials: 'Dry beans, sand, scoops, sorting bowls, smooth stones, water cups',
              routine:
                'Children dig, pour, sort textures by weight/roughness, and test items that float or sink.',
              mappedDomains: ['Cognitive (JM-CD)', 'Physical & Motor (JM-PM)'],
            },
            {
              title: 'Construction & Spatial Zone',
              focus: 'Fine motor control, balance & architectural planning',
              materials: 'Wooden offcuts, cardboard boxes, tape, animal figures, measuring strings',
              routine:
                'Children collaborate to construct enclosures, roads, and bridges with identifiable structural goals.',
              mappedDomains: ['Creative Expression (JM-CE)', 'Cognitive (JM-CD)'],
            },
            {
              title: 'Story Nook & Puppetry Corner',
              focus: 'Oral storytelling, active listening & phonological awareness',
              materials: 'Picture books, finger puppets, bilingual flashcards, soft floor cushions',
              routine:
                'Children look at visual stories, sequence picture cards, and act out cultural folk tales in English and local languages.',
              mappedDomains: ['Language & Comm (JM-LC)', 'Social-Emotional (JM-SE)'],
            },
            {
              title: 'Math & Manipulative Hub',
              focus: 'Number sense, 1-to-1 correspondence & patterns',
              materials: 'Bottle caps, shells, abacus counters, pattern cards, weighing balance',
              routine:
                'Children count real-life collections, create alternating color patterns, and compare heavier vs lighter objects.',
              mappedDomains: ['Early Numeracy (JM-EN)', 'Independence (JM-IL)'],
            },
            {
              title: 'Socio-Dramatic Market & Home',
              focus: 'Executive functioning, peer negotiation & role play',
              materials: 'Play cooking pots, fabric cloths, play money, empty food containers',
              routine:
                'Children role-play everyday Ghanaian market and home scenarios, practicing polite turn-taking and dialogue.',
              mappedDomains: ['Social-Emotional (JM-SE)', 'Independence (JM-IL)'],
            },
            {
              title: 'Gross Motor & Movement Path',
              focus: 'Balance, bilateral coordination & spatial boundaries',
              materials: 'Floor tape lines, balance beam or chalk circles, soft cones, beanbags',
              routine:
                'Children walk heel-to-toe, jump over gentle obstacles, and balance beanbags while moving to traditional drum beats.',
              mappedDomains: ['Physical & Motor (JM-PM)', 'Creative Expression (JM-CE)'],
            },
          ].map((station, i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <CardHeader className="pb-3 space-y-1">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {station.title}
                </CardTitle>
                <CardDescription className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {station.focus}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      Recommended Materials:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {station.materials}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      Facilitator Prompt & Routine:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                      {station.routine}
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1">
                  {station.mappedDomains.map((dom, dIdx) => (
                    <Badge key={dIdx} variant="secondary" className="text-[10px]">
                      {dom}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: DOMAIN DIFFERENTIATION */}
      {activeTab === 'differentiation' && (
        <div className="space-y-4">
          {[
            {
              domain: 'Cognitive Development (JM-CD)',
              scaffoldSupport:
                'Use physical 3D objects instead of 2D pictures; reduce choices to 2 items; provide clear visual sequence templates.',
              extensionChallenge:
                'Ask child to invent a third sorting rule; introduce multi-step problem solving with missing parts; encourage verbal prediction.',
            },
            {
              domain: 'Language & Communication (JM-LC)',
              scaffoldSupport:
                'Allow child to respond in their mother tongue (Twi/Ga/Ewe); use gestures and picture cards; model short 2-3 word sentences.',
              extensionChallenge:
                'Ask child to narrate a full beginning-middle-end story; invite them to act as the "librarian" explaining a storybook to peers.',
            },
            {
              domain: 'Early Numeracy (JM-EN)',
              scaffoldSupport:
                'Count small quantities (1 to 3) with tactile touch-counting; guide finger pointing directly on each object.',
              extensionChallenge:
                'Introduce subitizing with dice patterns up to 6; explore simple sharing ("If we have 6 mangoes and 2 plates, how many on each?").',
            },
            {
              domain: 'Social & Emotional (JM-SE)',
              scaffoldSupport:
                'Pair with a gentle, patient peer during partner activities; offer a calm corner with sensory cushions when overwhelmed.',
              extensionChallenge:
                'Empower child to serve as "Peace Helper" to resolve minor toy disputes; encourage leadership in welcoming new classmates.',
            },
            {
              domain: 'Physical & Motor (JM-PM)',
              scaffoldSupport:
                'Provide thicker triangular crayons, playdough squeezing routines, and large bead threading before thin pencils.',
              extensionChallenge:
                'Introduce intricate pattern cutting with child-safe scissors, origami folding, and single-foot hopping challenges.',
            },
          ].map((diff, i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  {diff.domain}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0 text-xs">
                <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl space-y-1">
                  <span className="font-bold text-amber-800 dark:text-amber-300 text-[11px] flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    For Learners Emerging (Scaffolding):
                  </span>
                  <p className="text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    {diff.scaffoldSupport}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 rounded-xl space-y-1">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    For Learners Extending (Enrichment):
                  </span>
                  <p className="text-emerald-900/90 dark:text-emerald-200/90 leading-relaxed">
                    {diff.extensionChallenge}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: IN-SERVICE TRAINING MODULES */}
      {activeTab === 'training' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              module: 'Module 1: Observational Assessment Fidelity & Objective Evidence Logging',
              duration: '45 mins',
              summary:
                'Mastering objective note-taking during everyday routines. How to record factual child behaviors without subjective bias or premature assumptions.',
              keyTakeaways: [
                'Distinguishing between objective facts and subjective judgements',
                'Selecting appropriate assessment methods (OBS vs ACT vs ORL)',
                'Applying the confidence framework (Low vs Moderate vs High)',
              ],
            },
            {
              module: 'Module 2: Designing Play Stations that Elicit Higher-Order Reasoning',
              duration: '60 mins',
              summary:
                'How to organize classroom interest centers using everyday and natural materials to invite self-directed problem-solving and collaboration.',
              keyTakeaways: [
                'Room layout zones and transition management',
                'Using open-ended loose parts instead of fixed commercial toys',
                'Integrating cross-domain competencies in single activities',
              ],
            },
            {
              module: 'Module 3: Affirming Multilingual Competencies in Early Years',
              duration: '45 mins',
              summary:
                'Valuing indigenous Ghanaian languages (Twi, Ga, Ewe) in developmental assessment so linguistic diversity is supported rather than penalized.',
              keyTakeaways: [
                'Documenting evidence in home languages without penalizing expression',
                'Bilingual vocabulary expansion strategies in circle time',
                'Partnering with parents to record home milestone observations',
              ],
            },
            {
              module: 'Module 4: Holistic School Readiness Transition for Band P4 (5–6 Years)',
              duration: '60 mins',
              summary:
                'Preparing learners socially, emotionally, and cognitively for Primary 1 without premature academic drilling or worksheets.',
              keyTakeaways: [
                'Evaluating the 7 foundational school readiness dimensions',
                'Self-regulation and independent desk management routines',
                'Generating transition portfolios for incoming primary teachers',
              ],
            },
          ].map((mod, i) => (
            <Card key={i} className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-violet-700 border-violet-200">
                    Framework Workshop
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="h-3 w-3" />
                    {mod.duration}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  {mod.module}
                </CardTitle>
                <CardDescription className="text-xs">
                  {mod.summary}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                    Core Learning Outcomes:
                  </span>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400">
                    {mod.keyTakeaways.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-violet-500 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

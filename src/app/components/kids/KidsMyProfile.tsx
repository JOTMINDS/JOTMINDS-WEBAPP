import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { User } from '../../types/index';
import { getAssessmentResults } from '../../utils/api';
import { AudioNarration } from './AudioNarration';
import { soundManager } from './SoundFeedback';

/**
 * "About Me": the child's own cognitive profile. No scores, charts or jargon. A buddy character,
 * one picture card each for how they learn, think and decide, and a couple of short sentences.
 * The detailed view for adults stays in KidsCognitiveProfile behind the parent PIN.
 */

type Topic = 'learning' | 'thinking' | 'decision';

interface KidsMyProfileProps {
  user: User;
  onBack: () => void;
  onPlay?: (type: Topic) => void;
}

const TOPICS: Topic[] = ['learning', 'thinking', 'decision'];

// What each quiz is saved as on the server.
const BACKEND_TYPE: Record<Topic, string> = { learning: 'kolb', thinking: 'sternberg', decision: 'dual-process' };

const TOPIC_INFO: Record<Topic, { heading: string; quiz: string; color: string; tint: string }> = {
  learning: { heading: 'How you learn', quiz: 'Learning', color: '#6B4C9A', tint: '#EFE9F7' },
  thinking: { heading: 'How you think', quiz: 'Thinking', color: '#5B7DB1', tint: '#E8EEF7' },
  decision: { heading: 'How you decide', quiz: 'Decision', color: '#1E8A6E', tint: '#E8F5F1' },
};

interface StyleCopy {
  picture: string;
  lines: [string, string];
  tryIt: string;
}

// Keys are the style ids the kids quizzes save. "mix" covers anything we do not recognise.
const COPY: Record<Topic, Record<string, StyleCopy>> = {
  learning: {
    visual: { picture: '👀', lines: ['You learn by seeing.', 'Pictures and colors help you remember.'], tryIt: '🖍️ Draw what you learn!' },
    auditory: { picture: '👂', lines: ['You learn by listening.', 'Songs and stories help you remember.'], tryIt: '🎵 Say it out loud!' },
    kinesthetic: { picture: '✋', lines: ['You learn by doing.', 'Moving and building help you remember.'], tryIt: '🧱 Build it!' },
    mix: { picture: '🌈', lines: ['You learn in lots of ways.', 'Mixing it up works for you.'], tryIt: '🌟 Try them all!' },
  },
  thinking: {
    analytical: { picture: '🧩', lines: ['You think step by step.', 'You love puzzles and how things work.'], tryIt: '📝 Make a plan first!' },
    creative: { picture: '💡', lines: ['You think up big ideas.', 'You love to imagine new things.'], tryIt: '🎨 Dream up something new!' },
    practical: { picture: '🔧', lines: ['You think about what works.', 'You like to get things done.'], tryIt: '🛠️ Make something useful!' },
    mix: { picture: '🌈', lines: ['You think in lots of ways.', 'Puzzles and ideas both work.'], tryIt: '🌟 Try them all!' },
  },
  decision: {
    quick: { picture: '⚡', lines: ['You decide fast.', 'You trust your feelings and go!'], tryIt: '💪 Be brave and try!' },
    careful: { picture: '🤔', lines: ['You decide with care.', 'You think about what could happen.'], tryIt: '📋 List your choices!' },
    social: { picture: '🤝', lines: ['You decide with friends.', 'You like to hear what others think.'], tryIt: '💬 Ask a friend!' },
    mix: { picture: '🌈', lines: ['You decide in lots of ways.', 'You pick what fits.'], tryIt: '🌟 Trust yourself!' },
  },
};

interface Buddy {
  emoji: string;
  name: string;
  line: string;
}

const EGG: Buddy = { emoji: '🥚', name: 'Mystery Egg', line: 'Play a quiz to hatch your buddy!' };

// The buddy comes from the first finished quiz in this order.
const BUDDIES: Record<Topic, Record<string, Buddy>> = {
  thinking: {
    analytical: { emoji: '🦉', name: 'Puzzle Owl', line: 'Loves puzzles and asking why.' },
    creative: { emoji: '🦊', name: 'Idea Fox', line: 'Full of big, bright ideas.' },
    practical: { emoji: '🐝', name: 'Busy Bee', line: 'Gets things done.' },
  },
  learning: {
    visual: { emoji: '🦋', name: 'Color Butterfly', line: 'Sees the world in color.' },
    auditory: { emoji: '🐦', name: 'Song Bird', line: 'Learns from every sound.' },
    kinesthetic: { emoji: '🐿️', name: 'Zippy Squirrel', line: 'Learns by trying.' },
  },
  decision: {
    quick: { emoji: '🐆', name: 'Speedy Cheetah', line: 'Decides fast.' },
    careful: { emoji: '🐢', name: 'Wise Turtle', line: 'Thinks, then decides.' },
    social: { emoji: '🐬', name: 'Friend Dolphin', line: 'Decides with friends.' },
  },
};
const BUDDY_ORDER: Topic[] = ['thinking', 'learning', 'decision'];
const FALLBACK_BUDDY: Buddy = { emoji: '🌟', name: 'Star Friend', line: 'Learns in lots of ways.' };

/** The saved record wraps the result; older and adult-style records keep it in other places. */
function readStyle(raw: any): string | null {
  const record = raw?.results ?? raw;
  const inner = record?.results ?? record;
  const style = inner?.dominantStyle ?? inner?.primaryStyle ?? inner?.style;
  return typeof style === 'string' && style ? style.toLowerCase() : null;
}

/** Style already on the signed-in user (set when their results come with the session). */
function styleFromUser(user: User, topic: Topic): string | null {
  const type = BACKEND_TYPE[topic];
  const found = user.assessments?.find(a => a.type === type);
  const score: any = found?.score;
  return score ? readStyle(Object.values(score)[0]) : null;
}

type StyleMap = Partial<Record<Topic, string | null>>;

function useMyStyles(user: User) {
  const [styles, setStyles] = useState<StyleMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      TOPICS.map(async topic => {
        try {
          const res = await getAssessmentResults(BACKEND_TYPE[topic]);
          return [topic, readStyle(res?.results)] as const;
        } catch {
          return [topic, null] as const;
        }
      })
    ).then(found => {
      if (cancelled) return;
      const next: StyleMap = {};
      for (const [topic, style] of found) next[topic] = style ?? styleFromUser(user, topic);
      setStyles(next);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [user.id]);

  return { styles, loading };
}

export function KidsMyProfile({ user, onBack, onPlay }: KidsMyProfileProps) {
  const reduceMotion = useReducedMotion();
  const { styles, loading } = useMyStyles(user);
  const firstName = user.name?.trim().split(/\s+/)[0] || 'Friend';

  // A quiz counts as done if we found its style, or the account says it was finished.
  const doneOnAccount = (topic: Topic) =>
    !!user.assessmentsCompleted?.includes(BACKEND_TYPE[topic]) ||
    !!user.assessments?.some(a => a.type === BACKEND_TYPE[topic]);
  const copyFor = (topic: Topic): StyleCopy | null => {
    const style = styles[topic];
    if (style) return COPY[topic][style] ?? COPY[topic].mix;
    return doneOnAccount(topic) ? COPY[topic].mix : null;
  };

  const doneCount = TOPICS.filter(t => copyFor(t)).length;
  const buddyTopic = BUDDY_ORDER.find(t => styles[t] && BUDDIES[t][styles[t] as string]);
  const buddy: Buddy = buddyTopic
    ? BUDDIES[buddyTopic][styles[buddyTopic] as string]
    : doneCount > 0 ? FALLBACK_BUDDY : EGG;

  const narration = loading
    ? ''
    : doneCount === 0
      ? `Hi ${firstName}! Play a quiz to hatch your buddy!`
      : [
          `Hi ${firstName}! You are like ${buddy.name}.`,
          ...TOPICS.flatMap(t => copyFor(t)?.lines ?? []),
        ].join(' ');

  const bob = reduceMotion ? {} : { y: [0, -10, 0] };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'linear-gradient(180deg, #F5F0FA 0%, #EAF1F8 100%)' }}>
      <div className="max-w-3xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <motion.button
            type="button"
            onClick={() => { soundManager.play('select'); onBack(); }}
            className="w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center"
            style={{ border: '4px solid #6B4C9A' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Back"
          >
            <ArrowLeft className="w-8 h-8" style={{ color: '#6B4C9A' }} />
          </motion.button>
          <h1 className="text-4xl md:text-5xl font-black" style={{ color: '#6B4C9A' }}>About Me</h1>
          <div className="w-16 h-16 flex items-center justify-center">
            <AudioNarration text={narration} autoPlay={false} />
          </div>
        </div>

        {/* Buddy */}
        <motion.section
          aria-label="My buddy"
          className="bg-white rounded-3xl shadow-xl px-6 py-8 text-center mb-8"
          style={{ border: '6px solid #6B4C9A' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="mx-auto w-44 h-44 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #EFE9F7 0%, #E8EEF7 100%)', border: '6px solid #5B7DB1' }}
            animate={bob}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="text-8xl leading-none" role="img" aria-label={buddy.name}>
              {loading ? '✨' : buddy.emoji}
            </span>
          </motion.div>

          {loading ? (
            <p className="text-2xl font-bold text-gray-600">Finding your buddy…</p>
          ) : (
            <>
              <p className="text-2xl md:text-3xl font-black text-gray-800 mb-1">
                {doneCount === 0 ? `Hi ${firstName}!` : `Hi ${firstName}! You are like`}
              </p>
              <p className="inline-block px-6 py-2 rounded-full text-3xl md:text-4xl font-black text-white mb-2" style={{ background: '#6B4C9A' }}>
                {buddy.name}
              </p>
              <p className="text-xl md:text-2xl font-bold text-gray-600">{buddy.line}</p>
            </>
          )}
        </motion.section>

        {/* Learn / think / decide */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {TOPICS.map((topic, i) => {
            const info = TOPIC_INFO[topic];
            const copy = copyFor(topic);
            return (
              <motion.section
                key={topic}
                aria-labelledby={`about-${topic}`}
                className="rounded-3xl bg-white shadow-lg overflow-hidden flex flex-col"
                style={{ border: `5px solid ${copy ? info.color : '#D1D5DB'}` }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.12 }}
              >
                <div className="py-5 text-center" style={{ background: copy ? info.tint : '#F3F4F6' }}>
                  <div
                    className="mx-auto w-24 h-24 rounded-full bg-white flex items-center justify-center"
                    style={{ border: `5px solid ${copy ? info.color : '#9CA3AF'}`, borderStyle: copy ? 'solid' : 'dashed' }}
                  >
                    {copy ? (
                      <span className="text-5xl leading-none" aria-hidden>{copy.picture}</span>
                    ) : (
                      <span className="text-5xl leading-none font-black text-gray-400" aria-hidden>?</span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col gap-3 text-center">
                  <h2 id={`about-${topic}`} className="text-2xl font-black" style={{ color: copy ? info.color : '#6B7280' }}>
                    {info.heading}
                  </h2>

                  {copy ? (
                    <>
                      <p className="text-xl font-bold text-gray-800">{copy.lines[0]}</p>
                      <p className="text-lg text-gray-600">{copy.lines[1]}</p>
                      <p
                        className="mt-auto rounded-2xl px-3 py-2 text-lg font-bold"
                        style={{ background: info.tint, color: info.color }}
                      >
                        {copy.tryIt}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xl font-bold text-gray-600">Play the {info.quiz} quiz to find out!</p>
                      {onPlay && (
                        <button
                          type="button"
                          onClick={() => { soundManager.play('next'); onPlay(topic); }}
                          className="mt-auto min-h-[56px] rounded-2xl px-4 text-xl font-black text-white shadow-md"
                          style={{ background: info.color }}
                        >
                          ▶️ Play
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => { soundManager.play('select'); onBack(); }}
            className="min-h-[64px] px-10 rounded-full text-2xl font-black text-white shadow-xl"
            style={{ background: '#6B4C9A', border: '6px solid white' }}
          >
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
}

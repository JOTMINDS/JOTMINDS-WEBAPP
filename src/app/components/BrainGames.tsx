import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Lightbulb, Clock } from 'lucide-react';
import {
  GAME_META,
  GameId,
  makePatternRounds,
  makeRng,
  pickQuickFire,
  pickRiddle,
  riddleAnswerMatches,
  shuffled,
} from '../data/dailyQuestData';

export interface GameResult {
  /** 0 to 1. Finishing always counts; a higher score only earns bonus XP. */
  score: number;
  summary: string;
}

interface GameProps {
  seed: number;
  onFinish: (result: GameResult) => void;
  /** JHS students get the gentler puzzle set. */
  young?: boolean;
}

const PURPLE = '#6B4C9A';

// ---- Small helpers -------------------------------------------------------

function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function useTimeout(fn: () => void, ms: number | null, deps: unknown[]) {
  const ref = useLatest(fn);
  useEffect(() => {
    if (ms === null) return;
    const id = setTimeout(() => ref.current(), ms);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms, ...deps]);
}

function TimerBar({ ms, roundKey }: { ms: number; roundKey: string | number }) {
  const [go, setGo] = useState(false);
  useEffect(() => {
    setGo(false);
    const id = setTimeout(() => setGo(true), 40);
    return () => clearTimeout(id);
  }, [roundKey]);
  return (
    <div aria-hidden className="h-2 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{
          background: PURPLE,
          width: go ? '0%' : '100%',
          transition: go ? `width ${ms}ms linear` : 'none',
        }}
      />
    </div>
  );
}

function GameIntro({ gameId, onStart, onSkip }: { gameId: GameId; onStart: () => void; onSkip?: () => void }) {
  const meta = GAME_META[gameId];
  return (
    <div className="text-center space-y-5 py-2">
      <div className="text-6xl" aria-hidden>{meta.emoji}</div>
      <div>
        <h2 className="text-2xl font-bold text-foreground">{meta.title}</h2>
        <p className="text-muted-foreground mt-1">{meta.tagline}</p>
      </div>
      <ul className="text-sm text-left max-w-sm mx-auto space-y-2 rounded-xl bg-muted/60 p-4">
        {meta.howTo.map((line) => (
          <li key={line} className="flex gap-2">
            <span aria-hidden style={{ color: PURPLE }}>●</span>
            <span>{line}</span>
          </li>
        ))}
        <li className="flex gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden />
          <span>About {meta.seconds >= 60 ? `${Math.round(meta.seconds / 60)} min` : `${meta.seconds} seconds`}</span>
        </li>
      </ul>
      <Button size="lg" className="w-full max-w-sm text-white" style={{ background: PURPLE }} onClick={onStart}>
        Start
      </Button>
      {onSkip && (
        <div>
          <button type="button" onClick={onSkip} className="text-xs text-muted-foreground underline underline-offset-2">
            I can't tell the colors apart. Give me a different game.
          </button>
        </div>
      )}
    </div>
  );
}

// ---- Shared multiple-choice rounds (Quick Fire, Pattern Finder, Color Clash)

interface ChoiceRound {
  prompt: ReactNode;
  options: string[];
  answer: number;
  why?: string;
}

function ChoiceRounds({
  rounds,
  timerMs,
  autoNextMs,
  finishLabel,
  summarise,
  onFinish,
}: {
  rounds: ChoiceRound[];
  timerMs?: number;
  autoNextMs?: number;
  finishLabel: string;
  summarise: (right: number, total: number) => string;
  onFinish: (r: GameResult) => void;
}) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [combo, setCombo] = useState(0);
  const round = rounds[i];
  const answered = picked !== null;
  const isLast = i === rounds.length - 1;

  const choose = (idx: number) => {
    if (answered) return;
    setPicked(idx);
    if (idx === round.answer) {
      setRight((r) => r + 1);
      setCombo((c) => c + 1);
    } else {
      setCombo(0);
    }
  };

  const next = () => {
    if (!isLast) {
      setI(i + 1);
      setPicked(null);
    } else {
      onFinish({ score: right / rounds.length, summary: summarise(right, rounds.length) });
    }
  };

  useTimeout(() => choose(-1), timerMs && !answered ? timerMs : null, [i, answered]);
  useTimeout(next, autoNextMs && answered ? autoNextMs : null, [i, answered]);

  const ok = picked === round.answer;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Round {i + 1} of {rounds.length}</span>
        {combo >= 2 ? <span className="font-semibold text-orange-600">🔥 {combo} in a row!</span> : <span>{right} right</span>}
      </div>
      {timerMs ? (answered ? <div className="h-2" /> : <TimerBar ms={timerMs} roundKey={i} />) : null}

      <div className="text-lg font-semibold text-foreground text-center min-h-[3.5rem] flex items-center justify-center">
        {round.prompt}
      </div>

      <div className={`grid gap-3 ${round.options.length === 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {round.options.map((opt, idx) => {
          const isAnswer = idx === round.answer;
          const isPicked = idx === picked;
          let style = 'bg-card hover:border-[#6B4C9A]';
          if (answered && isAnswer) style = 'bg-green-50 border-green-600 text-green-900 dark:bg-green-950 dark:text-green-100';
          else if (answered && isPicked) style = 'bg-red-50 border-red-600 text-red-900 dark:bg-red-950 dark:text-red-100';
          else if (answered) style = 'bg-card opacity-60';
          return (
            <button
              key={idx}
              type="button"
              disabled={answered}
              onClick={() => choose(idx)}
              className={`min-h-12 rounded-xl border-2 px-4 py-3 text-left font-medium transition-colors flex items-center justify-between gap-2 ${style}`}
            >
              <span>{opt}</span>
              {answered && isAnswer && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" aria-label="Correct answer" />}
              {answered && isPicked && !isAnswer && <XCircle className="h-5 w-5 text-red-600 shrink-0" aria-label="Your answer, not correct" />}
            </button>
          );
        })}
      </div>

      <div aria-live="polite" className="min-h-[3.5rem]">
        {answered && (
          <div className="space-y-3">
            <p className={`text-sm font-medium ${ok ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {picked === -1 ? "Time's up! " : ok ? 'Nice one! ' : 'Not quite. '}
              <span className="font-normal text-foreground">{round.why}</span>
            </p>
            {!autoNextMs && (
              <Button onClick={next} className="w-full text-white" style={{ background: PURPLE }}>
                {isLast ? finishLabel : 'Next'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Quick Fire ----------------------------------------------------------

function QuickFire({ seed, onFinish }: GameProps) {
  const rounds = useMemo<ChoiceRound[]>(
    () => pickQuickFire(seed).map((q) => ({ prompt: q.q, options: q.options, answer: q.answer, why: q.why })),
    [seed],
  );
  return (
    <ChoiceRounds
      rounds={rounds}
      timerMs={15000}
      finishLabel="See my score"
      summarise={(r, t) => `${r} of ${t} right`}
      onFinish={onFinish}
    />
  );
}

// ---- Pattern Finder ------------------------------------------------------

function PatternFinder({ seed, onFinish }: GameProps) {
  const rounds = useMemo<ChoiceRound[]>(
    () =>
      makePatternRounds(seed).map((r) => ({
        prompt: (
          <span className="text-2xl tracking-wide font-bold" style={{ color: PURPLE }}>
            {r.terms.join(' , ')} , ?
          </span>
        ),
        options: r.options.map(String),
        answer: r.answer,
        why: r.why,
      })),
    [seed],
  );
  return (
    <ChoiceRounds
      rounds={rounds}
      finishLabel="See my score"
      summarise={(r, t) => `${r} of ${t} patterns cracked`}
      onFinish={onFinish}
    />
  );
}

// ---- Color Clash (Stroop) ------------------------------------------------

const INKS = [
  { name: 'Red', hex: '#C62828' },
  { name: 'Blue', hex: '#1565C0' },
  { name: 'Green', hex: '#2E7D32' },
  { name: 'Orange', hex: '#E65100' },
];

function ColorClash({ seed, onFinish }: GameProps) {
  const rounds = useMemo<ChoiceRound[]>(() => {
    const rnd = makeRng(seed);
    return Array.from({ length: 8 }, () => {
      const ink = Math.floor(rnd() * INKS.length);
      let word = Math.floor(rnd() * INKS.length);
      if (word === ink) word = (word + 1 + Math.floor(rnd() * (INKS.length - 1))) % INKS.length;
      return {
        prompt: (
          <span className="rounded-xl bg-white px-6 py-3 text-4xl font-extrabold tracking-wide" style={{ color: INKS[ink].hex }}>
            {INKS[word].name.toUpperCase()}
          </span>
        ),
        options: INKS.map((c) => c.name),
        answer: ink,
        why: `It was printed in ${INKS[ink].name.toLowerCase()}.`,
      };
    });
  }, [seed]);
  return (
    <ChoiceRounds
      rounds={rounds}
      timerMs={4000}
      autoNextMs={900}
      finishLabel="See my score"
      summarise={(r, t) => `${r} of ${t} colors spotted`}
      onFinish={onFinish}
    />
  );
}

// ---- Memory Match --------------------------------------------------------

const ANIMALS = [
  { e: '🦁', n: 'lion' }, { e: '🐘', n: 'elephant' }, { e: '🦜', n: 'parrot' }, { e: '🐢', n: 'turtle' },
  { e: '🦒', n: 'giraffe' }, { e: '🐆', n: 'leopard' }, { e: '🦓', n: 'zebra' }, { e: '🐠', n: 'fish' },
  { e: '🦋', n: 'butterfly' }, { e: '🐝', n: 'bee' },
];

function MemoryMatch({ seed, onFinish }: GameProps) {
  const cards = useMemo(() => {
    const rnd = makeRng(seed);
    const six = shuffled(ANIMALS, rnd).slice(0, 6);
    return shuffled([...six, ...six], rnd);
  }, [seed]);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const finishRef = useLatest(() => {
    // 6 moves is perfect. Every extra move costs a little, never below 40%.
    const score = Math.max(0.4, Math.min(1, 1 - (moves - 6) / 14));
    onFinish({ score, summary: `All pairs found in ${moves} moves` });
  });

  const flip = (idx: number) => {
    if (open.length >= 2 || open.includes(idx) || matched.includes(idx)) return;
    const nowOpen = [...open, idx];
    setOpen(nowOpen);
    if (nowOpen.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nowOpen;
      if (cards[a].e === cards[b].e) {
        setMatched((m) => [...m, a, b]);
        setOpen([]);
      } else {
        setTimeout(() => setOpen([]), 800);
      }
    }
  };

  useEffect(() => {
    if (matched.length !== cards.length) return;
    const id = setTimeout(() => finishRef.current(), 1000);
    return () => clearTimeout(id);
  }, [matched.length, cards.length, finishRef]);

  const stars = moves <= 8 ? 3 : moves <= 12 ? 2 : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{matched.length / 2} of {cards.length / 2} pairs</span>
        <span>{moves} {moves === 1 ? 'move' : 'moves'}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-sm mx-auto">
        {cards.map((c, idx) => {
          const faceUp = open.includes(idx) || matched.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => flip(idx)}
              aria-label={faceUp ? `Card ${idx + 1}: ${c.n}` : `Card ${idx + 1}: face down`}
              className={`aspect-square rounded-xl border-2 text-3xl sm:text-4xl flex items-center justify-center transition-colors ${
                matched.includes(idx)
                  ? 'border-green-600 bg-green-50 dark:bg-green-950'
                  : faceUp
                    ? 'border-[#6B4C9A] bg-card'
                    : 'border-transparent text-transparent'
              }`}
              style={faceUp ? undefined : { background: PURPLE }}
            >
              {faceUp ? c.e : '?'}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="text-center text-sm text-muted-foreground min-h-5">
        {matched.length === cards.length ? `${'⭐'.repeat(stars)} All pairs found!` : 'Tap two cards to flip them.'}
      </p>
    </div>
  );
}

// ---- Spot the Repeat (1-back) --------------------------------------------

const LETTERS = 'BDFKMPRT'.split('');
const NBACK_LENGTH = 12;

function SpotTheRepeat({ seed, onFinish }: GameProps) {
  const seq = useMemo(() => {
    const rnd = makeRng(seed);
    const out = [LETTERS[Math.floor(rnd() * LETTERS.length)]];
    for (let k = 1; k < NBACK_LENGTH; k++) {
      if (rnd() < 0.35) out.push(out[k - 1]);
      else {
        const choices = LETTERS.filter((l) => l !== out[k - 1]);
        out.push(choices[Math.floor(rnd() * choices.length)]);
      }
    }
    return out;
  }, [seed]);

  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  const [taps, setTaps] = useState<Record<number, boolean>>({});
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const done = i >= NBACK_LENGTH;
  const finishRef = useLatest(() => {
    let correct = 0;
    for (let k = 1; k < NBACK_LENGTH; k++) {
      if ((seq[k] === seq[k - 1]) === !!taps[k]) correct++;
    }
    onFinish({ score: correct / (NBACK_LENGTH - 1), summary: `${correct} of ${NBACK_LENGTH - 1} calls right` });
  });

  useEffect(() => {
    if (done) {
      finishRef.current();
      return;
    }
    setVisible(true);
    setFlash(null);
    const hide = setTimeout(() => setVisible(false), 1300);
    const advance = setTimeout(() => setI((n) => n + 1), 1800);
    return () => {
      clearTimeout(hide);
      clearTimeout(advance);
    };
  }, [i, done, finishRef]);

  const tap = () => {
    if (done || i === 0 || taps[i]) return;
    setTaps((t) => ({ ...t, [i]: true }));
    setFlash(seq[i] === seq[i - 1] ? 'good' : 'bad');
  };

  return (
    <div className="space-y-5 text-center">
      <p className="text-sm text-muted-foreground">Letter {Math.min(i + 1, NBACK_LENGTH)} of {NBACK_LENGTH}</p>
      <div
        className="mx-auto flex h-32 w-32 items-center justify-center rounded-2xl text-6xl font-extrabold text-white"
        style={{ background: PURPLE }}
        aria-live="polite"
      >
        {visible && !done ? seq[i] : ''}
      </div>
      <p className="min-h-6 text-sm font-medium" aria-live="polite">
        {flash === 'good' && <span className="text-green-700 dark:text-green-400">✓ Yes, a repeat!</span>}
        {flash === 'bad' && <span className="text-red-700 dark:text-red-400">✗ That one was different.</span>}
      </p>
      <Button size="lg" className="w-full max-w-sm text-white" style={{ background: PURPLE }} onClick={tap} disabled={i === 0}>
        SAME as the last one
      </Button>
      <p className="text-xs text-muted-foreground">Only tap when it matches the letter right before it.</p>
    </div>
  );
}

// ---- Brain Teaser --------------------------------------------------------

function BrainTeaser({ seed, onFinish, young }: GameProps) {
  const riddle = useMemo(() => pickRiddle(seed, young), [seed, young]);
  const [guess, setGuess] = useState('');
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(false);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (status !== 'playing' || !guess.trim()) return;
    if (riddleAnswerMatches(guess, riddle)) {
      setStatus('won');
      return;
    }
    const used = tries + 1;
    setTries(used);
    if (used >= 2) setStatus('lost');
    else {
      setMessage('Not quite. One more try!');
      setGuess('');
    }
  };

  const score = status === 'won' ? Math.max(0.5, 1 - (tries > 0 ? 0.3 : 0) - (hint ? 0.2 : 0)) : 0.3;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold" style={{ color: PURPLE }}>{riddle.title}</h3>
      <p className="text-foreground">{riddle.prompt}</p>

      {status === 'playing' ? (
        <>
          {hint ? (
            <p className="rounded-lg bg-yellow-50 border border-yellow-300 p-3 text-sm text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100">
              <Lightbulb className="inline h-4 w-4 mr-1" aria-hidden /> {riddle.hint}
            </p>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={() => setHint(true)}>
              <Lightbulb className="h-4 w-4 mr-1" aria-hidden /> Show a hint (fewer points)
            </Button>
          )}
          <form onSubmit={submit} className="space-y-3">
            <label htmlFor="riddle-answer" className="text-sm font-medium">
              Your answer ({2 - tries} {2 - tries === 1 ? 'try' : 'tries'} left)
            </label>
            <input
              id="riddle-answer"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              autoComplete="off"
              className="w-full rounded-lg border-2 bg-background p-3 focus:border-[#6B4C9A] focus:outline-none"
              placeholder="Type here…"
            />
            <p aria-live="polite" className="min-h-5 text-sm text-red-700 dark:text-red-400">{message}</p>
            <Button type="submit" className="w-full text-white" style={{ background: PURPLE }} disabled={!guess.trim()}>
              Check my answer
            </Button>
          </form>
        </>
      ) : (
        <div className="space-y-3" aria-live="polite">
          <p className={`font-semibold ${status === 'won' ? 'text-green-700 dark:text-green-400' : 'text-foreground'}`}>
            {status === 'won' ? '🎉 You cracked it!' : `Good try! The answer was “${riddle.display}”.`}
          </p>
          <p className="text-sm text-muted-foreground">{riddle.why}</p>
          <Button
            className="w-full text-white"
            style={{ background: PURPLE }}
            onClick={() =>
              onFinish({
                score,
                summary: status === 'won' ? (tries === 0 ? 'Solved on the first try' : 'Solved on the second try') : 'Learned something new',
              })
            }
          >
            Finish
          </Button>
        </div>
      )}
    </div>
  );
}

// ---- Public wrapper ------------------------------------------------------

export function BrainGame({
  gameId,
  seed,
  onFinish,
  onSkip,
  young,
}: {
  gameId: GameId;
  seed: number;
  onFinish: (r: GameResult) => void;
  young?: boolean;
  /** Only used by Color Clash, for students who cannot tell the colors apart. */
  onSkip?: () => void;
}) {
  const [started, setStarted] = useState(false);
  if (!started) {
    return <GameIntro gameId={gameId} onStart={() => setStarted(true)} onSkip={gameId === 'stroop' ? onSkip : undefined} />;
  }
  const props = { seed, onFinish, young };
  switch (gameId) {
    case 'quickfire': return <QuickFire {...props} />;
    case 'memory-match': return <MemoryMatch {...props} />;
    case 'pattern': return <PatternFinder {...props} />;
    case 'stroop': return <ColorClash {...props} />;
    case 'riddle': return <BrainTeaser {...props} />;
    case 'n-back': return <SpotTheRepeat {...props} />;
  }
}

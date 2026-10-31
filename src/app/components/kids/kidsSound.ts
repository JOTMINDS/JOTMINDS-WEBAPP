import { useEffect, useState, useSyncExternalStore } from 'react';
import { soundManager } from './SoundFeedback';

/**
 * Sound settings for Kids Mode, remembered per child on this device, plus the narration voice
 * logic shared by every screen that reads aloud.
 *
 * Why the voice used to differ between accounts: the voice was picked inside speak(), from
 * speechSynthesis.getVoices(). Browsers load that list asynchronously, so a child who landed
 * on a narrated screen right after sign-in often got an empty list, no voice was set, and the
 * browser fell back to its own default (the "old" voice). The fallback was also "first English
 * voice", which changes with every device. Now voices are awaited, the choice is ranked
 * deterministically, and a child can pick their own voice, which is then remembered.
 */

export interface KidsSoundSettings {
  /** Beeps, pops and chimes. */
  effects: boolean;
  /** Reading questions and messages aloud. */
  narration: boolean;
  /** voiceURI of the voice this child picked; null means "use the best default". */
  voiceURI: string | null;
}

const DEFAULT_SETTINGS: KidsSoundSettings = { effects: true, narration: true, voiceURI: null };
const GUEST_ID = 'guest';
const LEGACY_MUTE_KEY = 'kids_sound_muted';

const storageKey = (childId: string) => `jm_kids_sound_${childId}`;

// ---------------------------------------------------------------------------
// Per-child settings store
// ---------------------------------------------------------------------------

type Listener = () => void;

let activeChildId = GUEST_ID;
let loadedFor: string | null = null;
let current: KidsSoundSettings = DEFAULT_SETTINGS;
const listeners = new Set<Listener>();

function readSettings(childId: string): KidsSoundSettings {
  try {
    const raw = localStorage.getItem(storageKey(childId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        effects: parsed.effects !== false,
        narration: parsed.narration !== false,
        voiceURI: typeof parsed.voiceURI === 'string' ? parsed.voiceURI : null,
      };
    }
    // One-time hand-over from the old device-wide mute flag. The first child to open Kids Mode
    // after the update takes it, so it never leaks to the next child on a shared device.
    const legacy = localStorage.getItem(LEGACY_MUTE_KEY);
    if (legacy !== null) {
      const on = legacy !== 'true';
      const migrated = { ...DEFAULT_SETTINGS, effects: on, narration: on };
      localStorage.setItem(storageKey(childId), JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_MUTE_KEY);
      return migrated;
    }
  } catch {
    // Storage blocked or corrupt: fall through to the defaults.
  }
  return DEFAULT_SETTINGS;
}

function applySettings() {
  soundManager.setEnabled(current.effects);
  if (!current.narration) cancelSpeech();
}

function commit(next: KidsSoundSettings) {
  current = next;
  applySettings();
  listeners.forEach(listener => listener());
}

export const kidsSound = {
  /** Switch to a child's saved settings. Safe to call repeatedly with the same id. */
  setChild(childId?: string | null) {
    const id = childId || GUEST_ID;
    if (id === loadedFor) return;
    loadedFor = id;
    activeChildId = id;
    commit(readSettings(id));
  },
  get: () => current,
  update(patch: Partial<KidsSoundSettings>) {
    const next = { ...current, ...patch };
    try {
      localStorage.setItem(storageKey(activeChildId), JSON.stringify(next));
    } catch {
      // Not remembered, but still applies for this visit.
    }
    commit(next);
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  },
};

export function useKidsSound() {
  return useSyncExternalStore(kidsSound.subscribe, kidsSound.get, kidsSound.get);
}

// ---------------------------------------------------------------------------
// Speech voices
// ---------------------------------------------------------------------------

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function cancelSpeech() {
  try {
    if (speechSupported()) window.speechSynthesis.cancel();
  } catch {
    // Nothing to stop.
  }
}

/** Waits for the browser to finish loading its voice list (never resolves later than the timeout). */
export function loadVoices(timeoutMs = 2500): Promise<SpeechSynthesisVoice[]> {
  if (!speechSupported()) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const ready = synth.getVoices();
  if (ready.length) return Promise.resolve(ready);

  return new Promise(resolve => {
    let timer: ReturnType<typeof setTimeout>;
    const finish = () => {
      clearTimeout(timer);
      synth.removeEventListener('voiceschanged', finish);
      resolve(synth.getVoices());
    };
    synth.addEventListener('voiceschanged', finish);
    timer = setTimeout(finish, timeoutMs);
  });
}

/** The browser's voices, kept up to date as they finish loading. */
export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() =>
    speechSupported() ? window.speechSynthesis.getVoices() : []
  );
  useEffect(() => {
    if (!speechSupported()) return;
    const synth = window.speechSynthesis;
    const refresh = () => setVoices(synth.getVoices());
    synth.addEventListener('voiceschanged', refresh);
    loadVoices().then(setVoices);
    return () => synth.removeEventListener('voiceschanged', refresh);
  }, []);
  return voices;
}

// Warm, natural voices that suit young listeners, best first. Browsers rarely label voices
// "female" or "child", so we recognise well-known ones by name.
const FRIENDLY_VOICE_NAMES = [
  'samantha', 'ava', 'allison', 'karen', 'tessa', 'moira', 'serena', 'zoe', 'nicky',
  'google uk english female', 'google us english', 'aria', 'jenny', 'ana', 'emma', 'sonia', 'libby',
  'michelle', 'joanna', 'salli', 'ivy', 'kendra', 'zira',
];

// MacOS ships joke and effect voices that Chrome lists next to the real ones.
const NOVELTY_VOICES = [
  'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'deranged', 'good news',
  'hysterical', 'organ', 'trinoids', 'whisper', 'zarvox', 'superstar', 'jester', 'wobble',
  'grandma', 'grandpa', 'rocko', 'flo', 'eddy', 'reed', 'shelley', 'sandy', 'fred', 'junior', 'ralph', 'kathy',
];

const isEnglish = (v: SpeechSynthesisVoice) => v.lang?.toLowerCase().replace('_', '-').startsWith('en');
const isNovelty = (v: SpeechSynthesisVoice) => {
  const name = v.name.toLowerCase();
  return NOVELTY_VOICES.some(n => name === n || name.startsWith(`${n} `));
};

function voiceScore(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  const lang = v.lang?.toLowerCase().replace('_', '-') || '';
  let score = 0;
  const friendly = FRIENDLY_VOICE_NAMES.findIndex(n => name.includes(n));
  if (friendly !== -1) score += 40 - friendly;
  if (/natural|neural|enhanced|premium/.test(name)) score += 50;
  if (v.localService) score += 5;
  if (lang === 'en-us') score += 3;
  else if (lang === 'en-gb') score += 2;
  else if (lang === 'en-au' || lang === 'en-ca') score += 1;
  return score;
}

/** Up to four good English voices, best first. The same browser always gets the same order. */
export function getVoiceOptions(voices: SpeechSynthesisVoice[], limit = 4): SpeechSynthesisVoice[] {
  const seen = new Set<string>();
  return voices
    .filter(v => isEnglish(v) && !isNovelty(v))
    .sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name))
    // "Karen" and "Karen (Enhanced)" are one choice for a child; the better one sorts first.
    .filter(v => {
      const label = friendlyVoiceName(v).toLowerCase();
      return !seen.has(label) && !!seen.add(label);
    })
    .slice(0, limit);
}

/** The child's saved voice if this device still has it, otherwise the best default. */
export function resolveVoice(voices: SpeechSynthesisVoice[], voiceURI: string | null): SpeechSynthesisVoice | undefined {
  if (voiceURI) {
    const saved = voices.find(v => v.voiceURI === voiceURI);
    if (saved) return saved;
  }
  return getVoiceOptions(voices, 1)[0] ?? voices.find(isEnglish) ?? voices[0];
}

/** "Microsoft Aria Online (Natural) - English (United States)" becomes "Aria". */
export function friendlyVoiceName(v: SpeechSynthesisVoice): string {
  const cleaned = v.name
    .replace(/^(microsoft|apple|google)\s+/i, '')
    .replace(/\s*[-–].*$/, '')
    .replace(/\s*\(.*?\)/g, '')
    .replace(/\s+(online|natural|neural|enhanced|premium|compact)\b/gi, '')
    .trim();
  return cleaned || v.name;
}

/** Plays a short sample so a child can hear a voice before choosing it. */
export async function previewVoice(voice: SpeechSynthesisVoice, text: string): Promise<void> {
  if (!speechSupported()) return;
  try {
    cancelSpeech();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    // Chrome drops a speak() that comes straight after cancel().
    await new Promise(resolve => setTimeout(resolve, 100));
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('Could not play the voice sample:', error);
  }
}

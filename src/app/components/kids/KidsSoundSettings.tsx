import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Check } from 'lucide-react';
import { soundManager } from './SoundFeedback';
import {
  kidsSound,
  useKidsSound,
  useVoices,
  getVoiceOptions,
  resolveVoice,
  friendlyVoiceName,
  previewVoice,
  speechSupported,
} from './kidsSound';

const PURPLE = '#6B4C9A';
const GREEN = '#1E8A6E';
const VOICE_FACES = ['🦊', '🐼', '🐸', '🦄', '🐯', '🐙'];

/**
 * One big speaker button. Off silences the beeps and the reading voice together,
 * and the choice is remembered for this child.
 */
export function SoundToggleButton({ className = '' }: { className?: string }) {
  const { effects, narration } = useKidsSound();
  const isOn = effects || narration;

  const toggle = () => {
    if (isOn) {
      kidsSound.update({ effects: false, narration: false });
    } else {
      kidsSound.update({ effects: true, narration: true });
      soundManager.play('pop');
    }
  };

  return (
    <motion.button
      type="button"
      onClick={toggle}
      className={`w-16 h-16 rounded-full bg-white shadow-xl flex items-center justify-center ${className}`}
      style={{ border: `4px solid ${isOn ? GREEN : '#9CA3AF'}` }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-pressed={isOn}
      aria-label={isOn ? 'Sound is on. Tap to turn off' : 'Sound is off. Tap to turn on'}
    >
      {isOn ? <Volume2 className="w-8 h-8" style={{ color: GREEN }} /> : <VolumeX className="w-8 h-8 text-gray-500" />}
    </motion.button>
  );
}

function SwitchRow({ icon, label, on, onChange }: { icon: string; label: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="w-full flex items-center gap-4 rounded-2xl px-4 min-h-[64px] text-left"
      style={{ background: on ? '#E8F5F1' : '#F3F4F6', border: `3px solid ${on ? GREEN : '#D1D5DB'}` }}
    >
      <span className="text-3xl" aria-hidden>{icon}</span>
      <span className="flex-1 text-xl font-black text-gray-800">{label}</span>
      <span
        className="px-4 py-1.5 rounded-full text-base font-black text-white"
        style={{ background: on ? GREEN : '#6B7280' }}
      >
        {on ? 'ON' : 'OFF'}
      </span>
    </button>
  );
}

/** Sound effects, read-aloud and voice choice for the child who is signed in. */
export function SoundSettingsPanel({ onClose }: { onClose: () => void }) {
  const { effects, narration, voiceURI, voiceName } = useKidsSound();
  const voices = useVoices();
  const options = getVoiceOptions(voices);
  const chosen = resolveVoice(voices, voiceURI, voiceName);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pickVoice = (voice: SpeechSynthesisVoice) => {
    kidsSound.update({ voiceURI: voice.voiceURI, voiceName: friendlyVoiceName(voice) });
    soundManager.play('pop');
    previewVoice(voice, 'Hi! I can read to you.');
  };

  const canPickVoice = narration && speechSupported() && options.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Sound and voice"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 text-slate-800"
        style={{ border: `4px solid ${PURPLE}` }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black" style={{ color: PURPLE }}>🎧 Sound</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-11 h-11 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <SwitchRow icon="🔔" label="Sounds" on={effects} onChange={on => kidsSound.update({ effects: on })} />
          <SwitchRow icon="📖" label="Read to me" on={narration} onChange={on => kidsSound.update({ narration: on })} />
        </div>

        <div>
          <p className="text-xl font-black mb-3" style={{ color: PURPLE }}>🗣️ My voice</p>
          {!speechSupported() || (voices.length > 0 && options.length === 0) ? (
            <p className="text-lg text-gray-600">This device has no voices.</p>
          ) : options.length === 0 ? (
            <p className="text-lg text-gray-600">Finding voices…</p>
          ) : (
            <ul className={`space-y-2 ${narration ? '' : 'opacity-50'}`}>
              {options.map((voice, i) => {
                const selected = chosen?.voiceURI === voice.voiceURI;
                return (
                  <li key={voice.voiceURI}>
                    <button
                      type="button"
                      disabled={!canPickVoice}
                      onClick={() => pickVoice(voice)}
                      aria-pressed={selected}
                      className="w-full flex items-center gap-4 rounded-2xl px-4 min-h-[60px] text-left"
                      style={{
                        background: selected ? '#EFE9F7' : '#FFFFFF',
                        border: `3px solid ${selected ? PURPLE : '#E5E7EB'}`,
                      }}
                    >
                      <span className="text-3xl" aria-hidden>{VOICE_FACES[i % VOICE_FACES.length]}</span>
                      <span className="flex-1 text-xl font-bold text-gray-800">{friendlyVoiceName(voice)}</span>
                      {selected ? (
                        <Check className="w-7 h-7" style={{ color: PURPLE }} aria-label="Chosen" />
                      ) : (
                        <Volume2 className="w-6 h-6 text-gray-400" aria-label="Hear it" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 text-xl text-white font-black rounded-2xl shadow-lg"
          style={{ background: PURPLE }}
        >
          Done
        </button>
      </motion.div>
    </div>
  );
}

/**
 * Sound Feedback System for Kids Mode
 * Provides audio feedback for interactions to maintain attention
 */

export type SoundType = 
  | 'click'          // Standard button click
  | 'success'        // Correct answer, completion
  | 'progress'       // Moving forward
  | 'celebration'    // Major achievement
  | 'whoosh'         // Quick transition
  | 'pop'            // Item appears
  | 'sparkle'        // Badge unlock
  | 'next'           // Next question
  | 'select';        // Selection/navigation

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private createOscillator(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  // Standard click sound
  playClick() {
    this.createOscillator(800, 0.1, 'sine');
  }

  // Success sound (ascending notes)
  playSuccess() {
    if (!this.audioContext || !this.enabled) return;

    const notes = [523, 659, 784]; // C, E, G (major chord)
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator(freq, 0.15, 'sine');
      }, i * 100);
    });
  }

  // Progress sound (gentle upward note)
  playProgress() {
    this.createOscillator(600, 0.15, 'sine');
  }

  // Celebration sound (fanfare)
  playCelebration() {
    if (!this.audioContext || !this.enabled) return;

    const melody = [523, 659, 784, 1047]; // C, E, G, high C
    melody.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator(freq, 0.2, 'triangle');
      }, i * 150);
    });
  }

  // Whoosh sound (quick slide down)
  playWhoosh() {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Slide from high to low
    oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + 0.2);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);
  }

  // Pop sound (quick burst)
  playPop() {
    if (!this.audioContext || !this.enabled) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.05);
    oscillator.type = 'square';
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.05);
  }

  // Sparkle sound (magical twinkling)
  playSparkle() {
    if (!this.audioContext || !this.enabled) return;

    const notes = [1047, 1319, 1568, 2093]; // High notes
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator(freq, 0.1, 'sine');
      }, i * 50);
    });
  }

  // Next question sound (encouraging)
  playNext() {
    if (!this.audioContext || !this.enabled) return;

    const notes = [659, 784]; // E, G (moving forward)
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.createOscillator(freq, 0.12, 'sine');
      }, i * 80);
    });
  }

  // Play sound by type
  play(type: SoundType) {
    try {
      switch (type) {
        case 'click':
          this.playClick();
          break;
        case 'success':
          this.playSuccess();
          break;
        case 'progress':
          this.playProgress();
          break;
        case 'celebration':
          this.playCelebration();
          break;
        case 'whoosh':
          this.playWhoosh();
          break;
        case 'pop':
          this.playPop();
          break;
        case 'sparkle':
          this.playSparkle();
          break;
        case 'next':
          this.playNext();
          break;
        case 'select':
          this.playClick(); // Use click sound for select
          break;
      }
    } catch (e) {
      console.log('Sound playback failed:', e);
    }
  }
}

// Singleton instance
const soundManagerInstance = new SoundManager();

// Named export for direct access
export const soundManager = soundManagerInstance;

// Hook for using sound feedback
export function useSound() {
  return {
    play: (type: SoundType) => soundManagerInstance.play(type),
    setEnabled: (enabled: boolean) => soundManagerInstance.setEnabled(enabled),
  };
}

// Helper component for sound effects
export function SoundEffect({ 
  trigger, 
  type 
}: { 
  trigger: boolean; 
  type: SoundType;
}) {
  if (trigger) {
    soundManagerInstance.play(type);
  }
  return null;
}

// Default export for backwards compatibility
export default soundManagerInstance;

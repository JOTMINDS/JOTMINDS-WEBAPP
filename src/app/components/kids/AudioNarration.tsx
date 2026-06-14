import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioNarrationProps {
  text: string;
  autoPlay?: boolean;
  showButton?: boolean;
  voice?: 'child' | 'adult';
  rate?: number;
  onComplete?: () => void;
}

export function AudioNarration({
  text,
  autoPlay = false,
  showButton = true,
  voice = 'child',
  rate = 0.9,
  onComplete
}: AudioNarrationProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if speech synthesis is supported
    setIsSupported('speechSynthesis' in window);

    return () => {
      // Cleanup on unmount
      try {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch (error) {
        // Silently handle cleanup errors
        console.warn('Error during speech cleanup:', error);
      }
    };
  }, []);

  useEffect(() => {
    if (autoPlay && isSupported && text) {
      // Add a small delay for autoplay to prevent conflicts
      const timer = setTimeout(() => {
        speak();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [text, autoPlay, isSupported]);

  const speak = () => {
    if (!isSupported || !text) return;

    try {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      // Remove emojis from text before speaking
      // This comprehensive regex matches all emoji characters including:
      // - Emoticons (😊, 🎉, etc.)
      // - Symbols (✨, ⭐, etc.)
      // - Regional indicators (flags)
      // - Skin tone modifiers
      // - Combined emojis
      const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]/gu;
      const cleanText = text.replace(emojiRegex, '').replace(/\s+/g, ' ').trim();

      // Don't speak if there's no text after cleaning
      if (!cleanText) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Try to find a suitable voice
      const voices = window.speechSynthesis.getVoices();
      
      // Prefer female/child-like voices for kids mode
      const preferredVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('woman') ||
        v.name.toLowerCase().includes('child')
      ) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Slower, clearer speech for children
      utterance.rate = rate;
      utterance.pitch = voice === 'child' ? 1.2 : 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        onComplete?.();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        // Silently handle common speech synthesis errors
        // "interrupted" is expected when user navigates quickly - don't log it
        if (event.error !== 'interrupted') {
          console.warn('Speech synthesis encountered an issue:', event.error);
        }
      };

      utteranceRef.current = utterance;
      
      // Small delay to ensure cancel completes before speaking
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 100);
    } catch (error) {
      // Gracefully handle any speech synthesis errors
      console.warn('Speech synthesis unavailable:', error);
      setIsSpeaking(false);
    }
  };

  const stop = () => {
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } catch (error) {
      console.warn('Error stopping speech:', error);
      setIsSpeaking(false);
    }
  };

  const toggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak();
    }
  };

  // Don't render if not supported, no button needed, or no text
  if (!isSupported || !showButton || !text || text.trim() === '') {
    return null;
  }

  return (
    <motion.button
      className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
      style={{
        background: isSpeaking 
          ? 'linear-gradient(135deg, #FF6B9D 0%, #C06C84 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '3px solid white'
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      animate={isSpeaking ? {
        scale: [1, 1.1, 1],
      } : {}}
      transition={{
        scale: {
          duration: 0.5,
          repeat: isSpeaking ? Infinity : 0,
          ease: "easeInOut"
        }
      }}
      onClick={toggle}
      aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
    >
      {isSpeaking ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Volume2 className="w-6 h-6 text-white" />
        </motion.div>
      ) : (
        <Volume2 className="w-6 h-6 text-white" />
      )}
    </motion.button>
  );
}

// Auto-narration wrapper component
export function NarratedText({
  children,
  text,
  autoPlay = false,
  className = ''
}: {
  children: React.ReactNode;
  text: string;
  autoPlay?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <AudioNarration 
        text={text} 
        autoPlay={autoPlay}
        showButton={true}
      />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}

// Pre-load voices (some browsers need this)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  try {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        window.speechSynthesis.getVoices();
      } catch (error) {
        console.warn('Error loading voices:', error);
      }
    };
  } catch (error) {
    console.warn('Speech synthesis initialization error:', error);
  }
}

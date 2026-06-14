import { AudioNarration, NarratedText } from './AudioNarration';
import { Mascot } from './Mascot';

/**
 * Test component to verify audio narration correctly strips emojis
 * This demonstrates that text with emojis will be spoken without them
 */
export function AudioNarrationTest() {
  const testMessages = [
    {
      title: "Welcome Message",
      original: "Hi! I'm Jot! Let's have fun learning together! 🎉",
      spoken: "Hi! I'm Jot! Let's have fun learning together!",
      emotion: 'excited' as const
    },
    {
      title: "Thinking Message",
      original: "Hmm... let me think about that! 🤔",
      spoken: "Hmm... let me think about that!",
      emotion: 'thinking' as const
    },
    {
      title: "Celebration Message",
      original: "You did it! I'm so proud of you! 🎉",
      spoken: "You did it! I'm so proud of you!",
      emotion: 'celebrating' as const
    },
    {
      title: "Encouragement Message",
      original: "Keep going! You're doing great! 💪⭐",
      spoken: "Keep going! You're doing great!",
      emotion: 'encouraging' as const
    },
    {
      title: "Multiple Emojis",
      original: "Wow! Let's explore and be creative! ✨🎨🌟",
      spoken: "Wow! Let's explore and be creative!",
      emotion: 'excited' as const
    },
    {
      title: "Complex Emojis",
      original: "You're amazing! Great job! 🎉❤️👏",
      spoken: "You're amazing! Great job!",
      emotion: 'celebrating' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4" style={{ color: '#1a1a1a' }}>
            🔊 Audio Narration Test
          </h1>
          <p className="text-xl text-gray-600">
            Click the speaker buttons to hear how emojis are filtered from speech
          </p>
        </div>

        {/* Test Cases */}
        <div className="space-y-6">
          {testMessages.map((test, index) => (
            <div 
              key={index}
              className="bg-white rounded-3xl shadow-xl p-8 border-4 border-purple-200"
            >
              <h2 className="text-2xl mb-4 text-purple-900">
                {test.title}
              </h2>

              {/* Visual Display with Mascot */}
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                <div className="flex items-center justify-center mb-4">
                  <Mascot
                    emotion={test.emotion}
                    message={test.original}
                    size="medium"
                    position="center"
                    showSpeechBubble={true}
                  />
                </div>
              </div>

              {/* Text Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                  <h3 className="text-sm uppercase tracking-wide text-blue-700 mb-2">
                    📝 Visual Text (with emojis)
                  </h3>
                  <p className="text-lg" style={{ color: '#1a1a1a' }}>
                    "{test.original}"
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <h3 className="text-sm uppercase tracking-wide text-green-700 mb-2">
                    🔊 Spoken Text (no emojis)
                  </h3>
                  <p className="text-lg" style={{ color: '#1a1a1a' }}>
                    "{test.spoken}"
                  </p>
                </div>
              </div>

              {/* Audio Button */}
              <div className="flex items-center justify-center gap-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6">
                <AudioNarration
                  text={test.original}
                  autoPlay={false}
                  showButton={true}
                  voice="child"
                  rate={0.9}
                />
                <div className="text-center">
                  <p className="text-gray-700">
                    Click the speaker to hear narration
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    (Emojis will be automatically removed from speech)
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NarratedText Component Test */}
        <div className="mt-12 bg-white rounded-3xl shadow-xl p-8 border-4 border-yellow-200">
          <h2 className="text-3xl mb-6 text-yellow-900 text-center">
            NarratedText Component Test
          </h2>
          
          <div className="space-y-4">
            <NarratedText 
              text="Welcome to Kids Mode! 🎉 Let's learn together!"
              autoPlay={false}
            >
              <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                <p className="text-xl" style={{ color: '#1a1a1a' }}>
                  Welcome to Kids Mode! 🎉 Let's learn together!
                </p>
              </div>
            </NarratedText>

            <NarratedText 
              text="You're doing an amazing job! Keep going! 💪⭐"
              autoPlay={false}
            >
              <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                <p className="text-xl" style={{ color: '#1a1a1a' }}>
                  You're doing an amazing job! Keep going! 💪⭐
                </p>
              </div>
            </NarratedText>

            <NarratedText 
              text="Great work! You earned a star! 🌟🎊"
              autoPlay={false}
            >
              <div className="bg-pink-50 rounded-xl p-4 border-2 border-pink-200">
                <p className="text-xl" style={{ color: '#1a1a1a' }}>
                  Great work! You earned a star! 🌟🎊
                </p>
              </div>
            </NarratedText>
          </div>
        </div>

        {/* Technical Info */}
        <div className="mt-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-xl p-8 text-white">
          <h2 className="text-3xl mb-6 text-center">
            ⚙️ Technical Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl mb-3 text-yellow-400">
                How It Works
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>✅ Comprehensive emoji regex removes all emoji types</li>
                <li>✅ Preserves all text content</li>
                <li>✅ Cleans up extra whitespace</li>
                <li>✅ Works with speech synthesis API</li>
                <li>✅ No visual changes - emojis still display</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl mb-3 text-green-400">
                Supported Emoji Types
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>😊 Faces and emotions</li>
                <li>🎉 Activities and celebrations</li>
                <li>⭐ Symbols and shapes</li>
                <li>🌟 Objects and nature</li>
                <li>❤️ Hearts and skin tones</li>
                <li>🏴 Flags and regional indicators</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-gray-700 rounded-xl p-4">
            <h3 className="text-lg mb-2 text-blue-300">Code Implementation</h3>
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`// In AudioNarration.tsx
const emojiRegex = /[comprehensive emoji pattern]/gu;
const cleanText = text
  .replace(emojiRegex, '')
  .replace(/\\s+/g, ' ')
  .trim();`}
            </pre>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-8 bg-blue-100 border-4 border-blue-400 rounded-3xl p-8">
          <h2 className="text-3xl mb-4 text-blue-900 text-center">
            📖 Usage Guide
          </h2>
          <div className="space-y-4 text-gray-800">
            <p>
              <strong>For Developers:</strong> No changes needed! The AudioNarration 
              component automatically filters emojis from all spoken text.
            </p>
            <p>
              <strong>For Content Writers:</strong> Feel free to use emojis in messages. 
              They will display visually but won't be spoken aloud.
            </p>
            <p>
              <strong>For QA Testing:</strong> Test each message by clicking the speaker 
              button. You should hear clear speech without emoji names.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AudioNarrationTest;

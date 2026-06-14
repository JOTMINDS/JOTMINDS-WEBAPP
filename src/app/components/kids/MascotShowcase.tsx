import { useState } from 'react';
import { Mascot, WelcomeMascot, EncouragingMascot, ThinkingMascot, CelebratingMascot } from './Mascot';
import { Sparkles, Search, Heart, Hammer } from 'lucide-react';

export function MascotShowcase() {
  const [selectedEmotion, setSelectedEmotion] = useState<'happy' | 'excited' | 'thinking' | 'celebrating' | 'encouraging'>('excited');
  const [message, setMessage] = useState("Hi! I'm Jot the Robot! Click the buttons to see my different modes!");

  const emotions = [
    { 
      name: 'excited', 
      label: 'Excited/Creative', 
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-yellow-100 border-yellow-500 text-yellow-700',
      message: "Wow! Let's explore and be creative! ✨"
    },
    { 
      name: 'thinking', 
      label: 'Thinking/Logic', 
      icon: <Search className="w-5 h-5" />,
      color: 'bg-blue-100 border-blue-500 text-blue-700',
      message: "Let me analyze this carefully... 🔍"
    },
    { 
      name: 'celebrating', 
      label: 'Celebrating', 
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-pink-100 border-pink-500 text-pink-700',
      message: "You're amazing! Great job! 🎉❤️"
    },
    { 
      name: 'encouraging', 
      label: 'Encouraging/Action', 
      icon: <Hammer className="w-5 h-5" />,
      color: 'bg-green-100 border-green-500 text-green-700',
      message: "You can do it! Let's build something! 💪"
    },
    { 
      name: 'happy', 
      label: 'Happy (Default)', 
      icon: <Sparkles className="w-5 h-5" />,
      color: 'bg-purple-100 border-purple-500 text-purple-700',
      message: "I'm so happy to help you learn! 😊"
    }
  ];

  const handleEmotionClick = (emotion: any) => {
    setSelectedEmotion(emotion.name);
    setMessage(emotion.message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl mb-4" style={{ color: '#1a1a1a' }}>
            🤖 Meet Jot the Robot!
          </h1>
          <p className="text-xl text-gray-600">
            Click the buttons below to see Jot's different personalities!
          </p>
        </div>

        {/* Main Showcase Area */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 mb-8">
          <div className="flex flex-col items-center gap-8">
            {/* Current Mascot Display */}
            <div className="min-h-[300px] flex items-center justify-center">
              <Mascot
                emotion={selectedEmotion}
                message={message}
                size="large"
                position="center"
                animate={true}
              />
            </div>

            {/* Emotion Selector Buttons */}
            <div className="flex flex-wrap gap-4 justify-center max-w-3xl">
              {emotions.map((emotion) => (
                <button
                  key={emotion.name}
                  onClick={() => handleEmotionClick(emotion)}
                  className={`
                    flex items-center gap-2 px-6 py-4 rounded-2xl 
                    transition-all duration-300 border-4
                    ${selectedEmotion === emotion.name 
                      ? `${emotion.color} scale-110 shadow-xl` 
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:scale-105'
                    }
                  `}
                >
                  {emotion.icon}
                  <span className="font-bold">{emotion.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pre-built Components Showcase */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl text-center mb-8" style={{ color: '#1a1a1a' }}>
            Pre-built Jot Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Welcome Mascot */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-4 border-yellow-200">
              <h3 className="text-xl mb-4 text-center text-gray-800">
                WelcomeMascot
              </h3>
              <div className="flex justify-center">
                <WelcomeMascot />
              </div>
              <code className="block mt-4 text-sm bg-white p-3 rounded-lg text-gray-700">
                <WelcomeMascot />
              </code>
            </div>

            {/* Encouraging Mascot */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6 border-4 border-green-200">
              <h3 className="text-xl mb-4 text-center text-gray-800">
                EncouragingMascot
              </h3>
              <div className="flex justify-center">
                <EncouragingMascot message="Keep going! You're doing great!" />
              </div>
              <code className="block mt-4 text-sm bg-white p-3 rounded-lg text-gray-700">
                <EncouragingMascot message="..." />
              </code>
            </div>

            {/* Thinking Mascot */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-4 border-blue-200">
              <h3 className="text-xl mb-4 text-center text-gray-800">
                ThinkingMascot
              </h3>
              <div className="flex justify-center">
                <ThinkingMascot />
              </div>
              <code className="block mt-4 text-sm bg-white p-3 rounded-lg text-gray-700">
                <ThinkingMascot />
              </code>
            </div>

            {/* Celebrating Mascot */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border-4 border-pink-200">
              <h3 className="text-xl mb-4 text-center text-gray-800">
                CelebratingMascot
              </h3>
              <div className="flex justify-center">
                <CelebratingMascot />
              </div>
              <code className="block mt-4 text-sm bg-white p-3 rounded-lg text-gray-700">
                <CelebratingMascot />
              </code>
            </div>
          </div>
        </div>

        {/* Size Showcase */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8">
          <h2 className="text-3xl text-center mb-8" style={{ color: '#1a1a1a' }}>
            Different Sizes
          </h2>
          
          <div className="flex items-end justify-center gap-12">
            <div className="text-center">
              <Mascot emotion="excited" size="small" message="Small" />
              <p className="mt-4 text-gray-600 font-bold">Small</p>
            </div>
            
            <div className="text-center">
              <Mascot emotion="excited" size="medium" message="Medium" />
              <p className="mt-4 text-gray-600 font-bold">Medium</p>
            </div>
            
            <div className="text-center">
              <Mascot emotion="excited" size="large" message="Large" />
              <p className="mt-4 text-gray-600 font-bold">Large</p>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mt-8">
          <h2 className="text-3xl text-center mb-6" style={{ color: '#1a1a1a' }}>
            How to Use
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl mb-3 text-gray-900">Emotions Mapping</h3>
              <ul className="space-y-2 text-sm">
                <li>✨ <strong>excited</strong> → Yellow Spark Robot (creative)</li>
                <li>🔍 <strong>thinking</strong> → Blue Detective Robot (logical)</li>
                <li>❤️ <strong>celebrating</strong> → Pink Heart Robot (emotional)</li>
                <li>💪 <strong>encouraging</strong> → Green Builder Robot (action)</li>
                <li>😊 <strong>happy</strong> → Yellow Spark Robot (default)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl mb-3 text-gray-900">Props</h3>
              <ul className="space-y-2 text-sm">
                <li><strong>message</strong>: Text in speech bubble</li>
                <li><strong>emotion</strong>: Robot personality mode</li>
                <li><strong>size</strong>: 'small' | 'medium' | 'large'</li>
                <li><strong>position</strong>: 'left' | 'center' | 'right'</li>
                <li><strong>animate</strong>: Enable bounce animation</li>
                <li><strong>showSpeechBubble</strong>: Show/hide bubble</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border-4 border-blue-200 rounded-xl p-6">
            <h3 className="text-xl mb-3 text-blue-900">Example Code</h3>
            <pre className="bg-white p-4 rounded-lg overflow-x-auto text-sm">
{`import { Mascot } from './components/kids/Mascot';

<Mascot
  emotion="excited"
  message="Let's learn together!"
  size="medium"
  position="center"
  animate={true}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MascotShowcase;

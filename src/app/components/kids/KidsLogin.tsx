import { useState } from 'react';
import { motion } from 'motion/react';
import { WelcomeMascot } from './Mascot';
import { KidsButton } from './KidsButton';
import { AudioNarration } from './AudioNarration';
import { User, LogIn, Mail, Key } from 'lucide-react';

interface KidsLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onParentMode?: () => void;
  onBack?: () => void;
}

export function KidsLogin({ onLogin, onParentMode, onBack }: KidsLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #FF6B9D 50%, #FEC163 100%)'
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Logo/Mascot */}
        <div className="flex justify-center mb-6">
          <WelcomeMascot />
        </div>

        {/* Title with Audio */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-800">Let's Sign In!</h1>
            <AudioNarration
              text="Welcome! Enter your email and password to start learning!"
              autoPlay={false}
            />
          </div>
          <p className="text-lg text-gray-600">Ready to have fun learning? 🎉</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl bg-red-50 border-3 border-red-300"
          >
            <p className="text-red-600 font-medium text-center">{error}</p>
          </motion.div>
        )}

        {/* Email Input */}
        <div className="mb-6">
          <label className="flex items-center gap-2 text-xl font-bold text-gray-700 mb-3">
            <Mail className="w-6 h-6 text-purple-500" />
            Your Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            className="w-full px-6 py-4 text-xl rounded-2xl border-4 border-purple-300 focus:border-purple-500 focus:outline-none bg-purple-50"
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="mb-8">
          <label className="flex items-center gap-2 text-xl font-bold text-gray-700 mb-3">
            <Key className="w-6 h-6 text-pink-500" />
            Your Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
              className="w-full px-6 py-4 text-xl rounded-2xl border-4 border-pink-300 focus:border-pink-500 focus:outline-none bg-pink-50"
              disabled={loading}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl"
            >
              {showPassword ? '👁️' : '🔒'}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <div className="mb-6">
          <KidsButton
            variant="rainbow"
            size="huge"
            icon={loading ? '⏳' : '🚀'}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Start Learning!'}
          </KidsButton>
        </div>

        {/* Parent Mode Button */}
        {onParentMode && (
          <div className="text-center">
            <button
              onClick={onParentMode}
              className="text-gray-600 hover:text-gray-800 font-medium underline text-lg"
            >
              👨‍👩‍👧 Parent? Click here
            </button>
          </div>
        )}

        {/* Back Button */}
        {onBack && (
          <div className="text-center mt-4">
            <button
              onClick={onBack}
              className="text-gray-500 hover:text-gray-700 font-medium text-lg"
            >
              ← Go Back
            </button>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-4 left-4 text-4xl animate-bounce">⭐</div>
        <div className="absolute top-4 right-4 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-4 left-8 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>🌟</div>
        <div className="absolute bottom-4 right-8 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>💫</div>
      </motion.div>
    </div>
  );
}

// Simplified Kids Login (icon-based for younger children)
export function SimpleKidsLogin({
  users,
  onSelectUser
}: {
  users: Array<{ id: string; name: string; avatar?: string }>;
  onSelectUser: (userId: string) => void;
}) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #FF6B9D 50%, #FEC163 100%)'
      }}
    >
      <div className="max-w-4xl w-full">
        {/* Mascot Welcome */}
        <div className="flex justify-center mb-8">
          <WelcomeMascot />
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Who's Learning Today? 🎉
          </h1>
          <p className="text-2xl text-white drop-shadow">
            Tap your picture to start!
          </p>
        </div>

        {/* User Selection Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {users.map((user, index) => (
            <motion.button
              key={user.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectUser(user.id)}
              className="bg-white rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-6xl shadow-lg">
                {user.avatar || user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-2xl font-bold text-gray-800">{user.name}</h3>
            </motion.button>
          ))}

          {/* Add User Option */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: users.length * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all border-4 border-dashed border-gray-300"
          >
            <div className="w-32 h-32 mx-auto mb-4 rounded-full bg-gray-200 flex items-center justify-center text-6xl">
              ➕
            </div>
            <h3 className="text-2xl font-bold text-gray-600">Add User</h3>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

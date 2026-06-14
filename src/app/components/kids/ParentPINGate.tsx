import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock, X } from 'lucide-react';
import { KidsButton } from './KidsButton';

interface ParentPINGateProps {
  onUnlock: () => void;
  onCancel?: () => void;
  title?: string;
  description?: string;
  userPin?: string; // The user's stored PIN (hashed)
}

const DEFAULT_PIN = '1234'; // Fallback if user hasn't set a custom PIN

export function ParentPINGate({
  onUnlock,
  onCancel,
  title = 'Parent Access',
  description = 'Enter parent PIN to continue',
  userPin
}: ParentPINGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError('');

      // Auto-check when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => checkPin(newPin), 300);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };

  const checkPin = (pinToCheck: string) => {
    // Check against user's custom PIN or default PIN
    const correctPin = userPin || DEFAULT_PIN;
    
    if (pinToCheck === correctPin) {
      onUnlock();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleSubmit = () => {
    if (pin.length === 4) {
      checkPin(pin);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: 1, 
          scale: 1,
          x: isShaking ? [-10, 10, -10, 10, 0] : 0
        }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>

        {/* PIN Display */}
        <div className="mb-8">
          <div className="flex justify-center gap-4 mb-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-16 h-16 rounded-2xl border-4 border-purple-300 flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-purple-50 to-pink-50"
                animate={pin.length === i ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {pin[i] ? '●' : ''}
              </motion.div>
            ))}
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              className="w-full aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            className="w-full aspect-square rounded-2xl bg-gray-200 text-gray-600 text-xl font-bold shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
          >
            ←
          </motion.button>
          <motion.button
            className="w-full aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold shadow-lg hover:shadow-xl transition-shadow"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumberClick('0')}
          >
            0
          </motion.button>
          <motion.button
            className="w-full aspect-square rounded-2xl bg-green-500 text-white text-xl font-bold shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            disabled={pin.length !== 4}
          >
            <Unlock className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500">
          For parents: Enter your 4-digit PIN to access parent features
        </p>
      </motion.div>
    </div>
  );
}

// PIN Setup Component (for first-time setup)
export function SetupParentPIN({
  onComplete
}: {
  onComplete: (pin: string) => void;
}) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const handleNumberClick = (num: string) => {
    if (step === 'enter' && pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => setStep('confirm'), 500);
      }
    } else if (step === 'confirm' && confirmPin.length < 4) {
      const newConfirmPin = confirmPin + num;
      setConfirmPin(newConfirmPin);
      
      if (newConfirmPin.length === 4) {
        setTimeout(() => {
          if (newConfirmPin === pin) {
            onComplete(pin);
          } else {
            setError('PINs do not match. Please try again.');
            setPin('');
            setConfirmPin('');
            setStep('enter');
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
    setError('');
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {step === 'enter' ? 'Create Parent PIN' : 'Confirm PIN'}
          </h2>
          <p className="text-gray-600">
            {step === 'enter' 
              ? 'Enter a 4-digit PIN to protect parent features'
              : 'Enter the same PIN again to confirm'}
          </p>
        </div>

        {/* PIN Display */}
        <div className="mb-8">
          <div className="flex justify-center gap-4 mb-4">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="w-16 h-16 rounded-2xl border-4 border-purple-300 flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-purple-50 to-pink-50"
                animate={currentPin.length === i ? { scale: [1, 1.1, 1] } : {}}
              >
                {currentPin[i] ? '●' : ''}
              </motion.div>
            ))}
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              className="w-full aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick(num.toString())}
            >
              {num}
            </motion.button>
          ))}
          <motion.button
            className="w-full aspect-square rounded-2xl bg-gray-200 text-gray-600 text-xl font-bold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
          >
            ←
          </motion.button>
          <motion.button
            className="w-full aspect-square rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleNumberClick('0')}
          >
            0
          </motion.button>
          <div /> {/* Empty space */}
        </div>
      </motion.div>
    </div>
  );
}
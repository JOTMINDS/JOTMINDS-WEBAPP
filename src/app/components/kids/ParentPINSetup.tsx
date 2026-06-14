import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Check, AlertCircle } from 'lucide-react';
import { KidsButton } from './KidsButton';

interface ParentPINSetupProps {
  onComplete: (pin: string) => void;
  onSkip?: () => void;
  title?: string;
  description?: string;
}

export function ParentPINSetup({ onComplete, onSkip, title, description }: ParentPINSetupProps) {
  const [step, setStep] = useState<'create' | 'confirm'>('create');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const currentPin = step === 'create' ? pin : confirmPin;
  const setCurrentPin = step === 'create' ? setPin : setConfirmPin;

  const handleNumberClick = (num: string) => {
    if (currentPin.length < 4) {
      const newPin = currentPin + num;
      setCurrentPin(newPin);
      setError('');

      // Auto-check when 4 digits entered
      if (newPin.length === 4) {
        setTimeout(() => {
          if (step === 'create') {
            setStep('confirm');
          } else {
            checkMatch(newPin);
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    setCurrentPin(currentPin.slice(0, -1));
    setError('');
  };

  const checkMatch = (confirmPinToCheck: string) => {
    if (confirmPinToCheck === pin) {
      onComplete(pin);
    } else {
      setError('PINs do not match. Please try again.');
      setConfirmPin('');
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setStep('create');
        setPin('');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ 
          scale: isShaking ? [1, 1.02, 0.98, 1.02, 1] : 1, 
          opacity: 1 
        }}
        transition={{ duration: isShaking ? 0.5 : 0.3 }}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            {step === 'create' ? (
              <Lock className="w-8 h-8 text-white" />
            ) : (
              <Check className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-center mb-2 text-gray-800">
          {step === 'create' ? 'Create Parent PIN' : 'Confirm Your PIN'}
        </h2>

        {/* Description */}
        <p className="text-center text-base text-gray-600 mb-6">
          {step === 'create' 
            ? 'Create a 4-digit PIN to protect Kids Mode access'
            : 'Enter your PIN again to confirm'
          }
        </p>

        {/* PIN Display */}
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="w-12 h-12 rounded-xl border-3 flex items-center justify-center text-2xl font-black"
              style={{
                borderColor: currentPin.length > index ? '#9333ea' : '#E5E7EB',
                background: currentPin.length > index ? '#9333ea' : 'white',
                color: currentPin.length > index ? 'white' : '#9CA3AF'
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {currentPin.length > index ? '●' : ''}
            </motion.div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            className="flex items-center gap-2 text-red-500 mb-4 justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm font-bold">{error}</p>
          </motion.div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              className="h-12 rounded-xl bg-gray-100 hover:bg-purple-100 text-xl font-black text-gray-800 transition-colors"
              onClick={() => handleNumberClick(num.toString())}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {num}
            </motion.button>
          ))}
          <div /> {/* Empty space */}
          <motion.button
            className="h-12 rounded-xl bg-gray-100 hover:bg-purple-100 text-xl font-black text-gray-800 transition-colors"
            onClick={() => handleNumberClick('0')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            0
          </motion.button>
          <motion.button
            className="h-12 rounded-xl bg-gray-100 hover:bg-red-100 text-base font-black text-gray-800 transition-colors"
            onClick={handleDelete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← DEL
          </motion.button>
        </div>

        {/* Help Text */}
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-3 mb-4">
          <p className="text-center text-xs text-gray-700">
            <strong>Important:</strong> Remember this PIN! You'll need it to exit Kids Mode.
          </p>
        </div>

        {/* Skip Button (optional) */}
        {onSkip && step === 'create' && (
          <button
            onClick={onSkip}
            className="w-full text-center text-gray-500 hover:text-gray-700 underline text-sm"
          >
            Skip for now (use default PIN: 1234)
          </button>
        )}
      </motion.div>
    </div>
  );
}
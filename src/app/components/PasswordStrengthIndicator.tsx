import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';

interface PasswordStrengthIndicatorProps {
  password: string;
  onStrengthChange?: (isStrong: boolean) => void;
}

export interface PasswordRequirement {
  label: string;
  met: boolean;
  regex?: RegExp;
}

export function checkPasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  requirements: PasswordRequirement[];
  isValid: boolean;
} {
  const requirements: PasswordRequirement[] = [
    {
      label: 'At least 8 characters long',
      met: password.length >= 8,
    },
    {
      label: 'Contains uppercase letter (A-Z)',
      met: /[A-Z]/.test(password),
      regex: /[A-Z]/,
    },
    {
      label: 'Contains lowercase letter (a-z)',
      met: /[a-z]/.test(password),
      regex: /[a-z]/,
    },
    {
      label: 'Contains number (0-9)',
      met: /[0-9]/.test(password),
      regex: /[0-9]/,
    },
    {
      label: 'Contains special character (!@#$%^&*)',
      met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      regex: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    },
  ];

  const metCount = requirements.filter(r => r.met).length;
  const isValid = metCount >= 4; // At least 4 out of 5 requirements must be met

  let score = 0;
  let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';

  if (metCount === 5) {
    score = 100;
    level = 'strong';
  } else if (metCount === 4) {
    score = 75;
    level = 'good';
  } else if (metCount === 3) {
    score = 50;
    level = 'fair';
  } else {
    score = 25;
    level = 'weak';
  }

  return { score, level, requirements, isValid };
}

export function PasswordStrengthIndicator({ password, onStrengthChange }: PasswordStrengthIndicatorProps) {
  const { score, level, requirements, isValid } = checkPasswordStrength(password);

  React.useEffect(() => {
    if (onStrengthChange) {
      onStrengthChange(isValid);
    }
  }, [isValid, onStrengthChange]);

  if (!password) {
    return null;
  }

  const getStrengthColor = () => {
    switch (level) {
      case 'strong':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getStrengthTextColor = () => {
    switch (level) {
      case 'strong':
        return 'text-green-700';
      case 'good':
        return 'text-blue-700';
      case 'fair':
        return 'text-yellow-700';
      case 'weak':
        return 'text-red-700';
      default:
        return 'text-gray-700';
    }
  };

  const getStrengthBadge = () => {
    switch (level) {
      case 'strong':
        return <Badge className="bg-green-500 text-white">Strong</Badge>;
      case 'good':
        return <Badge className="bg-blue-500 text-white">Good</Badge>;
      case 'fair':
        return <Badge className="bg-yellow-500 text-white">Fair</Badge>;
      case 'weak':
        return <Badge className="bg-red-500 text-white">Weak</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Password Strength:</span>
          {getStrengthBadge()}
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Password Requirements:
        </p>
        <div className="space-y-1.5">
          {requirements.map((req, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-xs"
            >
              {req.met ? (
                <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              )}
              <span className={req.met ? 'text-green-700' : 'text-gray-600'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Overall Validation Message */}
      {!isValid && password.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2.5">
          <p className="text-xs text-yellow-800 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            Please meet at least 4 out of 5 requirements for a secure password
          </p>
        </div>
      )}

      {isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5">
          <p className="text-xs text-green-800 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 flex-shrink-0" />
            Your password meets the security requirements!
          </p>
        </div>
      )}
    </div>
  );
}

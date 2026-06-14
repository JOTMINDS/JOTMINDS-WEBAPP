import React from 'react';
import { Phone } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const COUNTRY_CODES = [
  { code: '+233', country: 'Ghana 🇬🇭' },
  { code: '+1', country: 'USA/Canada 🇺🇸🇨🇦' },
  { code: '+44', country: 'UK 🇬🇧' },
  { code: '+234', country: 'Nigeria 🇳🇬' },
  { code: '+27', country: 'South Africa 🇿🇦' },
  { code: '+254', country: 'Kenya 🇰🇪' },
  { code: '+91', country: 'India 🇮🇳' },
  { code: '+61', country: 'Australia 🇦🇺' },
  { code: '+49', country: 'Germany 🇩🇪' },
  { code: '+33', country: 'France 🇫🇷' }
];

interface PhoneInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  label?: string;
  description?: React.ReactNode;
  placeholder?: string;
}

export function PhoneInput({
  id,
  value,
  onChange,
  required = false,
  label = "Phone Number",
  description,
  placeholder = "XXX XXXXXXX"
}: PhoneInputProps) {
  // Parse value into country code and number
  const matchedCode = COUNTRY_CODES.find(c => value.startsWith(c.code))?.code || '+233';
  const numberPart = value.startsWith(matchedCode) ? value.substring(matchedCode.length).trim() : value;

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    onChange(`${newCode} ${numberPart}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and spaces
    const rawValue = e.target.value.replace(/[^\d\s]/g, '');
    // Limit to 15 characters to prevent insanely long inputs
    const truncated = rawValue.substring(0, 15);
    onChange(`${matchedCode} ${truncated}`);
  };

  return (
    <div className="space-y-2 pb-2 w-full">
      <Label htmlFor={id}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="flex gap-2 relative">
        <div className="relative w-[140px] shrink-0">
          <select
            className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
            value={matchedCode}
            onChange={handleCodeChange}
          >
            {COUNTRY_CODES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.country} ({country.code})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-muted-foreground">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id={id}
            type="tel"
            placeholder={placeholder}
            value={numberPart}
            onChange={handleNumberChange}
            required={required}
            className="pl-10 shadow-sm"
            maxLength={15}
          />
        </div>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">
          {description}
        </p>
      )}
    </div>
  );
}

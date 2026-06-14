import React from 'react';
import logoImage from '../../imports/25a0182e-0aa1-4066-9c54-a860cd28207c.png';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'h-4 w-auto',
  sm: 'h-6 w-auto',
  md: 'h-8 w-auto',
  lg: 'h-12 w-auto',
  xl: 'h-16 w-auto'
};

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  return (
    <img
      src={logoImage}
      alt="JotMinds Logo"
      className={`${sizeMap[size]} ${className}`}
    />
  );
};

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  theme?: 'light' | 'dark';
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", showText = true, theme = 'light' }) => {
  const textColor = theme === 'light' ? 'text-slate-900' : 'text-white';
  
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${className} relative flex items-center justify-center`}>
        {/* Abstract Hexagon Shape representing Structure */}
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
          <path d="M50 5L93.3 30V80L50 105L6.7 80V30L50 5Z" fill="url(#logo_gradient)" />
          {/* Arrow/Checkmark representing Optimization/Success - Negative Space */}
          <path d="M35 55L45 65L68 35" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="logo_gradient" x1="6.7" y1="5" x2="93.3" y2="105" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" /> {/* Indigo 600 */}
              <stop offset="1" stopColor="#2563EB" /> {/* Blue 600 */}
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center">
            <span className={`text-xl font-bold tracking-tight leading-none ${textColor}`}>
              Opti<span className="text-blue-600">Buy</span>
            </span>
            <span className={`text-[0.6rem] uppercase tracking-widest font-medium opacity-60 ${textColor}`}>
              Intelligent Sourcing
            </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
interface JosimarLogoProps {
  size?: number | string;
  className?: string;
}

export function JosimarLogo({ size = 80, className = "" }: JosimarLogoProps) {
  const sizeValue = typeof size === 'number' ? `${size}px` : size;
  
  return (
    <div className={`relative ${className}`} style={{ width: sizeValue, height: sizeValue }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'oklch(0.45 0.12 250)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'oklch(0.35 0.08 250)', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: 'oklch(0.70 0.15 220)', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'oklch(0.60 0.12 220)', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        
        <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.1" />
        
        <rect x="30" y="25" width="25" height="40" rx="3" fill="url(#logoGradient)" />
        
        <rect x="30" y="28" width="25" height="15" rx="2" fill="url(#accentGradient)" opacity="0.3" />
        
        <circle cx="42.5" cy="52" r="2" fill="white" opacity="0.9" />
        
        <rect x="35" y="58" width="4" height="2" rx="1" fill="white" opacity="0.7" />
        <rect x="41" y="58" width="4" height="2" rx="1" fill="white" opacity="0.7" />
        <rect x="47" y="58" width="4" height="2" rx="1" fill="white" opacity="0.7" />
        
        <path
          d="M 62 35 L 75 35 L 75 70 L 62 70 Z"
          fill="url(#logoGradient)"
          opacity="0.85"
        />
        <path
          d="M 65 40 L 72 40 L 72 45 L 65 45 Z"
          fill="white"
          opacity="0.2"
        />
        
        <circle cx="42.5" cy="20" r="8" fill="url(#accentGradient)" opacity="0.15" />
        <text
          x="42.5"
          y="24"
          textAnchor="middle"
          fill="url(#logoGradient)"
          fontSize="12"
          fontWeight="bold"
          fontFamily="IBM Plex Sans, sans-serif"
        >
          J
        </text>
      </svg>
    </div>
  );
}

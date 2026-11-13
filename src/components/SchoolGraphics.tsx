import React, { useState } from 'react';

export const SchoolCrest: React.FC<{ className?: string; size?: number; customUrl?: string }> = ({
  className = '',
  size = 52,
  customUrl
}) => {
  const [imgError, setImgError] = useState(false);

  if (customUrl && !imgError) {
    return (
      <img
        src={customUrl}
        alt="School Logo"
        onError={() => setImgError(true)}
        className={`shrink-0 object-contain rounded-full shadow-2xs ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      {/* Shield Base */}
      <path
        d="M50 4C74 4 88 16 88 40C88 68 50 94 50 94C50 94 12 68 12 40C12 16 26 4 50 4Z"
        fill="#0F2B48"
        stroke="#D97706"
        strokeWidth="2.5"
      />
      {/* Inner Shield */}
      <path
        d="M50 9C70 9 82 20 82 40C82 64 50 87 50 87C50 87 18 64 18 40C18 20 30 9 50 9Z"
        fill="#13365A"
        stroke="#F59E0B"
        strokeWidth="1.2"
        strokeDasharray="2 2"
      />
      {/* Open Book of Knowledge */}
      <path
        d="M50 60C45 56 36 55 28 57V37C36 35 45 36 50 40C55 36 64 35 72 37V57C64 55 55 56 50 60Z"
        fill="#FEF3C7"
        stroke="#B45309"
        strokeWidth="1.5"
      />
      <line x1="50" y1="40" x2="50" y2="60" stroke="#B45309" strokeWidth="1.5" />
      {/* Flame of Wisdom / Diya */}
      <path
        d="M50 20C47 25 45 28 47 31C49 34 52 34 53 31C55 28 53 25 50 20Z"
        fill="#F59E0B"
      />
      <circle cx="50" cy="27" r="1.5" fill="#EF4444" />
      {/* Laurel Sprigs */}
      <path
        d="M26 45C22 42 22 36 26 33M24 55C20 52 20 46 24 43M74 45C78 42 78 36 74 33M76 55C80 52 80 46 76 43"
        stroke="#FBBF24"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Star of Excellence */}
      <polygon
        points="50,67 52,72 57,72 53,75 55,80 50,77 45,80 47,75 43,72 48,72"
        fill="#F59E0B"
      />
    </svg>
  );
};

export const SchoolOfficialSeal: React.FC<{ className?: string; size?: number; customUrl?: string }> = ({
  className = '',
  size = 96,
  customUrl
}) => {
  const [imgError, setImgError] = useState(false);

  if (customUrl && !imgError) {
    return (
      <img
        src={customUrl}
        alt="School Official Stamp"
        onError={() => setImgError(true)}
        className={`object-contain select-none ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
      className={`opacity-90 select-none ${className}`}
    >
      {/* Outer circle */}
      <circle cx="70" cy="70" r="66" fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeDasharray="3 2" />
      <circle cx="70" cy="70" r="61" fill="none" stroke="#1e3a8a" strokeWidth="1.8" />
      <circle cx="70" cy="70" r="44" fill="none" stroke="#1e3a8a" strokeWidth="1.2" />

      {/* Text curved via path */}
      <path id="seal-text-path-top" d="M 22 70 A 48 48 0 0 1 118 70" fill="none" />
      <path id="seal-text-path-bottom" d="M 118 70 A 48 48 0 0 1 22 70" fill="none" />

      <text fontFamily="'Inter', sans-serif" fontSize="9" fontWeight="700" fill="#1e3a8a" letterSpacing="1.5">
        <textPath href="#seal-text-path-top" startOffset="50%" textAnchor="middle">
          PRAGJYOTISH ACADEMY
        </textPath>
      </text>

      <text fontFamily="'Inter', sans-serif" fontSize="7.5" fontWeight="600" fill="#1e3a8a" letterSpacing="1.2">
        <textPath href="#seal-text-path-bottom" startOffset="50%" textAnchor="middle">
          ★ OFFICIAL AUDITED SEAL ★
        </textPath>
      </text>

      {/* Center Crest Emblems */}
      <circle cx="70" cy="70" r="16" fill="none" stroke="#1e3a8a" strokeWidth="1" strokeDasharray="2 1" />
      <text x="70" y="67" fontFamily="'Inter', sans-serif" fontSize="9" fontWeight="800" textAnchor="middle" fill="#1e3a8a">
        ESTD
      </text>
      <text x="70" y="78" fontFamily="'JetBrains Mono', monospace" fontSize="10" fontWeight="800" textAnchor="middle" fill="#1e3a8a">
        1998
      </text>
    </svg>
  );
};

export const PrincipalSignature: React.FC<{
  className?: string;
  width?: number;
  height?: number;
  customUrl?: string;
}> = ({ className = '', width = 130, height = 42, customUrl }) => {
  const [imgError, setImgError] = useState(false);

  if (customUrl && !imgError) {
    return (
      <img
        src={customUrl}
        alt="Principal Signature"
        onError={() => setImgError(true)}
        className={`object-contain select-none mx-auto ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 180 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <path
        d="M15 36C28 22 42 12 58 18C74 24 60 40 45 42C30 44 48 10 70 8C92 6 98 32 108 30C118 28 125 15 138 20C151 25 155 35 170 32"
        stroke="#1e3a8a"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M32 28L68 32M95 24L122 26M25 44C50 43 110 42 165 40"
        stroke="#1e3a8a"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const CashierSignature: React.FC<{
  className?: string;
  width?: number;
  height?: number;
  customUrl?: string;
}> = ({ className = '', width = 120, height = 38, customUrl }) => {
  const [imgError, setImgError] = useState(false);

  if (customUrl && !imgError) {
    return (
      <img
        src={customUrl}
        alt="Accountant Signature"
        onError={() => setImgError(true)}
        className={`object-contain select-none mx-auto ${className}`}
        style={{ width, height }}
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 45"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <path
        d="M12 28C24 16 35 14 42 22C49 30 38 38 28 36C18 34 32 12 55 10C78 8 72 32 88 28C104 24 115 14 130 18C145 22 138 34 152 30"
        stroke="#1e293b"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M20 38C45 37 90 36 140 35" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
};

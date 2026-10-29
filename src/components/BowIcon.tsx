import React from 'react';

export const BowIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      className={className}
      aria-hidden="true"
    >
      {/* Central Knot */}
      <circle cx="12" cy="12" r="2.2" />
      {/* Left Loop */}
      <path
        d="M10 12C7.5 9 3 9 3.5 12C4 15 7.5 15 10 12Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Right Loop */}
      <path
        d="M14 12C16.5 9 21 9 20.5 12C20 15 16.5 15 14 12Z"
        fill="currentColor"
        opacity="0.85"
      />
      {/* Left Tail */}
      <path
        d="M10.8 13.5C9.5 16.5 7.5 19.5 6 21C7.8 20 10 18 11.4 14.5L10.8 13.5Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Right Tail */}
      <path
        d="M13.2 13.5C14.5 16.5 16.5 19.5 18 21C16.2 20 14 18 12.6 14.5L13.2 13.5Z"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
};

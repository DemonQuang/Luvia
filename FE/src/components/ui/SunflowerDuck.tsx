import React from 'react';

interface SunflowerDuckProps {
  className?: string;
  style?: React.CSSProperties;
  size?: number;
}

export const SunflowerDuck: React.FC<SunflowerDuckProps> = ({ className = '', style, size = 160 }) => {
  return (
    <div className={`duck-container ${className}`} style={{ ...style, width: `${size}px`, height: `${size}px` }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 120 120"
        width="100%"
        height="100%"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <style>{`
            .duck-wrapper {
              animation: duck-bob 0.4s ease-in-out infinite;
              transform-origin: 60px 70px;
            }
            .leg-left {
              animation: leg-swing-left 0.4s linear infinite;
              transform-origin: 50px 85px;
            }
            .leg-right {
              animation: leg-swing-right 0.4s linear infinite;
              transform-origin: 70px 85px;
            }
            .duck-wing-animated {
              animation: wing-flap 0.4s ease-in-out infinite;
              transform-origin: 45px 75px;
            }

            @keyframes duck-bob {
              0%, 100% { transform: translateY(0) rotate(1deg); }
              50% { transform: translateY(-5px) rotate(-1deg); }
            }
            @keyframes leg-swing-left {
              0%, 100% { transform: rotate(-25deg); }
              50% { transform: rotate(25deg); }
            }
            @keyframes leg-swing-right {
              0%, 100% { transform: rotate(25deg); }
              50% { transform: rotate(-25deg); }
            }
            @keyframes wing-flap {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: translateY(-2px) rotate(-15deg); }
            }
          `}</style>
        </defs>

        {/* Animated Legs */}
        <g className="leg-left">
          <path d="M 50,85 C 50,95 45,98 42,98" stroke="#ff9800" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 37,98 C 42,98 45,95 45,95" stroke="#ff9800" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>
        <g className="leg-right">
          <path d="M 70,85 C 70,95 75,98 78,98" stroke="#ff9800" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M 83,98 C 78,98 75,95 75,95" stroke="#ff9800" strokeWidth="5" strokeLinecap="round" fill="none" />
        </g>

        {/* Bobbing Body & Head */}
        <g className="duck-wrapper">
          {/* Body */}
          <ellipse cx="60" cy="70" rx="35" ry="25" fill="#fffef0" stroke="#3d2314" strokeWidth="3" />
          
          {/* Strap for the bag */}
          <path d="M 45,65 C 55,75 75,85 75,85" stroke="#e0c068" strokeWidth="3" fill="none" />
          {/* Bag */}
          <path d="M 70,80 C 70,90 85,90 85,80 Z" fill="#f5d676" stroke="#3d2314" strokeWidth="2" />
          <circle cx="77" cy="84" r="2" fill="#ff7a59" />

          {/* Sunflower Hat (Behind Head) */}
          <g fill="#fada5e" stroke="#3d2314" strokeWidth="3">
            <circle cx="60" cy="18" r="16" />
            <circle cx="85" cy="28" r="16" />
            <circle cx="95" cy="50" r="16" />
            <circle cx="85" cy="72" r="16" />
            <circle cx="60" cy="82" r="16" />
            <circle cx="35" cy="72" r="16" />
            <circle cx="25" cy="50" r="16" />
            <circle cx="35" cy="28" r="16" />
          </g>

          {/* Head */}
          <circle cx="60" cy="50" r="28" fill="#fffef0" stroke="#3d2314" strokeWidth="3" />

          {/* Cheeks (Blush) */}
          <ellipse cx="42" cy="58" rx="6" ry="4" fill="#ffb3ba" />
          <ellipse cx="78" cy="58" rx="6" ry="4" fill="#ffb3ba" />

          {/* Eyes */}
          <circle cx="48" cy="50" r="3.5" fill="#3d2314" />
          <circle cx="72" cy="50" r="3.5" fill="#3d2314" />
          {/* Eye highlights */}
          <circle cx="49.5" cy="48.5" r="1" fill="#ffffff" />
          <circle cx="73.5" cy="48.5" r="1" fill="#ffffff" />

          {/* Beak */}
          <path d="M 52,54 Q 60,50 68,54 Q 60,65 52,54 Z" fill="#ffb834" stroke="#3d2314" strokeWidth="3" />
          <path d="M 54,55 Q 60,58 66,55" stroke="#3d2314" strokeWidth="1.5" fill="none" />

          {/* Little flower on the hat */}
          <g transform="translate(30, 48)">
            <g fill="#ff7a59" stroke="#3d2314" strokeWidth="1.5">
              <circle cx="-5" cy="0" r="4" />
              <circle cx="5" cy="0" r="4" />
              <circle cx="0" cy="-5" r="4" />
              <circle cx="0" cy="5" r="4" />
            </g>
            <circle cx="0" cy="0" r="3" fill="#fada5e" stroke="#3d2314" strokeWidth="1.5" />
          </g>

          {/* Wing */}
          <path d="M 35,68 C 30,73 38,82 45,78 C 43,74 40,70 35,68 Z" fill="#fffef0" stroke="#3d2314" strokeWidth="3" className="duck-wing-animated" />
        </g>
      </svg>
    </div>
  );
};
export default SunflowerDuck;

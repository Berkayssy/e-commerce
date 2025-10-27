import React from "react";

interface IndexLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

export const IndexLogo: React.FC<IndexLogoProps> = ({
  width = 240,
  height = 60,
  className = "",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="10 10 380 95"
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Galeria Logo"
    >
      <defs>
        <linearGradient id="metalBag" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#2A3739", stopOpacity: 1 }} />
          <stop offset="35%" style={{ stopColor: "#1C2526", stopOpacity: 1 }} />
          <stop offset="65%" style={{ stopColor: "#344144", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#1C2526", stopOpacity: 1 }}
          />
        </linearGradient>

        <radialGradient id="gCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: "#3D5256", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#1C2526", stopOpacity: 1 }}
          />
        </radialGradient>

        <linearGradient id="futuristicText" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: "#1C2526", stopOpacity: 1 }} />
          <stop offset="30%" style={{ stopColor: "#2D4347", stopOpacity: 1 }} />
          <stop offset="70%" style={{ stopColor: "#2D4347", stopOpacity: 1 }} />
          <stop
            offset="100%"
            style={{ stopColor: "#1C2526", stopOpacity: 1 }}
          />
        </linearGradient>

        <linearGradient id="shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop
            offset="0%"
            style={{ stopColor: "#FFFFFF", stopOpacity: 0.3 }}
          />
          <stop
            offset="100%"
            style={{ stopColor: "#FFFFFF", stopOpacity: 0 }}
          />
        </linearGradient>

        <filter id="shadow">
          <feDropShadow
            dx="0"
            dy="3"
            stdDeviation="2"
            floodColor="#000000"
            floodOpacity="0.4"
          />
        </filter>

        <filter id="innerShadow">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
          <feOffset dx="0" dy="-2" result="offsetblur" />
          <feFlood floodColor="#000000" floodOpacity="0.3" />
          <feComposite in2="offsetblur" operator="in" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Metal Briefcase */}
      <g transform="translate(20, 15)">
        <path
          d="M 12 22 L 7 70 Q 6 74, 10 74 L 60 74 Q 64 74, 63 70 L 58 22 Z"
          fill="url(#metalBag)"
          stroke="#0F1516"
          strokeWidth="2.5"
          filter="url(#shadow)"
        />

        <rect
          x="12"
          y="18"
          width="46"
          height="6"
          rx="1"
          fill="#1C2526"
          stroke="#0F1516"
          strokeWidth="2"
        />

        <path
          d="M 23 18 L 23 12 Q 23 8, 27 8 L 43 8 Q 47 8, 47 12 L 47 18"
          fill="none"
          stroke="#0F1516"
          strokeWidth="3"
          strokeLinecap="square"
        />

        <rect
          x="27"
          y="8"
          width="16"
          height="6"
          rx="2"
          fill="#2A3739"
          stroke="#0F1516"
          strokeWidth="1.5"
        />

        <path
          d="M 15 25 Q 20 40, 25 55 L 27 55 Q 22 40, 17 25 Z"
          fill="url(#shine)"
          opacity="0.6"
        />

        <path
          d="M 12 26 L 12 22 L 16 22"
          fill="none"
          stroke="#3D5256"
          strokeWidth="1.5"
        />
        <path
          d="M 58 26 L 58 22 L 54 22"
          fill="none"
          stroke="#3D5256"
          strokeWidth="1.5"
        />
        <path
          d="M 10 70 L 10 66 L 14 66"
          fill="none"
          stroke="#3D5256"
          strokeWidth="1.5"
        />
        <path
          d="M 60 70 L 60 66 L 56 66"
          fill="none"
          stroke="#3D5256"
          strokeWidth="1.5"
        />

        <circle cx="35" cy="21" r="2" fill="#3D5256" />

        {/* Central g */}
        <circle
          cx="35"
          cy="48"
          r="18"
          fill="#000000"
          stroke="#3D5256"
          strokeWidth="1.5"
        />

        <circle
          cx="35"
          cy="48"
          r="19"
          fill="none"
          stroke="#4A5C5F"
          strokeWidth="0.8"
          opacity="0.6"
        />

        <circle cx="35" cy="48" r="13" fill="#0A0F10" opacity="0.8" />

        <circle
          cx="35"
          cy="43"
          r="7"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7"
        />

        <line
          x1="42"
          y1="36"
          x2="42"
          y2="58"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <path
          d="M 42 58 Q 42 63, 34 63 Q 26 63, 26 58"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="7"
          strokeLinecap="round"
        />

        <circle
          cx="35"
          cy="43"
          r="7"
          fill="none"
          stroke="url(#gCenter)"
          strokeWidth="2"
          opacity="0.7"
        />

        <path
          d="M 30 40 A 6 6 0 0 1 40 40"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />

        <line
          x1="42"
          y1="38"
          x2="42"
          y2="56"
          stroke="url(#gCenter)"
          strokeWidth="2"
          opacity="0.6"
        />

        {/* Wheels */}
        <g transform="translate(18, 74)">
          <circle
            cx="0"
            cy="3"
            r="4.5"
            fill="#0F1516"
            stroke="#3D5256"
            strokeWidth="1"
          />
          <circle cx="0" cy="3" r="3" fill="#1C2526" />
          <circle cx="0" cy="3" r="1.5" fill="#3D5256" />
          <line
            x1="-2"
            y1="3"
            x2="2"
            y2="3"
            stroke="#0F1516"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="1"
            x2="0"
            y2="5"
            stroke="#0F1516"
            strokeWidth="0.5"
          />
        </g>

        <g transform="translate(52, 74)">
          <circle
            cx="0"
            cy="3"
            r="4.5"
            fill="#0F1516"
            stroke="#3D5256"
            strokeWidth="1"
          />
          <circle cx="0" cy="3" r="3" fill="#1C2526" />
          <circle cx="0" cy="3" r="1.5" fill="#3D5256" />
          <line
            x1="-2"
            y1="3"
            x2="2"
            y2="3"
            stroke="#0F1516"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="1"
            x2="0"
            y2="5"
            stroke="#0F1516"
            strokeWidth="0.5"
          />
        </g>
      </g>
      {/* GALERIA Text  */}
      <g transform="translate(105, 40)" fill="url(#futuristicText)">
        <path
          d="M 2 5 Q 0 5, 0 9 L 0 41 Q 0 45, 2 45 L 13 45 L 13 40 L 5 40 L 5 10 L 14 10 L 14 23 L 8 23 L 8 28 L 19 28 L 19 5 Z"
          stroke="#0F1516"
          strokeWidth="1.2"
        />

        <path
          d="M 24 45 L 28 5 L 36 5 L 40 45 L 35 45 L 34.5 35 L 29.5 35 L 29 45 Z M 30.5 30 L 33.5 30 L 32 12 Z"
          stroke="#0F1516"
          strokeWidth="1.2"
        />

        <path
          d="M 45 5 L 45 45 L 58 45 L 58 40 L 50 40 L 50 5 Z"
          stroke="#0F1516"
          strokeWidth="1.2"
        />

        <path
          d="M 63 5 L 63 45 L 76 45 L 76 40 L 68 40 L 68 27 L 74 27 L 74 23 L 68 23 L 68 10 L 76 10 L 76 5 Z"
          stroke="#0F1516"
          strokeWidth="1.2"
        />

        <path
          d="M 81 45 L 81 5 L 91 5 Q 96 5, 96 10 L 96 15 Q 96 20, 92 20 L 97 45 L 92 45 L 87 20 L 86 20 L 86 45 Z M 86 10 L 86 16 L 91 16 L 91 10 Z"
          stroke="#0F1516"
          strokeWidth="1.2"
        />

        <path
          d="M 102 5 L 102 45 L 107 45 L 107 5 Z"
          stroke="#0F1516"
          strokeWidth="1.2"
        />

        <path
          d="M 112 45 L 116 5 L 124 5 L 128 45 L 123 45 L 122.5 35 L 117.5 35 L 117 45 Z M 118.5 30 L 121.5 30 L 120 12 Z"
          stroke="#0F1516"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
};

export const CommunityIllustration = () => {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Person with puzzle piece */}
      <circle cx="200" cy="180" r="65" fill="hsl(203, 65%, 60%)" opacity="0.1" />
      
      {/* Head */}
      <circle cx="200" cy="130" r="28" fill="hsl(203, 65%, 60%)" />
      
      {/* Body */}
      <rect x="175" y="155" width="50" height="60" rx="12" fill="hsl(270, 65%, 47%)" />
      
      {/* Puzzle piece */}
      <g transform="translate(230, 160)">
        <path
          d="M0 0 H30 V10 H40 V20 H30 V40 H0 V20 H-10 V10 H0 Z"
          fill="hsl(122, 39%, 49%)"
        />
      </g>
      
      {/* Decorative community dots */}
      <circle cx="280" cy="100" r="8" fill="hsl(45, 100%, 51%)" />
      <circle cx="120" cy="110" r="10" fill="hsl(270, 65%, 47%)" opacity="0.7" />
      <circle cx="90" cy="200" r="7" fill="hsl(203, 65%, 60%)" opacity="0.7" />
      <circle cx="310" cy="190" r="9" fill="hsl(122, 39%, 49%)" opacity="0.7" />
    </svg>
  );
};

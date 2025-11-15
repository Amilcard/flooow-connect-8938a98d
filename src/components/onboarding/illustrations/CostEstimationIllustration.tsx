export const CostEstimationIllustration = () => {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Person pointing */}
      <circle cx="180" cy="180" r="60" fill="hsl(122, 39%, 49%)" opacity="0.1" />
      
      {/* Head */}
      <circle cx="160" cy="130" r="25" fill="hsl(122, 39%, 49%)" />
      
      {/* Body */}
      <rect x="140" y="152" width="40" height="55" rx="10" fill="hsl(270, 65%, 47%)" />
      
      {/* Arm pointing */}
      <rect
        x="175"
        y="165"
        width="45"
        height="8"
        rx="4"
        fill="hsl(122, 39%, 49%)"
        transform="rotate(-20 175 165)"
      />
      
      {/* Price tag / calculator */}
      <g transform="translate(240, 140)">
        <rect width="60" height="80" rx="8" fill="hsl(203, 65%, 60%)" />
        <rect x="10" y="15" width="40" height="20" rx="4" fill="white" opacity="0.9" />
        <circle cx="20" cy="50" r="6" fill="white" opacity="0.7" />
        <circle cx="40" cy="50" r="6" fill="white" opacity="0.7" />
        <circle cx="20" cy="65" r="6" fill="white" opacity="0.7" />
        <circle cx="40" cy="65" r="6" fill="white" opacity="0.7" />
      </g>
      
      {/* Euro symbol */}
      <text
        x="260"
        y="130"
        fontSize="30"
        fill="hsl(45, 100%, 51%)"
        fontWeight="bold"
      >
        €
      </text>
    </svg>
  );
};

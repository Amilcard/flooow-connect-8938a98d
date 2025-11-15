export const ReadyIllustration = () => {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Person smiling with arms up */}
      <circle cx="200" cy="180" r="70" fill="hsl(45, 100%, 51%)" opacity="0.15" />
      
      {/* Head */}
      <circle cx="200" cy="120" r="30" fill="hsl(270, 65%, 47%)" />
      
      {/* Smile */}
      <path
        d="M190 125 Q200 132 210 125"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Eyes */}
      <circle cx="193" cy="115" r="2" fill="white" />
      <circle cx="207" cy="115" r="2" fill="white" />
      
      {/* Body */}
      <rect x="175" y="147" width="50" height="65" rx="12" fill="hsl(203, 65%, 60%)" />
      
      {/* Arms raised */}
      <rect
        x="130"
        y="155"
        width="45"
        height="10"
        rx="5"
        fill="hsl(203, 65%, 60%)"
        transform="rotate(-35 130 160)"
      />
      <rect
        x="225"
        y="155"
        width="45"
        height="10"
        rx="5"
        fill="hsl(203, 65%, 60%)"
        transform="rotate(35 270 160)"
      />
      
      {/* Decorative geometric shapes */}
      <circle cx="120" cy="80" r="12" fill="hsl(122, 39%, 49%)" opacity="0.7" />
      <polygon
        points="280,90 295,120 265,120"
        fill="hsl(270, 65%, 47%)"
        opacity="0.6"
      />
      <rect x="270" y="200" width="20" height="20" rx="4" fill="hsl(45, 100%, 51%)" opacity="0.7" />
      <circle cx="130" cy="220" r="10" fill="hsl(203, 65%, 60%)" opacity="0.6" />
    </svg>
  );
};

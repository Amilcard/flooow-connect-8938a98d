export const DiscoverActivitiesIllustration = () => {
  return (
    <svg
      viewBox="0 0 400 300"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      {/* Person sitting with phone */}
      <circle cx="200" cy="180" r="60" fill="hsl(270, 65%, 47%)" opacity="0.1" />
      
      {/* Head */}
      <circle cx="200" cy="140" r="25" fill="hsl(270, 65%, 47%)" />
      
      {/* Body */}
      <rect x="180" y="160" width="40" height="50" rx="10" fill="hsl(203, 65%, 60%)" />
      
      {/* Phone */}
      <rect x="210" y="175" width="30" height="45" rx="5" fill="hsl(0, 0%, 20%)" />
      <rect x="213" y="178" width="24" height="36" rx="2" fill="hsl(122, 39%, 49%)" opacity="0.3" />
      
      {/* Decorative elements - activities icons */}
      <circle cx="120" cy="100" r="15" fill="hsl(122, 39%, 49%)" opacity="0.6" />
      <circle cx="280" cy="120" r="12" fill="hsl(45, 100%, 51%)" opacity="0.6" />
      <circle cx="150" cy="230" r="10" fill="hsl(203, 65%, 60%)" opacity="0.6" />
      <circle cx="260" cy="210" r="13" fill="hsl(270, 65%, 47%)" opacity="0.6" />
    </svg>
  );
};

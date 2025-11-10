/**
 * Responsive breakpoints and utilities
 * 
 * BREAKPOINTS:
 * - Mobile: < 768px
 * - Tablet: 768px - 1024px
 * - Desktop: ≥ 1024px
 */

export const BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
} as const;

/**
 * Hero image heights
 * Consistent across all pages with hero images
 */
export const HERO_IMAGE_CLASSES = {
  // Mobile: 40vh max
  // Tablet: 45vh max
  // Desktop: 480px max
  // Min height: 240px to ensure visibility
  default: "h-[40vh] md:h-[45vh] lg:h-[480px] min-h-[240px]",
  
  // For hero sections with content overlay (like landing page)
  withOverlay: "h-[40vh] md:h-[45vh] lg:h-[480px] min-h-[320px]",
} as const;

/**
 * Card image heights
 */
export const CARD_IMAGE_CLASSES = {
  // Activity cards: 176px (h-44)
  activity: "h-44",
  
  // Smaller preview cards: 128px (h-32)
  preview: "h-32",
  
  // Large featured cards: 256px (h-64)
  featured: "h-64",
} as const;

/**
 * Container paddings by breakpoint
 */
export const CONTAINER_PADDING = {
  mobile: "px-4",
  tablet: "px-6",
  desktop: "px-8",
  responsive: "px-4 md:px-6 lg:px-8",
} as const;

/**
 * Bottom navigation height
 * Used to add padding-bottom to content
 */
export const BOTTOM_NAV_HEIGHT = {
  pixels: 80,
  tailwind: "pb-20", // 80px
} as const;

/**
 * Minimum touch target size (WCAG AA)
 */
export const MIN_TOUCH_TARGET = {
  pixels: 44,
  tailwind: "min-h-[44px] min-w-[44px]",
} as const;

/**
 * Typography scaling by breakpoint
 */
export const TYPOGRAPHY_SCALE = {
  h1: "text-3xl md:text-4xl lg:text-5xl",
  h2: "text-2xl md:text-3xl lg:text-4xl",
  h3: "text-xl md:text-2xl lg:text-3xl",
  h4: "text-lg md:text-xl lg:text-2xl",
  body: "text-base md:text-lg",
  small: "text-sm md:text-base",
} as const;

/**
 * Grid layouts by breakpoint
 */
export const GRID_LAYOUTS = {
  // Activity lists
  activities: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  
  // Two-column layouts (tablet+)
  twoColumn: "grid-cols-1 md:grid-cols-2",
  
  // Info cards
  infoCards: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
} as const;

/**
 * Check if current viewport matches breakpoint
 */
export const useBreakpoint = () => {
  if (typeof window === 'undefined') return 'mobile';
  
  const width = window.innerWidth;
  
  if (width < BREAKPOINTS.mobile) return 'mobile';
  if (width < BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
};

/// <reference types="vite/client" />
/// <reference types="google.maps" />

// Asset module declarations for strict TypeScript
declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export {};

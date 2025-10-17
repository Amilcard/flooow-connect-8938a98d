/// <reference types="vite/client" />
/// <reference types="google.maps" />

declare global {
  interface Window {
    google: any;
  }
  
  var google: any;
}

export {};

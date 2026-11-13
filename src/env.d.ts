/// <reference types="astro/client" />

declare global {
  interface Window {
    goatcounter?: {
      count(options: { path: string; title: string; event: boolean }): void;
    };
  }
}

export {};

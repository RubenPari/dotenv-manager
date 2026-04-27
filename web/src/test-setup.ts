/**
 * Vitest setup
 * @module web/test-setup
 * @description Configures the Angular TestBed for zoneless change detection.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// jsdom doesn't implement matchMedia; some services rely on it.
// Keep minimal and deterministic for unit tests.
if (typeof window.matchMedia !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
});

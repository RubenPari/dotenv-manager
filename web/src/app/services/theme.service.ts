/**
 * Theme preference (light / dark / system) with persistence and OS sync.
 * @module web/app/services/theme.service
 */
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

const STORAGE_KEY = 'dm-theme-preference';

export type ThemePreference = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** User-selected preference. Default dark when no stored value. */
  readonly preference = signal<ThemePreference>(this.readStored());

  constructor() {
    this.apply();
    this.attachMediaListener();
  }

  /**
   * Resolved effective light/dark (system follows prefers-color-scheme).
   */
  resolvedMode(): 'light' | 'dark' {
    const p = this.preference();
    if (p === 'light' || p === 'dark') {
      return p;
    }
    if (!this.isBrowser) {
      return 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY, preference);
    }
    this.apply();
  }

  private readStored(): ThemePreference {
    if (!this.isBrowser) {
      return 'dark';
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') {
      return raw;
    }
    return 'dark';
  }

  private apply(): void {
    if (!this.isBrowser) {
      return;
    }
    const mode = this.resolvedMode();
    document.documentElement.setAttribute('data-theme', mode);
  }

  private attachMediaListener(): void {
    if (!this.isBrowser) {
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (): void => {
      if (this.preference() === 'system') {
        this.apply();
      }
    };
    mq.addEventListener('change', onChange);
  }
}

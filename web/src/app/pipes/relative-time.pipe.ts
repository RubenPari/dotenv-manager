/**
 * Relative time from ISO date (e.g. "3h ago").
 * @module web/app/pipes/relative-time
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'relativeTime' })
export class RelativeTimePipe implements PipeTransform {
  transform(iso: string | Date | null | undefined, fallback = '—'): string {
    if (!iso) {
      return fallback;
    }
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    const t = d.getTime();
    if (Number.isNaN(t)) {
      return fallback;
    }
    const now = Date.now();
    const sec = Math.round((now - t) / 1000);
    if (sec < 60) {
      return 'just now';
    }
    const min = Math.floor(sec / 60);
    if (min < 60) {
      return `${min}m ago`;
    }
    const h = Math.floor(min / 60);
    if (h < 24) {
      return `${h}h ago`;
    }
    const day = Math.floor(h / 24);
    if (day < 7) {
      return `${day}d ago`;
    }
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}

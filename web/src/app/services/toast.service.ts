/**
 * Transient notification toasts.
 * @module web/app/services/toast.service
 */
import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toasts = signal<Toast[]>([]);

  readonly items = this.toasts.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 5000): void {
    const id = crypto.randomUUID();
    this.toasts.update((t) => [...t, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }

  dismiss(id: string): void {
    this.toasts.update((t) => t.filter((x) => x.id !== id));
  }
}

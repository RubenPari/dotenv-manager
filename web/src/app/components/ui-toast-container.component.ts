/**
 * @module web/app/components/ui-toast-container
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Toast, ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-w-md flex-col gap-2 p-4"
      role="status"
    >
      @for (t of toastService.items(); track t.id) {
        <div
          class="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-lg border p-3 shadow-lg transition-ui"
          [class]="toastClass(t.type)"
        >
          <lucide-icon
            [name]="iconFor(t.type)"
            [size]="18"
            class="shrink-0"
          />
          <p class="min-w-0 flex-1 text-sm leading-snug">{{ t.message }}</p>
          <button
            type="button"
            class="shrink-0 rounded p-0.5 text-current opacity-70 transition-ui hover:opacity-100"
            (click)="dismiss(t.id)"
            [attr.aria-label]="'Dismiss notification'"
          >
            <lucide-icon name="x" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class UiToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected toastClass(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-elevated text-fg';
      case 'error':
        return 'border-danger/30 bg-elevated text-fg';
      case 'info':
        return 'border-border bg-elevated text-fg';
    }
  }

  protected iconFor(type: Toast['type']): string {
    switch (type) {
      case 'success':
        return 'check-circle-2';
      case 'error':
        return 'alert-circle';
      case 'info':
        return 'info';
    }
  }

  protected dismiss(id: string): void {
    this.toastService.dismiss(id);
  }
}

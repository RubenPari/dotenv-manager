/**
 * @module web/app/components/ui-button
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

const base =
  'inline-flex items-center justify-center gap-2 font-medium transition-ui ' +
  'active:scale-[0.98] ' +
  'focus:outline-none focus:ring-2 focus:ring-ring/60 focus:ring-offset-0 ' +
  'disabled:opacity-50 disabled:pointer-events-none ' +
  'rounded-lg';

const variants: Record<string, string> = {
  primary: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover',
  secondary:
    'bg-elevated text-fg border border-border hover:bg-surface shadow-sm/10 dark:shadow-none',
  ghost: 'text-fg-muted bg-transparent hover:bg-elevated hover:text-fg',
  danger: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20',
};

const sizes: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5 min-h-8',
  md: 'text-sm px-4 py-2 min-h-10',
  lg: 'text-sm px-5 py-2.5 min-h-11',
};

@Component({
  selector: 'ui-button',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex',
    '[class.w-full]': 'fullWidth()',
  },
  template: `
    <button
      [attr.type]="type()"
      [attr.aria-busy]="loading() ? 'true' : null"
      [disabled]="disabled() || loading()"
      [class]="btnClassStr()"
    >
      @if (loading()) {
        <lucide-icon
          class="h-4 w-4 shrink-0 animate-spin text-current"
          name="loader-2"
          [size]="loaderIconSize()"
        />
      }
      <ng-content />
    </button>
  `,
})
export class UiButtonComponent {
  readonly variant = input<keyof typeof variants>('primary');
  readonly size = input<keyof typeof sizes>('md');
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  /** Stretch to full width of the parent. */
  readonly fullWidth = input(false);
  protected readonly loaderIconSize = computed(() =>
    this.size() === 'sm' ? 14 : this.size() === 'lg' ? 18 : 16,
  );
  protected readonly btnClassStr = computed(
    () =>
      `${base} ${this.fullWidth() ? 'w-full' : ''} ` +
      `${variants[this.variant()]} ${sizes[this.size()]}`,
  );
}

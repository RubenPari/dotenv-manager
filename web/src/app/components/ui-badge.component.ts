/**
 * @module web/app/components/ui-badge
 */
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const variants: Record<string, string> = {
  secret: 'bg-danger/10 text-danger border-danger/20',
  required: 'bg-warn/10 text-warn border-warn/20',
  'env-dev': 'bg-sky-500/15 text-sky-400 border-sky-500/25',
  'env-staging': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'env-prod': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  success: 'bg-success/10 text-success border-success/20',
  warn: 'bg-warn/10 text-warn border-warn/20',
  danger: 'bg-danger/10 text-danger border-danger/20',
  info: 'bg-info/10 text-info border-info/20',
  neutral: 'bg-surface text-fg-muted border-border',
};

@Component({
  selector: 'ui-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class UiBadgeComponent {
  readonly variant = input<keyof typeof variants>('neutral');
  protected readonly classes = computed(
    () =>
      'inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ' +
      variants[this.variant()],
  );
}

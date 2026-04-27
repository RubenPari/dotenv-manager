/**
 * @module web/app/components/ui-empty-state
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-empty-state',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 bg-surface/50 py-12 px-6 text-center',
  },
  template: `
    @if (icon()) {
      <lucide-icon
        [name]="icon()!"
        [size]="40"
        class="mb-1 text-fg-muted opacity-80"
      />
    }
    <h3 class="text-base font-semibold text-fg">{{ title() }}</h3>
    @if (description()) {
      <p class="max-w-sm text-sm text-fg-muted">{{ description() }}</p>
    }
    <div class="mt-2 flex flex-wrap justify-center gap-2">
      <ng-content></ng-content>
    </div>
  `,
})
export class UiEmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
}

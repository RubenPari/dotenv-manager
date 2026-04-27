/**
 * @module web/app/components/ui-card
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  template: `
    <div
      [class]="
        gradientBorder()
          ? 'rounded-xl bg-gradient-to-br from-accent/20 via-border/60 to-border p-px'
          : ''
      "
    >
      <div
        [class]="
          'h-full min-h-0 overflow-hidden rounded-xl border border-border/80 bg-elevated transition-ui' +
          (hoverable() ? ' shadow-sm hover:border-accent/30 hover:shadow-md dark:shadow-white/[0.04]' : ' shadow-sm')
        "
      >
        <ng-content select="[uiCardHeader]"></ng-content>
        <div [class]="bodyClass()">
          <ng-content></ng-content>
        </div>
        <ng-content select="[uiCardFooter]"></ng-content>
      </div>
    </div>
  `,
})
export class UiCardComponent {
  readonly gradientBorder = input(false);
  readonly hoverable = input(true);
  readonly padded = input(true);
  protected bodyClass = (): string => (this.padded() ? 'p-5' : 'p-0');
}

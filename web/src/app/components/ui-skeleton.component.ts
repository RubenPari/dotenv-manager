/**
 * @module web/app/components/ui-skeleton
 */
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="block rounded-md ui-skeleton"
      [class]="class()"
      [style.width]="width() ?? '100%'"
      [style.height]="height()"
    ></div>
  `,
})
export class UiSkeletonComponent {
  readonly class = input('');
  readonly width = input<string | undefined>(undefined);
  readonly height = input('1rem');
}

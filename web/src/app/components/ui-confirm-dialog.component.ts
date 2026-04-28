/**
 * Reusable confirm dialog
 * @module web/app/components/ui-confirm-dialog
 * @description A simple confirm/cancel modal wrapper for destructive actions.
 */
import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { UiButtonComponent } from './ui-button.component';
import { UiModalComponent } from './ui-modal.component';

@Component({
  selector: 'ui-confirm-dialog',
  imports: [UiButtonComponent, UiModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ui-modal
      [title]="title()"
      [showClose]="true"
      [(open)]="open"
    >
      <p class="text-sm text-fg-muted"><ng-content /></p>
      <div class="mt-4 flex justify-end gap-2">
        <ui-button type="button" variant="secondary" (click)="cancel.emit()">Cancel</ui-button>
        <ui-button
          type="button"
          [variant]="variant()"
          [loading]="loading()"
          (click)="confirm.emit()"
        >
          {{ confirmLabel() }}
        </ui-button>
      </div>
    </ui-modal>
  `,
})
export class UiConfirmDialogComponent {
  readonly title = input.required<string>();
  readonly confirmLabel = input('Confirm');
  readonly variant = input<'primary' | 'danger'>('primary');
  readonly loading = input(false);
  readonly open = model.required<boolean>();

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}

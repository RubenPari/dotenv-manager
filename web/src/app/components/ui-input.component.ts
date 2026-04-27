/**
 * @module web/app/components/ui-input
 */
import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';

let _uiInputId = 0;

@Component({
  selector: 'ui-input',
  imports: [FormsModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    @if (label()) {
      <label [attr.for]="inputId" class="mb-1.5 block text-sm font-medium text-fg">
        {{ label() }}
      </label>
    }
    <div class="relative flex items-stretch">
      @if (leadingIcon()) {
        <span
          class="pointer-events-none absolute left-2.5 top-1/2 z-[1] -translate-y-1/2 text-fg-muted"
        >
          <lucide-icon [name]="leadingIcon()!" [size]="18" />
        </span>
      }
      <input
        [id]="inputId"
        [name]="name()"
        [type]="type()"
        [attr.placeholder]="placeholder() || null"
        [attr.autocomplete]="autocomplete() || null"
        [attr.required]="required() || null"
        [disabled]="disabled()"
        [class]="inputClasses()"
        [ngModel]="value()"
        (ngModelChange)="value.set($event)"
        [attr.aria-invalid]="error() ? 'true' : null"
        [attr.aria-describedby]="error() ? errorId : null"
      />
    </div>
    @if (error()) {
      <p class="mt-1.5 text-sm text-danger" [attr.id]="errorId" role="alert">
        {{ error() }}
      </p>
    } @else if (helperText()) {
      <p class="mt-1.5 text-sm text-fg-muted">{{ helperText() }}</p>
    }
  `,
})
export class UiInputComponent {
  private readonly _id = `ui-in-${++_uiInputId}`;
  protected readonly inputId = this._id;
  protected readonly errorId = `${this._id}-err`;

  readonly value = model('');
  readonly label = input<string | undefined>(undefined);
  readonly name = input('');
  readonly type = input('text');
  readonly placeholder = input<string | undefined>(undefined);
  readonly helperText = input<string | undefined>(undefined);
  readonly error = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly required = input(false);
  readonly leadingIcon = input<string | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);

  protected readonly inputClasses = computed(() => {
    const hasLead = Boolean(this.leadingIcon());
    const err = Boolean(this.error());
    return [
      'w-full min-h-10 rounded-lg border bg-elevated px-3 py-2 text-fg',
      'placeholder:text-fg-muted/80',
      'font-sans text-sm',
      'transition-ui',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:cursor-not-allowed disabled:opacity-50',
      hasLead ? 'pl-9' : 'pl-3',
      'pr-3',
      err
        ? 'border-danger/50 focus:ring-danger/30'
        : 'border-border focus:border-accent focus:ring-ring/50',
    ].join(' ');
  });
}

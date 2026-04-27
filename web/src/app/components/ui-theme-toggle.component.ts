/**
 * @module web/app/components/ui-theme-toggle
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ThemePreference, ThemeService } from '../services/theme.service';

@Component({
  selector: 'ui-theme-toggle',
  imports: [LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <div
      class="inline-flex rounded-lg border border-border bg-surface p-0.5"
      role="group"
      aria-label="Color theme"
    >
      <button
        type="button"
        class="rounded-md p-1.5 transition-ui focus:outline-none focus:ring-2 focus:ring-ring/50"
        [class]="btnClass('light')"
        (click)="pick('light')"
        [attr.aria-pressed]="theme.preference() === 'light' ? 'true' : 'false'"
        title="Light"
      >
        <lucide-icon name="sun" [size]="16" class="shrink-0" />
        <span class="sr-only">Light theme</span>
      </button>
      <button
        type="button"
        class="rounded-md p-1.5 transition-ui focus:outline-none focus:ring-2 focus:ring-ring/50"
        [class]="btnClass('dark')"
        (click)="pick('dark')"
        [attr.aria-pressed]="theme.preference() === 'dark' ? 'true' : 'false'"
        title="Dark"
      >
        <lucide-icon name="moon" [size]="16" class="shrink-0" />
        <span class="sr-only">Dark theme</span>
      </button>
      <button
        type="button"
        class="rounded-md p-1.5 transition-ui focus:outline-none focus:ring-2 focus:ring-ring/50"
        [class]="btnClass('system')"
        (click)="pick('system')"
        [attr.aria-pressed]="theme.preference() === 'system' ? 'true' : 'false'"
        title="System"
      >
        <lucide-icon name="monitor" [size]="16" class="shrink-0" />
        <span class="sr-only">System theme</span>
      </button>
    </div>
  `,
})
export class UiThemeToggleComponent {
  protected readonly theme = inject(ThemeService);

  pick(p: ThemePreference): void {
    this.theme.setPreference(p);
  }

  protected btnClass(mode: ThemePreference): string {
    return this.theme.preference() === mode
      ? 'bg-elevated text-fg shadow-sm'
      : 'text-fg-muted hover:text-fg';
  }
}

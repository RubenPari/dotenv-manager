/**
 * Root component
 * @module web/app/app.component
 * @description Root standalone component hosting the router outlet.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiToastContainerComponent } from './components/ui-toast-container.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, UiToastContainerComponent],
  template: '<router-outlet /><app-toast-container />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  // Ensure theme applies on bootstrap (side effects in ThemeService constructor).
  private readonly _theme = inject(ThemeService);
}

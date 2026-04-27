/**
 * Settings page
 * @module web/app/pages/settings/settings.component
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { API_BASE_URL } from '../../tokens';
import { UiButtonComponent } from '../../components/ui-button.component';
import { UiCardComponent } from '../../components/ui-card.component';
import { UiThemeToggleComponent } from '../../components/ui-theme-toggle.component';

@Component({
  selector: 'app-settings',
  imports: [UiButtonComponent, UiCardComponent, UiThemeToggleComponent],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  protected readonly apiBaseUrl = inject(API_BASE_URL);
  protected readonly currentUser = this.authService.currentUser;

  protected logout(): void {
    this.authService.logout().subscribe();
  }
}

/**
 * Settings page
 * @module web/app/pages/settings/settings.component
 * @description Displays basic app settings and allows logout.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { API_BASE_URL } from '../../tokens';

@Component({
  selector: 'app-settings',
  imports: [RouterLink],
  templateUrl: './settings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  protected readonly apiBaseUrl = inject(API_BASE_URL);

  /**
   * Logout the current user.
   */
  protected logout(): void {
    this.authService.logout().subscribe();
  }
}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Inject } from '@angular/core';
import { API_BASE_URL } from '../../tokens';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  constructor(
    private authService: AuthService,
    @Inject(API_BASE_URL) public apiBaseUrl: string,
  ) {}

  logout() {
    this.authService.logout();
  }
}

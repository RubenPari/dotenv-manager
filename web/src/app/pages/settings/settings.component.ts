import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './settings.component.html'
})
export class SettingsComponent {
  constructor(private authService: AuthService) {}

  logout() {
    this.authService.logout();
  }
}

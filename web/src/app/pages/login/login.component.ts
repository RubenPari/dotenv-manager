/**
 * Login page
 * @module web/app/pages/login/login.component
 * @description Login form page using `AuthService`.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  /**
   * Submit the login form and navigate to dashboard on success.
   */
  protected onSubmit(): void {
    const email = this.email();
    const password = this.password();

    if (!email || !password) {
      this.error.set('Email and password are required');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(email, password).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Login failed');
      },
    });
  }
}

/**
 * Register page
 * @module web/app/pages/register/register.component
 * @description Registration form page using `AuthService`.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly confirmPassword = signal('');
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  /**
   * Submit the registration form and navigate to dashboard on success.
   */
  protected onSubmit(): void {
    const email = this.email();
    const password = this.password();
    const confirmPassword = this.confirmPassword();

    if (!email || !password || !confirmPassword) {
      this.error.set('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      this.error.set('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      this.error.set('Password must be at least 8 characters');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.register(email, password).subscribe({
      next: () => {
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Registration failed');
      },
    });
  }
}

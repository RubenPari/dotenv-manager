/**
 * Login page
 * @module web/app/pages/login/login.component
 * @description Login form page using `AuthService`.
 */
import { ChangeDetectionStrategy, Component, inject, model, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UiButtonComponent } from '../../components/ui-button.component';
import { UiInputComponent } from '../../components/ui-input.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [RouterLink, UiButtonComponent, UiInputComponent, LucideAngularModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  protected readonly email = model('');
  protected readonly password = model('');
  protected readonly loading = signal(false);

  protected onSubmit(): void {
    const email = this.email().trim();
    const password = this.password();

    if (!email || !password) {
      this.toasts.show('Email and password are required', 'error');
      return;
    }

    this.loading.set(true);

    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toasts.show(err.error?.message || 'Login failed', 'error');
      },
    });
  }
}

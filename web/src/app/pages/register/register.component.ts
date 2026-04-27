/**
 * Register page
 * @module web/app/pages/register/register.component
 */
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { UiButtonComponent } from '../../components/ui-button.component';
import { UiInputComponent } from '../../components/ui-input.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-register',
  imports: [NgClass, RouterLink, UiButtonComponent, UiInputComponent, LucideAngularModule],
  templateUrl: './register.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);

  protected readonly email = model('');
  protected readonly password = model('');
  protected readonly confirmPassword = model('');
  protected readonly loading = signal(false);

  protected readonly passwordStrength = computed(() => {
    const p = this.password();
    let s = 0;
    if (p.length >= 8) s += 25;
    if (p.length >= 12) s += 15;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s += 20;
    if (/\d/.test(p)) s += 20;
    if (/[^A-Za-z0-9]/.test(p)) s += 20;
    return Math.min(100, s);
  });

  protected readonly strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (s < 30) {
      return 'weak';
    }
    if (s < 60) {
      return 'medium';
    }
    return 'strong';
  });

  protected onSubmit(): void {
    const email = this.email().trim();
    const password = this.password();
    const confirmPassword = this.confirmPassword();

    if (!email || !password || !confirmPassword) {
      this.toasts.show('All fields are required', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.toasts.show('Passwords do not match', 'error');
      return;
    }

    if (password.length < 8) {
      this.toasts.show('Password must be at least 8 characters', 'error');
      return;
    }

    this.loading.set(true);
    this.authService.register(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toasts.show(err.error?.message || 'Registration failed', 'error');
      },
    });
  }
}

/**
 * Authenticated app chrome: sidebar, top bar, main outlet.
 * @module web/app/layout/app-shell
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../services/auth.service';
import { UiButtonComponent } from '../components/ui-button.component';
import { UiThemeToggleComponent } from '../components/ui-theme-toggle.component';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    UiButtonComponent,
    UiThemeToggleComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-shell.component.html',
  host: { class: 'flex min-h-dvh' },
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  protected readonly router = inject(Router);

  protected readonly userEmail = this.auth.currentUser;
  protected readonly mobileNavOpen = signal(false);

  protected readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected signOut(): void {
    this.auth.logout().subscribe();
  }

  protected closeMobile(): void {
    this.mobileNavOpen.set(false);
  }

  protected projectSlugFromUrl(url: string): string {
    const m = url.match(/\/project\/([^/?#]+)/);
    if (!m?.[1]) {
      return '';
    }
    return m[1].replace(/-/g, ' ');
  }
}

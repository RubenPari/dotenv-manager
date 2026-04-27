/**
 * Authentication service (web)
 * @module web/app/services/auth.service
 * @description Handles login/register/logout and token storage for the web app.
 */
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { ApiService } from './api.service';

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string };
}

interface User {
  id: string;
  email: string;
}

const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly userSignal = signal<User | null>(null);
  private readonly tokenSignal = signal<string | null>(this.readStoredToken());

  /** Current user as a read-only signal. */
  readonly currentUser = this.userSignal.asReadonly();

  /** Whether a token is present. */
  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  /**
   * Authenticate the user and persist the access token in localStorage.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.api
      .post<LoginResponse>('/auth/login', { email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  /**
   * Register a new user and persist the access token in localStorage.
   */
  register(email: string, password: string): Observable<LoginResponse> {
    return this.api
      .post<LoginResponse>('/auth/register', { email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  /**
   * Logout the current user and clear local auth state.
   * Navigates back to `/login` even if the backend call fails.
   */
  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {}).pipe(
      tap(() => this.clearSession()),
      catchError(() => {
        this.clearSession();
        return of(undefined);
      }),
    );
  }

  /**
   * Refresh the access token (using the refresh cookie).
   */
  refresh(): Observable<{ accessToken: string }> {
    return this.api.post<{ accessToken: string }>('/auth/refresh', {});
  }

  /**
   * Get the currently stored access token.
   */
  getToken(): string | null {
    return this.tokenSignal();
  }

  private persistSession(res: LoginResponse): void {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    this.tokenSignal.set(res.accessToken);
    this.userSignal.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
    this.userSignal.set(null);
    void this.router.navigate(['/login']);
  }

  private readStoredToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }
}

/**
 * Authentication service (web)
 * @module web/app/services/auth.service
 * @description Handles login/register/logout and token storage for the web app.
 */
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { catchError, Observable, tap, of } from 'rxjs';

interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string };
}

interface User {
  id: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private user: User | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

  /**
   * Authenticate the user and persist the access token in localStorage.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.accessToken);
        this.user = res.user;
      }),
    );
  }

  /**
   * Register a new user and persist the access token in localStorage.
   */
  register(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/register', { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.accessToken);
        this.user = res.user;
      }),
    );
  }

  /**
   * Logout the current user and clear local auth state.
   * Navigates back to `/login` even if the backend call fails.
   */
  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout', {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        this.user = null;
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        localStorage.removeItem('token');
        this.user = null;
        this.router.navigate(['/login']);
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
    return localStorage.getItem('token');
  }

  /**
   * Whether a token is present.
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  /**
   * Get the current user snapshot (if set by login/register).
   */
  getCurrentUser(): User | null {
    return this.user;
  }
}

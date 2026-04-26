import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { catchError, Observable, tap, of, throwError } from 'rxjs';

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
    private router: Router
  ) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/login', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
        this.user = res.user;
      })
    );
  }

  register(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/auth/register', { email, password }).pipe(
      tap(res => {
        localStorage.setItem('token', res.accessToken);
        this.user = res.user;
      })
    );
  }

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
      })
    );
  }

  refresh(): Observable<{ accessToken: string }> {
    return this.api.post<{ accessToken: string }>('/auth/refresh', {});
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.user;
  }
}

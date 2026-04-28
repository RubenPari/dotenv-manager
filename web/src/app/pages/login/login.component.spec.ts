import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('LoginComponent', () => {
  it('shows toast when fields are missing', async () => {
    const show = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: { login: vi.fn(() => of({})) } },
        { provide: ToastService, useValue: { show } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = fixture.componentInstance as any;

    c.email.set('');
    c.password.set('');
    c.onSubmit();

    expect(show).toHaveBeenCalledWith('Email and password are required', 'error');
  });

  it('navigates to dashboard on successful login', async () => {
    const navigate = vi.fn();
    const login = vi.fn(() => of({}));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: { login } },
        { provide: ToastService, useValue: { show: vi.fn() } },
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = fixture.componentInstance as any;

    c.email.set('a@example.com');
    c.password.set('pw');
    c.onSubmit();

    expect(login).toHaveBeenCalledWith('a@example.com', 'pw');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(c.loading()).toBe(false);
  });

  it('shows toast on login error', async () => {
    const show = vi.fn();
    const login = vi.fn(() => throwError(() => ({ error: { message: 'Nope' } })));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: { login } },
        { provide: ToastService, useValue: { show } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = fixture.componentInstance as any;

    c.email.set('a@example.com');
    c.password.set('pw');
    c.onSubmit();

    expect(show).toHaveBeenCalledWith('Nope', 'error');
    expect(c.loading()).toBe(false);
  });
});

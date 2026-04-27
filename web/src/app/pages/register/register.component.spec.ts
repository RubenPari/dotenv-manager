import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

describe('RegisterComponent', () => {
  it('computes password strength label', async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: { register: vi.fn(() => of({})) } },
        { provide: ToastService, useValue: { show: vi.fn() } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    const c = fixture.componentInstance as any;

    c.password.set('a');
    expect(c.strengthLabel()).toBe('weak');

    c.password.set('Abcdef12');
    expect(['medium', 'strong']).toContain(c.strengthLabel());
  });

  it('shows toast when passwords do not match', async () => {
    const show = vi.fn();

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: { register: vi.fn(() => of({})) } },
        { provide: ToastService, useValue: { show } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    const c = fixture.componentInstance as any;

    c.email.set('a@example.com');
    c.password.set('password123');
    c.confirmPassword.set('password124');

    c.onSubmit();
    expect(show).toHaveBeenCalledWith('Passwords do not match', 'error');
  });

  it('navigates to dashboard on successful register', async () => {
    const navigate = vi.fn();
    const register = vi.fn(() => of({}));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: { register } },
        { provide: ToastService, useValue: { show: vi.fn() } },
        { provide: Router, useValue: { navigate } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    const c = fixture.componentInstance as any;

    c.email.set('a@example.com');
    c.password.set('password123');
    c.confirmPassword.set('password123');

    c.onSubmit();

    expect(register).toHaveBeenCalledWith('a@example.com', 'password123');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(c.loading()).toBe(false);
  });

  it('shows toast on register error', async () => {
    const show = vi.fn();
    const register = vi.fn(() => throwError(() => ({ error: { message: 'Bad' } })));

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: { register } },
        { provide: ToastService, useValue: { show } },
        { provide: Router, useValue: { navigate: vi.fn() } },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(RegisterComponent);
    const c = fixture.componentInstance as any;

    c.email.set('a@example.com');
    c.password.set('password123');
    c.confirmPassword.set('password123');

    c.onSubmit();

    expect(show).toHaveBeenCalledWith('Bad', 'error');
    expect(c.loading()).toBe(false);
  });
});


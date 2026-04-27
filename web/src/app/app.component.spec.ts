/**
 * App component smoke test
 * @module web/app/app.component.spec
 * @description Sanity-checks that the root component bootstraps correctly.
 */
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  it('creates the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

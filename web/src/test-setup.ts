/**
 * Vitest setup
 * @module web/test-setup
 * @description Configures the Angular TestBed for zoneless change detection.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

TestBed.configureTestingModule({
  providers: [provideZonelessChangeDetection()],
});

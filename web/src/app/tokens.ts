/**
 * Injection tokens
 * @module web/app/tokens
 * @description Angular DI tokens used across the application.
 */
import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

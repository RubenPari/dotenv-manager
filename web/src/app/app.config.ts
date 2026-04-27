/**
 * App configuration
 * @module web/app/app.config
 * @description Angular providers configuration (router, HTTP interceptors, base URL).
 */
import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { LucideAngularModule } from 'lucide-angular';
import { routes } from './app.routes';
import { jwtInterceptor } from './interceptors/jwt.interceptor';
import { API_BASE_URL } from './tokens';
import { environment } from '../environments/environment';
import { PICKED_LUCIDE_ICONS } from './icons/picked-icons';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    importProvidersFrom(LucideAngularModule.pick(PICKED_LUCIDE_ICONS)),
  ],
};

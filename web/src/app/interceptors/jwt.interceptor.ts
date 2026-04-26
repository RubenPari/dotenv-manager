/**
 * JWT interceptor
 * @module web/app/interceptors/jwt.interceptor
 * @description Attaches the access token from localStorage to outgoing requests.
 */
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor that adds `Authorization: Bearer <token>` when a token is present.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(req);
};

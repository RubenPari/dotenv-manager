/**
 * API service
 * @module web/app/services/api.service
 * @description Small wrapper around Angular HttpClient to call the backend API.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  /**
   * Perform a GET request.
   * @param path - API path (without base URL).
   * @param params - Optional query params.
   */
  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    return this.http.get<T>(`${this.apiBaseUrl}${path}`, { params, withCredentials: true });
  }

  /**
   * Perform a POST request.
   * @param path - API path (without base URL).
   * @param body - Request body.
   */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.apiBaseUrl}${path}`, body, { withCredentials: true });
  }

  /**
   * Perform a PUT request.
   * @param path - API path (without base URL).
   * @param body - Request body.
   */
  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.apiBaseUrl}${path}`, body, { withCredentials: true });
  }

  /**
   * Perform a DELETE request.
   * @param path - API path (without base URL).
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiBaseUrl}${path}`, { withCredentials: true });
  }
}

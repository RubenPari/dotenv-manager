import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    return this.http.get<T>(`${API_URL}${path}`, { params, withCredentials: true });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${API_URL}${path}`, body, { withCredentials: true });
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${API_URL}${path}`, body, { withCredentials: true });
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_URL}${path}`, { withCredentials: true });
  }
}

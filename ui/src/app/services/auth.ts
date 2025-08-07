import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// Import shared types
export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  tweets?: Tweet[];
  comments?: Comment[];
}

export interface Tweet {
  id: string;
  content: string;
  createdAt: Date;
  author?: User;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author?: User;
  tweet?: Tweet;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SignupDto {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
}

export interface AuthError {
  statusCode: number;
  message: string | string[];
  error: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/api`;

  // State management
  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  currentUser$ = this.currentUserSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Signals for modern Angular state management
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Check for existing token on service initialization
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = this.getStoredToken();
    if (token) {
      // Verify token by getting current user
      this.getCurrentUser().subscribe({
        next: (user) => {
          this.setCurrentUser(user);
          this.setAuthenticated(true);
        },
        error: () => {
          // Token is invalid, clear it
          this.clearToken();
        },
      });
    }
  }

  /**
   * Login as a user
   */
  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/users/login`, credentials)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.setAuthenticated(true);

          // Get user details after successful login
          this.getCurrentUser().subscribe({
            next: (user) => this.setCurrentUser(user),
            error: (error) =>
              console.error('Failed to get user details:', error),
          });
        })
      );
  }

  /**
   * Sign up as a user
   */
  signup(signupData: SignupDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/auth/users/signup`, signupData)
      .pipe(
        tap((response) => {
          this.storeToken(response.token);
          this.setAuthenticated(true);

          // Get user details after successful signup
          this.getCurrentUser().subscribe({
            next: (user) => this.setCurrentUser(user),
            error: (error) =>
              console.error('Failed to get user details:', error),
          });
        })
      );
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.baseUrl}/auth/users/me`, { headers });
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.clearToken();
    this.setCurrentUser(null);
    this.setAuthenticated(false);
  }

  /**
   * Check if user is currently authenticated
   */
  isLoggedIn(): boolean {
    return !!this.getStoredToken();
  }

  /**
   * Get the stored JWT token
   */
  getToken(): string | null {
    return this.getStoredToken();
  }

  /**
   * Get authorization headers for authenticated requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Get authorization headers only if user is authenticated
   */
  getAuthHeadersIfAuthenticated(): HttpHeaders {
    const token = this.getStoredToken();
    if (token) {
      return new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
    }
    return new HttpHeaders();
  }

  /**
   * Admin login (if needed in the future)
   */
  adminLogin(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.baseUrl}/auth/admins/login`,
      credentials
    );
  }

  /**
   * Get current admin (if needed in the future)
   */
  getCurrentAdmin(): Observable<User> {
    const headers = this.getAuthHeaders();
    return this.http.get<User>(`${this.baseUrl}/auth/admins/me`, { headers });
  }

  // Private helper methods
  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private getStoredToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  private clearToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
  }

  private setAuthenticated(value: boolean): void {
    this.isAuthenticatedSubject.next(value);
    this.isAuthenticated.set(value);
  }
}

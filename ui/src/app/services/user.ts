import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';
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

export interface CreateUpdateUserDto {
  email: string;
  password: string;
  username: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  from: number;
  to: number;
  total: number;
  perPage: number;
}

export interface SelectOption {
  id: number;
  label: string;
}

export interface UserListParams {
  page?: number;
  perPage?: number;
  orderBy?: 'username';
  order?: 'ASC' | 'DESC';
  relations?: ('tweets' | 'comments')[];
  username_eq?: string;
  username_neq?: string;
  username_like?: string;
  username_in?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.apiBaseUrl}/api`;

  /**
   * Create a new user
   */
  createUser(userData: CreateUpdateUserDto): Observable<User> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<User>(`${this.baseUrl}/collections/users`, userData, {
      headers,
    });
  }

  /**
   * Get a paginated list of users with optional filtering and sorting
   */
  getUsers(params?: UserListParams): Observable<PaginatedResponse<User>> {
    let httpParams = new HttpParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'relations' && Array.isArray(value)) {
            httpParams = httpParams.set(key, value.join(','));
          } else {
            httpParams = httpParams.set(key, value.toString());
          }
        }
      });
    }

    return this.http.get<PaginatedResponse<User>>(
      `${this.baseUrl}/collections/users`,
      {
        params: httpParams,
      }
    );
  }

  /**
   * Get a single user by ID
   */
  getUserById(
    id: string,
    relations?: ('tweets' | 'comments')[]
  ): Observable<User> {
    let httpParams = new HttpParams();

    if (relations && relations.length > 0) {
      httpParams = httpParams.set('relations', relations.join(','));
    }

    return this.http.get<User>(`${this.baseUrl}/collections/users/${id}`, {
      params: httpParams,
    });
  }

  /**
   * Update a user completely (PUT - full replace) - Admin only
   */
  updateUser(id: string, userData: CreateUpdateUserDto): Observable<User> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<User>(
      `${this.baseUrl}/collections/users/${id}`,
      userData,
      { headers }
    );
  }

  /**
   * Partially update a user (PATCH - partial update) - Admin only
   */
  patchUser(
    id: string,
    userData: Partial<CreateUpdateUserDto>
  ): Observable<User> {
    const headers = this.authService.getAuthHeaders();
    return this.http.patch<User>(
      `${this.baseUrl}/collections/users/${id}`,
      userData,
      { headers }
    );
  }

  /**
   * Delete a user by ID - Admin only
   */
  deleteUser(id: string): Observable<User> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<User>(`${this.baseUrl}/collections/users/${id}`, {
      headers,
    });
  }

  /**
   * Get users for select options (admin panel)
   */
  getUserSelectOptions(): Observable<SelectOption[]> {
    return this.http.get<SelectOption[]>(
      `${this.baseUrl}/collections/users/select-options`
    );
  }

  /**
   * Search users by username (helper method using username_like filter)
   */
  searchUsers(
    searchTerm: string,
    params?: Omit<UserListParams, 'username_like'>
  ): Observable<PaginatedResponse<User>> {
    return this.getUsers({
      ...params,
      username_like: `%${searchTerm}%`,
    });
  }

  /**
   * Get user by username (helper method)
   */
  getUserByUsername(username: string): Observable<PaginatedResponse<User>> {
    return this.getUsers({
      username_eq: username,
      perPage: 1,
    });
  }
}

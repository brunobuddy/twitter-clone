import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth';

// Reuse types from tweet service
export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author?: User;
  tweet?: Tweet;
}

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
  user?: User;
  comments?: Comment[];
}

export interface CreateCommentDto {
  content: string;
  tweetId: string;
  authorId?: string;
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

export interface CommentListParams {
  page?: number;
  perPage?: number;
  orderBy?: 'content' | 'createdAt';
  order?: 'ASC' | 'DESC';
  relations?: ('author' | 'tweet')[];
  'tweet.id_eq'?: string;
  'author.id_eq'?: string;
  content_like?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = 'http://localhost:1111/api';

  /**
   * Create a new comment
   */
  createComment(commentData: CreateCommentDto): Observable<Comment> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<Comment>(
      `${this.baseUrl}/collections/comments`,
      commentData,
      { headers }
    );
  }

  /**
   * Get a paginated list of comments with optional filtering and sorting
   */
  getComments(
    params?: CommentListParams
  ): Observable<PaginatedResponse<Comment>> {
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

    return this.http.get<PaginatedResponse<Comment>>(
      `${this.baseUrl}/collections/comments`,
      {
        params: httpParams,
      }
    );
  }

  /**
   * Get a single comment by ID
   */
  getCommentById(
    id: string,
    relations?: ('author' | 'tweet')[]
  ): Observable<Comment> {
    let httpParams = new HttpParams();

    if (relations && relations.length > 0) {
      httpParams = httpParams.set('relations', relations.join(','));
    }

    return this.http.get<Comment>(
      `${this.baseUrl}/collections/comments/${id}`,
      {
        params: httpParams,
      }
    );
  }

  /**
   * Delete a comment by ID
   */
  deleteComment(id: string): Observable<Comment> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<Comment>(
      `${this.baseUrl}/collections/comments/${id}`,
      {
        headers,
      }
    );
  }

  /**
   * Get comments for a specific tweet (helper method)
   */
  getCommentsByTweet(
    tweetId: string,
    params?: Omit<CommentListParams, 'tweet.id_eq'>
  ): Observable<PaginatedResponse<Comment>> {
    return this.getComments({
      ...params,
      'tweet.id_eq': tweetId,
      relations: ['author', ...(params?.relations || [])],
    });
  }

  /**
   * Get comments by author (helper method)
   */
  getCommentsByAuthor(
    authorId: string,
    params?: Omit<CommentListParams, 'author.id_eq'>
  ): Observable<PaginatedResponse<Comment>> {
    return this.getComments({
      ...params,
      'author.id_eq': authorId,
      relations: ['author', 'tweet', ...(params?.relations || [])],
    });
  }
}

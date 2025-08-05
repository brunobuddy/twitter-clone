import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// Types from the backend
export interface Tweet {
  id: string;
  content: string;
  createdAt: Date;
  author?: User;
  comments?: Comment[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  username: string;
  tweets?: Tweet[];
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author?: User;
  tweet?: Tweet;
}

export interface CreateUpdateTweetDto {
  content: string;
  createdAt: Date;
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

export interface SelectOption {
  id: number;
  label: string;
}

export interface TweetListParams {
  page?: number;
  perPage?: number;
  orderBy?: 'content' | 'createdAt';
  order?: 'ASC' | 'DESC';
  relations?: ('author' | 'comments')[];
  content_eq?: string;
  content_neq?: string;
  content_like?: string;
  content_in?: string;
  createdAt_eq?: string;
  createdAt_neq?: string;
  createdAt_gt?: string;
  createdAt_gte?: string;
  createdAt_lt?: string;
  createdAt_lte?: string;
  createdAt_in?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TweetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:1111/api';

  /**
   * Create a new tweet
   */
  createTweet(tweetData: CreateUpdateTweetDto): Observable<Tweet> {
    return this.http.post<Tweet>(
      `${this.baseUrl}/collections/tweets`,
      tweetData
    );
  }

  /**
   * Get a paginated list of tweets with optional filtering and sorting
   */
  getTweets(params?: TweetListParams): Observable<PaginatedResponse<Tweet>> {
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

    return this.http.get<PaginatedResponse<Tweet>>(
      `${this.baseUrl}/collections/tweets`,
      {
        params: httpParams,
      }
    );
  }

  /**
   * Get a single tweet by ID
   */
  getTweetById(
    id: string,
    relations?: ('author' | 'comments')[]
  ): Observable<Tweet> {
    let httpParams = new HttpParams();

    if (relations && relations.length > 0) {
      httpParams = httpParams.set('relations', relations.join(','));
    }

    return this.http.get<Tweet>(`${this.baseUrl}/collections/tweets/${id}`, {
      params: httpParams,
    });
  }

  /**
   * Update a tweet completely (PUT - full replace)
   */
  updateTweet(id: string, tweetData: CreateUpdateTweetDto): Observable<Tweet> {
    return this.http.put<Tweet>(
      `${this.baseUrl}/collections/tweets/${id}`,
      tweetData
    );
  }

  /**
   * Partially update a tweet (PATCH - partial update)
   */
  patchTweet(
    id: string,
    tweetData: Partial<CreateUpdateTweetDto>
  ): Observable<Tweet> {
    return this.http.patch<Tweet>(
      `${this.baseUrl}/collections/tweets/${id}`,
      tweetData
    );
  }

  /**
   * Delete a tweet by ID
   */
  deleteTweet(id: string): Observable<Tweet> {
    return this.http.delete<Tweet>(`${this.baseUrl}/collections/tweets/${id}`);
  }

  /**
   * Get tweets for select options (admin panel)
   */
  getTweetSelectOptions(): Observable<SelectOption[]> {
    return this.http.get<SelectOption[]>(
      `${this.baseUrl}/collections/tweets/select-options`
    );
  }

  /**
   * Search tweets by content (helper method using content_like filter)
   */
  searchTweets(
    searchTerm: string,
    params?: Omit<TweetListParams, 'content_like'>
  ): Observable<PaginatedResponse<Tweet>> {
    return this.getTweets({
      ...params,
      content_like: `%${searchTerm}%`,
    });
  }

  /**
   * Get tweets by author ID (helper method)
   */
  getTweetsByAuthor(
    authorId: string,
    params?: Omit<TweetListParams, 'authorId'>
  ): Observable<PaginatedResponse<Tweet>> {
    // Note: This would require filtering by authorId if available in the API
    // For now, we'll need to implement this on the frontend after fetching tweets with author relation
    return this.getTweets({
      ...params,
      relations: ['author', ...(params?.relations || [])],
    });
  }

  /**
   * Get recent tweets (helper method)
   */
  getRecentTweets(limit: number = 10): Observable<PaginatedResponse<Tweet>> {
    return this.getTweets({
      orderBy: 'createdAt',
      order: 'DESC',
      perPage: limit,
      page: 1,
      relations: ['author'],
    });
  }
}

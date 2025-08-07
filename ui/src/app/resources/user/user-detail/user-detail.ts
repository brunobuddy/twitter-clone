import { Component } from '@angular/core';
import {
  PaginatedResponse,
  Tweet,
  User,
  UserService,
} from '../../../services/user';
import { ActivatedRoute } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { TweetCard } from '../../tweet/tweet-card/tweet-card';
import { TweetService } from '../../../services/tweet';

@Component({
  selector: 'app-user-detail',
  imports: [NgIf, NgFor, TweetCard],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  user: User;
  tweets: Tweet[] = [];

  constructor(
    private userService: UserService,
    private tweetService: TweetService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    const userId = this.activatedRoute.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadUser(userId);
    }
  }

  private loadUser(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user: User) => {
        this.user = user;

        this.loadTweets(userId);
      },
      error: () => {
        console.error('Error loading user');
      },
    });
  }
  private loadTweets(userId: string): void {
    this.tweetService
      .getTweets({ 'author.id_eq': userId, relations: ['author'] })
      .subscribe({
        next: (tweets: PaginatedResponse<Tweet>) => {
          this.tweets = tweets.data;
        },
        error: () => {
          console.error('Error loading tweets');
        },
      });
  }
}

import { Component } from '@angular/core';
import { Tweet, TweetService } from '../../../services/tweet';
import { Comment } from '../../../services/comment';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { CommentForm } from '../comment-form/comment-form';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-tweet-detail',
  imports: [DatePipe, NgIf, NgFor, RouterLink, CommentForm],
  templateUrl: './tweet-detail.html',
  styleUrl: './tweet-detail.scss',
})
export class TweetDetail {
  tweet: Tweet;

  constructor(
    private tweetService: TweetService,
    private activatedRoute: ActivatedRoute,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const tweetId = this.activatedRoute.snapshot.paramMap.get('tweetId');
    if (tweetId) {
      this.loadTweet(tweetId);
    } else {
      console.error('No tweet ID provided in route');
    }
  }

  private loadTweet(tweetId: string): void {
    this.tweetService.getTweetById(tweetId, ['user', 'comments']).subscribe({
      next: (tweet) => {
        // Handle the loaded tweet
        this.tweet = tweet;
      },
      error: (err) => {
        console.error('Error loading tweet:', err);
      },
    });
  }

  onCommentCreated(newComment: Comment): void {
    // Add the new comment to the tweet's comments array
    if (!this.tweet.comments) {
      this.tweet.comments = [];
    }

    // Add the comment with author details (it should come from the API with relations)
    this.tweet.comments.push(newComment);
  }
}

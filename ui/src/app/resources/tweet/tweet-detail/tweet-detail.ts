import { Component } from '@angular/core';
import { Tweet, TweetService } from '../../../services/tweet';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-tweet-detail',
  imports: [DatePipe, NgIf, NgFor],
  templateUrl: './tweet-detail.html',
  styleUrl: './tweet-detail.scss',
})
export class TweetDetail {
  tweet: Tweet;

  constructor(
    private tweetService: TweetService,
    private activatedRoute: ActivatedRoute
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
    this.tweetService.getTweetById(tweetId, ['author', 'comments']).subscribe({
      next: (tweet) => {
        // Handle the loaded tweet
        this.tweet = tweet;
      },
      error: (err) => {
        console.error('Error loading tweet:', err);
      },
    });
  }
}

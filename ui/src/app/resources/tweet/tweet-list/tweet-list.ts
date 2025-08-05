import { Component } from '@angular/core';
import { Tweet, TweetService } from '../../../services/tweet';
import { NgFor } from '@angular/common';
import { TweetCard } from '../tweet-card/tweet-card';

@Component({
  selector: 'app-tweet-list',
  imports: [NgFor, TweetCard],
  templateUrl: './tweet-list.html',
  styleUrl: './tweet-list.scss',
})
export class TweetList {
  tweets: Tweet[] = []; // Array to hold the list of tweets

  constructor(private tweetService: TweetService) {}

  ngOnInit(): void {
    // Initialization logic can go here
    this.loadTweets();
  }
  private loadTweets(): void {
    this.tweetService.getTweets({ relations: ['author'] }).subscribe({
      next: (response) => {
        this.tweets = response.data;
      },
      error: (error) => {
        console.error('Error loading tweets:', error);
      },
    });
  }
}

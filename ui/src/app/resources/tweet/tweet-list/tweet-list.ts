import { Component } from '@angular/core';
import { Tweet, TweetService } from '../../../services/tweet';
import { NgFor } from '@angular/common';
import { TweetCard } from '../tweet-card/tweet-card';
import { TweetForm } from '../tweet-form/tweet-form';

@Component({
  selector: 'app-tweet-list',
  imports: [NgFor, TweetCard, TweetForm],
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

  onTweetCreated(newTweet: Tweet): void {
    // Add the new tweet to the beginning of the list
    // First, we need to load the tweet with author relation
    this.tweetService.getTweetById(newTweet.id, ['author']).subscribe({
      next: (tweetWithAuthor) => {
        this.tweets.unshift(tweetWithAuthor);
      },
      error: (error) => {
        console.error('Error loading new tweet details:', error);
        // Fallback: just add the tweet without author details
        this.tweets.unshift(newTweet);
      },
    });
  }
}

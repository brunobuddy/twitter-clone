import { Component, Input } from '@angular/core';
import { Tweet } from '../../../services/tweet';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-tweet-card',
  imports: [NgIf, RouterLink],
  templateUrl: './tweet-card.html',
  styleUrl: './tweet-card.scss',
})
export class TweetCard {
  @Input() tweet: Tweet;
}

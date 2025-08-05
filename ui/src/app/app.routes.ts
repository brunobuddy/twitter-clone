import { Routes } from '@angular/router';
import { TweetList } from './resources/tweet/tweet-list/tweet-list';
import { TweetDetail } from './resources/tweet/tweet-detail/tweet-detail';
import { UserDetail } from './resources/user/user-detail/user-detail';

export const routes: Routes = [
  {
    path: '',
    component: TweetList,
  },
  {
    path: 'tweets/:tweetId',
    component: TweetDetail,
  },
  {
    path: 'users/:userId',
    component: UserDetail,
  },
];

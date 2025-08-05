import { Component } from '@angular/core';
import { User } from '../../../services/user';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-detail',
  imports: [],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail {
  user: User;

  constructor(
    private userService: UserService,
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
      },
      error: () => {
        console.error('Error loading user');
      },
    });
  }
}

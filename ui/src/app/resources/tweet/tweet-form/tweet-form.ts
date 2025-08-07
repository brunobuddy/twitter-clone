import { Component, EventEmitter, Output, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  TweetService,
  CreateUpdateTweetDto,
  Tweet,
} from '../../../services/tweet';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-tweet-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './tweet-form.html',
  styleUrl: './tweet-form.scss',
})
export class TweetForm {
  @Output() tweetCreated = new EventEmitter<Tweet>();

  private fb = inject(FormBuilder);
  private tweetService = inject(TweetService);
  public authService = inject(AuthService); // Make public for template access

  tweetForm: FormGroup;
  isSubmitting = false;
  maxLength = 280;

  constructor() {
    this.tweetForm = this.fb.group({
      content: [
        '',
        [Validators.required, Validators.maxLength(this.maxLength)],
      ],
    });
  }

  get content() {
    return this.tweetForm.get('content');
  }

  get remainingCharacters(): number {
    const contentLength = this.content?.value?.length || 0;
    return this.maxLength - contentLength;
  }

  get isOverLimit(): boolean {
    return this.remainingCharacters < 0;
  }

  get canSubmit(): boolean {
    return this.tweetForm.valid && !this.isSubmitting && !this.isOverLimit;
  }

  onSubmit(): void {
    if (!this.canSubmit) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('User not authenticated');
      return;
    }

    this.isSubmitting = true;

    const tweetData: CreateUpdateTweetDto = {
      content: this.content!.value.trim(),
      createdAt: new Date(),
      authorId: currentUser.id,
    };

    this.tweetService.createTweet(tweetData).subscribe({
      next: (newTweet) => {
        this.tweetCreated.emit(newTweet);
        this.tweetForm.reset();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating tweet:', error);
        this.isSubmitting = false;
      },
    });
  }

  onTextareaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    // Auto-resize textarea
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }
}

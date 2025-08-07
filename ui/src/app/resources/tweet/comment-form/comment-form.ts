import { Component, Output, EventEmitter, Input } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth';
import {
  CommentService,
  CreateCommentDto,
  Comment,
} from '../../../services/comment';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './comment-form.html',
  styleUrl: './comment-form.scss',
})
export class CommentForm {
  @Input() tweetId!: string; // The tweet to comment on
  @Output() commentCreated = new EventEmitter<Comment>();

  commentForm: FormGroup;
  isSubmitting = false;
  maxLength = 280;

  constructor(
    private fb: FormBuilder,
    public authService: AuthService,
    private commentService: CommentService
  ) {
    this.commentForm = this.fb.group({
      content: [
        '',
        [Validators.required, Validators.maxLength(this.maxLength)],
      ],
    });
  }

  get content() {
    return this.commentForm.get('content');
  }

  get canSubmit(): boolean {
    return (
      this.commentForm.valid &&
      !this.isSubmitting &&
      this.content?.value?.trim()
    );
  }

  get characterCount(): number {
    return this.content?.value?.length || 0;
  }

  get remainingCharacters(): number {
    return this.maxLength - this.characterCount;
  }

  get isOverLimit(): boolean {
    return this.characterCount > this.maxLength;
  }

  onTextareaInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    // Auto-resize textarea
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }

  onSubmit(): void {
    if (!this.canSubmit) return;

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      console.error('User not authenticated');
      return;
    }

    this.isSubmitting = true;

    const commentData: CreateCommentDto = {
      content: this.content!.value.trim(),
      tweetId: this.tweetId,
      authorId: currentUser.id,
    };

    this.commentService.createComment(commentData).subscribe({
      next: (newComment) => {
        this.commentCreated.emit(newComment);
        this.commentForm.reset();
        this.isSubmitting = false;

        // Reset textarea height
        const textarea = document.querySelector(
          '.comment-textarea'
        ) as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
      },
      error: (error) => {
        console.error('Error creating comment:', error);
        this.isSubmitting = false;
      },
    });
  }
}

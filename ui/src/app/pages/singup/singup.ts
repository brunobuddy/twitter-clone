import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthError } from '../../services/auth';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './singup.html',
  styleUrl: './singup.scss',
})
export class Singup {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Form state
  signupForm: FormGroup;

  // Loading and error states
  isLoading = signal(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Password visibility toggles
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(20),
          ],
        ],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(form: FormGroup): null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      const errors = confirmPassword?.errors;
      if (errors) {
        delete errors['passwordMismatch'];
        if (Object.keys(errors).length === 0) {
          confirmPassword?.setErrors(null);
        }
      }
    }
    return null;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.signupForm.valid && !this.isLoading()) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');

      const { email, password, username } = this.signupForm.value;
      const signupData = { email, password, username };

      this.authService.signup(signupData).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.successMessage.set(
            'Account created successfully! Redirecting...'
          );

          // Redirect to home page or dashboard after successful signup
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 1500);
        },
        error: (error: AuthError) => {
          this.isLoading.set(false);
          this.handleError(error);
        },
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }

  /**
   * Handle authentication errors
   */
  private handleError(error: AuthError): void {
    if (error.statusCode === 400) {
      const message = Array.isArray(error.message)
        ? error.message.join(', ')
        : error.message;
      this.errorMessage.set(message);
    } else if (error.statusCode === 409) {
      this.errorMessage.set('An account with this email already exists.');
    } else {
      this.errorMessage.set('An unexpected error occurred. Please try again.');
    }
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach((key) => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Check if a form field has an error and is touched
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.signupForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && field.touched;
    }
    return field.invalid && field.touched;
  }

  /**
   * Get error message for a specific field
   */
  getErrorMessage(fieldName: string): string {
    const field = this.signupForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) {
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } is required`;
    }
    if (field.errors['email']) {
      return 'Please enter a valid email address';
    }
    if (field.errors['minlength']) {
      const requiredLength = field.errors['minlength'].requiredLength;
      if (fieldName === 'password') {
        return `Password must be at least ${requiredLength} characters`;
      }
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } must be at least ${requiredLength} characters`;
    }
    if (field.errors['maxlength']) {
      const requiredLength = field.errors['maxlength'].requiredLength;
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } must be no more than ${requiredLength} characters`;
    }
    if (field.errors['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }
}

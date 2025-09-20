import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.services';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, ButtonModule,
    InputTextModule,],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login {
  constructor(private router: Router, private authService: AuthService) { }

  fb = inject(FormBuilder)

  hasError = signal(false);
  isposting = signal(false);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  async login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.hasError.set(false);
    this.isposting.set(true);

    try {
      const { username, password } = this.loginForm.value;
      await this.authService.login(username!, password!);
      this.router.navigate(['/chat']);
    } catch (error) {
      this.hasError.set(true);
      console.error('Login failed:', error);
    } finally {
      this.isposting.set(false);
    }
  }
}



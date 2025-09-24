import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.services';
import { RecaptchaService } from '../../services/recaptcha.service';
import { HttpService } from '../../../shared/services/http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, ButtonModule,
    InputTextModule,],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login {
  constructor(private router: Router,
    private authService: AuthService,
    private recaptchaService: RecaptchaService,
    private httpService: HttpService) {
    // Check if user is already logged in
    authService.isLoggedIn().then((isAuthenticated) => {
      if (isAuthenticated) {
        authService.logout();
      }
    });
  }

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

      const isCaptchaValid = await this.validateCaptcha();
      if (!isCaptchaValid) {
        throw new Error('Su sesión ha expirado. Por favor, recargue la página e intente nuevamente.');
      }

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

  validateCaptcha(): Observable<boolean> {
    return this.recaptchaService.execute('login').then((token: string) => {
      return this.httpService.post('/recaptcha-validate', { recaptchaToken: token }).pipe(
        map((response: any) => {
          // Asegurarse de que response.success es un booleano
          const responseBody = JSON.parse(response.body);
          return responseBody.success === true;
        })
      );
    }) as unknown as Observable<boolean>;
  }

}





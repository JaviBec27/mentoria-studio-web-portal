import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '@AuthServices/auth.service';
import { RecaptchaService } from '@AuthServices/recaptcha.service';
import { HttpService } from '@SharedServices/http.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConsoleLogService } from '@SharedServices/console-log.service';

/**
 * Componente para la página de inicio de sesión.
 * Maneja la autenticación del usuario, la validación de reCAPTCHA y la redirección.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule, ButtonModule,
    InputTextModule,],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login {
  /**
   * @param router Servicio para la navegación.
   * @param authService Servicio para la autenticación de usuarios.
   * @param recaptchaService Servicio para la validación de reCAPTCHA.
   * @param httpService Servicio para realizar peticiones HTTP.
   * @param logger Servicio para registrar mensajes en la consola.
   */
  constructor(private router: Router,
    private authService: AuthService,
    private recaptchaService: RecaptchaService,
    private httpService: HttpService,
    private logger: ConsoleLogService) {
    // Check if user is already logged in
    authService.isLoggedIn().then((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/chat']);
      }
    });
  }

  fb = inject(FormBuilder)

  /** Signal que indica si ha ocurrido un error en el login. */
  hasError = signal(false);
  /** Signal que indica si se está procesando una petición de login. */
  isposting = signal(false);

  /** Formulario de login con validaciones. */
  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  /**
   * Maneja el proceso de inicio de sesión.
   * Valida el formulario, verifica el reCAPTCHA y llama al servicio de autenticación.
   */
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
      this.logger.error('Login failed:', error);
    } finally {
      this.isposting.set(false);
    }
  }

  /**
   * Ejecuta y valida el token de reCAPTCHA v3.
   * @returns Un Observable que emite `true` si el captcha es válido, `false` en caso contrario.
   */
  validateCaptcha(): Observable<boolean> {
    return this.recaptchaService.execute('login').then((token: string) => {
      return this.httpService.post('/recaptcha-validate', { recaptchaToken: token }).pipe(
        map((response: any) => {
          // Asegurarse de que response.success es un booleano
          if (response && response.body) {
            const responseBody = JSON.parse(response.body);
            return responseBody.success === true;
          }
          return false;
        })
      );
    }) as unknown as Observable<boolean>;
  }

}





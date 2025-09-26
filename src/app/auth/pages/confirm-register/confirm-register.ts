import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
import { ConsoleLogService } from '../../../shared/services/console-log.service';

/**
 * Componente para la página de confirmación de registro.
 * Permite a los usuarios confirmar su cuenta usando un código enviado a su email.
 */
@Component({
  selector: 'app-confirm-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './confirm-register.html',
  styleUrls: ['./confirm-register.scss'],
})
export class ConfirmRegister {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private logger = inject(ConsoleLogService);

  /** Formulario para la confirmación de registro. */
  public confirmForm: FormGroup;
  /** Signal para almacenar y mostrar mensajes de error. */
  public errorMessage = signal<string | null>(null);
  /** Signal para mostrar un mensaje de éxito al reenviar el código. */
  public resendMessage = signal<string | null>(null);

  constructor() {
    this.confirmForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      code: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Pre-fill email from query params if available
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.confirmForm.get('email')?.setValue(params['email']);
      }
    });
  }

  /**
   * Maneja el envío del formulario de confirmación.
   * Llama al servicio de autenticación para confirmar el registro y redirige al login si tiene éxito.
   */
  async onConfirm() {
    if (this.confirmForm.invalid) {
      this.confirmForm.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    try {
      const { email, code } = this.confirmForm.value;
      await this.authService.confirmSignUp(email, code);
      // On success, redirect to login with a success message
      this.router.navigate(['/auth/login'], { queryParams: { confirmed: 'true' } });
    } catch (error: any) {
      this.logger.error('Error confirming registration:', error);
      this.errorMessage.set(error.message || 'Ocurrió un error al confirmar el registro.');
    }
  }

  /**
   * Maneja la solicitud de reenvío del código de confirmación.
   */
  async onResendCode() {
    this.errorMessage.set(null);
    this.resendMessage.set(null);
    const email = this.confirmForm.get('email')?.value;
    if (!email) {
      this.errorMessage.set('Por favor, introduce tu email para reenviar el código.');
      return;
    }

    try {
      await this.authService.resendSignUpCode(email);
      this.resendMessage.set('Se ha reenviado un nuevo código a tu correo.');
    } catch (error: any) {
      this.logger.error('Error resending code:', error);
      this.errorMessage.set(error.message || 'Ocurrió un error al reenviar el código.');
    }
  }
}


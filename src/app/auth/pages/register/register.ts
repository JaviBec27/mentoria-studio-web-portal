import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@AuthServices/auth.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConsoleLogService } from '@SharedServices/console-log.service';

/**
 * Validador personalizado para confirmar que las contraseñas coinciden.
 * @param formGroup El grupo de formularios que contiene los campos de contraseña.
 * @returns Un objeto de error si las contraseñas no coinciden, de lo contrario, null.
 */
export function passwordsMatchValidator(formGroup: FormGroup) {
  const password = formGroup.get('password')?.value;
  const confirmPassword = formGroup.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordsMismatch: true };
}

/**
 * Componente para la página de registro de nuevos usuarios.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    CommonModule,
    ButtonModule,
    InputTextModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(ConsoleLogService);

  /** Formulario de registro con validaciones. */
  registerForm: FormGroup;
  /** Signal para almacenar y mostrar mensajes de error. */
  errorMessage = signal<string | null>(null);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: passwordsMatchValidator });
  }

  /**
   * Maneja el envío del formulario de registro.
   * Si es válido, llama al servicio de autenticación para registrar al usuario
   * y luego navega a la página de confirmación.
   */
  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);

    try {
      const { email, password } = this.registerForm.value;
      await this.authService.register(email, password);
      // On successful registration, navigate to the confirmation page
      this.router.navigate(['/auth/confirm-register'], { queryParams: { email: email } });
    } catch (error: any) {
      this.logger.error('Registration failed:', error);
      this.errorMessage.set(error.message || 'Ocurrió un error durante el registro.');
    }
  }
}

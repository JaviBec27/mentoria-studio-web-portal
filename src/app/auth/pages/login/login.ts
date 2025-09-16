import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  standalone: true,
})
export class Login {
  constructor(private router: Router) { }

  fb = inject(FormBuilder)

  hasError = signal(false);
  isposting = signal(false);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  login() {
    if (this.loginForm.invalid) {
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
      }
        , 3000);
      return;
    }

    const { username = '', password = '' } = this.loginForm.value;
    console.log({ username, password });

    // Lógica de autenticación simulada
    console.log('Iniciando sesión...');
    this.router.navigate(['/chat']);

  }
}



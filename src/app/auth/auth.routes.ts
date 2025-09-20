import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { Register } from './pages/register/register';
import { ConfirmRegister } from './pages/confirm-register/confirm-register';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register },
      { path: 'confirm-register', component: ConfirmRegister },
      { path: '**', redirectTo: 'login' },
    ],
  },
];

export default authRoutes;

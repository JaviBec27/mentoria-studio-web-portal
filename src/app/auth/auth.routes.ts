import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { AuthLayout } from './layout/auth-layout/auth-layout';

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      { path: 'login', component: Login },
      { path: '**', redirectTo: 'login' },
    ],
  },
];

export default authRoutes;

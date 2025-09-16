import { Routes } from '@angular/router';
import { Chat } from './pages/chat/chat';
import { Counter } from './pages/counter/counter';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  { path: 'chat', component: Chat },
  { path: 'counter', component: Counter },
  { path: '**', redirectTo: 'auth' },
];


import { Routes } from '@angular/router';
import { Chat } from './pages/chat/chat';
import { Counter } from './pages/counter/counter';
import { authGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'chat',
    component: Chat,
    canActivate: [authGuard],
  },
  { path: 'counter', component: Counter },
  { path: '**', redirectTo: 'auth' },
];

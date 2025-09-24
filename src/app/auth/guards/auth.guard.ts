import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.services';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  return authService.isLoggedIn().then((isAuthenticated) => {
    if (isAuthenticated) {
      return true;
    } else {
      // Si el usuario no está autenticado, se redirige a la página de login.
      return router.createUrlTree(['/auth/login']);
    }
  }).catch((error) => {
    console.error('Error checking authentication status:', error);
    return router.createUrlTree(['/auth/login']);
  });
};

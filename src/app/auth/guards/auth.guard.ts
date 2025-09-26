import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ConsoleLogService } from '../../shared/services/console-log.service';

/**
 * Guardia de ruta para proteger las rutas que requieren autenticación.
 * Comprueba si el usuario está autenticado usando `AuthService`.
 * Si el usuario no está autenticado, lo redirige a la página de login.
 *
 * @param route La ruta activada.
 * @param state El estado del enrutador.
 * @returns Una promesa que resuelve a `true` si el usuario puede acceder a la ruta,
 * o un `UrlTree` para redirigir al usuario.
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(ConsoleLogService);


  return authService.isLoggedIn().then((isAuthenticated) => {
    if (isAuthenticated) {
      return true;
    } else {
      // Si el usuario no está autenticado, se redirige a la página de login.
      return router.createUrlTree(['/auth/login']);
    }
  }).catch((error) => {
    logger.error('Error checking authentication status:', error);
    return router.createUrlTree(['/auth/login']);
  });
};

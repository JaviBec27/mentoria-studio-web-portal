import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { AuthService } from '../../auth/services/auth.services';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const API_BASE_URL = environment.apiConfig.baseUrl;

  // Solo interceptamos las peticiones a nuestra propia API (rutas relativas que empiezan con /)
  // y excluimos las rutas de autenticación de Amplify que podrían ser externas.
  if (!req.url.startsWith(API_BASE_URL)) {
    return next(req);
  }

  return from(authService.getJwtToken()).pipe(
    switchMap(token => {
      // Si tenemos un token, clonamos la petición y añadimos la cabecera de autorización.
      if (token) {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedReq);
      }
      // Si no hay token, dejamos pasar la petición original sin modificar.
      return next(req);
    })
  );
};

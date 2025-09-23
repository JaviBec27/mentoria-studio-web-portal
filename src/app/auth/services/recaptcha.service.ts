import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

// Le decimos a TypeScript que el objeto 'grecaptcha' existirá en el scope global (window).
// Esto evita errores de compilación.
declare const grecaptcha: any;

@Injectable({
  providedIn: 'root'
})
export class RecaptchaService {

  constructor() { }

  /**
   * Ejecuta la verificación de reCAPTCHA v3 para una acción específica.
   * @param action El nombre de la acción (ej. 'login', 'signup').
   * @returns Una Promesa que resuelve con el token de reCAPTCHA.
   */
  public execute(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Usamos 'ready' para asegurarnos de que la API de reCAPTCHA está cargada.
      grecaptcha.ready(() => {
        grecaptcha.execute(environment.captchaConfig.siteKey, { action: action })
          .then((token: string) => {
            resolve(token);
          })
          .catch((error: any) => {
            console.error('reCAPTCHA execution error:', error);
            reject(error);
          });
      });
    });
  }
}

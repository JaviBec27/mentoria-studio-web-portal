import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";

/**
 * Servicio para registrar mensajes en la consola.
 * Solo registra mensajes cuando la aplicación no está en modo de producción.
 */
@Injectable({
  providedIn: 'root'
})
export class ConsoleLogService {

  /**
   * Un indicador que muestra si la aplicación se está ejecutando en modo de producción.
   */
  readonly IS_PRODUCTION: boolean = environment.production;

  /**
   * Registra un mensaje en la consola si no está en producción.
   * @param args Los argumentos a registrar.
   */
  log(...args: any[]): void {
    if (!this.IS_PRODUCTION)
      console.log('CustomLog:', ...args);
  }
  /**
   * Registra un mensaje de error en la consola si no está en producción.
   * @param args Los argumentos a registrar como error.
   */
  error(...args: any[]): void {
    if (!this.IS_PRODUCTION)
      console.error('CustomError:', ...args);
  }

  /**
   * Registra un mensaje de advertencia en la consola si no está en producción.
   * @param args Los argumentos a registrar como advertencia.
   */
  warning(...args: any[]): void {
    if (!this.IS_PRODUCTION)
      console.warn('CustomWarning:', ...args);
  }

}

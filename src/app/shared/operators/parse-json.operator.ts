import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConsoleLogService } from '../services/console-log.service';

/**
 * Operador de RxJS para parsear una cadena JSON que viene en un flujo de datos.
 * Si el dato no es una cadena, lo pasa sin modificar.
 * @template T El tipo de objeto esperado después de parsear el JSON.
 * @param logger Una instancia del servicio de logging para registrar errores.
 * @returns Una función de operador de RxJS.
 */
export function parseJsonString<T>(logger: ConsoleLogService) {
  return (source: Observable<any>): Observable<T> => {
    return source.pipe(
      map(data => {
        if (typeof data === 'string') {
          try {
            return JSON.parse(data) as T;
          } catch (e) {
            logger.error('Failed to parse JSON string:', e);
            // Handle the error as you see fit. Maybe return a default value or re-throw.
            // For now, we'll let it fail to the catchError block of the subscription.
            throw new Error('Invalid JSON string received from server.');
          }
        }
        return data as T;
      })
    );
  };
}

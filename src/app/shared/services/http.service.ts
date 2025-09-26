import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ConsoleLogService } from './console-log.service';

/**
 * Servicio genérico para realizar peticiones HTTP.
 * Envuelve el HttpClient de Angular para centralizar la lógica de peticiones
 * y el manejo de la URL base de la API.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient, private logger: ConsoleLogService) { }

  /**
   * URL base de la API, obtenida desde los archivos de entorno.
   */
  readonly API_BASE_URL = environment.apiConfig.baseUrl;

  /**
   * Realiza una petición HTTP GET.
   * @param url La ruta del endpoint (ej. '/users').
   * @returns Un Observable con la respuesta de la API.
   * @template T El tipo de dato esperado en la respuesta.
   */
  get<T = any>(url: string): Observable<T> {
    return this.httpClient.get<T>(`${this.API_BASE_URL}${url}`);
  }

  /**
   * Realiza una petición HTTP POST.
   * @param url La ruta del endpoint.
   * @param body El cuerpo de la petición.
   * @returns Un Observable con la respuesta de la API.
   * @template T El tipo de dato esperado en la respuesta.
   */
  post<T = any>(url: string, body: any): Observable<T> {
    return this.httpClient.post<T>(`${this.API_BASE_URL}${url}`, body);
  }

  /**
   * Maneja errores de peticiones HTTP.
   * Registra el error en la consola y devuelve un objeto de error genérico.
   * @param error El objeto de error capturado.
   * @returns Un objeto con una propiedad 'error'.
   */
  handleError(error: any): any {
    this.logger.error('HTTP Error:', error);
    return { error: 'An error occurred while processing the request.' };
    // Aquí puedes agregar lógica adicional para manejar errores, como mostrar notificaciones al usuario.
  }

}

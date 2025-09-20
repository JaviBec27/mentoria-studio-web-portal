import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private httpClient: HttpClient) { }

  readonly API_BASE_URL = environment.apiConfig.baseUrl;

  get<T = any>(url: string): Observable<T> {
    return this.httpClient.get<T>(`${this.API_BASE_URL}${url}`);
  }

  post<T = any>(url: string, body: any): Observable<T> {
    return this.httpClient.post<T>(`${this.API_BASE_URL}${url}`, body);
  }

  handleError(error: any): any {
    console.error('HTTP Error:', error);
    return { error: 'An error occurred while processing the request.' };
    // Aquí puedes agregar lógica adicional para manejar errores, como mostrar notificaciones al usuario.
  }

}

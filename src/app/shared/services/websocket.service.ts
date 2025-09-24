import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject = new Subject<any>();
  public messages$: Observable<any> = this.messagesSubject.asObservable();

  /**
   * Establece la conexión con el servidor WebSocket, incluyendo un token de autenticación.
   * @param accessToken El token de acceso para enviar como parámetro de consulta.
   * @returns Un observable que emite cuando la conexión es exitosa y se completa.
   */
  public connect(accessToken: string): Observable<void> {
    return new Observable((observer) => {
      if (!this.socket$ || this.socket$.closed) {

        // Construye la URL con el token como query parameter 'Authorization'
        const url = `${environment.wsConfig.url}?Authorization=${accessToken}`;

        this.socket$ = webSocket({
          url: url,
          openObserver: {
            next: () => {
              console.log('WebSocket: Conexión exitosa.');
            },
          },
          closeObserver: {
            next: () => {
              console.log('WebSocket: Conexión cerrada.');
            },
          },
        });

        this.socket$
          .pipe(
            tap({
              //error: (error) => console.error('WebSocket: Error en la conexión.', error),
            }),
            catchError((_) => EMPTY) // Evita que el observable principal de mensajes se cierre en caso de error
          )
          .subscribe((message) => {
            console.log('WebSocket: Mensaje recibido:', message);
            this.messagesSubject.next(message);
          });
      }
      observer.next();
      observer.complete();
    });
  }

  /**
   * Envía un mensaje al servidor WebSocket.
   * @param msg El mensaje a enviar.
   */
  public sendMessage(msg: any): void {
    if (this.socket$) {
      this.socket$.next(msg);
    } else {
      console.error('WebSocket no está conectado. No se puede enviar el mensaje.');
    }
  }

  /**
   * Cierra la conexión WebSocket.
   */
  public close(): void {
    if (this.socket$) {
      this.socket$.complete();
    }
  }
}

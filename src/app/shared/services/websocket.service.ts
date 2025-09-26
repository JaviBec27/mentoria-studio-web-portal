import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, Subject, EMPTY, Subscription, interval } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<any>;
  private messagesSubject = new Subject<any>();
  public messages$: Observable<any> = this.messagesSubject.asObservable();
  private heartbeatSubscription!: Subscription;

  /**
   * Establece la conexión con el servidor WebSocket, incluyendo un token de autenticación.
   * @param accessToken El token de acceso para enviar como parámetro de consulta.
   * @returns Un observable que emite cuando la conexión es exitosa y se completa.
   */
  public connect(accessToken: string): Observable<void> {
    return new Observable((observer) => {
      if (!this.socket$ || this.socket$.closed) {
        console.log('WebSocket: Intentando conectar...');

        // Construye la URL con el token como query parameter 'Authorization'
        const url = `${environment.wsConfig.url}?Authorization=${accessToken}`;

        this.socket$ = webSocket({
          url: url,
          openObserver: {
            next: () => {
              console.log('WebSocket: Conexión establecida exitosamente.');
              this.startHeartbeat();
            },
          },
          closeObserver: {
            next: () => {
              console.log('WebSocket: Conexión cerrada.');
              this.stopHeartbeat();
            },
          },
        });

        this.socket$
          .pipe(
            tap({
              error: (error) => console.error('WebSocket: Error en la conexión.', error),
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
      console.log('WebSocket: Enviando mensaje:', msg);
      this.socket$.next(msg);
    } else {
      console.error('WebSocket no está conectado. No se puede enviar el mensaje.');
    }
  }

  /**
   * Cierra la conexión WebSocket.
   */
  public close(): void {
    this.stopHeartbeat();
    if (this.socket$) {
      this.socket$.complete();
      // @ts-ignore
      this.socket$ = null;
    }
  }

  /**
   * Inicia el envío periódico de pings para mantener la conexión activa.
   */
  private startHeartbeat(): void {
    console.log('WebSocket: Iniciando heartbeat.');
    this.heartbeatSubscription = interval(environment.wsConfig.intervalKeepAlive).subscribe(() => {
      const pingPayload = { action: 'ping' };
      console.log('WebSocket: Enviando ping para mantener la conexión viva.', pingPayload);
      this.sendMessage(pingPayload);
    }, error => {
      if (!environment.production)
        console.error('WebSocket: Error en el heartbeat.', error);
    });
  }

  /**
   * Detiene el envío de pings.
   */
  private stopHeartbeat(): void {
    if (this.heartbeatSubscription) {
      console.log('WebSocket: Deteniendo heartbeat.');
      this.heartbeatSubscription.unsubscribe();
    }
  }
}

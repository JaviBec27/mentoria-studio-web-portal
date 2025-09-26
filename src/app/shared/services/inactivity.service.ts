import { Injectable, NgZone } from '@angular/core';
import { fromEvent, merge, Subject, Subscription, timer } from 'rxjs';
import { switchMap, throttleTime } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { ConsoleLogService } from '@SharedServices/console-log.service';

/**
 * Servicio para detectar la inactividad del usuario y gestionar el cierre de sesión automático.
 *
 * Emite eventos para:
 * - Mostrar un diálogo de advertencia antes de cerrar la sesión.
 * - Cerrar la sesión del usuario después de un período de inactividad.
 */
@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  /** Tiempo total de inactividad en milisegundos antes de iniciar el proceso de cierre de sesión. */
  private readonly INACTIVITY_TIMEOUT_MS = environment.inactivityServiceConfig.inactivity_service_timeout_value * 60 * 1000; // inactivity_service_timeout_value  minutos
  /** Duración en segundos del diálogo de advertencia antes del cierre de sesión automático. */
  private readonly WARNING_DIALOG_TIMEOUT_S = environment.inactivityServiceConfig.warning_dialog_timeout_value; // warning_dialog_timeout_value segundos

  /** Suscripción a los eventos de actividad del usuario (ratón, teclado). */
  private activityEvents$: Subscription;
  /** Suscripción al temporizador principal de inactividad. */
  private timer$: Subscription;

  /** Subject que emite un evento cada vez que se detecta actividad del usuario. */
  public userIsActive = new Subject<void>();
  /** Subject que emite para mostrar el diálogo de advertencia. El valor emitido es el tiempo restante en segundos. Emite 0 para ocultarlo. */
  public showWarning = new Subject<number>();
  /** Subject que emite para indicar que se debe cerrar la sesión del usuario. */
  public logout = new Subject<void>();

  constructor(private ngZone: NgZone, private logger: ConsoleLogService) {
    this.activityEvents$ = this.setupActivityListener();
    this.timer$ = this.setupTimer();
  }

  /**
   * Configura los listeners de eventos de actividad del usuario (movimiento del ratón, teclado, scroll).
   * Utiliza throttleTime para limitar la frecuencia con la que se procesan estos eventos.
   * @returns Una suscripción a los eventos de actividad.
   */
  private setupActivityListener(): Subscription {
    return merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'scroll')
    )
      .pipe(throttleTime(environment.inactivityServiceConfig.check_activity_interval)) // Limita la frecuencia de reseteo
      .subscribe(() => this.userIsActive.next());
  }

  /**
   * Configura el temporizador principal que reacciona a la actividad del usuario.
   * Cuando el temporizador de inactividad expira, muestra una advertencia y comienza una cuenta atrás.
   * Si la cuenta atrás finaliza, emite un evento de logout.
   * @returns La suscripción al temporizador.
   */
  private setupTimer(): Subscription {
    return this.userIsActive
      .pipe(
        switchMap(() => {
          this.showWarning.next(0); // Oculta la advertencia al detectar actividad
          return timer(
            this.INACTIVITY_TIMEOUT_MS - this.WARNING_DIALOG_TIMEOUT_S * 1000

          );
        })
      )
      .subscribe(() => {
        this.ngZone.run(() => {
          this.showWarning.next(this.WARNING_DIALOG_TIMEOUT_S);
          const countdown$ = timer(0, 1000).subscribe((val) => {
            const remaining = this.WARNING_DIALOG_TIMEOUT_S - val;
            this.logger.log('Tiempo restante antes del cierre de sesión:', remaining);
            this.showWarning.next(remaining);
            if (remaining <= 0) {
              countdown$.unsubscribe();
              this.logout.next();
            }
          });

          // Si el usuario vuelve a estar activo, cancela la cuenta atrás.
          const activitySub = this.userIsActive.subscribe(() => {
            countdown$.unsubscribe();
            activitySub.unsubscribe();
          });
        });
      });
  }

  /**
   * Inicia el monitoreo de inactividad.
   * Debe llamarse cuando el usuario inicia sesión o la aplicación se carga.
   */
  public startMonitoring() {
    this.userIsActive.next(); // Inicia el temporizador la primera vez
  }

  /**
   * Detiene el monitoreo de inactividad y limpia las suscripciones.
   * Debe llamarse cuando el usuario cierra sesión manualmente.
   */
  public stopMonitoring() {
    this.activityEvents$?.unsubscribe();
    this.timer$?.unsubscribe();
    this.showWarning.next(0);
  }
}

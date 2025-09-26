import { Injectable, NgZone } from '@angular/core';
import { fromEvent, merge, Subject, Subscription, timer } from 'rxjs';
import { switchMap, throttleTime } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InactivityService {
  private readonly INACTIVITY_TIMEOUT_MS = environment.inactivityServiceConfig.inactivity_service_timeout_value * 60 * 1000; // inactivity_service_timeout_value  minutos
  private readonly WARNING_DIALOG_TIMEOUT_S = environment.inactivityServiceConfig.warning_dialog_timeout_value; // warning_dialog_timeout_value segundos

  private activityEvents$: Subscription;
  private timer$: Subscription;

  public userIsActive = new Subject<void>();
  public showWarning = new Subject<number>();
  public logout = new Subject<void>();

  constructor(private ngZone: NgZone) {
    this.activityEvents$ = this.setupActivityListener();
    this.timer$ = this.setupTimer();
  }

  private setupActivityListener(): Subscription {
    return merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'scroll')
    )
      .pipe(throttleTime(environment.inactivityServiceConfig.check_activity_interval)) // Limita la frecuencia de reseteo
      .subscribe(() => this.userIsActive.next());
  }

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
            console.log('Tiempo restante antes del cierre de sesión:', remaining);
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

  public startMonitoring() {
    this.userIsActive.next(); // Inicia el temporizador la primera vez
  }

  public stopMonitoring() {
    this.activityEvents$?.unsubscribe();
    this.timer$?.unsubscribe();
    this.showWarning.next(0);
  }
}

import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InactivityService } from '@SharedServices/inactivity.service';
import { AuthService } from '@AuthServices/auth.service';
import { Subscription, timer } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { environment } from '@environments/environment';
import { ConsoleLogService } from '@SharedServices/console-log.service';

/**
 * Componente de la cabecera de la aplicación.
 * Gestiona la visualización del estado de autenticación, el diálogo de inactividad
 * y proporciona la acción de cierre de sesión.
 */
@Component({
  selector: 'app-header',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  standalone: true,
})
export class AppHeader implements OnInit, OnDestroy {

  /** Controla la visibilidad del diálogo de advertencia de inactividad. */
  showWarningDialog = false;
  /** Tiempo restante en segundos para la cuenta atrás del cierre de sesión por inactividad. */
  countdown = 0;
  /** Agrupa todas las suscripciones de RxJS para facilitar su limpieza. */
  private subscriptions = new Subscription();

  /**
   * @param inactivityService Servicio para monitorear la inactividad del usuario.
   * @param authService Servicio para gestionar la autenticación.
   * @param logger Servicio para registrar mensajes en la consola.
   */
  constructor(
    private inactivityService: InactivityService,
    public authService: AuthService,
    private logger: ConsoleLogService
  ) { }

  /**
   * Hook del ciclo de vida de Angular. Se ejecuta al inicializar el componente.
   * Inicia el monitoreo de inactividad y se suscribe a los eventos del servicio de inactividad.
   * También inicia un contador de segundos para depuración si está habilitado.
   */
  ngOnInit(): void {
    this.inactivityService.startMonitoring();

    this.subscriptions.add(
      this.inactivityService.showWarning.subscribe((countdown) => {
        this.showWarningDialog = countdown > 0;
        this.countdown = countdown;
      })
    );

    this.subscriptions.add(
      this.inactivityService.logout.subscribe(() => {
        this.showWarningDialog = false;
        this.authService.logout(); // Asumiendo que authService tiene un método logout
      })
    );

    if (environment.showSecondCounter && !environment.production)
      this.startCounter();
  }

  /**
   * Hook del ciclo de vida de Angular. Se ejecuta al destruir el componente.
   * Detiene el monitoreo de inactividad y limpia todas las suscripciones.
   */
  ngOnDestroy(): void {
    this.inactivityService.stopMonitoring();
    this.subscriptions.unsubscribe();
  }

  /**
   * Notifica al servicio de inactividad que el usuario sigue activo.
   * Se llama desde el diálogo de advertencia para evitar el cierre de sesión.
   */
  stayActive(): void {
    this.inactivityService.userIsActive.next();
  }

  /** Signal utilizado para el contador de depuración. */
  counterSignal = signal(0);

  /**
   * Incrementa el valor del `counterSignal`.
   * Utilizado por el contador de depuración.
   */
  increment() {
    this.counterSignal.update(n => n + 1);
    this.logger.log('Contador incrementado:', this.counterSignal());
  }

  /**
   * Inicia un contador de segundos que se registra en la consola.
   * Esta función es solo para fines de depuración y se controla mediante variables de entorno.
   */
  startCounter(): void {
    const counterSubscription = timer(0, 1000).subscribe(() => {
      this.increment();
    });
    this.subscriptions.add(counterSubscription);
  }

}

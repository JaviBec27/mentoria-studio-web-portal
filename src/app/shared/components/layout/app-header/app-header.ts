import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InactivityService } from '../../../services/inactivity.service';
import { AuthService } from '../../../../auth/services/auth.services';
import { Subscription, timer } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-header',
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  standalone: true,
})
export class AppHeader implements OnInit, OnDestroy {
  title = 'Mi Aplicación'; // Cambia esto por el título de tu aplicación

  showWarningDialog = false;
  countdown = 0;
  private subscriptions = new Subscription();

  constructor(
    private inactivityService: InactivityService,
    public authService: AuthService
  ) { }

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

  ngOnDestroy(): void {
    this.inactivityService.stopMonitoring();
    this.subscriptions.unsubscribe();
  }

  stayActive(): void {
    this.inactivityService.userIsActive.next();
  }

  counterSignal = signal(0);

  increment() {
    this.counterSignal.update(n => n + 1);
    console.log('Contador incrementado:', this.counterSignal());
  }

  startCounter(): void {
    const counterSubscription = timer(0, 1000).subscribe(() => {
      this.increment();
    });
    this.subscriptions.add(counterSubscription);
  }

}

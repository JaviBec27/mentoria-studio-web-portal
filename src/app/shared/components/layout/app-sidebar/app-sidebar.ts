import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth.service';
import { ConsoleLogService } from '../../../services/console-log.service';

/**
 * Componente de la barra lateral de la aplicación.
 * Proporciona la navegación principal y la opción de cerrar sesión.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterModule],
  templateUrl: './app-sidebar.html',
  styleUrl: './app-sidebar.scss',
  standalone: true,
})
export class AppSidebar {
  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(ConsoleLogService);

  /**
   * Cierra la sesión del usuario y lo redirige a la página de login.
   * Maneja cualquier error que pueda ocurrir durante el proceso de cierre de sesión.
   */
  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      this.logger.error('Failed to logout:', error);
    }
  }
}

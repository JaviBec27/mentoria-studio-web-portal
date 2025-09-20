import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../auth/services/auth.services';

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

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }
}

import { Component } from '@angular/core';
import { AppHeader } from '../app-header/app-header';
import { AppSidebar } from '../app-sidebar/app-sidebar';

@Component({
  selector: 'app-layout',
  imports: [AppHeader, AppSidebar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
  standalone: true,
})
export class AppLayout {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ... otros imports

// Importaciones de PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// ... tus componentes como HeaderComponent

@NgModule({
  declarations: [
    // ... HeaderComponent, etc.
  ],
  imports: [
    CommonModule,
    // ... otros módulos
    DialogModule, // <-- Añadir aquí
    ButtonModule, // <-- Añadir aquí
  ],
  exports: [
    // ... HeaderComponent, etc.
    DialogModule, // <-- Y exportar aquí
    ButtonModule, // <-- Y exportar aquí
  ]
})
export class SharedModule { }

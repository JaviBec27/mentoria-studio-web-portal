
// reemplazar-saltos.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';
// 👇 1. Importa DomSanitizer y SafeHtml desde platform-browser
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'newlineformat',
  standalone: true,
})
export class NewlineformatPipe implements PipeTransform {
  // 2. Inyecta el servicio DomSanitizer en el constructor
  constructor(private sanitizer: DomSanitizer) { }

  // 3. Asegúrate de que el método devuelva el tipo 'SafeHtml'
  transform(value: string): SafeHtml {
    if (!value) {
      return ''; // Devuelve un string vacío si no hay valor
    }
    // 4. Reemplaza los saltos de línea como antes
    const htmlConSaltos = value.replace(/\n/g, '<br/>');

    // 5. Usa el sanitizador para marcar el HTML como seguro
    return this.sanitizer.bypassSecurityTrustHtml(htmlConSaltos);
  }
}

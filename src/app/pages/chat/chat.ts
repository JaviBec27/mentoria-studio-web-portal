import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AppLayout } from '../../shared/components/layout/app-layout/app-layout';

interface Message {
  text: string;
  type: 'sent' | 'received';
}

@Component({
  selector: 'app-chat',
  imports: [AppLayout, ReactiveFormsModule, CommonModule],
  templateUrl: './chat.html',
  styleUrl: './chat.scss',
  standalone: true,
})
export class Chat {
  messages = signal<Message[]>([
    { text: 'Hola, ¿en qué puedo ayudarte hoy?', type: 'received' },
  ]);

  messageControl = new FormControl('');

  sendMessage() {
    const message = this.messageControl.value;
    if (message) {
      this.messages.update((messages) => [...messages, { text: message, type: 'sent' }]);
      this.messageControl.setValue('');

      setTimeout(() => {
        this.messages.update((messages) => [
          ...messages,
          { text: 'no tengo respuestas aún.', type: 'received' },
        ]);
      }, 1000);
    }
  }
}

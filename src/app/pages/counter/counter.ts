import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-counter',
  imports: [],
  templateUrl: './counter.html',
  styleUrl: './counter.scss'
})
export class Counter {
  count = 0;
  counterSignal = signal(0);

  increment() {
    this.count++;
    this.counterSignal.update(n => n + 1);
  }


  decrement() {
    this.count--;
    this.counterSignal.update(n => n - 1);
  }

}

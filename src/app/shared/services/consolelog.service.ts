import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class ConsoleLogService {

  readonly IS_PRODUCTION: boolean = false;

  constructor() {
    this.IS_PRODUCTION = environment.production;
  }

  log(message: string): void {
    if (!this.IS_PRODUCTION)
      console.log('ConsoleLogService:', message);
  }
  error(message: string): void {
    if (!this.IS_PRODUCTION)
      console.error('ConsoleLogService Error:', message);
  }
}

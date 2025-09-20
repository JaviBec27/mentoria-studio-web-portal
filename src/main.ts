import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { environment } from './environments/environment';
import { Amplify } from 'aws-amplify';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

Amplify.configure(environment.awsAuthConfig);

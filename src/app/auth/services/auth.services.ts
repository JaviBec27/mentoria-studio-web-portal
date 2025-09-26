import { Injectable, signal } from "@angular/core";
import { v4 as uuidv4 } from 'uuid';
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  fetchAuthSession,
  resendSignUpCode,
} from '@aws-amplify/auth';
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Convertimos el estado de autenticación en un Signal para reactividad.
  isAuthenticated = signal(false);


  constructor(private router: Router) {
    // Comprobamos el estado de autenticación al iniciar el servicio.
    this.isLoggedIn();
  }

  getSessionId() {
    return localStorage.getItem('sess_id') || '';
  }

  setSessionId(): void {
    localStorage.setItem('sess_id', uuidv4());
  }

  removeSessionId(): void {
    localStorage.removeItem('sess_id');
  }

  async register(email: string, password: string) {
    try {
      const signUpResult = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email
          }
        }
      });
      return signUpResult;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error; // Lanzamos el error para que el componente lo maneje.
    }
  }

  async confirmSignUp(username: string, confirmationCode: string) {
    try {
      const confirmResult = await confirmSignUp({ username, confirmationCode });
      return confirmResult;
    } catch (error) {
      console.error('Error confirming registration:', error);
      throw error;
    }
  }

  async resendSignUpCode(username: string) {
    try {
      await resendSignUpCode({ username });
    } catch (error) {
      console.error('Error resending confirmation code:', error);
      throw error;
    }
  }

  async login(email: string, password: string) {
    try {
      const user = await signIn({ username: email, password });
      this.isAuthenticated.set(true); // Actualizamos el signal.
      this.setSessionId();
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      this.isAuthenticated.set(false);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut();
      this.isAuthenticated.set(false); // Actualizamos el signal.
      this.removeSessionId();// Eliminamos el sessionId al cerrar sesión.
      this.router.navigate(['/login']); // Redirigimos al login.
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      const session = await fetchAuthSession();
      const isAuthenticated = session.tokens !== undefined;
      // Si no hay sessionId, generamos uno nuevo.
      if (!this.getSessionId()) {
        this.setSessionId();
      }
      this.isAuthenticated.set(isAuthenticated); // Actualizamos el signal.
      return isAuthenticated;
    } catch (error) {
      console.error('Error fetching auth session:', error);
      this.isAuthenticated.set(false);
      return false;
    }
  }


  async getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      // El accessToken es el que se debe usar para autorizar peticiones a la API.
      const token = session.tokens?.accessToken.toString();
      return token ?? null;
    } catch {
      // Si no hay sesión, no hay token.
      return null;
    }
  }

  async getSession() {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      console.error('Error fetching auth session:', error);
      throw error;
    }
  }
}



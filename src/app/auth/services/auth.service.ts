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
import { ConsoleLogService } from '@SharedServices/console-log.service';

/**
 * Servicio para gestionar la autenticación de usuarios con AWS Amplify.
 * Proporciona métodos para registrar, confirmar, iniciar sesión, cerrar sesión y
 * gestionar la sesión del usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /**
   * Signal que indica si el usuario está autenticado.
   * Es reactivo y se puede usar en las plantillas para mostrar/ocultar elementos.
   */
  isAuthenticated = signal(false);


  constructor(private router: Router, private logger: ConsoleLogService) {
    // Comprobamos el estado de autenticación al iniciar el servicio.
    this.isLoggedIn();
  }

  /**
   * Obtiene el ID de sesión del almacenamiento local.
   * @returns El ID de sesión o una cadena vacía si no existe.
   */
  getSessionId() {
    return localStorage.getItem('sess_id') || '';
  }

  /**
   * Genera y guarda un nuevo ID de sesión en el almacenamiento local.
   */
  setSessionId(): void {
    localStorage.setItem('sess_id', uuidv4());
  }

  /**
   * Elimina el ID de sesión del almacenamiento local.
   */
  removeSessionId(): void {
    localStorage.removeItem('sess_id');
  }

  /**
   * Registra un nuevo usuario.
   * @param email El correo electrónico del usuario.
   * @param password La contraseña del usuario.
   * @returns El resultado del proceso de registro de Amplify.
   */
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
      this.logger.error('Error registering user:', error);
      throw error; // Lanzamos el error para que el componente lo maneje.
    }
  }

  /**
   * Confirma el registro de un usuario con un código de confirmación.
   * @param username El nombre de usuario (email).
   * @param confirmationCode El código de confirmación enviado al usuario.
   * @returns El resultado de la confirmación de Amplify.
   */
  async confirmSignUp(username: string, confirmationCode: string) {
    try {
      const confirmResult = await confirmSignUp({ username, confirmationCode });
      return confirmResult;
    } catch (error) {
      this.logger.error('Error confirming registration:', error);
      throw error;
    }
  }

  /**
   * Reenvía el código de confirmación de registro a un usuario.
   * @param username El nombre de usuario (email) al que se reenviará el código.
   */
  async resendSignUpCode(username: string) {
    try {
      await resendSignUpCode({ username });
    } catch (error) {
      this.logger.error('Error resending confirmation code:', error);
      throw error;
    }
  }

  /**
   * Inicia sesión de un usuario.
   * @param email El correo electrónico del usuario.
   * @param password La contraseña del usuario.
   * @returns El objeto de usuario de Amplify si el inicio de sesión es exitoso.
   */
  async login(email: string, password: string) {
    try {
      const user = await signIn({ username: email, password });
      this.isAuthenticated.set(true); // Actualizamos el signal.
      this.setSessionId();
      return user;
    } catch (error) {
      this.logger.error('Error logging in:', error);
      this.isAuthenticated.set(false);
      throw error;
    }
  }

  /**
   * Cierra la sesión del usuario actual.
   * Limpia el estado de autenticación y redirige a la página de login.
   */
  async logout(): Promise<void> {
    try {
      await signOut();
      this.isAuthenticated.set(false); // Actualizamos el signal.
      this.removeSessionId();// Eliminamos el sessionId al cerrar sesión.
      this.router.navigate(['/login']); // Redirigimos al login.
    } catch (error) {
      this.logger.error('Error logging out:', error);
      throw error;
    }
  }

  /**
   * Comprueba si el usuario tiene una sesión activa.
   * Actualiza el estado de autenticación.
   * @returns `true` si el usuario está autenticado, `false` en caso contrario.
   */
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
      this.logger.error('Error fetching auth session:', error);
      this.isAuthenticated.set(false);
      return false;
    }
  }


  /**
   * Obtiene el token de acceso JWT de la sesión actual.
   * Este token se debe usar para autorizar peticiones a la API.
   * @returns El token de acceso como una cadena, o `null` si no hay sesión.
   */
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

  /**
   * Obtiene el objeto de sesión completo de Amplify.
   * @returns El objeto de sesión de Amplify.
   */
  async getSession() {
    try {
      const session = await fetchAuthSession();
      return session;
    } catch (error) {
      this.logger.error('Error fetching auth session:', error);
      throw error;
    }
  }
}



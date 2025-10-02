# MentorIA Studio - Web Portal (MVP)

Este proyecto es un portal web MVP (Producto Mínimo Viable) desarrollado en Angular. Su principal funcionalidad es una interfaz de chat en tiempo real que se comunica con un backend a través de WebSockets, utilizando AWS Cognito para la autenticación de usuarios.

## ✨ Capacidades del MVP

- **Autenticación de Usuarios**: Integración completa con AWS Cognito para el registro e inicio de sesión de usuarios.
- **Chat en Tiempo Real**: Interfaz de chat que permite a los usuarios enviar mensajes y recibir respuestas del backend instantáneamente.
- **Comunicación por WebSockets**: Uso de WebSockets para una comunicación bidireccional eficiente entre el cliente y el servidor.
- **Conexión Segura**: El token de acceso del usuario (JWT) se envía al establecer la conexión WebSocket para autorizar la sesión en el backend (API Gateway).
- **Manejo de Sesión**: Persistencia de la sesión del usuario para mantener el contexto de la conversación.

---

## 🚀 Puesta en Marcha

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión 18.x o superior)
- [Angular CLI](https://angular.io/cli) (versión 17.x o superior)

### Instalación

1. Clona el repositorio en tu máquina local.
2. Navega a la carpeta raíz del proyecto.
3. Instala las dependencias necesarias con npm:

   ```bash
   npm install
   ```

### Configuración del Entorno

El proyecto utiliza archivos de entorno para gestionar las configuraciones específicas para desarrollo y producción. Debes configurar el archivo `src/environments/environment.ts`.

Copia el contenido de `src/environments/environment.prod.ts` a `src/environments/environment.ts` y ajústalo para tu entorno de desarrollo si es necesario.

A continuación se detalla cada sección de la configuración:

```typescript
// src/environments/environment.ts

export const environment = {
  production: false, // Cambiar a `true` para producción

  /**
   * Configuración de Google reCAPTCHA v2.
   */
  captchaConfig: {
    siteKey: 'TU_SITE_KEY_DE_RECAPTCHA',
  },

  /**
   * Configuración de la API REST principal (para autenticación, etc.).
   */
  apiConfig: {
    baseUrl: 'URL_DE_TU_API_GATEWAY_HTTP'
  },

  /**
   * Configuración del endpoint de WebSocket.
   */
  wsConfig: {
    url: 'URL_DE_TU_API_GATEWAY_WEBSOCKET', // Ejemplo: wss://xxxx.execute-api.us-east-1.amazonaws.com/prod
  },

  /**
   * Configuración de AWS Cognito para la autenticación de usuarios.
   */
  awsAuthConfig: {
    aws_project_region: 'REGION_DE_AWS', // ej: 'us-east-1'
    aws_cognito_region: 'REGION_DE_COGNITO', // ej: 'us-east-1'
    aws_user_pools_id: 'ID_DEL_USER_POOL', // ej: 'us-east-1_xxxxxxxxx'
    aws_user_pools_web_client_id: 'ID_DEL_CLIENTE_WEB_DEL_USER_POOL',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
};
```

### Ejecución

1. **Servidor de Desarrollo**: Para iniciar la aplicación en modo de desarrollo, ejecuta:

   ```bash
   ng serve
   ```

   Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias alguno de los archivos fuente.

2. **Compilación para Producción**: Para compilar el proyecto para producción, ejecuta:

   ```bash
   ng build
   ```

   O de forma explícita:

   ```bash
   ng build --configuration production
   ```

   Los archivos compilados se almacenarán en el directorio `dist/`.

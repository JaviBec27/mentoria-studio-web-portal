export const environment = {
  production: false,
  showSecondCounter: true,
  captchaConfig: {
    siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Clave de sitio de prueba de reCAPTCHA v3
  },
  apiConfig: {
    baseUrl: 'https://mnopiru.execute-api.us-east-1.amazonaws.com/dev'
  },
  wsConfig: {
    url: 'wss://example-websocket-endpoint.amazonaws.com/dev', // Reemplaza con tu endpoint de WebSocket
    region: 'us-east-1',
    intervalKeepAlive: 30000 // Intervalo para enviar mensajes de keep-alive (en ms)
  },
  awsAuthConfig: {
    aws_project_region: 'us-east-1',
    aws_cognito_region: 'us-east-1',
    aws_user_pools_id: 'us-east-1_45dfrtghj',
    aws_user_pools_web_client_id: '809tuf3n5exampleid123456',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
  inactivityServiceConfig: {
    inactivity_service_timeout_value: 2, // en minutos, tiempo de inactividad antes de mostrar el diálogo de advertencia
    warning_dialog_timeout_value: 20, // en segundos, tiempo para mostrar el diálogo de advertencia antes del cierre de sesión
    check_activity_interval: 1000 // en milisegundos, tiempo para verificar la actividad del usuario
  }
};


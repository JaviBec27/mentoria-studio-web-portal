export const environment = {
  production: true,
  captchaConfig: {
    siteKey: '6LcaBdIrAAAAANHzk9AnBhdrS1msXczdF3UPDC5n', // Clave de sitio de prueba de reCAPTCHA v3
  },
  apiConfig: {
    baseUrl: 'https://m1pk71j2d6.execute-api.us-east-1.amazonaws.com/dev'
  },
  wsConfig: {
    url: 'wss://b6k7eyghrh.execute-api.us-east-1.amazonaws.com/dev', // Reemplaza con tu endpoint de WebSocket
  },
  awsAuthConfig: {
    aws_project_region: 'us-east-1',
    aws_cognito_region: 'us-east-1',
    aws_user_pools_id: 'us-east-1_19pXhcTel',
    aws_user_pools_web_client_id: '6a9kla0j038jng3fr7vfr80i6f',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
};

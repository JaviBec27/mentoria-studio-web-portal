export const environment = {
  production: false,
  captchaConfig: {
    siteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI', // Clave de sitio de prueba de reCAPTCHA v3
  },
  apiConfig: {
    baseUrl: 'https://mnopiru.execute-api.us-east-1.amazonaws.com/dev'
  },
  awsAuthConfig: {
    aws_project_region: 'us-east-1',
    aws_cognito_region: 'us-east-1',
    aws_user_pools_id: 'us-east-1_45dfrtghj',
    aws_user_pools_web_client_id: '809tuf3n5exampleid123456',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
  },
};


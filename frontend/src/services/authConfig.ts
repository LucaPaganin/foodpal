// Authentication configuration
export const authConfig = {
  authority: process.env.REACT_APP_AUTH_AUTHORITY || 'https://foodpalauth.b2clogin.com/foodpalauth.onmicrosoft.com/B2C_1_signupsignin/v2.0',
  client_id: process.env.REACT_APP_AUTH_CLIENT_ID || '11111111-1111-1111-1111-111111111111',
  redirect_uri: process.env.REACT_APP_AUTH_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  post_logout_redirect_uri: process.env.REACT_APP_AUTH_POST_LOGOUT_REDIRECT_URI || window.location.origin,
  response_type: 'code',
  scope: process.env.REACT_APP_AUTH_SCOPE || 'openid profile email',
  automaticSilentRenew: true,
  loadUserInfo: true,
  
  // PKCE Configuration
  usePKCE: true, // Enable PKCE for more secure authorization
  
  // Additional optional configuration
  extraQueryParams: {
    prompt: 'login' // Force login screen to always appear
  },
  
  // Google auth configuration through federated identity
  // These are automatically picked up by Azure B2C if configured correctly
  // No additional config needed here for Google auth as it's handled by B2C
  
  // Metadata configuration
  metadata: {
    issuer: `https://foodpalauth.b2clogin.com/foodpalauth.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_signupsignin`,
    authorization_endpoint: `https://foodpalauth.b2clogin.com/foodpalauth.onmicrosoft.com/oauth2/v2.0/authorize?p=B2C_1_signupsignin`,
    token_endpoint: `https://foodpalauth.b2clogin.com/foodpalauth.onmicrosoft.com/oauth2/v2.0/token?p=B2C_1_signupsignin`,
    jwks_uri: `https://foodpalauth.b2clogin.com/foodpalauth.onmicrosoft.com/discovery/v2.0/keys?p=B2C_1_signupsignin`,
    end_session_endpoint: `https://foodpalauth.b2clogin.com/foodpalauth.onmicrosoft.com/oauth2/v2.0/logout?p=B2C_1_signupsignin`
  }
};

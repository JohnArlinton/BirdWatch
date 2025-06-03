import { WebStorageStateStore } from 'oidc-client-ts';

export const oidcConfig = {
  authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_cXP5BCfnh',
  client_id: '1891fth9eq6mfem6tiu3o2g48',
  redirect_uri: 'http://localhost:3000',
  post_logout_redirect_uri: 'http://localhost:3000',
  onSigninCallback: (): void => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  scope: 'openid profile email',
  response_type: 'code',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
  loadUserInfo: true,
};

export const hasRole = (user: any, role: string): boolean => {
  if (!user || !user.profile) return false;
  const roles = user.profile['cognito:groups'] || [];
  return roles.includes(role);
};
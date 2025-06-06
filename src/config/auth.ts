import { WebStorageStateStore } from 'oidc-client-ts';

export const oidcConfig = {
  authority: 'https://cognito-idp.ap-southeast-2.amazonaws.com/ap-southeast-2_KnlxE7kI4',
  client_id: '73o1d36ie045el2skapvd2f0u9',
  redirect_uri: 'http://localhost:3000/',
  post_logout_redirect_uri: 'http://localhost:3000/',
  onSigninCallback: (): void => {
    window.history.replaceState({}, document.title, window.location.pathname);
  },
  scope: 'openid profile email',
  response_type: 'code',
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  // Disable features that might cause CORS issues with direct API calls
  automaticSilentRenew: false,
  loadUserInfo: false,
  // Prevent metadata requests that might trigger CORS
  metadataUrl: undefined,
  // Use manual token management to avoid background requests
  monitorSession: false,
};

export const hasRole = (user: any, role: string): boolean => {
  if (!user || !user.profile) return false;
  const roles = user.profile['cognito:groups'] || [];
  return roles.includes(role);
};
import { makeRedirectUri } from 'expo-auth-session';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getDeepLinkUrl = (path: string) => {
  const redirectUrl = makeRedirectUri({
    scheme: 'fitnesstracker',
    path,
    preferLocalhost: false,
  });

  if (Platform.OS !== 'android' || Constants.isDevice || !redirectUrl.startsWith('exp://')) {
    return redirectUrl;
  }

  return redirectUrl.replace(/exp:\/\/([^/]+)/, (match, host) => {
    const port = host.includes(':') ? host.split(':')[1] : '8081';
    return `exp://127.0.0.1:${port}`;
  });
};

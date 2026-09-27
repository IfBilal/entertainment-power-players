import { useEffect, useRef } from 'react';
import { Alert, Linking } from 'react-native';
import { completeAuthRedirect, isAuthCallbackUrl } from '../../services/supabase/authRedirect';
import { openResetPasswordFromAuthLink } from '../../navigation/rootNavigation';

/** Listens for Supabase email links when the app is opened or already running. */
export function AuthDeepLinkHandler() {
  const handledUrls = useRef(new Set<string>());

  useEffect(() => {
    async function handle(url: string) {
      if (!isAuthCallbackUrl(url) || handledUrls.current.has(url)) return;
      handledUrls.current.add(url);

      try {
        const { kind } = await completeAuthRedirect(url);
        if (kind === 'recovery') {
          openResetPasswordFromAuthLink();
        } else if (kind === 'email-change') {
          Alert.alert(
            'Email confirmation received',
            'Your email change is being confirmed. If Supabase sent a link to both email addresses, open both links on this device.',
          );
        } else if (kind === 'signup') {
          Alert.alert('Email confirmed', 'Your account is confirmed. Continue in the app to finish setting up your profile.');
        } else {
          Alert.alert('Email confirmed', 'Your confirmation is complete. You can continue in the app.');
        }
      } catch (error) {
        Alert.alert(
          'Could not complete that link',
          error instanceof Error ? error.message : 'The link may have expired. Request a new email and try again.',
        );
      }
    }

    Linking.getInitialURL()
      .then((url) => {
        if (url) void handle(url);
      })
      .catch(() => undefined);
    const subscription = Linking.addEventListener('url', ({ url }) => void handle(url));
    return () => subscription.remove();
  }, []);

  return null;
}

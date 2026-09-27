import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const rootNavigationRef = createNavigationContainerRef<RootStackParamList>();

let resetPasswordPending = false;

export function openResetPasswordFromAuthLink() {
  if (rootNavigationRef.isReady()) {
    rootNavigationRef.navigate('ResetPassword');
  } else {
    resetPasswordPending = true;
  }
}

export function flushPendingAuthNavigation() {
  if (!resetPasswordPending || !rootNavigationRef.isReady()) return;
  resetPasswordPending = false;
  rootNavigationRef.navigate('ResetPassword');
}

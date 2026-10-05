import { fireEvent, screen } from '@testing-library/react-native';
import { LoginScreen } from '../features/onboarding/LoginScreen';
import { SignUpScreen } from '../features/onboarding/SignUpScreen';
import { renderWithProviders } from '../testing/renderWithProviders';

describe('Apple sign-in placeholder', () => {
  it('does not misroute from login to signup', async () => {
    const navigate = jest.fn();
    await renderWithProviders(<LoginScreen navigation={{ navigate } as never} route={{ key: 'login', name: 'Login' }} />);
    fireEvent.press(screen.getByText('Continue with Apple'));
    expect(await screen.findByText('Apple sign-in isn’t available yet. Use Google or email.')).toBeTruthy();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('explains the unavailable action on signup', async () => {
    await renderWithProviders(<SignUpScreen navigation={{ navigate: jest.fn() } as never} route={{ key: 'signup', name: 'SignUp' }} />);
    fireEvent.press(screen.getByText('Continue with Apple'));
    expect(await screen.findByText('Apple sign-in isn’t available yet. Use Google or email.')).toBeTruthy();
  });
});

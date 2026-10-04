import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { IntroSlidesScreen } from '../features/onboarding/IntroSlidesScreen';
import { renderWithProviders } from '../testing/renderWithProviders';

it('gives the progress illustration an explicit full-width native container', async () => {
  await renderWithProviders(<IntroSlidesScreen navigation={{ navigate: jest.fn() } as never} route={{ key: 'intro', name: 'IntroSlides' }} />);
  fireEvent.press(screen.getByText('Next'));

  const preview = await waitFor(() => screen.getByLabelText('Progress preview'));
  expect(StyleSheet.flatten(preview.props.style).width).toBe('100%');
});

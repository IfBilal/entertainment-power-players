import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { MainTabNavigator } from '../navigation/MainTabNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { createActivity } from '../services/supabase/activity';

const mockActivityRows: Array<{ id: string; type: 'contact' | 'event' | 'followUp'; title: string; date: string; weekKey: string }> = [];

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [{ slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 }]),
  fetchCategoryCounts: jest.fn(async () => ({ fashion: 1 })),
  fetchContactsByCategory: jest.fn(async () => []),
  fetchFavoriteContactIds: jest.fn(async () => []),
}));

jest.mock('../services/supabase/activity', () => ({
  activityQueryKey: (userId: string | null) => ['activity', userId],
  fetchUserActivity: jest.fn(async () => [...mockActivityRows]),
  createActivity: jest.fn(async ({ type, title, date, weekKey }: { type: 'contact' | 'event' | 'followUp'; title: string; date: Date; weekKey: string }) => {
    const entry = { id: `activity-${mockActivityRows.length + 1}`, type, title, date: date.toISOString(), weekKey };
    mockActivityRows.push(entry);
    return entry;
  }),
  deleteActivity: jest.fn(async () => undefined),
}));

it('saves contact, event and follow-up logs and shows them in Week History after reopening', async () => {
  mockActivityRows.length = 0;
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });
  const firstVisit = await renderWithProviders(<MainTabNavigator />);
  fireEvent.press(await screen.findByLabelText(/^Tracker, tab,/));

  const examples = [
    { type: 'Contact', title: 'Met a producer', placeholder: 'e.g. Jane Doe' },
    { type: 'Event', title: 'Industry mixer', placeholder: 'e.g. Industry mixer' },
    { type: 'Follow-up', title: 'Called the producer', placeholder: 'e.g. Jane Doe' },
  ];
  for (const example of examples) {
    fireEvent.press(await screen.findByText('Log Activity'));
    fireEvent.press(await screen.findByText(example.type));
    fireEvent.changeText(await screen.findByPlaceholderText(example.placeholder), example.title);
    await waitFor(() => expect(screen.getByPlaceholderText(example.placeholder).props.value).toBe(example.title));
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockActivityRows.some((entry) => entry.title === example.title)).toBe(true));
    expect(await screen.findByLabelText('Week History')).toBeTruthy();
  }

  expect(createActivity).toHaveBeenCalledTimes(3);
  fireEvent.press(screen.getByLabelText('Week History'));
  expect(await screen.findByText('History')).toBeTruthy();
  for (const example of examples) expect(await screen.findByText(example.title)).toBeTruthy();

  firstVisit.unmount();
  await renderWithProviders(<MainTabNavigator />);
  fireEvent.press(await screen.findByLabelText(/^Tracker, tab,/));
  fireEvent.press(await screen.findByLabelText('Week History'));
  for (const example of examples) expect(await screen.findByText(example.title)).toBeTruthy();
});

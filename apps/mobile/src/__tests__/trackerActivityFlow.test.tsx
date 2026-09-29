import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { MainTabNavigator } from '../navigation/MainTabNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { createActivity } from '../services/supabase/activity';
import { useAppStore } from '../store/useAppStore';
import { computeWeekKey } from '../utils/weekKey';
import { Alert } from 'react-native';

const mockActivityRows: Array<{ id: string; type: 'contact' | 'event' | 'followUp'; title: string; date: string; weekKey: string }> = [];

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [{ slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 }]),
  fetchCategoryCounts: jest.fn(async () => ({ fashion: 1 })),
  fetchContactsByCategory: jest.fn(async () => []),
  fetchFavoriteContactIds: jest.fn(async () => []),
  fetchContactChoices: jest.fn(async () => [{ id: 'contact-1', name: 'Jane Doe', categorySlug: 'fashion' }]),
}));

jest.mock('../services/supabase/activity', () => ({
  activityQueryKey: (userId: string | null) => ['activity', userId],
  fetchUserActivity: jest.fn(async () => [...mockActivityRows]),
  createActivity: jest.fn(async ({ type, title, date, weekKey, contactId }: { type: 'contact' | 'event' | 'followUp'; title: string; date: Date; weekKey: string; contactId?: string }) => {
    const entry = { id: `activity-${mockActivityRows.length + 1}`, type, title, date: date.toISOString(), weekKey, contactId };
    mockActivityRows.push(entry);
    return entry;
  }),
  deleteActivity: jest.fn(async (_userId: string, activityId: string) => { const index = mockActivityRows.findIndex((entry) => entry.id === activityId); if (index >= 0) mockActivityRows.splice(index, 1); }),
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

  await firstVisit.unmount();
  const secondVisit = await renderWithProviders(<MainTabNavigator />);
  fireEvent.press(await screen.findByLabelText(/^Tracker, tab,/));
  fireEvent.press(await screen.findByLabelText('Week History'));
  for (const example of examples) expect(await screen.findByText(example.title)).toBeTruthy();
  await secondVisit.unmount();
});

it('persists a linked directory contact and an event with its week key', async () => {
  mockActivityRows.length = 0;
  useAppStore.setState({ isPro: true });
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });
  const visit = await renderWithProviders(<MainTabNavigator />);
  fireEvent.press(await screen.findByLabelText(/^Tracker, tab,/));
  fireEvent.press(await screen.findByText('Log Activity'));
  fireEvent.press(await screen.findByText('Contact'));
  fireEvent.press(await screen.findByText('Directory contact'));
  fireEvent.press(await screen.findByLabelText('Link Jane Doe'));
  await waitFor(() => expect(screen.getByPlaceholderText('e.g. Jane Doe').props.value).toBe('Jane Doe'));
  fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockActivityRows[0]?.title).toBe('Jane Doe'));
  expect(createActivity).toHaveBeenCalledWith(expect.objectContaining({ contactId: 'contact-1' }));

  fireEvent.press(await screen.findByText('Log Activity'));
  fireEvent.press(await screen.findByText('Event'));
  fireEvent.changeText(await screen.findByPlaceholderText('e.g. Industry mixer'), 'Past conference');
  await waitFor(() => expect(screen.getByPlaceholderText('e.g. Industry mixer').props.value).toBe('Past conference'));
  expect(screen.getByLabelText('Choose event date')).toBeTruthy();
  fireEvent.press(screen.getByRole('button', { name: 'Save' }));
  await waitFor(() => expect(mockActivityRows[1]?.title).toBe('Past conference'));
  expect(createActivity).toHaveBeenLastCalledWith(expect.objectContaining({ weekKey: computeWeekKey(new Date()) }));
  await visit.unmount();
  useAppStore.setState({ isPro: false });
});

it('confirms a history deletion and keeps it gone after reopening', async () => {
  mockActivityRows.length = 0;
  mockActivityRows.push({ id: 'activity-1', type: 'contact', title: 'To remove', date: new Date().toISOString(), weekKey: computeWeekKey(new Date()) });
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });
  const alert = jest.spyOn(Alert, 'alert').mockImplementation((_title, _message, buttons) => { buttons?.find((button) => button.text === 'Delete')?.onPress?.(); });
  const visit = await renderWithProviders(<MainTabNavigator />);
  fireEvent.press(await screen.findByLabelText(/^Tracker, tab,/));
  fireEvent.press(await screen.findByLabelText('Week History'));
  fireEvent.press(await screen.findByLabelText('Reveal delete for To remove'));
  fireEvent.press(await screen.findByLabelText('Delete To remove'));
  await waitFor(() => expect(mockActivityRows).toHaveLength(0));
  await visit.unmount();
  const secondVisit = await renderWithProviders(<MainTabNavigator />);
  fireEvent.press(await screen.findByLabelText(/^Tracker, tab,/));
  fireEvent.press(await screen.findByLabelText('Week History'));
  expect(screen.queryByText('To remove')).toBeNull();
  await secondVisit.unmount();
  alert.mockRestore();
});

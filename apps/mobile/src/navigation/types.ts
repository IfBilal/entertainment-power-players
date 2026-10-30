import type { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Splash: undefined;
  IntroSlides: undefined;
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  TrackPicker: undefined;
};

/**
 * Client's 2 Oct bottom-bar spec is 4 tabs: Home, Power Moves, Challenges,
 * Search. Tracker, Inspiration (quotes) and Profile don't map to any of
 * those 4 names, so their screens live inside the Home stack instead of
 * getting their own tab -- Home becomes a real dashboard (greeting, weekly
 * tracker summary, quote of the day) with Profile reachable via a header
 * avatar button rather than a 5th tab.
 */
export type HomeStackParamList = {
  Home: undefined;
  TrackerDashboard: undefined;
  LogActivity: undefined;
  LogEntry: { type: 'contact' | 'event' | 'followUp' };
  GoalsEditor: undefined;
  TrackerHistory: undefined;
  QuoteFeed: undefined;
  ProfileHome: undefined;
  EditProfile: undefined;
  Subscription: undefined;
  Notifications: undefined;
};

/** "Power Moves" tab: the Questions module (question/answer/why/power move). */
export type PowerMovesStackParamList = {
  QuestionCategories: undefined;
  QuestionGroups: { categorySlug: string };
  QuestionList: { categorySlug: string; group: string };
  QuestionDetail: { questionId: string };
};

export type ChallengesStackParamList = {
  TrackList: undefined;
  TrackDetail: { trackSlug: string };
  ChallengeDetail: { trackSlug: string; challengeId: string };
};

/** "Search" tab: today's Directory (category grid -> contact list -> detail). */
export type SearchStackParamList = {
  CategoryGrid: undefined;
  ContactList: { categorySlug: string };
  ContactDetail: { contactId: string; city?: string };
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  PowerMoves: NavigatorScreenParams<PowerMovesStackParamList>;
  Challenges: NavigatorScreenParams<ChallengesStackParamList>;
  Search: NavigatorScreenParams<SearchStackParamList>;
};

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Paywall: { reason?: string; plan?: 'monthly' | 'annual' } | undefined;
  ResetPassword: undefined;
};

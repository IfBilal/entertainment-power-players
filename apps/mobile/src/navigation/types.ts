import type { NavigatorScreenParams } from '@react-navigation/native';

export type OnboardingStackParamList = {
  Splash: undefined;
  IntroSlides: undefined;
  SignUp: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  TrackPicker: undefined;
};

export type DirectoryStackParamList = {
  CategoryGrid: undefined;
  ContactList: { categorySlug: string };
  ContactDetail: { contactId: string };
};

export type TrackerStackParamList = {
  TrackerDashboard: undefined;
  LogEntry: { type: 'contact' | 'event' | 'followUp' };
  GoalsEditor: undefined;
  TrackerHistory: undefined;
};

export type ChallengesStackParamList = {
  TrackList: undefined;
  TrackDetail: { trackSlug: string };
};

export type InspirationStackParamList = {
  QuoteFeed: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
};

export type MainTabParamList = {
  Directory: NavigatorScreenParams<DirectoryStackParamList>;
  Tracker: NavigatorScreenParams<TrackerStackParamList>;
  Challenges: NavigatorScreenParams<ChallengesStackParamList>;
  Inspiration: NavigatorScreenParams<InspirationStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Paywall: { reason?: string } | undefined;
};

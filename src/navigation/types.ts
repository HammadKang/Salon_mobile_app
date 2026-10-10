import type { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Services: undefined;
  Gallery: undefined;
  Team: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  Booking: { serviceId?: string; stylistId?: string } | undefined;
};

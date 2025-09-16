/** The navigation context. */
export type NavContext = {
  navigateTo: (page: Pages) => Promise<void>;
};

/** The possible pages in the app. */
export type Pages = 'LoginPage' | 'DashboardPage' | 'SignupPage';

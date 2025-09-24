import { getAuthUser } from '@/api/auth';
import DashboardPage from '@/pages/dashboard/DashboardPage.svelte';
import LoadingPage from '@/pages/loading/LoadingPage.svelte';
import LoginPage from '@/pages/login/LoginPage.svelte';
import ProfilePage from '@/pages/profile/ProfilePage.svelte';
import SignupPage from '@/pages/signup/SignupPage.svelte';
import { type Component } from 'svelte';
import wrap from 'svelte-spa-router/wrap';

/** Describes a route. */
export type RouteInfo = {
  path: string;
  component: Component;
};

/** The various routes of the app. */
export const routes = {
  '/': wrap({
    component: LoginPage,
    loadingComponent: LoadingPage,
    conditions: [
      async () => {
        const authUser = await getAuthUser();
        if (authUser) {
          return true;
        }
        return false;
      },
    ],
  }),
  '/login': wrap({
    component: LoginPage,
    loadingComponent: LoadingPage,
  }),
  '/signup': wrap({
    component: SignupPage,
    loadingComponent: LoadingPage,
  }),
  '/dashboard': wrap({
    component: DashboardPage,
    loadingComponent: LoadingPage,
  }),
  '/profile': wrap({
    component: ProfilePage,
    loadingComponent: LoadingPage,
  }),
};

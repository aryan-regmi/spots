import DashboardPage from '@/pages/dashboard/DashboardPage.svelte';
import LoadingPage from '@/pages/loading/LoadingPage.svelte';
import LoginPage from '@/pages/login/LoginPage.svelte';
import ProfilePage from '@/pages/profile/ProfilePage.svelte';
import SignupPage from '@/pages/signup/SignupPage.svelte';
import page, { type Callback } from 'page';
import type { Component } from 'svelte';
import { getAuthUser } from '@/api/auth';

/** Describes a route. */
export type RouteInfo = {
  path: string;
  component: Component;
  loader?: Callback;
};

/** Redirects to login page if not authenticated, otherwise to the user dashboard. */
async function authRedirectLoader() {
  const authUser = await getAuthUser();
  if (authUser) {
    page.show('/dashboard');
  } else {
    page.show('/login');
  }
}

/** The various routes of the app. */
export const routes: RouteInfo[] = [
  {
    path: '/',
    component: LoadingPage,
    loader: authRedirectLoader,
  },
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/signup',
    component: SignupPage,
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    loader: async () => {
      const authUser = await getAuthUser();
      if (!authUser) {
        page.show('/login');
      }
    },
  },
  {
    path: '/profile',
    component: ProfilePage,
  },
];

import DashboardPage from '@/pages/dashboard/DashboardPage.svelte';
import LoadingPage from '@/pages/loading/LoadingPage.svelte';
import LoginPage from '@/pages/login/LoginPage.svelte';
import ProfilePage from '@/pages/profile/ProfilePage.svelte';
import SignupPage from '@/pages/signup/SignupPage.svelte';
import page, { type Callback } from 'page';
import { getContext, type Component } from 'svelte';
import { getAuthUser } from '@/api/auth';
import type { AuthContext } from '@/auth/types';

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
    page.replace('/dashboard');
    page.show('/dashboard');
  } else {
    page.replace('/login');
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
        page.replace('/login');
        page.show('/login');
      }
    },
  },
  {
    path: '/profile',
    component: ProfilePage,
  },
];

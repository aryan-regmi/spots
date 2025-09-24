import DashboardPage from '@/pages/dashboard/DashboardPage.svelte';
import LoadingPage from '@/pages/loading/LoadingPage.svelte';
import LoginPage from '@/pages/login/LoginPage.svelte';
import ProfilePage from '@/pages/profile/ProfilePage.svelte';
import SignupPage from '@/pages/signup/SignupPage.svelte';
import { getContext, type Component } from 'svelte';
import { getAuthUser } from '@/api/auth';
import type { AuthContext } from '@/auth/types';

/** Describes a route. */
export type RouteInfo = {
  path: string;
  component: Component;
};

/** The various routes of the app. */
export const routes = [
  {
    path: '/',
    action: () => {
      return '<LoadingPage/>';
    },
  },
  {
    path: '/login',
    action: () => {
      return '<LoginPage/>';
    },
  },
  {
    path: '/signup',
    action: () => {
      return '<SignupPage/>';
    },
  },
  {
    path: '/dashboard',
    action: () => {
      return '<DashboardPage/>';
    },
  },
  {
    path: '/profile',
    action: () => {
      return '<ProfilePage/>';
    },
  },
];

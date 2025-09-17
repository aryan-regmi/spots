import type { Route } from '@/router/types';
import DashboardPage from '@/pages/dashboard/DashboardPage.svelte';
import LoginPage from '@/pages/login/LoginPage.svelte';
import SignupPage from '@/pages/signup/SignupPage.svelte';

export const routes: Route[] = [
  { path: '/', component: LoginPage },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignupPage },
  { path: '/dashboard', component: DashboardPage },
];

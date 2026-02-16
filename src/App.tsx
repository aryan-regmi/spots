import '@/App.css';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NavMusicLayout } from '@/pages/NavMusicLayout';
import { Route, Router } from '@solidjs/router';
import { SignupPage } from '@/pages/SignupPage';
import { UnlistenFn } from '@tauri-apps/api/event';
import { attachConsole } from '@tauri-apps/plugin-log';
import { onCleanup, onMount } from 'solid-js';

// TODO: Add isolation app (check tauri docs)
function App() {
  // TODO: Remove during prod (log to file!)
  //
  // Prints backend logs to the console
  let detachConsole!: Promise<UnlistenFn>;
  onMount(() => {
    detachConsole = attachConsole();
  });
  onCleanup(async () => (await detachConsole)());

  return (
    <main class="container">
      <Router>
        <Route path={'/'} component={LoginPage} />
        <Route path={'/signup'} component={SignupPage} />
        <Route path="/user" component={NavMusicLayout}>
          <Route path="/dashboard" component={DashboardPage} />
        </Route>
      </Router>
    </main>
  );
}

export default App;

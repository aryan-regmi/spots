import '@/App.css';
import { LoginPage } from './pages/LoginPage';
import { Route, Router } from '@solidjs/router';
import { onCleanup, onMount } from 'solid-js';
import { attachConsole } from '@tauri-apps/plugin-log';
import { UnlistenFn } from '@tauri-apps/api/event';
import { SignupPage } from './pages/SignupPage';

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
      </Router>
    </main>
  );
}

export default App;

import '@/App.css';
import { LoginPage } from './pages/LoginPage';
import { Route, Router } from '@solidjs/router';

import { attachConsole } from '@tauri-apps/plugin-log';
import { onCleanup, onMount } from 'solid-js/types/server/reactive.js';
import { UnlistenFn } from '@tauri-apps/api/event';

// TODO: Add isolation app (check tauri docs)
function App() {
  // TODO: Remove during prod (log to file!)
  //
  // Prints backend logs to the console
  let detach!: UnlistenFn;
  onMount(async () => {
    detach = await attachConsole();
  });
  onCleanup(() => detach());

  return (
    <main class="container">
      <Router>
        <Route path={'/'} component={LoginPage} />
      </Router>
    </main>
  );
}

export default App;

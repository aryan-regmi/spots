import '@/App.css';
import { LoginPage } from './pages/LoginPage';
import { Route, Router } from '@solidjs/router';
import { UnlistenFn } from '@tauri-apps/api/event';
import { attachConsole } from '@fltsci/tauri-plugin-tracing';
import { onCleanup, onMount } from 'solid-js';
import { useLogger } from './services/logger/provider';

// TODO: Add isolation app (check tauri docs)
function App() {
  const logger = useLogger();

  // TODO: Remove during prod (log to file!)
  //
  // Prints backend logs to the console
  let detach!: UnlistenFn;
  onMount(async () => {
    detach = await attachConsole();
    logger.info('Attached backend console');
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

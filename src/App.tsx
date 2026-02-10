import './App.css';
// import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
// import { PlaylistPage } from '@/pages/PlaylistPage';
import { Route, Router } from '@solidjs/router';
import { useDBProvider } from './dbService/mockDBServiceProvider';
import { onCleanup } from 'solid-js';

// TODO: Add bottom navbar
// TODO: Add `Create user/Sign up` page
// TODO: Add Error boundaries
// TODO: Make all providers use solid-router queries!

function App() {
  // Close database connection
  onCleanup(() => {
    const dbService = useDBProvider();
    dbService.database?.close();
  });

  return (
    <main class="container">
      <Router>
        <Route path={'/'} component={LoginPage} />
        {/* <Route path={'/dashboard'} component={DashboardPage} /> */}
        {/* <Route path={'/library/playlist/:id'} component={PlaylistPage} /> */}
      </Router>
    </main>
  );
}

export default App;

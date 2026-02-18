import '@/App.css';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NavMusicLayout } from '@/pages/NavMusicLayout';
import { Route, Router } from '@solidjs/router';
import { SignupPage } from '@/pages/SignupPage';

// TODO: Add isolation app (check tauri docs)
function App() {
  return (
    <main class="container">
      <Router>
        <Route path={'/'} component={LoginPage} />
        <Route path={'/signup'} component={SignupPage} />
        <Route path="/user/:id" component={NavMusicLayout}>
          <Route path="/dashboard" component={DashboardPage} />
        </Route>
      </Router>
    </main>
  );
}

export default App;

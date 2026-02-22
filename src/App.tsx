import '@/App.css';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { NavMusicLayout } from '@/pages/NavMusicLayout';
import { Route, Router } from '@solidjs/router';
import { SignupPage } from '@/pages/SignupPage';
import { StoreProvider } from './utils/tauriStore';

// TODO: Add isolation app (check tauri docs)
// TODO: Add error boundary
function App() {
  return (
    <main class="container">
      <StoreProvider>
        <Router>
          <Route path={'/'} component={LoginPage} />
          {/* <Route path={'/signup'} component={SignupPage} /> */}
          {/* <Route path="/user/:id" component={NavMusicLayout}> */}
          {/*   <Route path="/dashboard" component={DashboardPage} /> */}
          {/* </Route> */}
        </Router>
      </StoreProvider>
    </main>
  );
}

export default App;

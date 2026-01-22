import './App.css';
import { AuthProvider } from '@/auth/AuthProvider';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { Route, Router } from '@solidjs/router';

function App() {
  return (
    <main class="container">
      <AuthProvider>
        <Router>
          <Route path={'/'} component={LoginPage} />
          <Route path={'/dashboard'} component={DashboardPage} />
        </Router>
      </AuthProvider>
    </main>
  );
}

export default App;

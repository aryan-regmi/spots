import './App.css';
import { AuthProvider } from '@/auth/AuthProvider';
import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
import { Route, Router } from '@solidjs/router';

// TODO: Add bottom navbar
// TODO: Add `Create user/Sign up` page

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

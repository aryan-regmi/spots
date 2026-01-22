import './App.css';
import { LoginPage } from '@/pages/LoginPage';
import { Route, Router } from '@solidjs/router';
import { AuthProvider } from './auth/AuthProvider';

function App() {
  return (
    <main class="container">
      <AuthProvider>
        <Router>
          <Route path={'/'} component={LoginPage} />
        </Router>
      </AuthProvider>
    </main>
  );
}

export default App;

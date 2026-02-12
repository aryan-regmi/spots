import '@/App.css';
import { LoginPage } from './pages/LoginPage';
import { Route, Router } from '@solidjs/router';

// TODO: Add isolation app (check tauri docs)
function App() {
  return (
    <main class="container">
      <Router>
        <Route path={'/'} component={LoginPage} />
      </Router>
    </main>
  );
}

export default App;

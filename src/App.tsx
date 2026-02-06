import './App.css';
// import { DashboardPage } from '@/pages/DashboardPage';
import { LoginPage } from '@/pages/LoginPage';
// import { PlaylistPage } from '@/pages/PlaylistPage';
import { Route, Router } from '@solidjs/router';

// TODO: Add bottom navbar
// TODO: Add `Create user/Sign up` page
// TODO: Add Error boundaries

function App() {
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

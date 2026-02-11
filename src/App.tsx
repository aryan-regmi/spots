import { Route, Router } from "@solidjs/router";
import "./App.css";
import { LoginPage } from "./pages/LoginPage";

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

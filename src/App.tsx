import {
    Navigate,
    Route,
    HashRouter as Router,
    Routes,
} from 'react-router-dom';
import './App.css';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { SignupPage } from './pages/SignupPage';
import { loadDatabase } from './utils/sql';

/** The main component of the application. */
function App() {
    // Load database
    const dbName = 'test.db';
    const db = loadDatabase(dbName);

    // Setup routes
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage db={db} />}></Route>
                <Route path="/home" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage db={db} />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

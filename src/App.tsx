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

/** The main component of the application. */
function App() {
    // return <Navigate to="/login" replace />;
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />}></Route>
                <Route path="/home" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

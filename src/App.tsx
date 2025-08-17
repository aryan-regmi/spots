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
import { useEffect, useState } from 'react';
import Database from '@tauri-apps/plugin-sql';

/** The main component of the application. */
function App() {
    // Load database
    const dbName = 'test.db';
    const [db, setDb] = useState<Database | null>(null);
    useEffect(() => {
        const loadDb = async () => {
            setDb(await Database.load(`sqlite:${dbName}`));
        };
        if (db == null) {
            loadDb();
            console.log('Database loaded!');
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage db={db!} />}></Route>
                <Route path="/home" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage db={db!} />} />
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;

import { useLocation, useNavigate } from 'react-router-dom';
import { LoginFormData } from '../components/LoginForm';
import './pages.css';

export function HomePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const loginInfo: LoginFormData = location.state;
    let username = loginInfo.username;

    /** Redirects to the login page. */
    function redirectToLogin() {
        navigate('/login');
    }

    return (
        <div className="col">
            <div className="row">
                <h2>Welcome {username}!</h2>
            </div>
            <footer className="footer" style={{ fontSize: '20px' }}>
                <a onClick={redirectToLogin} className="text-link">
                    Log Out
                </a>
            </footer>
        </div>
    );
}

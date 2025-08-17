import { LoginForm, LoginFormData } from "../components/LoginForm";
import { useNavigate } from "react-router-dom";
import "./pages.css";

/** The login page component. */
export function LoginPage() {
  const navigate = useNavigate();

  /** Handles logging in by navigating to the home page. */
  function loginHandler(data: LoginFormData) {
    navigate('/home', {
      state: data
    });
  }

  return (
    <main className="container">
      <h1>Spots: A Spotify Alternative</h1>
      <div className="col">
        <LoginForm loginHandler={loginHandler} />
        <a onClick={(_) => { navigate('/signup') }} className="text-link">Sign Up</a>
      </div>
    </main>);
}

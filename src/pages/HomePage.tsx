import { useLocation } from "react-router-dom";
import { LoginFormData } from "../components/LoginForm";

export function HomePage() {
  const location = useLocation();
  const loginInfo: LoginFormData = location.state;
  let username = loginInfo.username;

  return (
    <div className="row">
      <h2>Welcome {username}!</h2>
    </div>
  );
}

import { useState } from "react";
import { LoginForm, LoginFormData } from "../components/LoginForm";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const navigate = useNavigate();
  // const [loginInfo, setLoginInfo] = useState({ username: "", password: "" });

  // FIXME: Remove this and add validation to `LoginForm` instead.
  // 
  /** Handles logging in. */
  function loginHandler(data: LoginFormData) {
    // setLoginInfo(data);
    navigate('/home', {
      state: {
        data
      }
    });
  }

  return (
    <main className="container">
      <h1>Spots: A Spotify Alternative</h1>
      <LoginForm loginDataHandler={loginHandler} />
    </main>);
}

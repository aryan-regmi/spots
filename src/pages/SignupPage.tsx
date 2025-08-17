import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usernameExists } from "../utils/sql";
import Database from "@tauri-apps/plugin-sql";
import "./pages.css";

/** The signup page component. */
export function SignupPage() {
  return (
    <div className="col">
      <SignupForm />
    </div>
  );
}

/** The form responsible for handling user signups. */
function SignupForm() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [db, setDb] = useState<Database | null>(null);
  useEffect(() => {
    const loadDb = async () => {
      setDb(await Database.load('sqlite:test.db'));
    }
    loadDb();
  }, []);

  /** Checks if the username is available in the database. */
  async function validateLogin(db: Database, username: string) {
    return !await usernameExists(db, username)
  }

  /** Validates the login (checks if username already exists). */
  function signupHandler(event: FormEvent) {
    event.preventDefault();
    if (db != null) {
      validateLogin(db, username).then((valid) => {
        if (valid) {
          // Save to database
          db.execute(
            `INSERT INTO users (username, password) VALUES ($1,$2)`,
            [username, password]
          ).then((result) => {
            console.log(`Inserted ${result.rowsAffected} users`)
            navigate('/home', {
              state: { username: username, password: password }
            });
          });
        }
        else {
          alert(`Invalid username: ${username} already exists!`);
        }

      });
    } else {
      console.error("Invalid database");
    }
  }

  return (
    <form
      className="col"
      id="login-form"
      onSubmit={signupHandler}
    >
      <div className="row">
        Username:
        <input
          id="username-input"
          onChange={(e) => setUsername(e.currentTarget.value)}
          placeholder="Enter username..."
        />
      </div>

      <div className="row">
        Password:
        <input
          id="password-input"
          type="password"
          onChange={(e) => setPassword(e.currentTarget.value)}
          placeholder="Enter password..."
        />
      </div>

      <input type="submit" placeholder="Create Login" className="submit-button" />
    </form >
  );
}

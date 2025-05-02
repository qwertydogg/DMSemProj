import React, { useState, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Category = "client" | "contractor";

interface LoginResponse {
  success: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    clientId?: number;
    clientName?: string;
  };
}

function Login() {
  const [category, setCategory] = useState<Category>("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post<LoginResponse>(
        "http://localhost:8081/login",
        {
          category,
          email,
          password,
        }
      );

      if (res.data.success) {
        setMessage(`Welcome, ${res.data.user.name}!`);

        if (category === "client" && res.data.user.clientId) {
          navigate(`/client-dashboard/${res.data.user.clientId}`, {
            state: {
              clientName: res.data.user.clientName || res.data.user.name,
            },
          });
        } else if (category === "contractor") {
          navigate(`/contractor-dashboard/${res.data.user.id}`);
        }
      } else {
        setMessage("Invalid credentials.");
      }
    } catch (err: any) {
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>
          Category:
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            <option value="client">Client</option>
            <option value="contractor">Contractor</option>
          </select>
        </label>
        <br />
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Login</button>
        <button type="button" onClick={() => navigate("/signup")}>
          Don't have an account? Sign up
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;

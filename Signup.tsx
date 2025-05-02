import React, { useState, FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Category = "client" | "contractor";

function Signup() {
  const [category, setCategory] = useState<Category>("client");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8081/signup", {
        category,
        name,
        email,
        password,
        contact,
        address,
      });

      if (res.data.success) {
        setMessage("Signup successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        setMessage(err.response?.data?.error || "Signup failed");
      } else {
        setMessage("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup}>
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
          Name:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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

        <label>
          Contact:
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            required
          />
        </label>
        <br />

        <label>
          Address:
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>
        <br />

        <button type="submit">Sign Up</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;

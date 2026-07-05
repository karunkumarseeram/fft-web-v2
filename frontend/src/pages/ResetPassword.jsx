// frontend/src/pages/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../services/api";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract token from URL query
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) setError("Invalid or missing reset token.");
  }, [token]);

  const handleReset = async () => {
    if (!password || !confirm) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await API.post("/auth/reset-password", { password, token });
      setMessage(res.data.message || "Password reset successful!");
      setError("");
      setTimeout(() => navigate("/login"), 2000); // Redirect to login
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password");
      setMessage("");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/fft_logo.png" alt="fft_logo" style={styles.logo} />
        <h2 style={styles.title}>Reset Password</h2>
        <p style={styles.subtitle}>Set a new password for your account</p>

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          style={styles.input}
        />

        <button onClick={handleReset} style={styles.button}>
          Update Password
        </button>

        <p style={styles.link} onClick={() => navigate("/login")}>
          Back to Login
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `
      linear-gradient(135deg, rgba(106,27,154,0.7), rgba(135,206,235,0.7)), 
      url('/bg-login.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    padding: 40,
    width: 360,
    background: "#fff",
    borderRadius: 15,
    textAlign: "center",
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },
  logo: { width: 100, marginBottom: 10 },
  title: { color: "#6A1B9A", fontSize: 28, marginBottom: 5 },
  subtitle: { fontSize: 14, marginBottom: 20 },
  input: {
    width: "100%",
    padding: 12,
    margin: "10px 0",
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 16,
    boxSizing: "border-box",
    textAlign: "left",
  },
  button: {
    width: "100%",
    padding: 14,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 16,
    marginTop: 10,
  },
  link: {
    color: "#6A1B9A",
    cursor: "pointer",
    marginTop: 10,
    fontSize: 14,
  },
  error: { color: "red", fontSize: 13, marginBottom: 10 },
  success: { color: "green", fontSize: 13, marginBottom: 10 },
};
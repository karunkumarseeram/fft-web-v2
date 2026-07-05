import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSignup = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("All fields are required");
      return;
    }

    if (!emailRegex.test(form.email)) {
      setError("Invalid email format");
      return;
    }

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    try {
      await API.post("/auth/signup", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });

      setError("");
      setSuccess(
        "Signup successful! Welcome email sent. Waiting for you to see..."
      );

      setTimeout(() => {
        navigate("/");
      }, 12000);
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img
          src="/fft_logo.png"
          alt="FFT Church Logo"
          style={styles.logo}
        />

        <h2 style={styles.title}>FFT Church Signup</h2>
        <p style={styles.subtitle}>HIM We Proclaim</p>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <input
            style={styles.input}
            type="password"
            placeholder="Confirm Password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          />

          <button style={styles.button} onClick={handleSignup}>
            Signup
          </button>
        </div>

        <p style={styles.link} onClick={() => navigate("/")}>
          Already have an account? Login
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
      linear-gradient(135deg, rgba(230,230,250,0.7), rgba(135,206,235,0.7)), 
      url('/bg-signup.png')
    `,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },

  // 🔥 No box, only glass effect
  card: {
    padding: 30,
    width: 340,
    textAlign: "center",
    background: "transparent",
    backdropFilter: "blur(8px)",
  },

  logo: {
    width: 90,
    height: 90,
    objectFit: "contain",
    marginBottom: 10,
  },

  title: {
    marginBottom: 5,
    color: "#6A1B9A",
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: 13,
    marginBottom: 15,
    color: "#333",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  // 🔥 Transparent styled inputs
  input: {
    width: "100%",
    padding: 12,
    border: "1px solid rgba(255,255,255,0.6)",
    borderRadius: 8,
    fontSize: 14,
    boxSizing: "border-box",
    background: "rgba(255,255,255,0.2)",
    outline: "none",
  },

  button: {
    width: "100%",
    padding: 12,
    marginTop: 10,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: "bold",
  },

  link: {
    marginTop: 15,
    color: "#6A1B9A",
    cursor: "pointer",
    fontSize: 14,
  },

  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
  },

  success: {
    color: "green",
    fontSize: 13,
    marginBottom: 10,
  },
};
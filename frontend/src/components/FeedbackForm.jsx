import React, { useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import { createFeedback } from "../services/feedbackApi";

const FeedbackForm = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    rating: 5,
    category: "GENERAL",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      await createFeedback(form);
      setSuccess("Feedback submitted successfully!");

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
        rating: 5,
        category: "GENERAL",
      });
    } catch (err) {
      console.error(err);
      setSuccess("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* ================= HEADER ================= */}
      <div style={styles.header}>
        <div style={styles.backRow} onClick={() => navigate(-1)}>
          <ArrowBackIcon />
          <span style={{ marginLeft: 8 }}>Back</span>
        </div>

        <h2 style={{ margin: 0 }}>Feedback Form</h2>
      </div>

      {/* ================= FORM ================= */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <input
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          style={styles.input}
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          style={styles.textarea}
          required
        />

        <select
          name="rating"
          value={form.rating}
          onChange={handleChange}
          style={styles.input}
        >
          {[1, 2, 3, 4, 5].map((r) => (
            <option key={r} value={r}>
              {r} Star
            </option>
          ))}
        </select>

        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="GENERAL">General</option>
          <option value="BUG">Bug</option>
          <option value="SUGGESTION">Suggestion</option>
          <option value="COMPLAINT">Complaint</option>
          <option value="APPRECIATION">Appreciation</option>
        </select>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>

        {success && <p style={styles.success}>{success}</p>}
      </form>
    </div>
  );
};

// ================= STYLES =================
const styles = {
  container: {
    maxWidth: "500px",
    margin: "40px auto",
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "10px",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },

  backRow: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontWeight: "bold",
    color: "#333",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },

  textarea: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    minHeight: "100px",
  },

  button: {
    padding: "10px",
    background: "#1976d2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  success: {
    color: "green",
  },
};

export default FeedbackForm;
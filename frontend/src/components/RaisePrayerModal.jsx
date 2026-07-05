import { useState } from "react";
import API from "../services/api";

export default function RaisePrayerModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return alert("Please write your prayer 🙏");

    try {
      setLoading(true);

      await API.post("/prayers", {
        name,
        request: message,   // ✅ FIXED HERE
      });

      setName("");
      setMessage("");

      onSave(); // refresh dashboard
    } catch (err) {
      console.error("Failed to submit prayer request", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3 style={{ marginBottom: 10 }}>Raise Prayer Request</h3>

        <input
          style={styles.input}
          placeholder="Your Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          style={styles.textarea}
          placeholder="Write your prayer..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button style={styles.saveBtn} onClick={handleSubmit}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    width: 420,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  textarea: {
    padding: 10,
    minHeight: 100,
    borderRadius: 8,
    border: "1px solid #ccc",
    resize: "none",
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelBtn: {
    padding: "8px 14px",
    background: "#ccc",
    border: "none",
    borderRadius: 6,
  },

  saveBtn: {
    padding: "8px 14px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 6,
  },
};
import { useState, useEffect } from "react";
import API from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddEvent() {
  const navigate = useNavigate();
  const location = useLocation();

  // If editing, event data comes from navigate state
  const existingEvent = location.state?.event;

  const [event, setEvent] = useState({
  title: "",
  description: "",
  location: "",
  event_date: "",
});

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (existingEvent) {
      setEvent(existingEvent);
    }
  }, [existingEvent]);

  const handleSubmit = async () => {
    try {
      if (!event.title || !event.date || !event.time) {
        setMessage("Please fill all required fields");
        return;
      }

      if (existingEvent) {
        // 🔁 Update
        await API.put(`/events/${existingEvent.id}`, event);
        setMessage("Event updated successfully!");
      } else {
        // ➕ Create
        await API.post("/events", event);
        setMessage("Event created successfully!");
      }

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Error saving event");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{existingEvent ? "Update Event" : "Add Event"}</h2>

        {message && <p style={styles.message}>{message}</p>}

        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Event Title"
            value={event.title}
            onChange={(e) =>
              setEvent({ ...event, title: e.target.value })
            }
          />

          <input
            type="datetime-local"
            value={event.event_date}
            onChange={(e) =>
              setEvent({ ...event, event_date: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="time"
            value={event.time}
            onChange={(e) =>
              setEvent({ ...event, time: e.target.value })
            }
          />

          <textarea
            style={styles.textarea}
            placeholder="Description"
            value={event.description}
            onChange={(e) =>
              setEvent({ ...event, description: e.target.value })
            }
          />

          <button style={styles.button} onClick={handleSubmit}>
            {existingEvent ? "Update Event" : "Create Event"}
          </button>

          <button
            style={styles.cancel}
            onClick={() => navigate("/dashboard")}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "linear-gradient(135deg, #E6E6FA, #ADD8E6)",
  },

  card: {
    width: 400,
    padding: 30,
    borderRadius: 12,
    background: "#fff",
    boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    textAlign: "center",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 15,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },

  textarea: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
    minHeight: 80,
  },

  button: {
    padding: 12,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  cancel: {
    padding: 10,
    background: "#ccc",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  message: {
    marginTop: 10,
    color: "green",
  },
};
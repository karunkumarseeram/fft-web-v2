import { useState, useEffect } from "react";
import API from "../services/api";

export default function AddEventModal({ onClose, onSave, event }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  /* ================================
     LOAD EDIT DATA
  ================================= */
  useEffect(() => {
    if (event) {
      setTitle(event.title || "");
      setDescription(event.description || "");
      setLocation(event.location || "");

      if (event.event_date) {
        const dt = new Date(event.event_date);
        const isoDate = dt.toISOString().split("T")[0];
        const isoTime = dt.toTimeString().slice(0, 5);

        setDate(isoDate);
        setTime(isoTime);
      }
    } else {
      setTitle("");
      setDescription("");
      setLocation("");
      setDate("");
      setTime("");
    }
  }, [event]);

  /* ================================
     SAVE EVENT
  ================================= */
  const handleSave = async () => {
    if (!title || !date || !time) {
      alert("Title, date and time are required!");
      return;
    }

    const eventData = {
      title,
      description,
      location,
      event_date: `${date}T${time}:00`,
    };

    try {
      if (event?.id) {
        await API.put(`/events/${event.id}`, eventData);
      } else {
        await API.post("/events", eventData);
      }

      onSave();
    } catch (err) {
      console.error("Failed to save event", err);
    }
  };

  return (
    /* ================================
       OVERLAY (CLICK OUTSIDE CLOSE FIX)
    ================================= */
    <div style={styles.overlay} onClick={onClose}>
      
      {/* MODAL BOX */}
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>{event?.id ? "✏️ Edit Event" : "➕ Add Event"}</h3>

        <div style={styles.form}>
          <input
            style={styles.input}
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            style={{ ...styles.input, resize: "vertical", minHeight: 70 }}
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            style={styles.input}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <input
            style={styles.input}
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        <div style={styles.buttons}>
          <button style={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>

          <button style={styles.saveBtn} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================
   STYLES
================================ */
const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  modal: {
    background: "#f7f2ff",
    padding: 25,
    borderRadius: 14,
    width: 420,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  input: {
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ccc",
    fontSize: 14,
    width: "100%",
    boxSizing: "border-box",
  },

  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },

  saveBtn: {
    padding: "10px 18px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  cancelBtn: {
    padding: "10px 18px",
    background: "#ccc",
    color: "#000",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};
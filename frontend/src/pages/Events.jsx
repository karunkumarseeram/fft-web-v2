import { useEffect, useState } from "react";
import API from "../services/api";

/* ================================
   HELPERS
================================ */
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatTime = (date) =>
  new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

/* ================================
   COMPONENT
================================ */
export default function Events() {
  const [events, setEvents] = useState([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editEvent, setEditEvent] = useState(null);

  const [time, setTime] = useState("09:00");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  /* ================================
     COLORS (STABLE)
  ================================= */
  const getGradientColor = (id) => {
    const colors = [
      "linear-gradient(135deg,#FF6B6B,#FFD93D)",
      "linear-gradient(135deg,#6BCB77,#4D96FF)",
      "linear-gradient(135deg,#FF8787,#845EC2)",
      "linear-gradient(135deg,#00C9A7,#92FE9D)",
      "linear-gradient(135deg,#F9F871,#FF9671)",
    ];

    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash += id.charCodeAt(i);
    }

    return colors[hash % colors.length];
  };

  /* ================================
     LOAD EVENTS
  ================================= */
  const defaultEventTemplates = [
    { id: "d1", title: "Sunday Worship 1", description: "Morning Worship", weekday: 0, hour: 8, minute: 0, location: "Pallamraju Nagar" },
    { id: "d2", title: "Sunday Worship 2", description: "Morning Worship", weekday: 0, hour: 11, minute: 0, location: "Indrapalem" },
    { id: "d3", title: "Sunday Worship 3", description: "Afternoon Worship", weekday: 0, hour: 14, minute: 0, location: "Lakshmi Narasarpuram" },
    { id: "d4", title: "Youth Meet", description: "Sunday Evening", weekday: 0, hour: 17, minute: 0, location: "Community Hall" },
    { id: "d5", title: "Whole Night Prayer", description: "Friday Night", weekday: 5, hour: 19, minute: 0, location: "Pallamraju Nagar" },
  ];

  const loadEvents = async () => {
    try {
      const res = await API.get("/events?skip=0&limit=100");

      const generated = [];

      defaultEventTemplates.forEach((t) => {
        for (let m = 0; m < 6; m++) {
          const base = new Date();
          const month = new Date(base.getFullYear(), base.getMonth() + m, 1);

          const firstDay = new Date(month);
          const diff = (t.weekday + 7 - firstDay.getDay()) % 7;

          firstDay.setDate(firstDay.getDate() + diff);
          firstDay.setHours(t.hour, t.minute, 0, 0);

          generated.push({
            ...t,
            id: `${t.id}-m${m}`,
            event_date: firstDay.toISOString(),
          });
        }
      });

      setEvents([...generated, ...res.data]);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  /* ================================
     DATE LOGIC
  ================================= */
  const now = new Date();

  const isToday = (date) =>
    new Date(date).toDateString() === now.toDateString();

  const getMonthEvents = () => {
    const currentMonth = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      1
    );

    const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    return events.filter((e) => {
      const d = new Date(e.event_date);
      return d >= start && d <= end;
    });
  };

  const monthEvents = getMonthEvents();

  const sortedEvents = [...monthEvents].sort((a, b) => {
    const aDate = new Date(a.event_date);
    const bDate = new Date(b.event_date);

    const aToday = isToday(aDate);
    const bToday = isToday(bDate);

    if (aToday && !bToday) return -1;
    if (!aToday && bToday) return 1;

    return aDate - bDate;
  });

  /* ================================
     CRUD
  ================================= */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/events/${id}`);
      showToast("Event deleted 🗑️");
      loadEvents();
    } catch (err) {
      console.log(err);
    }
  };

  const handleEdit = (event) => {
    setEditEvent(event);
    setTime(new Date(event.event_date).toTimeString().slice(0, 5));
    setShowModal(true);
  };

  const handleSave = async () => {
    const [h, m] = time.split(":");

    const form = {
      title: document.getElementById("title").value,
      description: document.getElementById("desc").value,
      location: document.getElementById("loc").value,
      event_date: new Date(
        `${document.getElementById("date").value}T${time}:00`
      ).toISOString(),
      hour: Number(h),
      minute: Number(m),
    };

    try {
      if (editEvent) {
        await API.put(`/events/${editEvent.id}`, form);
        showToast("Event updated ✏️");
      } else {
        await API.post("/events", form);
        showToast("Event created ➕");
      }

      setShowModal(false);
      setEditEvent(null);
      setTime("09:00");
      loadEvents();
    } catch (err) {
      console.log(err);
    }
  };

  const openMap = (location) => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(location),
      "_blank"
    );
  };

  /* ================================
     UI
  ================================= */
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h2>📅 Events</h2>

        <div style={styles.nav}>
          <button onClick={() => setMonthOffset(monthOffset - 1)}>◀</button>
          <h3>
            {new Date(
              now.getFullYear(),
              now.getMonth() + monthOffset,
              1
            ).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button onClick={() => setMonthOffset(monthOffset + 1)}>▶</button>
        </div>

        <button style={styles.addBtn} onClick={() => setShowModal(true)}>
          ➕ Add Event
        </button>
      </div>

      {/* CARDS */}
      <div style={styles.list}>
        {sortedEvents.map((e) => {
          const today = isToday(e.event_date);

          return (
            <div
              key={e.id}
              style={{
                ...styles.card,
                background: today
                  ? "linear-gradient(270deg,#FFD700,#FF69B4,#1E90FF)"
                  : getGradientColor(e.id),
              }}
            >
              {today && <div style={styles.today}>TODAY 🔥</div>}

              <h3>{e.title}</h3>
              <p>{e.description}</p>

              <p>📅 {formatDate(e.event_date)}</p>
              <p>⏰ {formatTime(e.event_date)}</p>

              <p style={styles.location} onClick={() => openMap(e.location)}>
                📍 {e.location}
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={() => handleEdit(e)}>✏️ Edit</button>
                <button onClick={() => handleDelete(e.id)}>🗑️ Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={styles.modalOverlay}
          onClick={() => {
            setShowModal(false);
            setEditEvent(null);
          }}
        >
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.title}>
              {editEvent ? "✏️ Edit Event" : "➕ Add Event"}
            </h2>

            <div style={styles.form}>
              <input id="title" style={styles.input} placeholder="Title" defaultValue={editEvent?.title || ""} />
              <input id="desc" style={styles.input} placeholder="Description" defaultValue={editEvent?.description || ""} />
              <input id="loc" style={styles.input} placeholder="Location" defaultValue={editEvent?.location || ""} />

              <div style={styles.row}>
                <input id="date" type="date" style={styles.input} defaultValue={
                  editEvent
                    ? new Date(editEvent.event_date).toISOString().split("T")[0]
                    : ""
                } />

                <input
                  type="time"
                  style={styles.input}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <div style={styles.actions}>
              <button onClick={handleSave} style={styles.saveBtn}>Save</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && <div style={styles.toast}>{toast}</div>}
    </div>
  );
}

/* ================================
   STYLES (FINAL CLEAN UI)
================================ */
const styles = {
  container: {
    padding: 30,
    minHeight: "100vh",
    background: "linear-gradient(135deg,#6A1B9A,#ADD8E6)",
    color: "#fff",
  },

  header: { marginBottom: 20 },
  nav: { display: "flex", gap: 10, alignItems: "center" },
  list: { display: "flex", flexDirection: "column", gap: 15 },

  card: {
    padding: 18,
    borderRadius: 12,
    position: "relative",
    textAlign: "center",
  },

  today: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "gold",
    color: "#000",
    padding: "4px 10px",
    borderRadius: 10,
    fontWeight: "bold",
  },

  location: {
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: "bold",
  },

  addBtn: {
    marginTop: 10,
    padding: "8px 12px",
    background: "#fff",
    color: "#000",
    borderRadius: 8,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    background: "#fff",
    padding: 22,
    borderRadius: 14,
    width: 380,
    color: "#000",
  },

  title: {
    marginBottom: 12,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  row: {
    display: "flex",
    gap: 10,
  },

  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
  },

  actions: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 15,
  },

  saveBtn: {
    background: "#6A1B9A",
    color: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    border: "none",
  },

  toast: {
    position: "fixed",
    bottom: 20,
    right: 20,
    background: "#333",
    color: "#fff",
    padding: "10px 15px",
    borderRadius: 8,
  },
};
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import AdminDashboardHeader from "../components/AdminDashboardHeader";
import { useNavigate } from "react-router-dom";
import AddEventModal from "../components/AddEventModal";
import RaisePrayerModal from "../components/RaisePrayerModal";

export default function Dashboard() {
  const { userRole } = useContext(AuthContext);

  const [stats, setStats] = useState({
    members: 0,
    events: 0,
    donations: 0,
    prayers: 0,
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBible, setLoadingBible] = useState(true);
  const [bibleVerse, setBibleVerse] = useState(null);
  const [dailyVerses, setDailyVerses] = useState([]);

  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);

  const [toast, setToast] = useState({ show: false, message: "" });

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredEvent, setHoveredEvent] = useState(null);

  const navigate = useNavigate();
  const isAdmin = userRole === "ADMIN" || userRole === "PASTOR";

  /* ================================
     TOAST
  ================================= */
  const showToast = (msg) => {
    setToast({ show: true, message: msg });

    setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 2500);
  };

  /* ================================
     MAP
  ================================= */
  const openMap = (location) => {
    window.open(
      "https://www.google.com/maps/search/?api=1&query=" +
        encodeURIComponent(location),
      "_blank"
    );
  };

  /* ================================
     COLORS
  ================================= */
  const gradientColors = [
    "#7F7FD5, #86A8E7",
    "#6A11CB, #2575FC",
    "#8E2DE2, #4A00E0",
    "#5B86E5, #36D1DC",
    "#667EEA, #764BA2",
  ];

  const getGradientColor = (idx) =>
    gradientColors[idx % gradientColors.length];

  /* ================================
     DEFAULT EVENTS
  ================================= */
  const getDynamicDefaultEvents = () => {
    const now = new Date();

    const baseMonth = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      1
    );

    const sunday = new Date(baseMonth);
    sunday.setDate(baseMonth.getDate() + ((7 - baseMonth.getDay()) % 7));

    const friday = new Date(baseMonth);
    friday.setDate(baseMonth.getDate() + ((5 - baseMonth.getDay() + 7) % 7));

    return [
      {
        id: "d1",
        title: "Sunday Worship 1",
        description: "Morning Worship at Pallamraju Nagar",
        event_date: new Date(sunday.setHours(8, 0, 0, 0)),
        location: "Pallamraju Nagar",
      },
      {
        id: "d2",
        title: "Sunday Worship 2",
        description: "Morning Worship at Indrapalem",
        event_date: new Date(sunday.setHours(11, 0, 0, 0)),
        location: "Indrapalem",
      },
      {
        id: "d3",
        title: "Sunday Worship 3",
        description: "Afternoon Worship at Lakshmi Narasarpuram",
        event_date: new Date(sunday.setHours(14, 0, 0, 0)),
        location: "Lakshmi Narasarpuram",
      },
      {
        id: "d4",
        title: "Whole Night Prayer",
        description: "Friday Prayer Night",
        event_date: new Date(friday.setHours(19, 0, 0, 0)),
        location: "Pallamraju Nagar",
      },
      {
        id: "d5",
        title: "Youth Meet",
        description: "Every 2nd & 4th Sunday evening",
        event_date: new Date(
          new Date(baseMonth).setDate(baseMonth.getDate() + 14)
        ),
        location: "Community Hall",
      },
    ];
  };

  /* ================================
     LOAD DASHBOARD
  ================================= */
  const loadDashboard = async () => {
    try {
      const [dashboardRes, eventsRes, prayersRes] = await Promise.all([
        API.get("/dashboard"),
        API.get("/events"),
        API.get("/prayers/count"),
      ]);

      setStats({
        ...dashboardRes.data,
        prayers: prayersRes.data.count,
      });

      setEvents(eventsRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadBibleDaily();
  }, []);

  const loadBibleDaily = async () => {
    try {
      const res = await API.get("/bible/daily");
      setBibleVerse(res.data.verse_of_the_day);
      setDailyVerses(res.data.verses || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingBible(false);
    }
  };

  /* ================================
     MONTH EVENTS
  ================================= */
  const getMonthlyEvents = () => {
    const all = [...getDynamicDefaultEvents(), ...events];

    const now = new Date();

    const target = new Date(
      now.getFullYear(),
      now.getMonth() + monthOffset,
      1
    );

    const start = new Date(target.getFullYear(), target.getMonth(), 1);
    const end = new Date(target.getFullYear(), target.getMonth() + 1, 0);

    return all
      .filter((e) => {
        const d = new Date(e.event_date);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
  };

  /* ================================
     DELETE EVENT
  ================================= */
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;

    try {
      await API.delete(`/events/${id}`);

      setEvents((prev) => prev.filter((e) => e.id !== id));
      showToast("🗑 Event deleted successfully");
    } catch (err) {
      showToast("❌ Delete failed");
    }
  };

  if (loading) return <h2 style={{ padding: 30 }}>Loading...</h2>;

  return (
    <div style={styles.container}>
      <AdminDashboardHeader userRole={userRole} />

      {/* TOAST */}
      {toast.show && <div style={styles.toast}>{toast.message}</div>}

      {/* STATS */}
      <div style={styles.grid}>
        {isAdmin && (
          <div style={{ ...styles.card, background: "linear-gradient(135deg,#7F7FD5,#86A8E7)", transform: hoveredCard === 'members' ? "scale(1.05)" : "scale(1)" }} onClick={() => navigate("/members")} onMouseEnter={() => setHoveredCard('members')} onMouseLeave={() => setHoveredCard(null)}>
            <h3 style={styles.cardTitle}>👥 Members</h3>
            <p style={styles.cardValue}>{stats.members}</p>
          </div>
        )}

        <div style={{ ...styles.card, background: "linear-gradient(135deg,#6A11CB,#2575FC)", transform: hoveredCard === 'events' ? "scale(1.05)" : "scale(1)" }} onClick={() => navigate("/events")} onMouseEnter={() => setHoveredCard('events')} onMouseLeave={() => setHoveredCard(null)}>
          <h3 style={styles.cardTitle}>📅 Events</h3>
          <p style={styles.cardValue}>{stats.events}</p>
        </div>

        <div style={{ ...styles.card, background: "linear-gradient(135deg,#8E2DE2,#4A00E0)", transform: hoveredCard === 'donations' ? "scale(1.05)" : "scale(1)" }} onClick={() => navigate("/donations")} onMouseEnter={() => setHoveredCard('donations')} onMouseLeave={() => setHoveredCard(null)}>
          <h3 style={styles.cardTitle}>💳 Donations</h3>
          <p style={styles.cardValue}>₹{stats.donations}</p>
        </div>

        <div style={{ ...styles.card, background: "linear-gradient(135deg,#5B86E5,#36D1DC)", transform: hoveredCard === 'prayers' ? "scale(1.05)" : "scale(1)" }} onClick={() => navigate("/prayers")} onMouseEnter={() => setHoveredCard('prayers')} onMouseLeave={() => setHoveredCard(null)}>
          <h3 style={styles.cardTitle}>🙏 Prayers</h3>
          <p style={styles.cardValue}>{stats.prayers}</p>
        </div>
      </div>

      {/* MONTH NAV */}
      <div style={styles.monthNav}>
        <button style={styles.monthNavButton} onClick={() => setMonthOffset(monthOffset - 1)}>
          ◀
        </button>
        <h3 style={styles.monthNavLabel}>
          {new Date(
            new Date().getFullYear(),
            new Date().getMonth() + monthOffset
          ).toLocaleString("default", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button style={styles.monthNavButton} onClick={() => setMonthOffset(monthOffset + 1)}>
          ▶
        </button>
      </div>

      <div style={styles.bibleSection}>
        <div style={styles.bibleHeader}>
          <div>
            <h2 style={styles.bibleTitle}>📖 Bible of the Day</h2>
            <p style={styles.bibleNote}>
              Daily verses and a quick path to the full online Bible reader.
            </p>
          </div>
          <button style={styles.openBibleButton} onClick={() => navigate("/bible")}>Open Bible Reader</button>
        </div>

        {loadingBible ? (
          <p style={styles.loadingBible}>Loading Bible devotion...</p>
        ) : (
          <div style={styles.bibleGrid}>
            {bibleVerse && (
              <div style={styles.dailyVerseCard}>
                <span style={styles.cardLabel}>Verse of the Day</span>
                <p style={styles.dailyVerseText}>{bibleVerse.text}</p>
                <p style={styles.dailyVerseRef}>{bibleVerse.reference}</p>
              </div>
            )}

            {dailyVerses.slice(0, 3).map((verse) => (
              <div key={verse.reference} style={styles.smallVerseCard}>
                <p style={styles.smallVerseText}>{verse.text}</p>
                <p style={styles.smallVerseRef}>{verse.reference}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EVENTS */}
      <h2 style={{ background: "#fff", padding: "10px 15px", borderRadius: 8, display: "inline-block", boxShadow: "0 2px 5px rgba(0,0,0,0.1)", color: "#000" }}>📅 Upcoming Events</h2>

      <div style={styles.eventSection}>
        {getMonthlyEvents().map((e, idx) => (
          <div
            key={e.id}
            style={{
              ...styles.eventCard,
              background: `linear-gradient(135deg, ${getGradientColor(idx)})`,
              transform: hoveredEvent === e.id ? "scale(1.05)" : "scale(1)",
            }}
            onMouseEnter={() => setHoveredEvent(e.id)}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <h4 style={styles.eventTitle}>{e.title}</h4>
            <p style={styles.eventDescription}>{e.description}</p>
            <p style={styles.eventMeta}>{new Date(e.event_date).toLocaleString()}</p>

            <p style={styles.location} onClick={() => openMap(e.location)}>
              📍 {e.location}
            </p>

            {isAdmin && (
              <div style={styles.adminRow}>
                <button
                  onClick={() => {
                    setEditingEvent(e);
                    setShowEventModal(true);
                  }}
                >
                  ✏️ Edit
                </button>

                <button onClick={() => handleDelete(e.id)}>
                  🗑 Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={styles.viewMoreContainer}>
        <button style={styles.viewMoreButton} onClick={() => navigate("/events")}>
          View More Events
        </button>
      </div>

      {/* QUICK ACTIONS */}
      <div style={styles.section}>
        <h3>Quick Actions</h3>

        <div style={styles.actions}>
          {isAdmin ? (
            <>
              <button style={styles.button} onClick={() => setShowEventModal(true)}>
                Add Event
              </button>
              <button style={styles.button} onClick={() => navigate("/members")}>
                View Members
              </button>
              <button style={styles.button} onClick={() => navigate("/donations")}>
                View Donations
              </button>
              <button style={styles.button} onClick={() => navigate("/bible")}>
                Open Bible Reader
              </button>
              <button style={styles.button} onClick={() => setShowPrayerModal(true)}>
                Raise Prayer Request
              </button>
              <button style={styles.button} onClick={() => navigate("/prayers")}>
                Accept Prayer Requests
              </button>
            </>
          ) : (
            <>
              <button style={styles.button} onClick={() => setShowPrayerModal(true)}>
                Raise Prayer Request
              </button>
              <button style={styles.button} onClick={() => navigate("/donations")}>
                Donate
              </button>
              <button style={styles.button} onClick={() => navigate("/bible")}>
                Open Bible Reader
              </button>
            </>
          )}
        </div>
      </div>

      {/* EVENT MODAL (CLICK OUTSIDE CLOSE FIXED INSIDE COMPONENT) */}
      {showEventModal && (
        <AddEventModal
          event={editingEvent}
          onClose={() => {
            setShowEventModal(false);
            setEditingEvent(null);
          }}
          onSave={() => {
            loadDashboard();
            setShowEventModal(false);
            setEditingEvent(null);
            showToast(editingEvent ? "✏️ Event updated" : "🎉 Event created");
          }}
        />
      )}

      {/* PRAYER MODAL */}
      {showPrayerModal && (
        <RaisePrayerModal
          onClose={() => setShowPrayerModal(false)}
          onSave={() => {
            loadDashboard();
            showToast("🙏 Prayer submitted successfully");
          }}
        />
      )}
    </div>
  );
}

/* ================================
   STYLES
================================ */
const styles = {
  container: { padding: 30, minHeight: "100vh", background: "#E6E6FA" },

  grid: { display: "flex", gap: 20, flexWrap: "wrap" },

  card: {
    flex: 1,
    padding: 20,
    color: "#fff",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
    transition: "transform 0.3s, box-shadow 0.3s",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },

  monthNav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    margin: "15px 0",
    padding: "14px 18px",
    borderRadius: 14,
    background: "linear-gradient(135deg,#5B86E5,#6A11CB,#8E2DE2)",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
  },

  monthNavButton: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background 0.2s, transform 0.2s",
  },

  monthNavLabel: {
    margin: 0,
    color: "#fff",
    fontWeight: 700,
    fontSize: "1rem",
  },

  eventSection: {
    background: "#fff",
    padding: 15,
    borderRadius: 12,
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },

  eventCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 18,
    color: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    fontSize: "14px",
    textAlign: "center",
    transition: "transform 0.3s",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    minHeight: 170,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  eventTitle: {
    fontSize: "18px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    margin: "0 0 8px",
  },

  eventDescription: {
    margin: "0 0 10px",
    opacity: 0.95,
    fontSize: "14px",
    fontStyle: "italic",
    lineHeight: 1.4,
  },

  eventMeta: {
    margin: "0 0 10px",
    fontSize: "13px",
    opacity: 0.9,
  },

  location: {
    cursor: "pointer",
    textDecoration: "underline",
    fontWeight: "bold",
  },

  adminRow: {
    marginTop: 10,
    display: "flex",
    gap: 10,
    justifyContent: "space-between",
  },

  button: {
    padding: "10px 18px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
  },

  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  viewMoreContainer: {
    textAlign: "center",
    marginTop: 10,
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: 700,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    margin: 0,
  },

  cardValue: {
    fontSize: "32px",
    fontWeight: 900,
    margin: "8px 0 0",
  },

  viewMoreButton: {
    padding: "8px 16px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
  },

  bibleSection: {
    background: "#fff",
    padding: 24,
    borderRadius: 20,
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
    marginBottom: 24,
  },

  bibleHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },

  bibleTitle: {
    margin: 0,
    fontSize: "1.45rem",
    fontWeight: 800,
    color: "#111827",
  },

  bibleNote: {
    margin: "8px 0 0",
    color: "#475569",
    maxWidth: 620,
  },

  openBibleButton: {
    padding: "12px 18px",
    background: "linear-gradient(135deg, #7F7FD5, #86A8E7)",
    border: "none",
    borderRadius: 14,
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },

  bibleGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr 1fr",
    gap: 18,
  },

  dailyVerseCard: {
    background: "linear-gradient(135deg, #8C46FF, #4A64E8)",
    color: "#fff",
    borderRadius: 20,
    padding: 24,
    minHeight: 220,
    boxShadow: "0 16px 35px rgba(74, 71, 128, 0.16)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  cardLabel: {
    display: "inline-block",
    marginBottom: 16,
    fontSize: "0.85rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    opacity: 0.9,
  },

  dailyVerseText: {
    margin: 0,
    fontSize: "1.05rem",
    lineHeight: 1.75,
    fontWeight: 600,
    letterSpacing: "0.01em",
  },

  dailyVerseRef: {
    marginTop: 18,
    color: "#EDEBFF",
    fontWeight: 700,
  },

  smallVerseCard: {
    background: "#F8FAFC",
    borderRadius: 18,
    padding: 18,
    border: "1px solid #E2E8F0",
    minHeight: 220,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },

  smallVerseText: {
    margin: 0,
    color: "#0F172A",
    lineHeight: 1.7,
    fontSize: "0.98rem",
  },

  smallVerseRef: {
    marginTop: 18,
    color: "#4F46E5",
    fontWeight: 700,
  },

  loadingBible: {
    color: "#475569",
    fontStyle: "italic",
  },

  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    background: "#000",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 10,
    zIndex: 9999,
  },
};
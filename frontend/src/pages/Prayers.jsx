import { useEffect, useState, useContext } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Prayers() {
  const { userRole, userId } = useContext(AuthContext);

  const [prayers, setPrayers] = useState([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: toast message state
  const [message, setMessage] = useState("");

  const isAdmin =
    userRole === "ADMIN" || userRole === "PASTOR";

  const commonPrayers = [
    {
      id: "c1",
      name: "Common Prayer",
      request: "Pray for peace 🇮🇳",
      is_approved: true,
    },
    {
      id: "c2",
      name: "Common Prayer",
      request: "Pray for church growth 🙏",
      is_approved: true,
    },
    {
      id: "c3",
      name: "Common Prayer",
      request: "Pray for families 👨‍👩‍👧‍👦",
      is_approved: true,
    },
  ];

  const loadPrayers = async () => {
    if (!userRole) return;

    const admin =
      userRole === "ADMIN" || userRole === "PASTOR";

    const url = admin ? "/prayers/admin" : "/prayers";

    try {
      const res = await API.get(url);
      setPrayers([...commonPrayers, ...res.data]);
    } catch (err) {
      console.error("Failed to load prayers:", err);
    }
  };

  useEffect(() => {
    loadPrayers();
  }, [userRole]);

  const submitPrayer = async () => {
    if (!text.trim()) return alert("Write your prayer 🙏");

    setLoading(true);

    try {
      await API.post("/prayers", {
        name,
        request: text,
      });

      // ✅ Success message
      setMessage(
        isAdmin
          ? "✅ Prayer added successfully"
          : "🙏 Your prayer request has been submitted!"
      );

      setName("");
      setText("");
      setOpen(false);

      loadPrayers();

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);

      // ❌ Error message
      setMessage("❌ Failed to submit prayer");
      setTimeout(() => setMessage(""), 3000);
    }

    setLoading(false);
  };

  const approvePrayer = async (id) => {
    await API.put(`/prayers/${id}/approve`);
    setMessage("✅ Prayer approved");
    setTimeout(() => setMessage(""), 3000);
    loadPrayers();
  };

  const editPrayer = async (p) => {
    const newName = prompt("Edit name:", p.name);
    const newText = prompt("Edit prayer:", p.request);

    if (!newText) return;

    await API.put(`/prayers/${p.id}`, {
      name: newName,
      request: newText,
    });

    setMessage("✏️ Prayer updated");
    setTimeout(() => setMessage(""), 3000);

    loadPrayers();
  };

  const deletePrayer = async (id) => {
    if (!window.confirm("Delete this prayer?")) return;

    await API.delete(`/prayers/${id}`);

    setMessage("🗑️ Prayer deleted");
    setTimeout(() => setMessage(""), 3000);

    loadPrayers();
  };

  const canModify = (p) => {
    if (p.id?.startsWith("c")) return false;
    return isAdmin || p.user_id === userId;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🙏 Prayer Requests</h2>

      {/* ✅ TOAST MESSAGE */}
      {message && (
        <div style={styles.toast}>
          {message}
        </div>
      )}

      <button
        style={styles.openBtn}
        onClick={() => setOpen(true)}
      >
        + Raise Prayer Request
      </button>

      {/* MODAL */}
      {open && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              Share Your Prayer
            </h3>

            <input
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
            />

            <textarea
              placeholder="Write your prayer..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={styles.textarea}
            />

            <div style={styles.btnRow}>
              <button
                onClick={() => setOpen(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>

              <button
                onClick={submitPrayer}
                style={styles.saveBtn}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRAYER LIST */}
      <div style={styles.grid}>
        {prayers.map((p, idx) => {
          const approved = p.is_approved;

          return (
            <div
              key={p.id}
              style={{
                ...styles.card,
                background:
                  gradients[idx % gradients.length],
                border: approved
                  ? "3px solid #00e676"
                  : "none",
                boxShadow: approved
                  ? "0 0 15px rgba(0,255,100,0.5)"
                  : "0 4px 10px rgba(0,0,0,0.2)",
                opacity: approved ? 1 : 0.85,
              }}
            >
              {approved && (
                <div style={styles.tick}>
                  ✔ Approved
                </div>
              )}

              <h4>{p.name || "Anonymous"}</h4>
              <p>{p.request}</p>

              {isAdmin && !approved && (
                <button
                  onClick={() =>
                    approvePrayer(p.id)
                  }
                  style={styles.approveBtn}
                >
                  Approve ✓
                </button>
              )}

              {canModify(p) && (
                <div style={styles.actions}>
                  <button
                    onClick={() => editPrayer(p)}
                    style={styles.editBtn}
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() =>
                      deletePrayer(p.id)
                    }
                    style={styles.deleteBtn}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const gradients = [
  "linear-gradient(135deg, #6A1B9A, #9C27B0)",
  "linear-gradient(135deg, #4D96FF, #6BCB77)",
  "linear-gradient(135deg, #FF6B6B, #FFD93D)",
  "linear-gradient(135deg, #FF9800, #FFC107)",
];

const styles = {
  container: {
    padding: 30,
    minHeight: "100vh",
    background: "linear-gradient(135deg, #E6E6FA, #ADD8E6)",
  },
  title: { color: "#6A1B9A" },

  toast: {
    position: "fixed",
    top: 20,
    right: 20,
    background: "#4CAF50",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    zIndex: 9999,
  },

  openBtn: {
    padding: "10px 16px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    marginBottom: 20,
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    background: "#fff",
    padding: 25,
    borderRadius: 12,
    width: 400,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  modalTitle: { color: "#6A1B9A" },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ccc",
  },
  textarea: {
    padding: 10,
    minHeight: 100,
    borderRadius: 8,
  },
  btnRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    padding: "8px 14px",
    background: "#ccc",
    border: "none",
  },
  saveBtn: {
    padding: "8px 14px",
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
  },
  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 15,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    color: "#fff",
    position: "relative",
  },
  tick: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "#00e676",
    color: "#000",
    padding: "3px 8px",
    borderRadius: 8,
    fontSize: 12,
    fontWeight: "bold",
  },
  approveBtn: {
    marginTop: 10,
    background: "#00c853",
    color: "#fff",
    border: "none",
    padding: "5px 10px",
    borderRadius: 6,
    cursor: "pointer",
  },
  actions: {
    marginTop: 10,
    display: "flex",
    gap: 8,
  },
  editBtn: {
    background: "#1976D2",
    border: "none",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: 6,
  },
  deleteBtn: {
    background: "#D32F2F",
    border: "none",
    color: "#fff",
    padding: "5px 10px",
    borderRadius: 6,
  },
};
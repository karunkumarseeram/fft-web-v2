import React, { useEffect, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";

import {
  getAllFeedback,
  replyFeedback,
  updateFeedbackStatus,
  deleteFeedback,
} from "../services/feedbackApi";

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  // ================= FETCH FEEDBACKS =================
  const fetchFeedbacks = async () => {
    try {
      setLoading(true);

      const res = await getAllFeedback(0, 50, statusFilter);

      console.log("API RESPONSE:", res);

      setFeedbacks(res?.items || []);
    } catch (err) {
      console.error(err);
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [statusFilter]);

  // ================= REPLY =================
  const handleReply = async (id) => {
    try {
      await replyFeedback(id, {
        admin_reply: replyText[id],
      });

      setReplyText((prev) => ({ ...prev, [id]: "" }));
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= STATUS UPDATE =================
  const handleStatus = async (id, status) => {
    try {
      await updateFeedbackStatus(id, status);
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    try {
      await deleteFeedback(id);
      fetchFeedbacks();
    } catch (err) {
      console.error(err);
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

        <h1 style={{ margin: 0 }}>Admin Feedback Dashboard</h1>
      </div>

      {/* ================= FILTER ================= */}
      <div style={styles.filterRow}>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.select}
        >
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="REVIEWED">Reviewed</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* ================= LIST ================= */}
      {loading ? (
        <p>Loading...</p>
      ) : feedbacks.length === 0 ? (
        <p>No feedback found</p>
      ) : (
        feedbacks.map((fb) => (
          <div key={fb.id} style={styles.card}>
            <h3>{fb.subject}</h3>

            <p>
              <b>User:</b> {fb.name} ({fb.email})
            </p>

            <p>{fb.message}</p>

            <div style={styles.row}>
              <span>⭐ {fb.rating}</span>
              <span>Status: {fb.status}</span>
            </div>

            {/* STATUS BUTTONS */}
            <div style={styles.actions}>
              <button onClick={() => handleStatus(fb.id, "PENDING")}>
                Pending
              </button>
              <button onClick={() => handleStatus(fb.id, "REVIEWED")}>
                Reviewed
              </button>
              <button onClick={() => handleStatus(fb.id, "RESOLVED")}>
                Resolved
              </button>
              <button onClick={() => handleDelete(fb.id)} style={styles.delete}>
                Delete
              </button>
            </div>

            {/* REPLY BOX */}
            <div style={styles.replyBox}>
              <textarea
                placeholder="Write admin reply..."
                value={replyText[fb.id] || ""}
                onChange={(e) =>
                  setReplyText((prev) => ({
                    ...prev,
                    [fb.id]: e.target.value,
                  }))
                }
                style={styles.textarea}
              />

              <button onClick={() => handleReply(fb.id)}>
                Send Reply
              </button>
            </div>

            {/* EXISTING REPLY */}
            {fb.admin_reply && (
              <div style={styles.existingReply}>
                <strong>Admin Reply:</strong>
                <p>{fb.admin_reply}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

// ================= STYLES =================
const styles = {
  container: {
    padding: "20px",
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

  filterRow: {
    marginBottom: "20px",
  },

  select: {
    padding: "8px",
  },

  card: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },

  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  delete: {
    background: "red",
    color: "white",
  },

  replyBox: {
    marginTop: "10px",
  },

  textarea: {
    width: "100%",
    minHeight: "60px",
    marginBottom: "5px",
  },

  existingReply: {
    marginTop: "10px",
    background: "#f5f5f5",
    padding: "10px",
    borderRadius: "8px",
  },
};

export default AdminFeedback;
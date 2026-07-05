import React, { useEffect, useState } from "react";
import FeedbackForm from "../components/FeedbackForm";
import { getMyFeedback } from "../services/feedbackApi";

const Feedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await getMyFeedback();
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  return (
    <div style={styles.container}>
      <h1>User Feedback</h1>

      {/* FORM */}
      <FeedbackForm />

      {/* LIST */}
      <div style={styles.listContainer}>
        <h2>Your Feedback History</h2>

        {loading ? (
          <p>Loading...</p>
        ) : feedbacks.length === 0 ? (
          <p>No feedback submitted yet.</p>
        ) : (
          feedbacks.map((fb) => (
            <div key={fb.id} style={styles.card}>
              <h3>{fb.subject}</h3>
              <p>{fb.message}</p>

              <div style={styles.row}>
                <span>⭐ {fb.rating}</span>
                <span>Status: {fb.status}</span>
              </div>

              {fb.admin_reply && (
                <div style={styles.reply}>
                  <strong>Admin Reply:</strong>
                  <p>{fb.admin_reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "800px",
    margin: "auto",
    padding: "20px",
  },
  listContainer: {
    marginTop: "40px",
  },
  card: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "10px",
    marginBottom: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  reply: {
    marginTop: "10px",
    padding: "10px",
    background: "#f5f5f5",
    borderRadius: "8px",
  },
};

export default Feedback;
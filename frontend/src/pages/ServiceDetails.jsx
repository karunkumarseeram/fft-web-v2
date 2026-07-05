import { useParams, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ServiceDetails() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🔐 Show message instead of redirect
  if (!token) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <h3>Please login to view this service 🙏</h3>
        <button onClick={() => navigate("/")}>Go to Login</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>🙏 Service Details #{id}</h2>
        <p>Welcome! You are now viewing full service content.</p>

        <div style={styles.contentBox}>
          <h3>Sunday Worship</h3>
          <p>
            Join us every Sunday at 9:00 AM for a powerful time of worship,
            prayer, and Word of God.
          </p>

          <h3>Location</h3>
          <p>FFT Faith Fellowship Temple</p>

          <h3>Pastor Message</h3>
          <p>"HIM We Proclaim" — Growing together in Christ 🙏</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    padding: 40,
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  card: {
    width: 500,
    padding: 30,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },
  contentBox: {
    marginTop: 20,
    padding: 15,
    background: "#fafafa",
    borderRadius: 8,
  },
};
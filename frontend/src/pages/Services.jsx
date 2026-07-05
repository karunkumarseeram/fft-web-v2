import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Services() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const services = [
    { id: 1, title: "Sunday Worship", short: "Join our Sunday service" },
    { id: 2, title: "Prayer Meeting", short: "Weekly prayer gathering" },
    { id: 3, title: "Youth Fellowship", short: "Youth spiritual growth" },
  ];

  const handleClick = (id) => {
    if (!token) {
      navigate("/login"); // 🔐 redirect if not logged in
    } else {
      navigate(`/services/${id}`);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Church Services</h2>

      <div style={styles.grid}>
        {services.map((s) => (
          <div key={s.id} style={styles.card} onClick={() => handleClick(s.id)}>
            <h3>{s.title}</h3>
            <p>{s.short}</p>
            <button style={styles.button}>View More</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 40,
    textAlign: "center",
  },
  grid: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  card: {
    width: 250,
    padding: 20,
    borderRadius: 10,
    background: "#fff",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    cursor: "pointer",
  },
  button: {
    marginTop: 10,
    padding: 8,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
  },
};
// src/pages/PrayerRequests.jsx
import { useEffect, useState } from "react";
import API from "../services/api";
import RaisePrayerModal from "../components/RaisePrayerModal";

export default function PrayerRequests() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Default common prayers
  const defaultPrayers = [
    { id: "c1", name: "Common Prayer", message: "Prayer for India" },
    { id: "c2", name: "Common Prayer", message: "Prayer for World Salvation" },
  ];

  const loadPrayers = async () => {
    try {
      const res = await API.get("/prayers");
      setPrayers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrayers(); }, []);

  if (loading) return <h2 style={{padding:30}}>Loading prayers...</h2>;

  return (
    <div style={styles.container}>
      <h2>🙏 Prayer Requests</h2>

      <div style={styles.list}>
        {[...defaultPrayers, ...prayers].map((p) => (
          <div key={p.id} style={styles.card}>
            <p style={styles.name}><strong>{p.name}</strong></p>
            <p style={styles.message}>{p.message}</p>
          </div>
        ))}
      </div>

      {/* Floating + button */}
      <button style={styles.addBtn} onClick={() => setShowModal(true)}>+</button>

      {showModal && (
        <RaisePrayerModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); loadPrayers(); }}
        />
      )}
    </div>
  );
}

const styles = {
  container: { padding: 30, minHeight: "100vh", position: "relative", background: "#f0f0f5" },
  list: { display: "flex", flexDirection: "column", gap: 12, marginTop: 20 },
  card: { padding: 20, borderRadius: 10, background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" },
  name: { margin: 0, fontWeight: "bold", color: "#6A1B9A" },
  message: { margin: "6px 0 0 0" },
  addBtn: {
    position: "fixed", bottom: 30, right: 30, width: 60, height: 60, borderRadius: "50%",
    background: "#6A1B9A", color: "#fff", fontSize: 32, border: "none", cursor: "pointer",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
  }
};
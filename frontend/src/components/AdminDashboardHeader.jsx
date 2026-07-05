import { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboardHeader({ userRole }) {
  const { token } = useContext(AuthContext);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load pending users (first time admin login)
  const loadPending = async () => {
    if (!token || userRole !== "ADMIN") return;
    try {
      const res = await API.get("/admin/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ⚠ Adjusted for API returning raw array
      if (Array.isArray(res.data)) {
        setPendingUsers(res.data);
      } else if (res.data.members) {
        setPendingUsers(res.data.members);
      } else {
        setPendingUsers([]);
      }
    } catch (err) {
      console.error("Failed to load pending users:", err);
      setPendingUsers([]);
    }
  };

  useEffect(() => {
    if (!token || userRole !== "ADMIN") return;
    loadPending();
  }, [token, userRole]);

  const handleAction = async (userId, action) => {
    try {
      await API.put(`/admin/members/${userId}/${action}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadPending(); // refresh after action
    } catch (err) {
      console.error(`Failed to ${action} user:`, err);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dashboardTitle =
    userRole === "ADMIN" || userRole === "PASTOR"
      ? "Admin Dashboard"
      : "Member Dashboard";

  return (
    <div style={styles.header}>
      {/* Gradient thick title banner */}
      <h2 style={styles.title}>{dashboardTitle}</h2>

      {/* Notification bell for admin */}
      {userRole === "ADMIN" && (
        <div ref={dropdownRef} style={styles.bellWrapper}>
          <div
            onClick={() => setShowDropdown((prev) => !prev)}
            style={styles.bellIcon}
            title="Pending Approvals"
          >
            🔔
            {pendingUsers.length > 0 && (
              <span style={styles.badge}>{pendingUsers.length}</span>
            )}
          </div>

          {/* Dropdown panel */}
          {showDropdown && pendingUsers.length > 0 && (
            <div style={styles.dropdown}>
              {pendingUsers.slice(0, 5).map((user) => (
                <div
                  key={user.id}
                  style={styles.userRow}
                  title={user.email}
                >
                  <span>{user.name}</span>
                  <div>
                    <button
                      style={styles.approveBtn}
                      onClick={() => handleAction(user.id, "approve")}
                      title="Approve user"
                    >
                      ✅
                    </button>
                    <button
                      style={styles.revokeBtn}
                      onClick={() => handleAction(user.id, "revoke")}
                      title="Reject user"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}

              {pendingUsers.length > 5 && (
                <div
                  style={styles.viewMore}
                  onClick={() => navigate("/members")}
                >
                  View More...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    background: "linear-gradient(90deg, #6A5ACD, #B3C6FF, #E6E6FA)",
    borderRadius: 10,
    color: "#fff",
    fontFamily: "'Cinzel', serif",
    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
  },

  title: {
    fontSize: "2rem",
    fontWeight: 700,
    textShadow: "0 0 12px rgba(0,0,0,0.3)",
  },

  bellWrapper: {
    position: "relative",
  },

  bellIcon: {
    cursor: "pointer",
    fontSize: 28,
    color: "#fff",
    position: "relative",
    userSelect: "none",
    textShadow: "0 0 6px rgba(255,255,255,0.8)",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    background: "red",
    borderRadius: "50%",
    padding: "3px 7px",
    fontSize: 12,
    fontWeight: "bold",
    color: "#fff",
  },

  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 320,
    maxHeight: 300,
    overflowY: "auto",
    background: "#fff",
    color: "#000",
    borderRadius: 10,
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    zIndex: 1000,
    padding: 10,
  },

  userRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 5px",
    borderBottom: "1px solid #eee",
  },

  approveBtn: {
    marginRight: 5,
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "2px 6px",
  },

  revokeBtn: {
    background: "red",
    color: "#fff",
    border: "none",
    borderRadius: 4,
    cursor: "pointer",
    padding: "2px 6px",
  },

  viewMore: {
    textAlign: "center",
    marginTop: 5,
    color: "#6A5ACD",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
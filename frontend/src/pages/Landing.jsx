import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const [showPopup, setShowPopup] = useState(false);

  /* PREMIUM BUTTON HOVER */
  const [hoveredBtn, setHoveredBtn] = useState(false);

  /* CTA BUTTON HOVER */
  const [hoveredCTA, setHoveredCTA] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <div style={mainContainer}>

        {/* TOP RIGHT BUTTON */}
        <div style={topRight}>
          {isAuthenticated ? (
            <button
              style={{
                ...btnPurple,

                transform: hoveredBtn
                  ? "translateY(-4px) scale(1.05)"
                  : "translateY(0)",

                boxShadow: hoveredBtn
                  ? "0 18px 35px rgba(54,209,220,0.6), inset 0 1px 1px rgba(255,255,255,0.4)"
                  : "0 10px 25px rgba(54,209,220,0.35), inset 0 1px 1px rgba(255,255,255,0.3)",
              }}
              onMouseEnter={() => setHoveredBtn(true)}
              onMouseLeave={() => setHoveredBtn(false)}
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Logout
            </button>
          ) : (
            <button
  style={{
    ...btnBlue,

    transform: hoveredBtn
      ? "translateY(-4px) scale(1.05)"
      : "translateY(0) scale(1)",

    boxShadow: hoveredBtn
      ? "0 18px 35px rgba(253,29,29,0.45), 0 0 18px rgba(252,176,69,0.35)"
      : "0 10px 22px rgba(131,58,180,0.35), inset 0 1px 1px rgba(255,255,255,0.25)",

    filter: hoveredBtn
      ? "brightness(1.08)"
      : "brightness(1)",
  }}
  onMouseEnter={() => setHoveredBtn(true)}
  onMouseLeave={() => setHoveredBtn(false)}
>
  Login
</button>
          )}
        </div>

        {/* HERO SECTION */}
        <div style={heroWrapper}>

          <div style={heroCard}>
            <h1 style={title}>
              Welcome to <br /> Faith Fellowship Temple
            </h1>

            <p style={subtitle}>HIM We Proclaim 🙏</p>

            <div style={divider} />

            <p style={verse}>
              "The Lord is my shepherd; I shall not want." — Psalm 23:1
            </p>

            {!isAuthenticated && (
              <div style={loginNote}>
                Please login to access all features
              </div>
            )}
          </div>

          {/* EVENTS TITLE */}
          <div style={eventBadge}>
            <h2 style={eventTitle}>Upcoming Events</h2>
          </div>

        </div>

        {/* EVENTS SECTION PLACEHOLDER */}
        <div style={{ marginTop: 30 }}>
          <div style={!isAuthenticated ? blurStyle : {}}>
            <h3 style={{ textAlign: "center", color: "#fff" }}>
              Events will load here...
            </h3>
          </div>
        </div>

        {/* BIBLE POPUP */}
        {showPopup && !isAuthenticated && (
          <div style={overlay}>
            <div style={modal}>

              <button
                onClick={() => setShowPopup(false)}
                style={closeBtn}
              >
                ✖
              </button>

              <h2 style={{ color: "#4A148C" }}>
                📖 Word of God
              </h2>

              <p style={versePopup}>
                “For I know the plans I have for you,” declares the Lord,
                “plans to prosper you and not to harm you, plans to give you hope and a future.”
              </p>

              <p style={{ fontWeight: "bold" }}>
                — Jeremiah 29:11
              </p>

              <button
                style={{
                  ...ctaBtn,

                  transform: hoveredCTA
                    ? "translateY(-3px) scale(1.04)"
                    : "translateY(0)",

                  boxShadow: hoveredCTA
                    ? "0 14px 30px rgba(127,127,213,0.55)"
                    : "0 8px 20px rgba(127,127,213,0.35)",
                }}
                onMouseEnter={() => setHoveredCTA(true)}
                onMouseLeave={() => setHoveredCTA(false)}
                onClick={() => {
                  setShowPopup(false);
                  navigate("/login");
                }}
              >
                ✨ Login to Continue
              </button>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* =========================
   STYLES
========================= */

const mainContainer = {
  flex: 1,
  position: "relative",
  padding: 20,

  backgroundImage: `
    linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)),
    url("/church.png")
  `,

  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
};

const topRight = {
  position: "absolute",
  top: 20,
  right: 20,
  zIndex: 10,
};

/* PREMIUM GLASS BUTTON */
const btnPurple = {
  padding: "12px 24px",

  background:
    "linear-gradient(145deg, rgba(127,127,213,0.95), rgba(91,134,229,0.95), rgba(54,209,220,0.95))",

  color: "#F8FAFC",

  border: "1px solid rgba(255,255,255,0.25)",

  borderRadius: 14,

  cursor: "pointer",

  fontWeight: "700",

  letterSpacing: "0.5px",

  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",

  transition: "all 0.3s ease",

  position: "relative",

  overflow: "hidden",
};

const btnBlue = {
  padding: "12px 24px",

  background:
    "linear-gradient(145deg, rgba(131,58,180,0.95), rgba(253,29,29,0.9), rgba(252,176,69,0.9))",

  color: "#fff",

  border: "1px solid rgba(255,255,255,0.2)",

  borderRadius: 14,

  cursor: "pointer",

  fontWeight: "800",

  fontFamily: "'Cinzel', serif",
letterSpacing: "1.5px",
textTransform: "uppercase",
fontWeight: "900",

  backdropFilter: "blur(10px)",

  boxShadow: "0 10px 22px rgba(131,58,180,0.35)",

  transition: "all 0.3s ease",
  textShadow: "0 2px 10px rgba(0,0,0,0.3)"
};

const heroWrapper = {
  marginTop: 100,
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 25,
};

/* HERO CARD */
const heroCard = {
  width: "80%",
  maxWidth: 750,

  padding: "45px 35px",

  borderRadius: 24,

  background:
    "linear-gradient(135deg, rgba(35,37,38,0.88), rgba(65,67,69,0.88))",

  backdropFilter: "blur(12px)",

  border: "1px solid rgba(255,255,255,0.12)",

  boxShadow:
    "0 20px 45px rgba(0,0,0,0.45)",

  color: "#fff",
};

const title = {
  fontSize: "2.7rem",
  fontFamily: "'Cinzel', serif",
  margin: 0,
  fontWeight: 800,
};

const subtitle = {
  marginTop: 12,
  fontStyle: "italic",
  opacity: 0.9,
  fontSize: "1.1rem",
};

const divider = {
  width: 80,
  height: 4,
  background:
    "linear-gradient(90deg,#FFD700,#FFB300)",

  margin: "18px auto",

  borderRadius: 999,
};

const verse = {
  fontStyle: "italic",
  marginTop: 18,
  lineHeight: 1.8,
  opacity: 0.92,
  fontSize: "1.05rem",
};

const loginNote = {
  marginTop: 22,

  padding: 12,

  background: "rgba(255,255,255,0.12)",

  borderRadius: 12,

  backdropFilter: "blur(10px)",

  border: "1px solid rgba(255,255,255,0.15)",
};

const eventBadge = {
  padding: "12px 28px",

  borderRadius: 16,

  background:
    "linear-gradient(135deg,#FFD700,#FFB300)",

  boxShadow:
    "0 10px 25px rgba(255,179,0,0.35)",
};

const eventTitle = {
  margin: 0,
  color: "#222",
  fontWeight: 800,
};

const blurStyle = {
  filter: "blur(3px)",
  pointerEvents: "none",
};

const overlay = {
  position: "fixed",
  inset: 0,

  background: "rgba(0,0,0,0.65)",

  backdropFilter: "blur(6px)",

  display: "flex",
  justifyContent: "center",
  alignItems: "center",

  zIndex: 9999,
};

/* GLASS MODAL */
const modal = {
  width: 420,

  background:
    "linear-gradient(135deg, rgba(217,175,217,0.95), rgba(151,217,225,0.95))",

  backdropFilter: "blur(14px)",

  padding: 30,

  borderRadius: 22,

  textAlign: "center",

  position: "relative",

  border: "1px solid rgba(255,255,255,0.35)",

  boxShadow:
    "0 20px 45px rgba(0,0,0,0.35)",
};

const closeBtn = {
  position: "absolute",
  top: 12,
  right: 14,

  border: "none",

  background: "transparent",

  fontSize: 20,

  cursor: "pointer",

  color: "#333",
};

const versePopup = {
  fontStyle: "italic",
  lineHeight: 1.8,
  color: "#222",
};

/* CTA GLASS BUTTON */
const ctaBtn = {
  marginTop: 18,

  padding: "12px 22px",

  background:
    "linear-gradient(145deg, rgba(127,127,213,0.95), rgba(91,134,229,0.95), rgba(54,209,220,0.95))",

  color: "#fff",

  border: "1px solid rgba(255,255,255,0.25)",

  borderRadius: 14,

  cursor: "pointer",

  fontWeight: "700",

  letterSpacing: "0.5px",

  backdropFilter: "blur(12px)",

  transition: "all 0.3s ease",
};
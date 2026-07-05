import { useState, useContext, useRef } from "react";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);
  const [loginMode, setLoginMode] = useState("otp"); // otp | password

  const inputsRef = useRef([]);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ================= OTP FLOW =================

  const sendOtp = async () => {
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    try {
      await API.post("/auth/send-otp", { email });
      setStep(2);
      setError("");
      startTimer();
    } catch {
      setError("Failed to send OTP");
    }
  };

  const startTimer = () => {
    setTimer(30);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const resendOtp = async () => {
    if (timer > 0) return;

    try {
      await API.post("/auth/send-otp", { email });
      setError("");
      startTimer();
    } catch {
      setError("Failed to resend OTP");
    }
  };

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasteData)) return;

    const newOtp = pasteData.split("");
    setOtp(newOtp);

    newOtp.forEach((digit, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = digit;
      }
    });
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== 6) {
      setError("Enter complete OTP");
      return;
    }

    try {
      const res = await API.post("/auth/verify-otp", {
        email,
        otp: finalOtp,
      });

      login(res.data.access_token);
      navigate("/dashboard");
    } catch {
      setError("Invalid OTP");
    }
  };

  // ================= PASSWORD LOGIN =================

  const loginWithPassword = async () => {
    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      login(res.data.access_token);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    }
  };

  // ================= UI =================

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <img src="/fft_logo.png" alt="fft_logo" style={styles.logo} />
        <h2 style={styles.title}>FFT</h2>
        <p style={styles.subtitle}>HIM We Proclaim 🙏</p>

        {error && <p style={styles.error}>{error}</p>}

        {/* TOGGLE */}
        <div style={styles.toggleContainer}>
          <button
            style={{
              ...styles.toggleButton,
              background: loginMode === "otp" ? "#6A1B9A" : "#ccc",
            }}
            onClick={() => {
              setLoginMode("otp");
              setStep(1);
              setError("");
            }}
          >
            OTP Login
          </button>

          <button
            style={{
              ...styles.toggleButton,
              background: loginMode === "password" ? "#6A1B9A" : "#ccc",
            }}
            onClick={() => {
              setLoginMode("password");
              setStep(1);
              setError("");
            }}
          >
            Password Login
          </button>
        </div>

        {/* STEP 1 */}
{step === 1 && (
  <>
    <input
      style={{ ...styles.input, textAlign: "left" }} // always left-aligned
      placeholder="Enter Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    {loginMode === "password" && (
      <input
        style={{ ...styles.input, textAlign: "left" }}
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
    )}

    {loginMode === "otp" ? (
      <button style={styles.button} onClick={sendOtp}>
        Send OTP
      </button>
    ) : (
      <button style={styles.button} onClick={loginWithPassword}>
        Login
      </button>
    )}
  </>
)}

        {/* STEP 2 (OTP) */}
        {loginMode === "otp" && step === 2 && (
          <>
            <div style={styles.otpContainer} onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  style={styles.otpInput}
                  value={digit}
                  ref={(el) => (inputsRef.current[index] = el)}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>

            <button style={styles.button} onClick={verifyOtp}>
              Verify & Login
            </button>

            <p
              style={{
                ...styles.link,
                opacity: timer > 0 ? 0.5 : 1,
                cursor: timer > 0 ? "not-allowed" : "pointer",
              }}
              onClick={resendOtp}
            >
              {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </p>
          </>
        )}

        {/* LINKS */}
        <div style={styles.links}>
          <p style={styles.link} onClick={() => navigate("/signup")}>
            New Member? Signup
          </p>

          <p style={styles.link} onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </p>
        </div>
      </div>
    </div>
  );
}

// ================= STYLES =================

// ================= STYLES =================

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundImage: `
      linear-gradient(135deg, rgba(106,27,154,0.7), rgba(135,206,235,0.7)), 
      url('/bg-login.png')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  card: {
    padding: 40,
    width: 360,
    textAlign: "center",
    background: "rgba(255,255,255,0.95)",
    borderRadius: 20, // smoother card corners
    boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
  },
  logo: { width: 100, marginBottom: 10 },
  title: { color: "#6A1B9A", fontSize: 28, marginBottom: 5 },
  subtitle: {
  fontSize: 14,
  marginBottom: 20,
  color: "#6A1B9A",   // 👈 FIXED: strong purple for visibility
  fontWeight: "600",
  letterSpacing: "1px",
},

  input: {
    width: "100%",
    padding: 14,
    margin: "10px 0",
    borderRadius: 12, // rounded edges
    border: "1px solid #ccc",
    fontSize: 16,
    boxSizing: "border-box",
    textAlign: "left",
    outline: "none",
    transition: "0.2s",
  },

  button: {
    width: "100%",
    padding: 14,
    background: "#6A1B9A",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 16,
    marginTop: 10,
    transition: "0.2s",
  },

  toggleContainer: {
    display: "flex",
    gap: 10,
    marginBottom: 15,
  },

  toggleButton: {
    flex: 1,
    padding: 12,
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    color: "#fff",
    fontSize: 14,
    transition: "0.2s",
  },

  otpContainer: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    margin: "20px 0",
  },

  otpInput: {
    width: 50,
    height: 50,
    textAlign: "center",
    fontSize: 20,
    borderRadius: 12, // rounded OTP boxes
    border: "1px solid #ccc",
    outline: "none",
    transition: "0.2s",
  },

  link: {
    color: "#6A1B9A",
    cursor: "pointer",
    fontSize: 14,
    marginTop: 10,
  },

  links: {
    marginTop: 20,
  },

  error: {
    color: "red",
    fontSize: 13,
    marginBottom: 10,
  },
};
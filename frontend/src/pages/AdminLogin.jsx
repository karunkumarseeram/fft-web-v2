// pages/AdminLogin.jsx
import { useState } from "react";
import API from "../services/api";
import "../index.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const sendOtp = async () => {
    await API.post("/auth/admin-otp", { email });
    setStep(2);
  };

  const verify = async () => {
    await API.post("/auth/admin-verify", { email, otp });
    alert("Admin Logged In");
  };

  return (
    <div className="container">
      <div className="left-panel"></div>

      <div className="right-panel">
        <div className="card">
          <h2 className="title">Admin Login (MFA)</h2>

          {step === 1 && (
            <>
              <input className="input" placeholder="Admin Email"
                onChange={(e)=>setEmail(e.target.value)} />
              <button className="button" onClick={sendOtp}>
                Send OTP
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <input className="input" placeholder="OTP"
                onChange={(e)=>setOtp(e.target.value)} />
              <button className="button" onClick={verify}>
                Verify
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
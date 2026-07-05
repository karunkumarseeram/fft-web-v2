import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext, useMemo, useState } from "react";
import { AuthProvider, AuthContext } from "./context/AuthContext";

import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import Landing from "./pages/Landing"; // Import your Landing Page
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Events from "./pages/Events";
import Donations from "./pages/Donations";
import Live from "./pages/Live";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import AddEvent from "./pages/AddEvent";
import Bible from "./pages/Bible";
import BibleVerseManager from "./pages/BibleVerseManager";
import Scanner from "./pages/Scanner";
import Layout from "./components/Layout";
import Prayers from "./pages/Prayers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import Feedback from "./pages/Feedback";
import AdminFeedback from "./pages/AdminFeedback";
function PrivateRoute({ children, allowedRoles = [] }) {
  const { token, userRole } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div style={{ padding: 30, color: "#6A1B9A", fontWeight: "bold" }}>
        Access Denied. You do not have the required permissions.
      </div>
    );
  }

  return children;
}

function PublicRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  const [mode, setMode] = useState("dark");

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: {
                  default: "#0f172a",
                  paper: "#1e293b",
                },
              }
            : {
                background: {
                  default: "#f9fafb",
                  paper: "#ffffff",
                },
              }),
        },
        typography: {
          fontFamily: "'Poppins', sans-serif",
        },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* 🌟 New Default Landing Page */}
            <Route path="/" element={<Landing />} />

            {/* Public Routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/services" element={<Services />} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

            {/* Protected Routes */}
            <Route
              path="/services/:id"
              element={
                <PrivateRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <ServiceDetails />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/members"
              element={
                <PrivateRoute allowedRoles={["ADMIN"]}>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Members />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/events"
              element={
                <PrivateRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Events />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/add-event"
              element={
                <PrivateRoute allowedRoles={["ADMIN", "PASTOR"]}>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <AddEvent />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/donations"
              element={
                <PrivateRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Donations />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/scanner"
              element={
                <PrivateRoute allowedRoles={["ADMIN", "PASTOR"]}>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Scanner />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/prayers"
              element={
                <PrivateRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Prayers />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/live"
              element={
                <PrivateRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Live />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/bible"
              element={
                <PrivateRoute>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <Bible />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/bible-manager"
              element={
                <PrivateRoute allowedRoles={["ADMIN"]}>
                  <Layout mode={mode} toggleTheme={toggleTheme}>
                    <BibleVerseManager />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route
                path="/profile-settings"
                element={
                  <PrivateRoute allowedRoles={["ADMIN", "PASTOR", "MEMBER"]}>
                    <Layout mode={mode} toggleTheme={toggleTheme}>
                      <ProfileSettings />
                    </Layout>
                  </PrivateRoute>
                }
              />
            {/* Catch-All */}
            <Route path="*" element={<Navigate to="/" />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
import { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import API from "../services/api";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";

export default function ProfileSettings() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔥 POPUP STATES
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [logoutCountdown, setLogoutCountdown] = useState(null);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/auth/me");

        setProfile({
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone || "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (err) {
        console.log(err);
      }
    };

    load();
  }, []);

  const handleUpdate = async () => {
    // Validate passwords
    if (
      profile.newPassword &&
      profile.newPassword !== profile.confirmPassword
    ) {
      showSnackbar("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await API.put("/auth/update-profile", {
        phone: profile.phone,
        password: profile.newPassword || undefined,
      });

      // 🔥 PASSWORD CHANGE → LOGOUT ALL DEVICES
      if (res.data.force_logout) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete API.defaults.headers.common["Authorization"];

        showSnackbar(
          "Password updated. Logging out from all devices...",
          "warning"
        );

        let count = 10;
        setLogoutCountdown(count);

        const interval = setInterval(() => {
          count--;
          setLogoutCountdown(count);

          if (count === 0) {
            clearInterval(interval);
            window.location.replace("/login");
          }
        }, 1000);

        return;
      }

      // PROFILE UPDATED SUCCESS
      showSnackbar("Profile updated successfully", "success");

      setProfile((prev) => ({
        ...prev,
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (err) {
      console.error(err);
      showSnackbar(
        err?.response?.data?.detail || "Failed to update profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1E1B4B,#312E81)",
        p: 4,
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Back
        </Button>

        <Typography variant="h4" fontWeight={700}>
          Profile Settings
        </Typography>
      </Box>

      {/* CARD */}
      <Paper
        sx={{
          maxWidth: 600,
          mx: "auto",
          p: 4,
          borderRadius: 4,
        }}
      >
        {/* FORM */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Name"
            value={profile.name}
            disabled
            fullWidth
            variant="filled"
          />

          <TextField
            label="Email"
            value={profile.email}
            disabled
            fullWidth
            variant="filled"
          />

          <TextField
            label="Phone Number"
            value={profile.phone}
            onChange={(e) =>
              setProfile({ ...profile, phone: e.target.value })
            }
            fullWidth
            variant="filled"
          />

          <TextField
            label="New Password"
            type="password"
            value={profile.newPassword}
            onChange={(e) =>
              setProfile({ ...profile, newPassword: e.target.value })
            }
            fullWidth
            variant="filled"
          />

          <TextField
            label="Confirm Password"
            type="password"
            value={profile.confirmPassword}
            onChange={(e) =>
              setProfile({ ...profile, confirmPassword: e.target.value })
            }
            fullWidth
            variant="filled"
            error={
              profile.confirmPassword &&
              profile.newPassword !== profile.confirmPassword
            }
            helperText={
              profile.confirmPassword &&
              profile.newPassword !== profile.confirmPassword
                ? "Passwords do not match"
                : ""
            }
          />

          <Button
            onClick={handleUpdate}
            disabled={loading}
            variant="contained"
            startIcon={<SaveIcon />}
            sx={{
              mt: 2,
              py: 1.5,
              borderRadius: 3,
              background: "linear-gradient(135deg,#6A11CB,#2575FC)",
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Paper>

      {/* 🔥 SNACKBAR POPUP */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* 🔥 LOGOUT COUNTDOWN POPUP */}
      <Dialog open={logoutCountdown !== null}>
        <DialogTitle>Security Logout</DialogTitle>

        <DialogContent>
          You will be logged out from all devices in{" "}
          <b>{logoutCountdown}</b> seconds.
        </DialogContent>

        <DialogActions>
          <Button
            color="error"
            onClick={() => window.location.replace("/login")}
          >
            Logout Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
import { Box, List, ListItem, ListItemText } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SettingsIcon from "@mui/icons-material/Settings"; // ✅ ADDED

export default function Sidebar() {
  const { userRole } = useContext(AuthContext);
  const navigate = useNavigate(); // ✅ ADDED

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { name: "Members", path: "/members", icon: <PeopleIcon />, roles: ["ADMIN"] },
    { name: "Events", path: "/events", icon: <EventIcon /> },
    { name: "Donations", path: "/donations", icon: <VolunteerActivismIcon /> },
    { name: "Feedback", path: "/feedback", icon: <VolunteerActivismIcon /> },
    { name: "Feedback Admin", path: "/admin/feedback", icon: <AdminPanelSettingsIcon />, roles: ["ADMIN"] },
    { name: "Scanner", path: "/scanner", icon: <QrCodeScannerIcon />, roles: ["ADMIN", "PASTOR"] },
    { name: "Bible", path: "/bible", icon: <MenuBookIcon /> },
    { name: "Bible Manager", path: "/bible-manager", icon: <AdminPanelSettingsIcon />, roles: ["ADMIN"] },
    { name: "Prayer Requests", path: "/prayers", icon: <SelfImprovementIcon /> },
    { name: "Live", path: "/live", icon: <LiveTvIcon /> },
    
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <Box
      sx={{
        width: 260,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(180deg, #E6E6FA, #B3C6FF)",
        boxShadow: "4px 0 20px rgba(0,0,0,0.1)",
      }}
    >
      {/* LOGO SECTION (UNCHANGED) */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          component="img"
          src="/fft_logo.png"
          alt="FFT Logo"
          sx={{
            width: 65,
            height: 65,
            objectFit: "contain",
            borderRadius: "50%",
            background: "#fff",
            p: 0.5,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            transition: "0.3s",
            "&:hover": {
              transform: "scale(1.08)",
            },
          }}
        />
        <Box
          sx={{
            fontSize: "1.4rem",
            fontWeight: 700,
            fontFamily: "'Cinzel', serif",
            letterSpacing: "2px",
            textAlign: "center",
            background: "linear-gradient(90deg, #6A1B9A, #3F51B5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Faith Fellowship
        </Box>
      </Box>

      {/* MENU */}
      <List sx={{ px: 2 }}>
        {filteredMenuItems.map((item) => (
          <ListItem
            key={item.name}
            component={NavLink}
            to={item.path}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              borderRadius: "12px",
              mb: 1,
              px: 2,
              py: 1.2,
              color: "#333",
              fontWeight: 500,
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(255,255,255,0.6)",
                transform: "translateX(6px)",
              },
              "&.active": {
                background: "linear-gradient(90deg, #AA3BFF, #6A5ACD)",
                color: "#fff",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              },
            }}
          >
            <Box>{item.icon}</Box>
            <ListItemText
              primary={item.name}
              primaryTypographyProps={{
                fontFamily: "'Poppins', sans-serif",
                fontSize: "0.95rem",
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* ✅ PROFILE SETTINGS BUTTON (ADDED ONLY THIS) */}
      <Box
        onClick={() => navigate("/profile-settings")}
        sx={{
          mt: "auto",
          mx: 2,
          mb: 1,
          p: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderRadius: "12px",
          cursor: "pointer",
          background: "rgba(174, 127, 16, 0.7)",
          transition: "0.3s",
          "&:hover": {
            background: "rgba(8, 88, 150, 0.8)",
            transform: "translateX(4px)",
          },
        }}
      >
        <SettingsIcon />
        <ListItemText
          primary="Profile Settings"
          primaryTypographyProps={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: "0.95rem",
          }}
        />
      </Box>

      {/* FOOTER (UNCHANGED) */}
      <Box
        sx={{
          p: 2,
          textAlign: "center",
          fontSize: "0.75rem",
          color: "#555",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        © Faith Fellowship Temple
      </Box>
    </Box>
  );
}
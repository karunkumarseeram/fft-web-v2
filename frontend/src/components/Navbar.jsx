import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function Navbar({ toggleTheme, mode }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();

  const [verse, setVerse] = useState('"Loading verse..."');
  const [verseColor, setVerseColor] = useState("#98FB98");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const dailyVerses = [
    { text: '"Go into all the world and preach the gospel to all creation." — Mark 16:15', color: "#98FB98" },
    { text: '"For God so loved the world, that he gave his only Son." — John 3:16', color: "#7FFFD4" },
    { text: '"I can do all things through Christ who strengthens me." — Philippians 4:13', color: "#ADFF2F" },
    { text: '"Trust in the Lord with all your heart." — Proverbs 3:5', color: "#00FA9A" },
    { text: '"The Lord is my shepherd; I shall not want." — Psalm 23:1', color: "#32CD32" },
  ];

  useEffect(() => {
    const day = new Date().getDate();
    const index = day % dailyVerses.length;
    setVerse(dailyVerses[index].text);
    setVerseColor(dailyVerses[index].color);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 80,
        px: 3,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f2027, #203a43, #2c5364)"
            : "linear-gradient(135deg, #e0f7fa, #ffffff, #e3f2fd)",
        color: theme.palette.text.primary,
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
        position: "relative",
        transition: "all 0.3s ease",
      }}
    >
      {/* Scrolling Container */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          whiteSpace: "nowrap",
          width: "70%",
          "&::before, &::after": {
            content: '""',
            position: "absolute",
            top: 0,
            width: 60,
            height: "100%",
            zIndex: 2,
          },
          "&::before": {
            left: 0,
            background: `linear-gradient(to right, ${theme.palette.background.default} 20%, transparent)`,
          },
          "&::after": {
            right: 0,
            background: `linear-gradient(to left, ${theme.palette.background.default} 20%, transparent)`,
          },
        }}
      >
        <Box
          sx={{
            display: "inline-block",
            whiteSpace: "nowrap",
            animation: "marquee 20s linear infinite",
            "@keyframes marquee": {
              "0%": { transform: "translateX(100%)" },
              "100%": { transform: "translateX(-100%)" },
            },
          }}
        >
          {/* Church Title */}
          <Typography
            component="span"
            sx={{
              fontSize: "1.45rem",
              fontWeight: 800,
              fontFamily: "'Cinzel Decorative', cursive",
              letterSpacing: "2px",
              background:
                "linear-gradient(90deg, #FFD700, #FFB347, #FF416C, #FF4B2B, #FFD700)",
              backgroundSize: "300% 100%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "gradientShift 8s ease infinite",
              textShadow: "0 0 10px rgba(255,215,0,0.6)",
            }}
          >
            Faith Fellowship Temple — With HIM{" "}
            <Box
              component="span"
              sx={{
                fontSize: "1.6rem",
                fontWeight: "bold",
                display: "inline-block",
                background:
                  "linear-gradient(90deg, #FFD700, #FFB347, #FF416C, #FF4B2B, #FFD700)",
                backgroundSize: "300% 100%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradientShift 8s ease infinite, pulse 2s infinite",
                textShadow: "0 0 15px #FFD700, 0 0 20px #FFA500",
              }}
            >
              "We Proclaim"
            </Box>{" "}
            ✝️
          </Typography>

          {/* Bible Verse */}
          <Typography
            component="span"
            sx={{
              ml: 5,
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontStyle: "italic",
              color: verseColor,
              letterSpacing: "0.5px",
            }}
          >
            {verse}
          </Typography>
        </Box>
      </Box>

      {/* Right Controls */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Theme Toggle */}
        <IconButton onClick={toggleTheme} sx={{ color: theme.palette.text.primary }}>
          {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          sx={{
            background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
            color: "#fff",
            borderRadius: "25px",
            px: 3,
            py: 1,
            fontWeight: 700,
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "0.5px",
            textTransform: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
            transition: "0.3s",
            "&:hover": {
              transform: "scale(1.08)",
              opacity: 0.9,
            },
          }}
        >
          Logout
        </Button>
      </Box>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }

          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
    </Box>
  );
}
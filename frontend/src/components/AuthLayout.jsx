// src/components/AuthLayout.jsx
import { Box, Typography } from "@mui/material";

export default function AuthLayout({ children }) {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      
      {/* LEFT SIDE */}
      <Box
        sx={{
          width: "60%",
          background: "linear-gradient(rgba(106,27,154,0.7), rgba(106,27,154,0.7)), url('/logo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h3" fontWeight="bold">
          FFT Faith Fellowship Temple
        </Typography>
        <Typography variant="h6">
          HIM We Proclaim
        </Typography>
      </Box>

      {/* RIGHT SIDE */}
      <Box
        sx={{
          width: "40%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f5f5f5",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
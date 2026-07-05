import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children, mode, toggleTheme }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Navbar mode={mode} toggleTheme={toggleTheme} />
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
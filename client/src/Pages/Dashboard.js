import React from "react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import TopBar from "./TopBar";
import SideMenu from "./SideMenu";

export default function Dashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <TopBar />
      <SideMenu dashboard_selected={true} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="subtitle1">Welcome to Dashboard</Typography>
      </Box>
    </Box>
  );
}

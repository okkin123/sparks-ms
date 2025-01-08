import React from "react";
import Toolbar from "@mui/material/Toolbar";
import Alert from "@mui/material/Alert";

export default function Dashboard() {
  return (
    <React.Fragment>
      <Toolbar />
      <Alert severity="info">Dashboard page is under maintenance... Coming Soon!</Alert>
    </React.Fragment>
  );
}

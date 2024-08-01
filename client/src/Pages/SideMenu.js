import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Dashboard, ManageAccounts } from "@mui/icons-material";
import Divider from "@mui/material/Divider";
import { useNavigate } from "react-router-dom";
import AxiosInstance from "../AxiosInstance";
const drawerWidth = 240;

export default function SideMenu(props) {
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);
  const [userType, setUserType] = useState("");
  useEffect(() => {
    // make the API call

    AxiosInstance.get("/user/info")
      .then((result) => {
        // assign the message in our result to the message we initialized above

        setUserType(result.data[0].user_type);
        setRefresh(!refresh);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [refresh]);

  return (
    <React.Fragment>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            <ListItem
              disablePadding
              selected={props.dashboard_selected}
              onClick={() => navigate("/dashboard")}
            >
              <ListItemButton>
                <ListItemIcon>
                  <Dashboard />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            {userType === "OWNER" ? (
              <ListItem
                disablePadding
                selected={props.mu_selected}
                onClick={() => navigate("/manageuser")}
              >
                <ListItemButton>
                  <ListItemIcon>
                    <ManageAccounts />
                  </ListItemIcon>
                  <ListItemText primary="Manage Users" />
                </ListItemButton>
              </ListItem>
            ) : null}
          </List>
        </Box>
      </Drawer>
    </React.Fragment>
  );
}

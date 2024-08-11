import React, { useState, useEffect } from "react";
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CssBaseline,
  AppBar,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import { BarChart, ManageAccounts, AccountBalance } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

import logo from "../Assets/BS LOGO White.png";
import AxiosInstance from "../AxiosInstance";

import Dashboard from "./Dashboard";
import ManageUser from "./ManageUser";
import BankAccounts from "./BankAccounts";

import Cookies from "universal-cookie";
const cookies = new Cookies();
const drawerWidth = 240;

export default function SideMenu() {
  const navigate = useNavigate();
  const [component, setComponent] = useState(<Dashboard />);
  const [name, setName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };


  useEffect(() => {
    // make the API call

    AxiosInstance.get("/user/info")
      .then((result) => {
        // assign the message in our result to the message we initialized above

        setName(result.data[0].fullname);
      })
      .catch((error) => {
        console.log(error);
      });
  });

  const logout = () => {
    handleClose();
    // destroy the cookie
    cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    navigate("/");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
          >
            <img src={logo} width="125" alt="logo" />
          </Typography>
          <Box sx={{ display: { xs: "none", sm: "block" } }}>
            <Button
              sx={{ color: "#fff" }}
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              {name}
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
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
              selected={true}
              onClick={() => setComponent(<Dashboard />)}
            >
              <ListItemButton>
                <ListItemIcon>
                  <BarChart />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List>
            <ListItem
              disablePadding
              selected={false}
              onClick={() => setComponent(<BankAccounts />)}
            >
              <ListItemButton>
                <ListItemIcon>
                  <AccountBalance />
                </ListItemIcon>
                <ListItemText primary="Bank Accounts" />
              </ListItemButton>
            </ListItem>
          </List>
          <List>
            <ListItem
              disablePadding
              selected={false}
              onClick={() => setComponent(<ManageUser />)}
            >
              <ListItemButton>
                <ListItemIcon>
                  <ManageAccounts />
                </ListItemIcon>
                <ListItemText primary="Manage Users" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {component}
      </Box>
    </Box>
  );
}

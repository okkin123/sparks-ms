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
  Collapse,
  Grid
} from "@mui/material";
import { BarChart, ManageAccounts, SettingsSuggest, Description, ExpandMore, ExpandLess, Add, ViewList} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

import logo from "../Assets/BS LOGO White.png";
import AxiosInstance from "../AxiosInstance";

import Dashboard from "./Dashboard";
import QList from "./Quotations/List";
import QNew from "./Quotations/New";
import ManageUser from "./ManageUser";
import Preferences from "./Preferences";

import Cookies from "universal-cookie";
const cookies = new Cookies();
const drawerWidth = 240;

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelect = (el, com) => {
    const pages = Object.keys(component);

    setComponent(pages.reduce((acc, page) => ({
      ...acc,
      element: com,
      [page]: {
        ...acc[page],
        selected: page === el ? true: false
      }
    }), {}))
  };


  const [component, setComponent] = useState({
    element: !location.state ? <Dashboard /> : <QList message={

        <React.Fragment>
          <Grid item>
          <Typography variant="h6">{location.state.message}</Typography>
          </Grid> 
        </React.Fragment>
      
    } />,
    dashboard: {
      selected: !location.state ? true : false 
    },
    qlist: {
      selected: !location.state ? false : true
    },
    qnew: {
      selected: false
    },
    manage_users: {
      selected: false
    },
    preferences: {
      selected: false
    },
  });
  const [user, setUser] = useState({
    name: "",
    type: "",
    email_address: ""
  })
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [dropdownMenu, setDropdownMenu] = useState(!location.state ? false : true);


  useEffect(() => {
    // make the API call

    AxiosInstance.get("/user/info")
      .then((result) => {
        // assign the message in our result to the message we initialized above

        setUser({
          name: result.data[0].fullname,
          user_type: result.data[0].user_type,
          email_address: result.data[0].email_address
        });
      })
      .catch((error) => {
        console.log(error);
      });

     
     
  }, []);

  const logout = () => {
    handleClose();
    // destroy the cookie
    cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    navigate("/login");
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
              {user.name}
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
              selected={component.dashboard.selected}
              onClick={() => handleSelect('dashboard', <Dashboard/>)}
            >
              <ListItemButton>
                <ListItemIcon>
                  <BarChart />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
            </ListItem>
          </List>
          <List>
            <ListItem
              disablePadding
              
              onClick={()=>setDropdownMenu(!dropdownMenu)}
            >
              <ListItemButton>
                <ListItemIcon>
                  <Description />
                </ListItemIcon>
                <ListItemText primary="Quotations" />
                {dropdownMenu ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
              <Collapse in={dropdownMenu} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                { user.user_type === 'Managing Director' || user.user_type === 'Operations Manager' ? null : <ListItemButton 
                 selected={component.qnew.selected}
                 onClick={() => {
                   handleSelect('qnew', <QNew/>)
                 }}
                 sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Add />
                  </ListItemIcon>
                  <ListItemText primary="New" />
                </ListItemButton>}
                <ListItemButton
                  selected={component.qlist.selected}
                  onClick={() => {
                    handleSelect('qlist', <QList />)
                  }}
                 sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <ViewList />
                  </ListItemIcon>
                  <ListItemText primary="View List" />
                </ListItemButton>
              </List>
            </Collapse>
          </List>
          <Divider />
          { user.user_type === 'Managing Director' || user.user_type === 'Operations Manager' ? <List>
          <ListItem
              disablePadding
              selected={component.manage_users.selected}
              onClick={() => {
                handleSelect('manage_users', <ManageUser/>)
              }}
            >
              <ListItemButton>
                <ListItemIcon>
                  <ManageAccounts />
                </ListItemIcon>
                <ListItemText primary="Manage Users" />
              </ListItemButton>
            </ListItem>
          </List>  : null }
          { user.user_type === 'Managing Director' || user.user_type === 'Operations Manager' ? null : <List>
            <ListItem
              disablePadding
              selected={component.preferences.selected}
              onClick={() => {
                handleSelect('preferences', <Preferences/>)
              }}
            >
              <ListItemButton>
                <ListItemIcon>
                  <SettingsSuggest />
                </ListItemIcon>
                <ListItemText primary="Preferences" />
              </ListItemButton>
            </ListItem>
          </List> }
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          { component.element }
      </Box>
    </Box>
  );
}

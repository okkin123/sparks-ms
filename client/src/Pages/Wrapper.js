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
  Grid,
  Alert,
  IconButton
} from "@mui/material";
import { BarChart, ManageAccounts, SettingsSuggest, ExpandMore, ExpandLess, Add, ViewList, Folder} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import logo from "../Assets/BS LOGO White.png";
import AxiosInstance from "../AxiosInstance";

import Dashboard from "./Dashboard";
import QList from "./Quotations/List";
import QNew from "./Quotations/New";
import QEdit from "./Quotations/Edit";
import InvoiceNew from "./Invoices/New";
import InvoiceEdit from "./Invoices/Edit";
import InvoiceList from "./Invoices/List";
import ManageUser from "./ManageUser";
import Preferences from "./Preferences";

import PEList from "./Expenses/Project/List";
import PENew from "./Expenses/Project/New";

import EditVendorExpense from "./Expenses/Project/Components/EditVendorExpense";

import AENew from "./Expenses/Admin/New";
import AEList from "./Expenses/Admin/List";

import Cookies from "universal-cookie";
const cookies = new Cookies();
const drawerWidth = 240;

export default function SideMenu() {
  const navigate = useNavigate();
  const location = useLocation()
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
    element: <Dashboard />,
    dashboard: {
      selected: true
    },
    qlist: {
      selected: false
    },
    qnew: {
      selected: false
    },
    invoice_new: {
      selected: false
    },
    invoice_list: {
      selected: false,
    },
    penew: {
      selected: false
    },
    aenew: {
      selected: false
    },
    aelist: {
      selected: false
    },
    pelist: {
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

  const [dropdownMenu, setDropdownMenu] = useState({
    quotation: !location.state ? false : true,
    invoice: !location.state ? false : true,
    expense: !location.state ? false : true,
    project_expense: !location.state ? false : true,
    admin_expense: !location.state ? false : true,
  });


  useEffect(() => {
    // make the API call

    window.addEventListener('beforeunload', (event) => {
      navigate(location.pathname, { replace: true, state: {} });
      // Optionally, you can show a confirmation dialog
      event.preventDefault();
      
    });

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

     
     
  }, [location.pathname, navigate]);

useEffect(()=>{
  if (location.state) {
    setComponent((component)=>({
        ...component,
        element: location.state.quotation_created_updated ? (
            <QList message={
                <React.Fragment>
                    <Grid item>
                        <Collapse in={Boolean(location.state.message)}>
                            <Alert
                                action={
                                    <IconButton
                                        aria-label="close"
                                        color="inherit"
                                        size="small"
                                        onClick={() => {
                                            navigate(location.pathname, { replace: true, state: {quotation_created_updated: true, message: false} });
                                        }}
                                    >
                                        <CloseIcon fontSize="inherit" />
                                    </IconButton>
                                }
                                sx={{ mb: 2 }}
                                icon={<CheckIcon fontSize="inherit" />}
                                severity="success"
                            >
                                {location.state.message}
                            </Alert>
                        </Collapse>
                    </Grid>
                </React.Fragment>
            } />
            ) : location.state.quotation_edit ? (
                <QEdit quotation_number={location.state.quotation_number} />
            ) : 
            location.state.invoice_created_updated ? (
              <InvoiceList message={
                  <React.Fragment>
                      <Grid item>
                          <Collapse in={Boolean(location.state.message)}>
                              <Alert
                                  action={
                                      <IconButton
                                          aria-label="close"
                                          color="inherit"
                                          size="small"
                                          onClick={() => {
                                              navigate(location.pathname, { replace: true, state: {invoice_created_updated: true, message: false} });
                                          }}
                                      >
                                          <CloseIcon fontSize="inherit" />
                                      </IconButton>
                                  }
                                  sx={{ mb: 2 }}
                                  icon={<CheckIcon fontSize="inherit" />}
                                  severity="success"
                              >
                                  {location.state.message}
                              </Alert>
                          </Collapse>
                      </Grid>
                  </React.Fragment>
              } />
              ) : location.state.invoice_edit ? (
                <InvoiceEdit invoice_number={location.state.invoice_number} quotation_number={location.state.quotation_number} />
            )  : location.state.vendor_expense_edit ? (
              <EditVendorExpense initialValues={location.state.initialValues} />
          ) :<Dashboard />,
      qlist: location.state.quotation_created ? {...component.qlist, selected: true} : location.state.quotation_edit ? {...component.qlist, selected: false}  : {...component.qlist, selected: false} ,
      qnew: {...component.qnew, selected: false},
      invoice_list: location.state.invoice_created ? {...component.invoice_list, selected: true} : location.state.invoice_edit ? {...component.invoice_list, selected: false}  : {...component.invoice_list, selected: false} ,  
      invoice_new: {...component.invoice_new, selected: false},
    }));
}


// eslint-disable-next-line 
},[location.state, navigate])

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
            <ListItem
              disablePadding
              onClick={()=>setDropdownMenu({...dropdownMenu, quotation: !dropdownMenu.quotation})}
            >
              <ListItemButton>
                <ListItemIcon>
                  <Folder />
                </ListItemIcon>
                <ListItemText primary="Quotations" />
                {dropdownMenu.quotation ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
              <Collapse in={dropdownMenu.quotation} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
               <ListItemButton 
                 selected={component.qnew.selected}
                 onClick={() => {
                   handleSelect('qnew', <QNew/>)
                 }}
                 sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Add />
                  </ListItemIcon>
                  <ListItemText primary="New" />
                </ListItemButton>
                <ListItemButton
                  selected={component.qlist.selected}
                  onClick={() => {
                    handleSelect('qlist', (
                        <QList />
                    ))
                  }}
                 sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <ViewList />
                  </ListItemIcon>
                  <ListItemText primary="View List" />
                </ListItemButton>
              </List>
            </Collapse>
          <ListItem
              disablePadding
              onClick={()=>setDropdownMenu({...dropdownMenu, invoice: !dropdownMenu.invoice})}
            >
              <ListItemButton>
                <ListItemIcon>
                  <Folder />
                </ListItemIcon>
                <ListItemText primary="Invoices" />
                {dropdownMenu.invoice ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
          </ListItem>
          <Collapse in={dropdownMenu.invoice} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
               <ListItemButton 
                 selected={component.invoice_new.selected}
                 onClick={() => {
                   handleSelect('invoice_new', <InvoiceNew/>)
                 }}
                 sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <Add />
                  </ListItemIcon>
                  <ListItemText primary="New" />
                </ListItemButton>
                <ListItemButton
                 selected={component.invoice_list.selected}
                 onClick={() => {
                   handleSelect('invoice_list', (
                       <InvoiceList />
                   ))
                 }}
                 sx={{ pl: 4 }}>
                  <ListItemIcon>
                    <ViewList />
                  </ListItemIcon>
                  <ListItemText primary="View List" />
                </ListItemButton>
              </List>
            </Collapse>
      <ListItem
        disablePadding
        onClick={() => setDropdownMenu({ ...dropdownMenu, expense: !dropdownMenu.expense })}
      >
        <ListItemButton>
          <ListItemIcon>
            <Folder />
          </ListItemIcon>
          <ListItemText primary="Expenses" />
          {dropdownMenu.expense ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
      </ListItem>
      <Collapse in={dropdownMenu.expense} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <ListItem
            disablePadding
            onClick={() => setDropdownMenu({ ...dropdownMenu, project_expense: !dropdownMenu.project_expense })}
          >
            <ListItemButton sx={{pl: 4}}>
              <ListItemIcon>
                <Folder />
              </ListItemIcon>
              <ListItemText primary="Project" />
              {dropdownMenu.project_expense ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
          </ListItem>
          <Collapse in={dropdownMenu.project_expense} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                selected={component.penew.selected}
                onClick={() => {
                  handleSelect('penew', <PENew />);
                }}
                sx={{ pl: 8 }}
              >
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText primary="New" />
              </ListItemButton>
              <ListItemButton
                selected={component.pelist.selected}
                onClick={() => {
                  handleSelect('pelist', <PEList />);
                }}
                sx={{ pl: 8 }}
              >
                <ListItemIcon>
                  <ViewList />
                </ListItemIcon>
                <ListItemText primary="View List" />
              </ListItemButton>
            </List>
          </Collapse>
          <ListItem
              disablePadding
              onClick={() => setDropdownMenu({ ...dropdownMenu, admin_expense: !dropdownMenu.admin_expense })}
            >
              <ListItemButton sx={{pl: 4}}>
                <ListItemIcon>
                  <Folder />
                </ListItemIcon>
                <ListItemText primary="Admin" />
                {dropdownMenu.admin_expense ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={dropdownMenu.admin_expense} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                selected={component.aenew.selected}
                onClick={() => {
                  handleSelect('aenew', <AENew />);
                }}
                sx={{ pl: 8 }}
              >
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText primary="New" />
              </ListItemButton>
              <ListItemButton
                selected={component.aelist.selected}
                onClick={() => {
                  handleSelect('aelist', <AEList />);
                }}
                sx={{ pl: 8 }}
              >
                <ListItemIcon>
                  <ViewList />
                </ListItemIcon>
                <ListItemText primary="View List" />
              </ListItemButton>
            </List>
          </Collapse>
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
          { user.user_type === 'Managing Director' || user.user_type === 'Operations Manager' ? <List>
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
          </List> : null }
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          { component.element }
      </Box>
    </Box>
  );
}

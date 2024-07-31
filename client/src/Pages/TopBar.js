import React, { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";

import logo from "../Assets/BS LOGO White.png";

import AxiosInstance from "../AxiosInstance";
import { useNavigate } from "react-router-dom";

import Cookies from "universal-cookie";
const cookies = new Cookies();

export default function TopBar() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // make the API call

    AxiosInstance.get("/user/info")
      .then((result) => {
        // assign the message in our result to the message we initialized above

        setName(result.data[0].fullname);
        setRefresh(true);
      })
      .catch((error) => {
        navigate("/");
      });
  }, [refresh]);

  const logout = () => {
    handleClose();
    // destroy the cookie
    cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    navigate("/");
  };

  return (
    <React.Fragment>
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
    </React.Fragment>
  );
}

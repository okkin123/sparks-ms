import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Grid,
  Button,
  Modal,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  ListItemAvatar,
  Avatar,
} from "@mui/material";

import AxiosInstance from "../AxiosInstance";
import FolderIcon from "@mui/icons-material/Folder";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import TopBar from "./TopBar";
import SideMenu from "./SideMenu";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 15,
  p: 2,
};

const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

export default function ManageUser() {
  const [open, setOpen] = useState(false);
  const [dense, setDense] = React.useState(false);
  const [registrationCodes, setRegistrationCodes] = useState([]);
  const [registrationCode, setRegistrationCode] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  
  function RegistrationCode() {
    // make the API call
    setRegistrationCodes([]);
    AxiosInstance.get("/user/get_registration_code")
      .then((result) => {
        // assign the message in our result to the message we initialized above
        setRegistrationCodes((registrationCodes) => [
          ...registrationCodes,
          ...result.data.map((element) => ({
            code: element.code,
            status: element.status,
          })),
        ]);
        setOpen(true);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function generateRegistrationCode()
  {
    AxiosInstance.get("/user/generate_registration_code")
    .then((result)=>{
      setRegistrationCode(result.data.registration_code)
    })
  }

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <TopBar />
      <SideMenu mu_selected={true} />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Grid container justifyContent="space-between">
          <Typography variant="subtitle1">Manage Users</Typography>
          <Button
            variant="contained"
            color="success"
            onClick={RegistrationCode}
          >
            Registration Code
          </Button>
          <Modal
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                  <Demo>
                    <List dense={dense}>
                      {registrationCodes.map((registrationCode, key) => {
                        return (
                          <ListItem
                            key={key}
                            secondaryAction={
                              <IconButton edge="end" aria-label="copy">
                                <ContentCopyIcon />
                              </IconButton>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar>
                                <FolderIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                registrationCode.code.substring(0, 40) + "..."
                              }
                              secondary={registrationCode.status}
                              secondaryTypographyProps={ {color: theme.palette.error.main} }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Demo>
                </Grid>
                <Grid item>
                  <FormControl variant="outlined" fullWidth>
                    <InputLabel htmlFor="outlined-adornment-registration-code">
                      Registration Code
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-registration-code"
                      endAdornment={
                        <InputAdornment position="end">
                          <Button variant="text" color="info" onClick={generateRegistrationCode}>
                            Generate Code
                          </Button>
                        </InputAdornment>
                      }
                      label="Registration Code"
                      placeholder="Registration Code"
                      value={registrationCode}
                      readOnly
                    />
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Modal>
        </Grid>
      </Box>
    </Box>
  );
}

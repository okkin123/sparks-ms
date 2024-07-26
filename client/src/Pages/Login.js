import React, { useState } from "react";
import {
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  TextField,
  Stack,
  Button,
  Typography,
  Box,
  Alert,
  Collapse,
  IconButton
} from "@mui/material";

import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import Image from "mui-image";
import bsLogo from "../Assets/BS LOGO.png";

import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {

  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
    >
      <Grid container justifyContent="center">
        <Grid item xl={3} lg={4} md={6} sm={8} xs={12}>
          <Paper>
            <Stack direction="column" spacing={2} style={{ padding: 15 }}>
              <Stack direction="row" justifyContent="center">
              <Image src={bsLogo} width={250} />
              </Stack>
              <Typography variant="h5">LOGIN</Typography>
              <TextField label="Email Address" variant="outlined" fullWidth />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
              />
              <FormControlLabel control={<Checkbox />} label="Remember Me" />
              {location.state !== null ? 
               <Collapse in={open}>
                <Alert 
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
                variant="filled" icon={<CheckIcon fontSize="inherit" />} severity="info">
                 <strong>{location.state.status}!</strong>&nbsp;{location.state.message}
                </Alert>
                </Collapse>
                : null}
              <Button variant="contained">LOGIN</Button>
              <Button variant="text" color="info">Forgot Password</Button>
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Typography variant="subtitle1">Dont have an account?</Typography>
              <Button variant="contained" color="success" onClick={()=>navigate('/register')}>REGISTER NOW</Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

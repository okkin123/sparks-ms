import * as React from "react";
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
} from "@mui/material";

export default function Login() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
    >
      <Grid container justifyContent="center">
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Paper>
            <Stack direction="column" spacing={2} style={{ padding: 15 }}>
              <Stack direction="column" spacing={0}>
                <Typography variant="h4" style={{ textAlign: "center" }}>
                  SPARKS
                </Typography>
                <Typography variant="subtitle1" style={{ textAlign: "center" }}>
                  Marketing and Communications LLC
                </Typography>
              </Stack>
              <Typography variant="h5">ADMIN LOGIN</Typography>
              <TextField label="Email Address" variant="outlined" fullWidth />
              <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
              />
              <FormControlLabel control={<Checkbox />} label="Remember Me" />
              <Button variant="contained">LOGIN</Button>
              <Button variant="text">Forgot Password</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

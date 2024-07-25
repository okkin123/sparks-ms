import * as React from "react";
import {
  Grid,
  Paper,
  TextField,
  Stack,
  Button,
  Typography,
  Box,
} from "@mui/material";

export default function ChangePassword() {
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
              <Typography variant="h5">Change Password</Typography>
              <TextField
                label="New Password"
                variant="outlined"
                type="password"
                fullWidth
              />
              <TextField
                label="Confirm Password"
                variant="outlined"
                type="password"
                fullWidth
              />
              <Button variant="contained">Change Password</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

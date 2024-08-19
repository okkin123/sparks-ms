import React from 'react';
import {Toolbar,
        Grid,
        Typography,
        Button,
        TextField,
        Divider
} from '@mui/material';
export default function Preferences(){
    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="h6">PREFERENCES</Typography>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">TRN:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                   
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <Button variant="contained" color="secondary">Save TRN</Button>
                </Grid>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1"><strong>BANK ACCOUNT</strong></Typography>
              </Grid>
              <Grid item>
                <Divider />
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Name of Benificiary:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Name of Bank:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Address of Bank:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Account Number:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">IBAN:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Swift Code:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Routing Code:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                   
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <Button variant="contained" color="secondary">Save Bank Account</Button>
                </Grid>
              </Grid>
            </Grid>
        </React.Fragment>
    )
}

// npm install dotenv

// const fs = require('fs');
// const path = require('path');

// // Define the variable you want to update and its new value
// const variableName = 'YOUR_VARIABLE';
// const newValue = 'new_value';

// // Define the .env file path
// const envFilePath = path.join(__dirname, '.env');

// // Read the .env file
// let envContent = fs.readFileSync(envFilePath, 'utf-8');

// // Create a regular expression to find the variable
// const regex = new RegExp(`^${variableName}=.*$`, 'm');

// // Update the variable if it exists, otherwise add it
// if (regex.test(envContent)) {
//     envContent = envContent.replace(regex, `${variableName}=${newValue}`);
// } else {
//     envContent += `\n${variableName}=${newValue}`;
// }

// // Write the updated content back to the .env file
// fs.writeFileSync(envFilePath, envContent);

// console.log(`Variable "${variableName}" updated to "${newValue}" in .env file`);

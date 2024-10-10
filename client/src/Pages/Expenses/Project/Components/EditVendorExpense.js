import {Grid, Box, Divider, Toolbar, Paper, Typography} from '@mui/material';
import React, {useState} from 'react';
import NewVendorExpense from './Components/NewVendorExpense';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}



export default function EditVendorExpense(){

    return(
        <React.Fragment>
            <Toolbar />
            <Paper>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>
              <Grid item>
                <Typography variant="h6">EDIT PROJECT VENDOR EXPENSE</Typography>
              </Grid>
              <Grid item>
                 <Divider />
              </Grid>
              <Grid item>
                <NewVendorExpense />
              </Grid>
            </Grid>
            </Paper>
        </React.Fragment>
    )
}


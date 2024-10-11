import {Grid, Divider, Toolbar, Paper, Typography} from '@mui/material';
import React from 'react';
import NewVendorExpense from './NewVendorExpense';

export default function EditVendorExpense(props){

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
                <NewVendorExpense mode="EDIT" initialValues={props.initialValues} />
              </Grid>
            </Grid>
            </Paper>
        </React.Fragment>
    )
}


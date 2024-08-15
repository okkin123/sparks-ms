import React from 'react';
import { Toolbar, Typography, Grid} from '@mui/material';

export default function List(){
    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
               <Grid item>
                 <Typography variant="h6">QUOTATION LIST</Typography>
               </Grid>
            </Grid>
        </React.Fragment>
    )
}
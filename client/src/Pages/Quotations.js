import React from 'react';
import { Toolbar, Typography, Grid, Button} from '@mui/material';

export default function Quotations(){
    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
                <Grid item container justifyContent="space-between">
                    <Typography variant="h6">QUOTATIONS</Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                    >
                    Add Quotations
                    </Button>
                </Grid>

            </Grid>
        </React.Fragment>
    )
}
import {Grid, Box, AppBar, Divider,Tabs, Tab, Toolbar, Paper, Typography} from '@mui/material';
import React, {useState} from 'react';
import NewSupplierExpense from './Components/NewSupplierExpense';
import NewVendorExpense from './Components/NewVendorExpense';
import NewPromoterExpense from './Components/NewPromoterExpense';

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



export default function New(){

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };


    return(
        <React.Fragment>
            <Toolbar />
            <Paper square>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>
              <Grid item>
                <Typography variant="h6">NEW PROJECT EXPENSE</Typography>
              </Grid>
              <Grid item>
                 <Divider />
              </Grid>

              <Grid item>
              <AppBar position="static" color="transparent">
              <Tabs value={tabValue} onChange={handleTabChange}
                  textColor='inherit'>
                      <Tab label="Supplier" />
                      <Tab label="Vendor" />
                      <Tab label="Promoter" />
                  </Tabs>
              </AppBar>
              </Grid>


              <TabPanel value={tabValue} index={0}>
                <NewSupplierExpense />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <NewVendorExpense mode="NEW" />
              </TabPanel>
              <TabPanel value={tabValue} index={2}>
                <NewPromoterExpense mode="NEW" />
              </TabPanel>
            
            </Grid>
            </Paper>
        </React.Fragment>
    )
}


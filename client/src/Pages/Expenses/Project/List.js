import React, {useState} from 'react' 
import {Grid, Toolbar, Typography, Box, Divider, AppBar, Tabs, Tab} from '@mui/material'
import ListSupplierExpense from './Components/ListSupplierExpense';
import ListVendorExpense from './Components/ListVendorExpense';
// function createMessageHandler(navigate, invoice_number, quotation_number, setRefresh, refresh) {

//     return function HandleMessage(event) {
      
//         if (event.data.childClosed || event.data.childSubmit) {
          
//             AxiosInstance.post("/quotation/unlock", { quotation_number: invoice_number })
//                 .then(function(response) {
//                   setRefresh(!refresh)
//                 })
//                 .catch(function(error) {
//                     console.error("Axios error:", error.response ? error.response.data : error.message);
//                 });
           
//         }
//         else if(event.data.childEdit) {
//           navigate('/', { 
//             state: {
//               invoice_edit: true,
//               invoice_number: invoice_number,
//               quotation_number: quotation_number
//             }
//            });
//         }
  
//         window.removeEventListener('message', HandleMessage);
        
//     };
//   }


function TabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <React.Fragment
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
      </React.Fragment>
    );
  }


export default function List(){

    const [tabValue, setTabValue] = useState(0);
    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

    return(
        <React.Fragment>
            <Toolbar />
            {/* <Paper> */}
            <Grid container direction="column" spacing={2} sx={{padding: 2}}>
              <Grid item>
                <Typography variant="h6">LIST OF PROJECT EXPENSE</Typography>
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
                  </Tabs>
              </AppBar>
              </Grid>
              <Grid item>
              <TabPanel value={tabValue} index={0}>
                <ListSupplierExpense />
              </TabPanel>
              </Grid>
              <Grid item>
              <TabPanel value={tabValue} index={1}>
                <ListVendorExpense />
              </TabPanel>
              </Grid>
            </Grid>
            {/* </Paper> */}
        </React.Fragment>
    )
}
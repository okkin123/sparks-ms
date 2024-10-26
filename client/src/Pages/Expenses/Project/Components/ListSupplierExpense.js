import React, {useState} from 'react' 
import {Tabs, Tab, Paper} from '@mui/material'
import ListSupplierExpenseInvoices from './ListSupplierExpenseInvoices';
import ListSupplierExpensePayments from './ListSupplierExpensePayments';
import SupplierExpenseStatement from './SupplierExpenseStatement';

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
        {value === index && 
            children}
        
      </React.Fragment>
    );
  }

export default function ListSupplierExpense(){

   const [tabValue, setTabValue] = useState(0);
   const handleTabChange = (event, newValue) => {
     setTabValue(newValue);
   };


    return(
        <React.Fragment>   
        <Paper elevation={2} sx={{ width: '100%', borderRadius: 0, border: 'none', margin: 0}}>
            <Tabs value={tabValue} onChange={handleTabChange}
                textColor='inherit'>
                <Tab label="Invoices" />
                <Tab label="Payments" />
                <Tab label="Statement" />
            </Tabs>
        </Paper>

        {/* Invoices Panel */}
        <TabPanel value={tabValue} index={0}>
            <ListSupplierExpenseInvoices />
        </TabPanel>

         {/* Payments Panel */}
         <TabPanel value={tabValue} index={1}>
          <ListSupplierExpensePayments />
         </TabPanel>

         <TabPanel value={tabValue} index={2}>
          <SupplierExpenseStatement />
         </TabPanel>

        </React.Fragment>   
    )
}
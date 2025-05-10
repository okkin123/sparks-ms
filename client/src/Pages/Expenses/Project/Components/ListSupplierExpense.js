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

export default function ListSupplierExpense(props){
   
   const [tabValue, setTabValue] = useState(0);
   const handleTabChange = (event, newValue) => {
     setTabValue(newValue);
   };


    return(
        <React.Fragment>   
        <Paper elevation={2} sx={{ width: '100%', borderRadius: 0, border: 'none', margin: 0}}>
        { props.user_type !== 'Managing Director' ? <Tabs value={tabValue} onChange={handleTabChange}
                textColor='inherit'>
               <Tab label="Invoices" />
                <Tab label="Payments" />
                <Tab label="Statement" />  
            </Tabs> : 
             <Tabs value={tabValue} onChange={handleTabChange}
                textColor='inherit'>
                <Tab label="Statement" />  
            </Tabs> }
        </Paper>
        {props.user_type !== 'Managing Director' ?
          <React.Fragment>
          <TabPanel value={tabValue} index={0}>
              <ListSupplierExpenseInvoices />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <ListSupplierExpensePayments />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <SupplierExpenseStatement />
          </TabPanel>
          </React.Fragment>
          : 
          <TabPanel value={tabValue} index={0}>
          <SupplierExpenseStatement />
          </TabPanel> }

        </React.Fragment>   
    )
}
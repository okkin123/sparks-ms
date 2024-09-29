import React, {useEffect, useState} from 'react';
import{Box, Grid, Paper, Typography, Stack} from '@mui/material';
import AxiosInstance from '../../../AxiosInstance';
import dayjs from 'dayjs';

import PdfViewer from '../../../Components/PdfViewer';


export default function Details(){

    const url = new URL(window.location.href);

    // Create a URLSearchParams object
    const params = new URLSearchParams(url.search);

    // Get the value of the 'param' parameter
    const paramValue = params.get('pe_number');
    const [projectExpenseDetails, setProjectExpensesDetails] = useState([])

    useEffect(()=>{
        AxiosInstance.post("/project_expense/details", {pe_number: paramValue})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
              
                
                  setProjectExpensesDetails({
                    pe_number: result.data.project_expense_details[0].pe_number,
                    project_name: result.data.project_expense_details[0].project_name,
                    supplier_name: result.data.project_expense_details[0].supplier_name,
                    invoice_number: result.data.project_expense_details[0].invoice_number,
                    created_by_email: result.data.project_expense_details[0].created_by_email,
                    date_issued: dayjs(new Date(result.data.project_expense_details[0].date_issued)).format('DD-MMM-YYYY'),
                    is_vat: !!result.data.project_expense_details[0].is_vat,
                    amount_without_vat: result.data.project_expense_details[0].amount_without_vat,
                    vat_percentage: !!result.data.project_expense_details[0].is_vat ? result.data.project_expense_details[0].vat_percentage+'%' : '',
                    vat_amount: result.data.project_expense_details[0].vat_amount,
                    amount_with_vat: result.data.project_expense_details[0].amount_with_vat,
                    currency: result.data.project_expense_details[0].currency,
                    file_url: result.data.file_url
                  })
                
                  console.log(result.data.file_url)
                  
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })

        // eslint-disable-next-line
    },[])
    
    return(
        <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        >
            <Grid container justifyContent="center">
        
                <Grid item xl={10} lg={10} md={10} sm={12} xs={12}>
                    <Paper sx={{paddingTop: 4, 
                                paddingRight: 4, 
                                paddingBottom: 1, 
                                paddingLeft: 4}}>
                        <Grid container direction="column" spacing={3}>
                            <Grid item>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="subtitle1">PE Number: {projectExpenseDetails.pe_number}</Typography>
                                    <Typography variant="subtitle1">Status: </Typography>
                                </Stack>
                            </Grid>
                            <Grid item container direction="row" spacing={2}>
                                <Grid item xl={3}>
                                    <Stack direction="column" spacing={1}>
                                        <Typography variant="subtitle1">Supplier Name: {projectExpenseDetails.supplier_name}</Typography>
                                        <Typography variant="subtitle1">Invoice No.: {projectExpenseDetails.invoice_number}</Typography>
                                        <Typography variant="subtitle1">Project Name: {projectExpenseDetails.project_name}</Typography>
                                        <Typography variant="subtitle1">Date Issued: {projectExpenseDetails.date_issued}</Typography>
                                        {projectExpenseDetails.is_vat ? 
                                            <React.Fragment>
                                                <Typography variant="subtitle1">Amount w/o Vat: {projectExpenseDetails.amount_without_vat}</Typography>
                                                <Typography variant="subtitle1">Vat Amount: {projectExpenseDetails.vat_amount}</Typography>
                                                <Typography variant="subtitle1">Amount w/ Vat: {projectExpenseDetails.amount_with_vat}</Typography>
                                            </React.Fragment>
                                        : <Typography variant="subtitle1">Amount : {projectExpenseDetails.amount_without_vat}</Typography>}
                                        
                                    </Stack>
                                </Grid>
                                <Grid item xl={9}>
                                     <PdfViewer file={projectExpenseDetails.file_url} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    )
}
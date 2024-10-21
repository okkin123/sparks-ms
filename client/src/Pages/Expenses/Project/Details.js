import React, {useEffect, useState} from 'react';
import{Box, Grid, Paper, Typography, Stack, AppBar, Toolbar, IconButton, TextField, Chip, Divider} from '@mui/material';
import AxiosInstance from '../../../AxiosInstance';
import dayjs from 'dayjs';

import PdfViewer from '../../../Components/PdfViewer';
// import PrintIcon from '@mui/icons-material/Print';
import NumberFormatCustom from '../../../Components/NumberFormatCustom';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

  

export default function Details(){

    const url = new URL(window.location.href);

    // Create a URLSearchParams object
    const params = new URLSearchParams(url.search);

    // Get the value of the 'param' parameter
    const paramValue = params.get('pe_number');


    const [projectSupplierExpenseDetails, setProjectSupplierExpensesDetails] = useState({
        pe_number: "",
        project_name: "",
        supplier_name: "",
        invoice_number: "",
        created_by_email: "",
        date_issued: "",
        is_vat: "",
        amount_without_vat: "",
        vat_percentage: "",
        vat_amount: "",
        amount_with_vat: "",
        total_payments: "",
        remaining_balance: "",
        currency: "",
    })

    const [projectSupplierPaymentDetails, setProjectSupplierPaymentDetails] = useState([])

    const [file, setFile] = useState(null)

    useEffect(()=>{

        AxiosInstance.post("/project_expense/details", {pe_number: paramValue})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
               const expenses = result.data.project_supplier_expense_details;
               const payments = result.data.project_supplier_payment_details;
                
                setProjectSupplierExpensesDetails({
                    project_expense_id: expenses[0].project_expense_id,
                    pe_number: expenses[0].pe_number,
                    invoice_file_name: expenses[0].invoice_file_name,
                    invoice_file_path: expenses[0].invoice_file_path,
                    project_name: expenses[0].project_name,
                    supplier_name: expenses[0].supplier_name,
                    bank_name: expenses[0].bank_name,
                    account_name: expenses[0].account_name,
                    account_number: expenses[0].account_number,
                    iban: expenses[0].iban,
                    invoice_number: expenses[0].invoice_number,
                    created_by_email: expenses[0].created_by_email,
                    date_issued: dayjs(new Date(expenses[0].date_issued)).format('DD-MMM-YYYY'),
                    is_vat: !!expenses[0].is_vat,
                    amount_without_vat: expenses[0].amount_without_vat,
                    vat_percentage: !!expenses[0].is_vat ? expenses[0].vat_percentage+'%' : '',
                    vat_amount: expenses[0].vat_amount,
                    amount_with_vat: expenses[0].amount_with_vat,
                    currency: expenses[0].currency,
                    status: expenses[0].STATUS,
                    authorized: JSON.parse(expenses[0].reporting_to).user_id.some((user_id)=>user_id === result.data.user_id)
                  })

                  const fetchedSupplierPaymentDetails = payments.map((element) => ({
                    amount: element.amount,
                    currency: element.currency,
                    mode_of_payment: element.mode_of_payment,
                    cheque_no: element.cheque_no,
                    reference_no: element.reference_no,
                    date: element.date,
                    processed_by: element.processed_by,
                    status: element.status,
                    voided_by: element.voided_by
                  })); 
                  setProjectSupplierPaymentDetails(fetchedSupplierPaymentDetails)

                  setFile(result.data.file_url)
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })


       
       

        // eslint-disable-next-line
    },[])
  




    const downloadFile = async (filename, filepath) => {
        try {
          const response = await AxiosInstance.post(`/project_expense/download_file`, {filepath: filepath}, {
            responseType: 'blob',
          });
      
          if (response.status === 200) {
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
          } else {
            console.error('Error: File not found or server error');
          }
        } catch (error) {
          console.error('Error downloading the file:', error);
        }
      };
  

     function handleVoidExpense(project_expense_id){
        AxiosInstance.post("/project_expense/void_expense", {project_expense_id : project_expense_id})
        .then(function(response){
            alert(response.data.status +" "+ response.data.message)
            if(response.data.status === "SUCCESS"){
                window.location.reload()
            }  
        })
        .catch(function(error){
            console.log(error)
        })
     }
    
    return(
        <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        >
            <Grid container justifyContent="center">
            <Grid item xl={12} lg={12} md={12} sm={12} xs={12}>
            <Paper sx={{paddingTop: 4, 
                        paddingRight: 4, 
                        paddingBottom: 1, 
                        paddingLeft: 4}}>
                <Grid container direction="column" spacing={3}>
                    <Grid item>
                        <Stack direction="row" justifyContent="space-between">
                            <Chip color="secondary" size="small" label={"PE Number: "+ projectSupplierExpenseDetails.pe_number}/>
                            <Stack direction="row" spacing={2}>

                            {projectSupplierExpenseDetails.status === 'UNPAID' && projectSupplierExpenseDetails.authorized ? <Chip
                                label="Void" 
                                size="small"
                                onClick={()=>handleVoidExpense(projectSupplierExpenseDetails.project_expense_id)}
                            /> : null}
                            
                            <Chip 
                                label={"Status: "+projectSupplierExpenseDetails.status} 
                                size="small"
                                color={projectSupplierExpenseDetails.status === 'PAID' ? 'success' : projectSupplierExpenseDetails.status === 'PARTIALLY PAID' ? 'warning' :  projectSupplierExpenseDetails.status === 'UNPAID' ? 'info' : 'error'}
                            />
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item container direction="row" spacing={2}>
                        <Grid item xl={5} lg={5}>
                            <Stack direction="column" spacing={2}>
                                <TextField label="Supplier Name" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.supplier_name} />
                                <Stack direction="row" spacing={2}>
                                <TextField label="Date Issued" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.date_issued} />
                                <TextField label="Invoice No." size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.invoice_number} />
                                </Stack>
                                <TextField label="Project Name" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.project_name} />
                                

                                {projectSupplierExpenseDetails.is_vat ? 
                                    <Stack direction="row" spacing={2}>
                                        <TextField label="Amount w/o Vat" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.amount_without_vat}
                                            InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                        <TextField label="Vat Amount" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.vat_amount} InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                        <TextField label="Amount w/ Vat" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.amount_with_vat} InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                    </Stack>
                                : <TextField label="Amount" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.amount_without_vat} InputProps={{
                                    inputComponent: NumberFormatCustom,
                                    }} />}
 
                                    <TextField label="Currency" size="small" variant="outlined" readOnly fullWidth value={projectSupplierExpenseDetails.currency}
                                        />
                                <Typography variant="body1">PAYMENT DETAILS:</Typography>
                                {projectSupplierPaymentDetails.map((projectSupplierPaymentDetail)=>(
                                    <React.Fragment>
                                    <Stack direction="row" gap={1} justifyContent="flex-start" alignItems="flex-start" flexWrap="wrap">
                                    <Chip 
                                        label={<>Status: <b>{projectSupplierPaymentDetail.status}</b></>}
                                        size="small"
                                        color={projectSupplierPaymentDetail.status === 'PAID' ? 'success' : 'error' }
                                    /> 
                                     {projectSupplierPaymentDetail.voided_by && <Chip 
                                        label={<>Voided By: <b>{projectSupplierPaymentDetail.voided_by}</b></>}
                                        size="small"
                                    />}
                                    <Chip 
                                        label={<>Mode of Payment: <b>{projectSupplierPaymentDetail.mode_of_payment}</b></>}
                                        size="small"
                                        color={projectSupplierPaymentDetail.mode_of_payment === 'Cash' ? 'secondary' : projectSupplierPaymentDetail.mode_of_payment === 'Online Transfer' ? 'warning' : 'info' }
                                    /> 
                                    {projectSupplierPaymentDetail.mode_of_payment !== 'Cash' ? <Chip 
                                        label={<>{projectSupplierPaymentDetail.mode_of_payment==='Cheque Deposit' ? 'Cheque No.: ' : projectSupplierPaymentDetail.mode_of_payment==='Online Transfer' ? 'Reference No.: ' : ''} 
                                        <b>{projectSupplierPaymentDetail.mode_of_payment==='Cheque Deposit' ? projectSupplierPaymentDetail.cheque_no : projectSupplierPaymentDetail.mode_of_payment==='Online Transfer' ? projectSupplierPaymentDetail.reference_no : ''}</b></>}
                                        size="small"
                                    /> : null }
                                    <Chip 
                                    label={<>Date: <b>{dayjs(new Date(projectSupplierPaymentDetail.date)).format('DD-MMM-YYYY')}</b></>}
                                        size="small"
                                    /> 
                                    <Chip 
                                        label={<>Processed By: <b>{projectSupplierPaymentDetail.processed_by}</b></>}
                                        size="small"
                                    />
                                   
                                    
                                </Stack> 
                                <Divider />
                                </React.Fragment>
                                ))}

                            </Stack>
                        </Grid>
                        <Grid item xl={7} lg={7}>
                            <Box sx={{ flexGrow: 1}}>
                                <AppBar position="static">
                                <Toolbar variant='dense'>
                                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                     Invoice
                                    </Typography>
                                    {/* <IconButton
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                        //sx={{ ml: 2 }}
                                    >
                                        <PrintIcon />
                                    </IconButton> */}
                                    <IconButton
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                        //sx={{ ml: 2 }}
                                        onClick={()=>downloadFile(projectSupplierExpenseDetails.invoice_file_name, projectSupplierExpenseDetails.invoice_file_path)}
                                    >
                                        <FileDownloadIcon />
                                    </IconButton>
                                </Toolbar>
                                </AppBar>
                            </Box>
                            <PdfViewer file={`${file}`} />
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
        </Grid>
        </Box>
    )
}
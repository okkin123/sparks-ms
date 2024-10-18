import React, {useEffect, useState} from 'react';
import{Box, Grid, Paper, Typography, Stack, AppBar, Toolbar, IconButton, TextField, Chip} from '@mui/material';
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


    const [projectExpenseDetails, setProjectExpensesDetails] = useState({
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


    const [file, setFile] = useState(null)

    useEffect(()=>{

        AxiosInstance.post("/project_expense/details", {pe_number: paramValue})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
              
                
                setProjectExpensesDetails({
                    project_expense_id: result.data.project_expense_details[0].project_expense_id,
                    pe_number: result.data.project_expense_details[0].pe_number,
                    invoice_file_name: result.data.project_expense_details[0].invoice_file_name,
                    invoice_file_path: result.data.project_expense_details[0].invoice_file_path,
                    project_name: result.data.project_expense_details[0].project_name,
                    supplier_name: result.data.project_expense_details[0].supplier_name,
                    bank_name: result.data.project_expense_details[0].bank_name,
                    account_name: result.data.project_expense_details[0].account_name,
                    account_number: result.data.project_expense_details[0].account_number,
                    iban: result.data.project_expense_details[0].iban,
                    invoice_number: result.data.project_expense_details[0].invoice_number,
                    created_by_email: result.data.project_expense_details[0].created_by_email,
                    date_issued: dayjs(new Date(result.data.project_expense_details[0].date_issued)).format('DD-MMM-YYYY'),
                    is_vat: !!result.data.project_expense_details[0].is_vat,
                    amount_without_vat: result.data.project_expense_details[0].amount_without_vat,
                    vat_percentage: !!result.data.project_expense_details[0].is_vat ? result.data.project_expense_details[0].vat_percentage+'%' : '',
                    vat_amount: result.data.project_expense_details[0].vat_amount,
                    amount_with_vat: result.data.project_expense_details[0].amount_with_vat,
                    currency: result.data.project_expense_details[0].currency,
                    status: result.data.project_expense_details[0].STATUS,
                    authorized: JSON.parse(result.data.project_expense_details[0].reporting_to).user_id.some((user_id)=>user_id === result.data.user_id)
                  })

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
                            <Chip color="secondary" size="small" label={"PE Number: "+ projectExpenseDetails.pe_number}/>
                            <Stack direction="row" spacing={2}>

                            {projectExpenseDetails.status === 'UNPAID' && projectExpenseDetails.authorized ? <Chip
                                label="Void" 
                                size="small"
                                onClick={()=>handleVoidExpense(projectExpenseDetails.project_expense_id)}
                            /> : null}
                            
                            <Chip 
                                label={"Status: "+projectExpenseDetails.status} 
                                size="small"
                                color={projectExpenseDetails.status === 'PAID' ? 'success' : projectExpenseDetails.status === 'PARTIALLY PAID' ? 'warning' :  projectExpenseDetails.status === 'UNPAID' ? 'info' : 'error'}
                            />
                            </Stack>
                        </Stack>
                    </Grid>
                    <Grid item container direction="row" spacing={2}>
                        <Grid item xl={5} lg={5}>
                            <Stack direction="column" spacing={2}>
                                <TextField label="Supplier Name" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.supplier_name} />
                                <Stack direction="row" spacing={2}>
                                <TextField label="Date Issued" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.date_issued} />
                                <TextField label="Invoice No." size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.invoice_number} />
                                </Stack>
                                <TextField label="Project Name" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.project_name} />
                                

                                {projectExpenseDetails.is_vat ? 
                                    <Stack direction="row" spacing={2}>
                                        <TextField label="Amount w/o Vat" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.amount_without_vat}
                                            InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                        <TextField label="Vat Amount" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.vat_amount} InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                        <TextField label="Amount w/ Vat" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.amount_with_vat} InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                    </Stack>
                                : <TextField label="Amount" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.amount_without_vat} InputProps={{
                                    inputComponent: NumberFormatCustom,
                                    }} />}
 
                                    <TextField label="Currency" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.currency}
                                        />


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
                                        onClick={()=>downloadFile(projectExpenseDetails.invoice_file_name, projectExpenseDetails.invoice_file_path)}
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
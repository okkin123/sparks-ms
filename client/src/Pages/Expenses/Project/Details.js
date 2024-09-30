import React, {useEffect, useState} from 'react';
import{Box, Grid, Paper, Typography, Stack, AppBar, Toolbar, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Autocomplete, Button} from '@mui/material';
import AxiosInstance from '../../../AxiosInstance';
import AxiosFileInstance from '../../../AxiosFileInstance';
import dayjs from 'dayjs';

import PdfViewer from '../../../Components/PdfViewer';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import NumberFormatCustom from '../../../Components/NumberFormatCustom';
import FileUpload from '../../../Components/FileUpload';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const MakePaymentSchema = Yup.object().shape({
    mode_of_payment: Yup.string()
    .required('This field is required!'),
    date_issued: Yup.date().required('Date issued is required'),
    cheque_no: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed!')
    .test('is-required-if', 'This field is required!', function (value) {
        const { mode_of_payment } = this.parent;
        if (mode_of_payment === 'Cheque Deposit') {
          return false;
        }
        return true;
    }),
    name: Yup.string()
    .required('This field is required!'),
    bank_name: Yup.string()
    .required('This field is required!'),
    account_number: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed!')
    .required('This field is required!'),
    amount: Yup.string()
      .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
      .required('This field is required!'),
    file: Yup.mixed().required('Supporting document is required!'),
  });

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
        currency: "",
    })
    const [file, setFile] = useState(null)
    const [paymentDetails, setPaymentDetails] = useState([])
    const formik_make_payment = useFormik({
        initialValues: {
            mode_of_payment: "",
            cheque_no: "",
            bank_name: "",
            account_number: "",
            name: "",
            amount: "",
            file: null
        },
        validateOnChange: false,
        validationSchema: MakePaymentSchema,
        onSubmit: ((values, {validateForm})=>{
        
        })
    })

    const handleFileUpload = (file) => {
        formik_make_payment.setFieldValue('file', file);
    };
    
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
                    currency: result.data.project_expense_details[0].currency
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


    function handleGetPaymentDetails(name){
        AxiosInstance.post("/project_expense/get_payment_details", {name: name})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){

                setPaymentDetails((paymentDetails)=>[
                ...result.data.payment_details.map(element => ({
                    name: element.name,
                    bank_name: element.bank_name,
                    account_number: element.account_number
                }))
                ])

            }else{
                console.log(result.data.message)
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
                                <Grid item xl={5}>
                                    <Stack direction="column" spacing={2}>
                                        <TextField label="Supplier Name" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.supplier_name} />
                                        <TextField label="Invoice No." size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.invoice_number} />
                                        <TextField label="Project Name" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.project_name} />
                                        <TextField label="Date Issued" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.date_issued} />

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
                                            <Stack direction="row" spacing={2}>
                                                <TextField label="Total Payments" size="small" variant="outlined" readOnly fullWidth 
                                                    InputProps={{
                                                    inputComponent: NumberFormatCustom,
                                                  }} />
                                                <TextField label="Remaining Balance" size="small" variant="outlined" readOnly fullWidth InputProps={{
                                                    inputComponent: NumberFormatCustom,
                                                  }} />
                                            </Stack>
                                            <Stack direction="row" justifyContent="space-between">      
                                                <Typography variant="subtitle1">MAKE PAYMENT:</Typography> 
                                                <Button variant="contained" color="success" size="small" onClick={formik_make_payment.handleSubmit}>Submit Payment</Button>
                                            </Stack>
                                            <FormControl
                                                fullWidth
                                                size="small"
                                                error={formik_make_payment.touched.mode_of_payment && Boolean(formik_make_payment.errors.mode_of_payment)}
                                                >
                                                <InputLabel>Mode of Payment</InputLabel>
                                                <Select
                                                name="mode_of_payment"
                                                value={formik_make_payment.values.mode_of_payment}
                                                label="Mode of Payment"
                                                onChange={(event)=>formik_make_payment.setFieldValue('mode_of_payment',event.target.value)}
                                                >
                                                    <MenuItem value={'Cheque Deposit'}>
                                                        Cheque Deposit
                                                    </MenuItem>
                                                    <MenuItem value={'Account Deposit'}>
                                                        Account Deposit
                                                    </MenuItem>
                                                </Select>
                                                <FormHelperText>
                                                {formik_make_payment.touched.mode_of_payment && formik_make_payment.errors.mode_of_payment}
                                                </FormHelperText>
                                            </FormControl> 
                                            {formik_make_payment.values.mode_of_payment === 'Cheque Deposit' && <TextField label="Cheque No." size="small" variant="outlined" name="cheque_no" readOnly fullWidth 
                                            onChange={formik_make_payment.handleChange} value={formik_make_payment.values.cheque_no} /> }
                                            <Autocomplete
                                                freeSolo
                                                selectOnFocus
                                                clearOnBlur
                                                handleHomeEndKeys
                                                onFocus={()=>handleGetPaymentDetails(formik_make_payment.values.name)}
                                                options={paymentDetails.map((option) => option.name)}
                                                value={formik_make_payment.values.name}
                                                onChange={(event, value)=>formik_make_payment.setFieldValue('name', value)}
                                                renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Name"
                                                    name="name"
                                                    value={formik_make_payment.values.name}
                                                    onChange={formik_make_payment.handleChange}
                                                    fullWidth
                                                    size="small"
                                                    error={
                                                        formik_make_payment.touched.name && Boolean(formik_make_payment.errors.name)
                                                    }
                                                    helperText={
                                                        formik_make_payment.touched.name && formik_make_payment.errors.name
                                                    }
                                                />
                                                )}
                                                fullWidth
                                            />
                                            <Autocomplete
                                                freeSolo
                                                selectOnFocus
                                                clearOnBlur
                                                handleHomeEndKeys
                                                onFocus={()=>handleGetPaymentDetails(formik_make_payment.values.name)}
                                                options={paymentDetails.map((option) => option.account_number)}
                                                value={formik_make_payment.values.account_number}
                                                onChange={(event, value)=>formik_make_payment.setFieldValue('account_number', value)}
                                                renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Account Number"
                                                    name="account_number"
                                                    value={formik_make_payment.values.account_number}
                                                    onChange={formik_make_payment.handleChange}
                                                    fullWidth
                                                    size="small"
                                                    error={
                                                        formik_make_payment.touched.account_number && Boolean(formik_make_payment.errors.account_number)
                                                    }
                                                    helperText={
                                                        formik_make_payment.touched.account_number && formik_make_payment.errors.account_number
                                                    }
                                                />
                                                )}
                                                fullWidth
                                            />
                                            <Autocomplete
                                                freeSolo
                                                selectOnFocus
                                                clearOnBlur
                                                handleHomeEndKeys
                                                onFocus={()=>handleGetPaymentDetails(formik_make_payment.values.name)}
                                                options={paymentDetails.map((option) => option.bank_name)}
                                                value={formik_make_payment.values.bank_name}
                                                onChange={(event, value)=>formik_make_payment.setFieldValue('bank_name', value)}
                                                renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Bank Name"
                                                    name="bank_name"
                                                    value={formik_make_payment.values.bank_name}
                                                    onChange={formik_make_payment.handleChange}
                                                    fullWidth
                                                    size="small"
                                                    error={
                                                        formik_make_payment.touched.bank_name && Boolean(formik_make_payment.errors.bank_name)
                                                    }
                                                    helperText={
                                                        formik_make_payment.touched.bank_name && formik_make_payment.errors.bank_name
                                                    }
                                                />
                                                )}
                                                fullWidth
                                            />
                                            <TextField label="Amount" name="amount" onChange={formik_make_payment.handleChange} size="small" variant="outlined" readOnly 
                                            fullWidth value={formik_make_payment.values.amount} />
                                            <Typography variant="subtitle1">Supporting Doc:</Typography>
                                            <FileUpload onFileUpload={handleFileUpload} fileTypes={['image/jpeg', 'image/png', 'application/pdf']} />
                                    </Stack>
                                </Grid>
                                <Grid item xl={7}>
                                   <Box sx={{ flexGrow: 1}}>
                                        <AppBar position="static">
                                        <Toolbar variant='dense'>
                                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                            Supplier Invoice
                                            </Typography>
                                            <IconButton
                                                size="large"
                                                edge="start"
                                                color="inherit"
                                                aria-label="menu"
                                                //sx={{ ml: 2 }}
                                            >
                                                <PrintIcon />
                                            </IconButton>
                                            <IconButton
                                                size="large"
                                                edge="start"
                                                color="inherit"
                                                aria-label="menu"
                                                //sx={{ ml: 2 }}
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
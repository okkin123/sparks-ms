import React, {useEffect, useState} from 'react';
import{Box, Grid, Paper, Typography, Stack, AppBar, Toolbar, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Tabs, Tab} from '@mui/material';
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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoadingButton from '@mui/lab/LoadingButton';

const MakePaymentSchema = Yup.object().shape({
    mode_of_payment: Yup.string()
    .required('This field is required!'),
    date_issued: Yup.date().required('Date issued is required'),
    cheque_no: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed!')
    .test('is-required-if', 'This field is required!', function (value) {
        const { mode_of_payment } = this.parent;
        if (mode_of_payment === 'Cheque Deposit') { 
          return true;
        }
        return false;
    }),
    name: Yup.string()
    .required('This field is required!'),
    bank_name: Yup.string()
    .required('This field is required!'),
    account_number: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed!')
    .required('This field is required!'),
    date: Yup.date().required('Date is required'),
    amount: Yup.string()
      .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
      .required('This field is required!'),
    file: Yup.mixed().required('Supporting document is required!')
  });

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
          <Box pl={2} pr={2}>
            {children}
          </Box>
        )}
      </div>
    );
  }
  

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
    const [fileAlert, setFileAlert] = useState(false)
    const [loading, setLoading] = useState(false)
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

    const formik_make_payment = useFormik({
        initialValues: {
            mode_of_payment: "",
            cheque_no: "",
            bank_name: "",
            account_number: "",
            name: "",
            date: null,
            amount: "",
            file: null
        },
        validateOnChange: false,
        validationSchema: MakePaymentSchema,
        onSubmit: (values, {validateForm})=>{
                console.log(values)
                setLoading(true)
                const formData = new FormData();
                formData.append('file', values.file);
                formData.append('values', JSON.stringify(values))
                
                AxiosFileInstance.post("/project_expense/insert_payment", formData)
                .then(function(response){
                  if(response.data.status === 'SUCCESS'){
                    setLoading(false)
                    console.log(response.data.message)
                  }else{
                    console.log(response.data.message)
                  }
                })
                .catch(function(error){
                  console.log(error)
                })
        }
    })

    const handleFileUpload = (file) => {
        formik_make_payment.setFieldValue('file', file);
        setFileAlert(true)
    };
    
    useEffect(()=>{
        AxiosInstance.post("/project_expense/details", {pe_number: paramValue})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
              
                
                setProjectExpensesDetails({
                    pe_number: result.data.project_expense_details[0].pe_number,
                    project_name: result.data.project_expense_details[0].project_name,
                    supplier_name: result.data.project_expense_details[0].supplier_name,
                    bank_name: result.data.project_expense_details[0].bank_name,
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
                                    <Chip color="secondary" size="small" label={"PE Number: "+ projectExpenseDetails.pe_number}/>
                                    <Typography variant="subtitle1">Status: </Typography>
                                </Stack>
                            </Grid>
                            <Grid item container direction="row" spacing={2}>
                                <Grid item xl={5}>
                                    <Stack direction="column" spacing={2}>
                                        <TextField label="Supplier Name" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.supplier_name} />
                                        <Stack direction="row" spacing={2}>
                                        <TextField label="Invoice No." size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.invoice_number} />
                                        <TextField label="Date Issued" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.date_issued} />
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
                                            <Stack direction="row" spacing={2}>
                                                <TextField label="Total Payments" size="small" variant="outlined" readOnly fullWidth 
                                                    InputProps={{
                                                    inputComponent: NumberFormatCustom,
                                                  }} />
                                                <TextField label="Remaining Balance" size="small" variant="outlined" readOnly fullWidth InputProps={{
                                                    inputComponent: NumberFormatCustom,
                                                  }} />
                                            </Stack>


                                            {/* Tabs         */}
                                            {/* <Box sx={{width: '100%' }}> */}
                                            <AppBar position="static" color="transparent">
                                                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth"  indicatorColor="primary" textColor='inherit'>
                                                    <Tab label="Payments" />
                                                    <Tab label="Make Payment" />
                                                </Tabs>
                                            </AppBar>

                                           <TabPanel value={tabValue} index={0}>
                                            </TabPanel>

                                            <TabPanel value={tabValue} index={1}>
                                             <Stack direction="column" spacing={2}>
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
                                                {
                                                formik_make_payment.values.mode_of_payment === 'Cheque Deposit' && <TextField label="Cheque No." size="small" variant="outlined" name="cheque_no" fullWidth 
                                                onChange={formik_make_payment.handleChange} value={formik_make_payment.values.cheque_no} 
                                                error={
                                                    formik_make_payment.touched.cheque_no && Boolean(formik_make_payment.errors.cheque_no)
                                                }
                                                helperText={
                                                    formik_make_payment.touched.cheque_no && formik_make_payment.errors.cheque_no
                                                } />  }
                                        
                                                { (formik_make_payment.values.mode_of_payment === 'Account Deposit' ||
                                                formik_make_payment.values.mode_of_payment === 'Cheque Deposit') &&
                                                <React.Fragment>
                                                 <TextField label="Bank Name" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.bank_name} />
                                                 <TextField label="Account No" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.account_number} />
                                                 <TextField label="IBAN" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.iban} />
                                                 <Stack direction="row" spacing={2}>
                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                        <DatePicker 
                                                        value={dayjs(formik_make_payment.values.date)}
                                                        onChange={(value)=>formik_make_payment.setFieldValue('date', dayjs(new Date(value)).format('YYYY-MM-DD'))}
                                                        slotProps={{
                                                            textField: {
                                                            label: 'Date',
                                                            variant: 'outlined',
                                                            name: 'date',
                                                            size: 'small', 
                                                            fullWidth: true,
                                                            error: Boolean(formik_make_payment.errors.date),
                                                            helperText:formik_make_payment.touched.date && formik_make_payment.errors.date
                                                            },
                                                        }} />
                                                    </LocalizationProvider>
                                                    <TextField label="Amount" name="amount" onChange={formik_make_payment.handleChange} size="small" variant="outlined" 
                                                    fullWidth value={formik_make_payment.values.amount}
                                                    error={
                                                        formik_make_payment.touched.amount && Boolean(formik_make_payment.errors.amount)
                                                    }
                                                    helperText={
                                                        formik_make_payment.touched.amount && formik_make_payment.errors.amount
                                                    } />
                                                </Stack>
                                            
                                                <Typography variant="subtitle1">Supporting Doc:</Typography>
                                                <FileUpload onFileUpload={handleFileUpload} fileTypes={['application/pdf']} mainError={formik_make_payment.touched.file && Boolean(formik_make_payment.errors.file)} alertOpen={fileAlert} />
                                                 <input type="file" name="file" value={formik_make_payment.values.file} />
                                                 <Typography>{formik_make_payment.touched.file && Boolean(formik_make_payment.errors.file)}</Typography>
                                                <Stack direction="row" justifyContent="flex-end">
                                                <LoadingButton variant='contained' color='secondary' onClick={formik_make_payment.handleSubmit} loading={loading}>Save Payment</LoadingButton>
                                                </Stack>  
                                                </React.Fragment> }
                                               
                                                </Stack> 
                                            </TabPanel>

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
import React, {useEffect, useState} from 'react';
import{Box, Grid, Paper, Typography, Stack, AppBar, Toolbar, IconButton, TextField, FormControl, InputLabel, Select, MenuItem, FormHelperText, Chip, Tabs, Tab, List, ListItem, ListItemAvatar, ListItemText, Divider, Alert, Button} from '@mui/material';
import AxiosInstance from '../../../AxiosInstance';
import AxiosFileInstance from '../../../AxiosFileInstance';
import dayjs from 'dayjs';

import PdfViewer from '../../../Components/PdfViewer';
// import PrintIcon from '@mui/icons-material/Print';
import NumberFormatCustom from '../../../Components/NumberFormatCustom';
import FileUpload from '../../../Components/FileUpload';
import Dialog from '../../../Components/Dialog';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoadingButton from '@mui/lab/LoadingButton';

import CloseIcon from '@mui/icons-material/Close';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Check from '@mui/icons-material/Check';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import { NumericFormat } from 'react-number-format';

const MakePaymentSchema = Yup.object().shape({
    date: Yup.date().required('Date is required'),
    cheque_no: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed!')
    .test('is-required-if', 'This field is required!', function (value) {
        const { mode_of_payment } = this.parent;
        if (mode_of_payment === 'Cheque Deposit') {
            return value !== undefined && value !== null && value !== '';
        }
        return true;
    }),
    amount: Yup.string()
      .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
      .required('This field is required!')
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
          <Box>
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
        total_payments: "",
        remaining_balance: "",
        currency: "",
    })

    const [payments, setPayments] = useState([])

    const [file, setFile] = useState(null)
    const [fileAlert, setFileAlert] = useState(false)
    const [fileError, setFileError] = useState('')
    const [amountAlert, setAmountAlert] = useState('');
    const [loading, setLoading] = useState({
        make_payment: false,
        void_payment: false
    })
    const [tabValue, setTabValue] = useState(0);
    const [dialogVoid, setDialogVoid] = useState({
        project_expense_payment_id: 0,
        content: null
    });
    const handleTabChange = (event, newValue) => {
      setTabValue(newValue);
    };

    const formik_make_payment = useFormik({
        initialValues: {
            project_expense_id: 0,
            mode_of_payment: "",
            cheque_no: "",
            bank_name: "",
            account_name: "",
            account_number: "",
            name: "",
            date: null,
            amount: "",
            file: null
        },
        validateOnChange: false,
        validationSchema: MakePaymentSchema,
        onSubmit: (values, {validateForm})=>{
                if(values.file === null){
                    setFileError('Supporting Document is required!')
                    setFileAlert(true)
                }else if(parseFloat(values.amount) > projectExpenseDetails.remaining_balance)
                {
                    setAmountAlert('The amount is invalid! The remaining balance for this invoice is greater than the payment amount. Please check and try again!')
                }
                else{
                    setLoading({...loading, make_payment: true})
                    const formData = new FormData();
                    formData.append('file', values.file);
                    formData.append('values', JSON.stringify(values))
                    
                    AxiosFileInstance.post("/project_expense/insert_payment", formData)
                    .then(function(response){
                      if(response.data.status === 'SUCCESS'){
                        
                        alert(response.data.message)
                        window.location.reload()
                      }else{
                        console.log(response.data.message)
                      }
                      setLoading({...loading, make_payment: false})
                    })
                    .catch(function(error){
                      console.log(error)
                    })
                }
        
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
                    total_payments: result.data.project_expense_details[0].total_payments,
                    remaining_balance: result.data.project_expense_details[0].remaining_balance,
                    currency: result.data.project_expense_details[0].currency,
                    status: result.data.project_expense_details[0].STATUS,
                    authorized: JSON.parse(result.data.project_expense_details[0].reporting_to).user_id.some((user_id)=>user_id === result.data.user_id)
                  })

                  setFile(result.data.file_url)
                  getPayments(result.data.project_expense_details[0].project_expense_id)
                  formik_make_payment.setFieldValue('project_expense_id', result.data.project_expense_details[0].project_expense_id)
                  formik_make_payment.setFieldValue('bank_name', result.data.project_expense_details[0].bank_name)
                  formik_make_payment.setFieldValue('account_name', result.data.project_expense_details[0].account_name)
                  formik_make_payment.setFieldValue('account_number', result.data.project_expense_details[0].account_number)
                  formik_make_payment.setFieldValue('iban', result.data.project_expense_details[0].iban)
                  
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })


       
       

        // eslint-disable-next-line
    },[])
  

    function getPayments(project_expense_id){
     
        AxiosInstance.post("/project_expense/payments", {project_expense_id : project_expense_id})
        .then(function(result){
            if(result.data.status === 'SUCCESS')
            {
                setPayments(result.data.payments.map((element)=>({
                    void_open: false,
                    project_expense_payment_id: element.project_expense_payment_id,
                    mode_of_payment: element.mode_of_payment,
                    amount: element.amount,
                    cheque_no: element.cheque_no,
                    date: dayjs(new Date(element.date_paid)).format('DD-MMM-YYYY'),
                    supporting_doc: element.supporting_doc_name,
                    bank_name: element.bank_name,
                    account_name: element.account_name,
                    account_number: element.account_number,
                    iban: element.iban,
                    processed_by: element.processed_by,
                    status: element.status,
                    supporting_doc_name: element.supporting_doc_name,
                    supporting_doc_path: element.supporting_doc_path,
                    voided_by: element.voided_by,
                    authorized: JSON.parse(element.reporting_to).user_id.some((user_id)=>user_id === result.data.user_id)
                    })
                ))
            }       
            else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })
    }

    function handleVoidPaymentDialog(index){
            setPayments(payments.map((payment, i) =>
              i === index ? { ...payment, void_open: true } : payment
            ));
    }

    const handleVoidPaymentDialogCancel = (index)=>{
        setPayments(payments.map((payment, i) =>
            i === index ? { ...payment, void_open: false } : payment
          ));
      }

    function voidPayment(project_expense_payment_id){
     
        setLoading({...loading, void_payment: true})
        AxiosInstance.post("/project_expense/void_payment", {project_expense_payment_id : project_expense_payment_id})
        .then(function(response){
            if(response.data.status === 'SUCCESS')
            {
                setDialogVoid({
                    open: false,
                    project_expense_payment_id: 0,
                    content: null
                })
                alert(response.data.message)
                window.location.reload()
            }       
            else{
                console.log(response.data.message)
            }
            setLoading({...loading, void_payment: false})
        })
        .catch(function(error){
            console.log(error)
        })
    }

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
                                    <Stack direction="row" spacing={2}>
                                        <TextField label="Total Payments" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.total_payments}
                                            InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                        <TextField label="Remaining Balance" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.remaining_balance}
                                        InputProps={{
                                            inputComponent: NumberFormatCustom,
                                            }} />
                                            <TextField label="Currency" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.currency}
                                             />
                                    </Stack>


                                    {/* Tabs         */}
                                    {/* <Box sx={{width: '100%' }}> */}
                                    <AppBar position="static  " color="primary">
                                        <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth"  
                                        textColor='inherit'>
                                            <Tab label="Payments" />
                                            <Tab label="Make Payment" />
                                        </Tabs>
                                    </AppBar>

                                    <TabPanel value={tabValue} index={0}>

                                        <List dense={true}>
                                            {
                                                payments.map((element, key)=>(
                                                    <React.Fragment key={key}>
                                                    <ListItem
                                                    secondaryAction={
                                                        <Stack direction="row" spacing={1}>
                                                            { !element.voided_by && element.authorized && <IconButton edge="end" size="small" color="error" onClick={()=>{
                                                            handleVoidPaymentDialog(key)
                                                            setDialogVoid({...dialogVoid, open: true, project_expense_payment_id: parseInt(element.project_expense_payment_id),
                                                            content:
                                                            <ListItemText
                                                                primary={
                                                                <Stack direction="row" justifyContent="center" spacing={1}>
                                                                        <NumericFormat 
                                                                        value={element.amount} 
                                                                        displayType={'text'}
                                                                        thousandSeparator={true}
                                                                        decimalScale={2}
                                                                        fixedDecimalScale={true}
                                                                        style={{ fontSize: '16px', fontWeight: 'bold'}}  />
                                                                        <Typography variant="body1"><strong>{projectExpenseDetails.currency}</strong></Typography>
                                                                </Stack>}
                                                                secondary={
                                                                <Stack direction="row" gap={1} justifyContent="center" alignItems="center" flexWrap="wrap">
                                                                    <Chip color="secondary" label={element.mode_of_payment} size="small" />
                                                                    {element.cheque_no !== 0 && <Chip color="warning" label={'Cheque No. '+element.cheque_no} size="small" /> }
                                                                    <Chip color="info" label={'Date Paid: '+element.date} size="small" />
                                                                    <Chip variant='outlined' color="success" label={'Bank Name: '+element.bank_name} size="small" />
                                                                    <Chip variant='outlined' color="secondary" label={'Account Name: '+element.account_name} size="small" />
                                                                    <Chip variant='outlined' color="warning" label={'Account No.: '+element.account_number} size="small" />
                                                                    <Chip variant='outlined' color="info" label={'IBAN: '+element.iban} size="small" />
                                                                    <Chip label={'Processed By: '+element.processed_by} size="small" />
                                                                </Stack>
                                                                }
                                                            />
                                                            })
                                                           }

                                                            }>
                                                            <RemoveCircleIcon />
                                                            </IconButton> }
                                                            <Dialog open={element.void_open} content={
                                                                <Stack direction="column" spacing={2}>
                                                                        <Typography variant="h6">VOID PAYMENT</Typography>
                                                                        <Typography variant="body2">Are you sure you want to void this payment?</Typography>
                                                                        {dialogVoid.content}
                                                                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                                                            <Button size="small" onClick={()=>handleVoidPaymentDialogCancel(key)}>Cancel</Button>
                                                                            <LoadingButton loading={loading.void_payment} size="small" variant="contained" color="secondary" onClick={()=>voidPayment(element.project_expense_payment_id)}>Yes</LoadingButton>
                                                                        </Stack>
                                                                </Stack>
                                                            } />
                                                            <IconButton onClick={()=>downloadFile(element.supporting_doc_name, element.supporting_doc_path)} color="secondary" edge="end" size="small" >
                                                            <FileDownloadIcon />
                                                            </IconButton>
                                                        </Stack>
                                                    }

                                                    >
                                                    <ListItemAvatar>
                                                            { !element.voided_by ? <Check color='success' /> : <CloseIcon color='error' />}
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={<Stack direction="row" spacing={1}>
                                                                        <NumericFormat 
                                                                        value={element.amount} 
                                                                        displayType={'text'}
                                                                        thousandSeparator={true}
                                                                        decimalScale={2}
                                                                        fixedDecimalScale={true}
                                                                        style={{ fontSize: '16px', fontWeight: 'bold'}}  />
                                                                        <Typography variant="body1"><strong>{projectExpenseDetails.currency}</strong></Typography>
                                                                 </Stack>}
                                                        secondary={
                                                            <Stack direction="row" gap={1} justifyContent="flex-start" alignItems="center" flexWrap="wrap">
                                                                <Chip color="secondary" label={element.mode_of_payment} size="small" />
                                                                {element.cheque_no !== 0 && <Chip color="warning" label={'Cheque No. '+element.cheque_no} size="small" /> }
                                                                <Chip color="info" label={'Date Paid: '+element.date} size="small" />
                                                                <Chip variant='outlined' color="success" label={'Bank Name: '+element.bank_name} size="small" />
                                                                <Chip variant='outlined' color="secondary" label={'Account Name: '+element.account_name} size="small" />
                                                                <Chip variant='outlined' color="warning" label={'Account No.: '+element.account_number} size="small" />
                                                                <Chip variant='outlined' color="info" label={'IBAN: '+element.iban} size="small" />
                                                                <Chip label={'Processed By: '+element.processed_by} size="small" />
                                                                { element.voided_by && <Chip color="error" label={'Voided By: '+element.voided_by} size="small" />}
                                                            </Stack>
                                                        }
                                                    />
                                                    </ListItem>
                                                    <Divider />
                                                    </React.Fragment>
                                                ))
                                            }

                                        </List>
                                    </TabPanel>

                                    <TabPanel value={tabValue} index={1}>
                                        <Stack direction="column" spacing={2}>
                                        {amountAlert && <Alert severity="error">{amountAlert}</Alert> }
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
                                            <TextField label="Account Name" size="small" variant="outlined" readOnly fullWidth value={projectExpenseDetails.account_name} />
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
                                        <FileUpload onFileUpload={handleFileUpload} fileTypes={['application/pdf']} mainError={fileError} alertOpen={fileAlert} />
                                        <Stack direction="row" justifyContent="flex-end">
                                        <LoadingButton variant='contained' color='secondary' onClick={formik_make_payment.handleSubmit} loading={loading.make_payment}>Save Payment</LoadingButton>
                                        </Stack>  
                                        </React.Fragment> }
                                        
                                        </Stack> 
                                    </TabPanel>

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
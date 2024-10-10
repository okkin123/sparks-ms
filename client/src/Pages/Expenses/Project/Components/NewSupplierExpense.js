import {Autocomplete, Divider, AppBar, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Stack, TextField, Toolbar, Typography, Alert, Collapse, IconButton, Checkbox, FormControlLabel} from '@mui/material';
import React, {useState, useEffect} from 'react';
import PdfViewer from '../../../../Components/PdfViewer';
import FileUpload from '../../../../Components/FileUpload';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import AxiosFileInstance from '../../../../AxiosFileInstance';
import AxiosInstance from '../../../../AxiosInstance';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoadingButton from '@mui/lab/LoadingButton';

import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

const ProjectExpenseSchema = Yup.object().shape({
  ref_invoice_number: Yup.string()
  .required('This field is required!'),
  project_name: Yup.string()
  .required('This field is required!'),
  file: Yup.mixed().required('Supplier invoice file is required!'),
  date_issued: Yup.date().required('Date issued is required'),
  supplier_name: Yup.string()
  .required('This field is required!'),
  supplier_invoice_number: Yup.string()
  .required('This field is required!'),
  amount_without_vat: Yup.string()
    .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
    .required('This field is required!'),
  bank_name: Yup.string()
  .required('This field is required!'),
  account_number: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed!')
    .required('This field is required!'),
  iban: Yup.string()
  .required('This field is required!')
});


export default function NewSupplierExpense(){
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [supplierDetails, setSupplierDetails] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState([])

    const [response, setResponse] = useState({
      open: false,
      severity: "",
      message: ""
    })
    const [isEditing, setIsEditing] = useState(false)
    const [fileAlert, setFileAlert] = useState(false)
    const [previousValue, setPreviousValue] = useState({
      bank_name: "",
      account_name: "",
      account_number: "",
      iban: ""
    })
  

    const handleFileUpload = (file) => {
      const fileUrl = URL.createObjectURL(file);
      setFile(fileUrl);
      formik_project_expense.setFieldValue('file', file)
      setFileAlert(true)
      setResponse({...response, open: false})
      };

    useEffect(()=>{
      AxiosInstance.get("/preferences/currency")
      .then(function(result){
           formik_project_expense.setFieldValue('currency', result.data.currency);
      })
      .catch(function(error){
        console.log(error)
      }) 

      // eslint-disable-next-line  
    }, [])

    const formik_project_expense = useFormik({
      initialValues: {
        file: null,
        date_issued: null,
        is_vat: false,
        ref_invoice_number: "",
        project_name: "",
        supplier_name: "",
        supplier_invoice_number: "",
        amount_without_vat: "",
        vat_amount: "",
        amount_with_vat: "",
        vat_percentage: 0,
        currency: "",
        bank_name: "",
        account_name: "",
        set_account_name: false,
        account_number: "",
        iban: ""
      },
      validateOnChange: false,
      validationSchema: ProjectExpenseSchema,
      onSubmit: (values, {validateForm})=>{
        setLoading(true)
        const formData = new FormData();
        formData.append('file', values.file);
        formData.append('values', JSON.stringify(values));

        AxiosFileInstance.post("/project_expense/insert", formData)
        .then(function(response){
          if(response.data.status === 'SUCCESS'){
           
           
            setResponse({
              open: true,
              severity: "success",
              message: response.data.message
            })
            handleClearValues()
          }else{
            setResponse({
              open: true,
              severity: "error",
              message: response.data.message
            })
          }
          setLoading(false)
        })
        .catch(function(error){
          console.log(error)
        })
      }
    })

    const handleVatApplicableOnChange = (is_vat)=>{
      if(is_vat){
        AxiosInstance.get("/preferences/vat")
        .then(function(result){
          formik_project_expense.setFieldValue('vat_percentage',result.data.vat)

          const value = formik_project_expense.values.amount_without_vat || 0;
          const vat = isNaN(result.data.vat) ? 0 : parseInt(result.data.vat);
          formik_project_expense.setFieldValue('vat_amount', (value * (vat / 100)).toFixed(2))
          formik_project_expense.setFieldValue('amount_with_vat', (parseFloat(value) + (parseFloat(value) * (parseInt(vat) / 100))).toFixed(2))

        })
        .catch(function(error){
          console.log(error)
        })
      }else{
        formik_project_expense.setFieldValue('vat_percentage', "")
      }

      formik_project_expense.setFieldValue('is_vat', is_vat)
              
     }

     function handleGetSupplierDetails(){
      AxiosInstance.get("/project_expense/get_supplier_details")
      .then(function(result){
          if(result.data.status === 'SUCCESS'){
            setSupplierDetails((supplierDetails)=>[
              ...result.data.suppliers.map(element => ({
                supplier_name: element.supplier_name,
                bank_name: element.bank_name,
                account_name: element.account_name,
                account_number: element.account_number,
                iban: element.iban
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

     function handleGetInvoiceDetails(){
      AxiosInstance.get("/project_expense/get_invoice_details")
      .then(function(result){
          if(result.data.status === 'SUCCESS'){
            setInvoiceDetails((invoiceDetails)=>[
              ...result.data.invoice_details.map(element => ({
                invoice_number: element.invoice_number,
                project_name: element.project_name
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

     const supplierExists = (name) => {

      return supplierDetails.some(option => option.supplier_name === name);
    };

     function handleClearValues(){

      formik_project_expense.setValues({
        file: null,
        date_issued: null,
        is_vat: false,
        ref_invoice_number: "",
        project_name: "",
        supplier_name: "",
        supplier_invoice_number: "",
        amount_without_vat: "",
        vat_amount: "",
        amount_with_vat: "",
        vat_percentage: "",
        currency: "",
        bank_name: "",
        account_name: "",
        set_account_name: false,
        account_number: "",
        iban: ""
      })
      setFile(null);
      setFileAlert(false)
      
     }
     
     return(
        <Grid container direction="column" spacing={2} sx={{paddingLeft: 4, paddingRight: 4  }}>
              <Grid item>
                  <Collapse in={response.open}>
                      <Alert
                      action={
                          <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                              setResponse({...response, open: false});
                          }}
                          >
                          <CloseIcon fontSize="inherit" />
                          </IconButton>
                      }
                      //sx={{ mb: 2 }}
                      //icon={<CheckIcon fontSize="inherit" />}
                      severity={response.severity}
                      >
                      {response.message}
                      </Alert>
                  </Collapse>
                </Grid>
                <Grid item>
                <Stack direction="row" spacing={2}>
                    {/* <Grid item xl={4} lg={4} md={5} sm={12}> */}
                        <Stack direction="column" spacing={2}>
                            <Typography variant="body2">Attached Invoice:</Typography>
                            <FileUpload onFileUpload={handleFileUpload} fileTypes={['application/pdf']} mainError={formik_project_expense.touched.file && formik_project_expense.errors.file} alertOpen={fileAlert}/>
                            {formik_project_expense.values.file !== null ? 
                            <React.Fragment>
                            <Autocomplete
                                freeSolo
                                selectOnFocus 
                                clearOnBlur
                                handleHomeEndKeys
                                onFocus={() => handleGetInvoiceDetails()}
                                options={invoiceDetails.map((option) => ({
                                    label: `${option.invoice_number} - ${option.project_name}`,
                                    value: option.invoice_number,
                                    projectName: option.project_name
                                }))}
                                value={
                                    formik_project_expense.values.ref_invoice_number
                                    ? {
                                        label: `${formik_project_expense.values.ref_invoice_number} - ${formik_project_expense.values.project_name}`,
                                        value: formik_project_expense.values.ref_invoice_number,
                                        projectName: formik_project_expense.values.project_name
                                        }
                                    : null
                                }
                                onChange={(event, newValue) => {
                                    if (newValue) {
                                    formik_project_expense.setFieldValue('ref_invoice_number', newValue.value);
                                    formik_project_expense.setFieldValue('project_name', newValue.projectName);
                                    } else {
                                    formik_project_expense.setFieldValue('ref_invoice_number', '');
                                    formik_project_expense.setFieldValue('project_name', '');
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    label="Reference Invoice"
                                    name="ref_invoice_number"
                                    value={formik_project_expense.values.ref_invoice_number}
                                    fullWidth
                                    size="small"
                                    error={
                                        formik_project_expense.touched.ref_invoice_number && Boolean(formik_project_expense.errors.ref_invoice_number)
                                    }
                                    helperText={
                                        formik_project_expense.touched.ref_invoice_number && formik_project_expense.errors.ref_invoice_number
                                    }
                                    InputProps={{
                                        ...params.InputProps,
                                        readOnly: true,
                                    }}
                                    />
                                )}
                                fullWidth
                                />
                            <Stack direction="row" spacing={2}>
                            <FormControl
                                fullWidth
                                size="small"
                                error={formik_project_expense.touched.is_vat && Boolean(formik_project_expense.errors.is_vat)}
                                >
                                <InputLabel>Vat Applicable</InputLabel>
                                <Select
                                name="is_vat"
                                value={formik_project_expense.values.is_vat}
                                label="Vat Applicable"
                                onChange={(event)=>handleVatApplicableOnChange(event.target.value)}>
                                <MenuItem value={true}>
                                    Yes
                                </MenuItem>
                                <MenuItem value={false}>
                                    No
                                </MenuItem>
                                </Select>
                                <FormHelperText>
                                {formik_project_expense.touched.is_vat && formik_project_expense.errors.is_vat}
                                </FormHelperText>
                            </FormControl>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker 
                            value={dayjs(formik_project_expense.values.date_issued)}
                            onChange={(value)=>formik_project_expense.setFieldValue('date_issued', dayjs(new Date(value)).format('YYYY-MM-DD'))}
                            slotProps={{
                                textField: {
                                    label: 'Date Issued',
                                    variant: 'outlined',
                                    name: 'date_issued',
                                    size: 'small', 
                                    fullWidth: true,
                                    error: Boolean(formik_project_expense.errors.date_issued),
                                    helperText:formik_project_expense.touched.date_issued && formik_project_expense.errors.date_issued
                                },
                                }} />
                            </LocalizationProvider>
                            </Stack>
                            <Stack direction="row" spacing={2}>
                            <TextField variant='outlined' label="Invoice Number"
                            name="supplier_invoice_number"
                            value={formik_project_expense.values.supplier_invoice_number}
                            onChange={formik_project_expense.handleChange}
                            size="small"
                            error={
                            formik_project_expense.touched.supplier_invoice_number && Boolean(formik_project_expense.errors.supplier_invoice_number)
                            }
                            helperText={
                            formik_project_expense.touched.supplier_invoice_number && formik_project_expense.errors.supplier_invoice_number
                            }
                            fullWidth
                            autoComplete="off" />
                            <TextField variant='outlined' label="Amount"
                            name="amount_without_vat"
                            value={formik_project_expense.values.amount_without_vat}
                            onChange={(evt)=>{
                            const value = +evt.target.value || 0;
                            const vat = formik_project_expense.values.vat_percentage;
                            formik_project_expense.setFieldValue('amount_without_vat', evt.target.value)
                            formik_project_expense.setFieldValue('vat_amount', (value * (parseInt(vat) / 100)).toFixed(2))
                            formik_project_expense.setFieldValue('amount_with_vat', (value + (value * (parseInt(vat) / 100))).toFixed(2) )
                            }}

                            size="small"
                            error={
                            formik_project_expense.touched.amount_without_vat && Boolean(formik_project_expense.errors.amount_without_vat)
                            }
                            helperText={
                            formik_project_expense.touched.amount_without_vat && formik_project_expense.errors.amount_without_vat
                            }
                            fullWidth
                            autoComplete="off" />
                            </Stack>
                        
                            { formik_project_expense.values.is_vat ? 
                                (
                                <Stack direction="row" spacing={2}>

                                    <TextField variant='outlined' label="Vat Amount"
                                    size="small"
                                    name="vat_amount"
                                    value={formik_project_expense.values.vat_amount}
                                    readOnly
                                    fullWidth
                                    autoComplete="off" />
                                    <TextField variant='outlined' label="Amount w/ Vat"
                                    size="small"
                                    name="amount_with_vat"
                                    value={formik_project_expense.values.amount_with_vat}
                                    readOnly
                                    fullWidth
                                    autoComplete="off" />
                                </Stack>
                                ) : null } 

                            <Autocomplete
                                freeSolo
                                selectOnFocus
                                clearOnBlur
                                handleHomeEndKeys
                                onFocus={() => handleGetSupplierDetails()}
                                options={supplierDetails.map((option) => ({
                                label: option.supplier_name,
                                value: option.supplier_name,
                                bank_name: option.bank_name,
                                account_name: option.account_name,
                                account_number: option.account_number,
                                iban: option.iban,
                                }))}
                                value={formik_project_expense.values.supplier_name}
                                onChange={(event, newValue) => {

                                    //formik_project_expense.setFieldValue('account_name', );
                    

                                if (newValue) {
                                    formik_project_expense.setFieldValue('supplier_name', newValue.value);
                                    formik_project_expense.setFieldValue('bank_name', newValue.bank_name);
                                    formik_project_expense.setFieldValue('account_name', newValue.account_name);
                                    formik_project_expense.setFieldValue('account_number', newValue.account_number);
                                    formik_project_expense.setFieldValue('iban', newValue.iban);
                                    formik_project_expense.setFieldValue('save_bank_details', true);
                                    
                                    setPreviousValue({
                                    bank_name: newValue.bank_name,
                                    account_name: newValue.account_name,
                                    account_number: newValue.account_number,
                                    iban: newValue.iban
                                    })
                                } else {
                                    formik_project_expense.setFieldValue('supplier_name', '');
                                    formik_project_expense.setFieldValue('bank_name', '');
                                    formik_project_expense.setFieldValue('account_name', '');
                                    formik_project_expense.setFieldValue('account_number', '');
                                    formik_project_expense.setFieldValue('iban', '');
                                    formik_project_expense.setFieldValue('save_bank_details', false);
                                    setPreviousValue({
                                    bank_name: "",
                                    account_name: "",
                                    account_number: "",
                                    iban: ""
                                    })
                                }
                                }}
                                renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Supplier Name"
                                    name="supplier_name"
                                    value={formik_project_expense.values.supplier_name}
                                    onChange={(event)=>{
                                        formik_project_expense.setFieldValue('supplier_name', event.target.value)
                                    
                                        if(formik_project_expense.values.set_account_name){
                                            formik_project_expense.setFieldValue('account_name', event.target.value)
                                        }
                                        
                                    }}
                                    fullWidth
                                    size="small"
                                    error={
                                    formik_project_expense.touched.supplier_name && Boolean(formik_project_expense.errors.supplier_name)
                                    }
                                    helperText={
                                    formik_project_expense.touched.supplier_name && formik_project_expense.errors.supplier_name
                                    }
                                />
                                )}
                                fullWidth
                            />
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">Bank Details:</Typography>
                            <Stack direction="row" spacing={1}>
                            <IconButton size="small" color="primary" onClick={()=>{
                                    formik_project_expense.setFieldValue('bank_name', previousValue.bank_name)
                                    formik_project_expense.setFieldValue('account_number', previousValue.account_number)
                                    formik_project_expense.setFieldValue('iban', previousValue.iban)
                                    setIsEditing(false)
                            }} sx={{display: isEditing ? 'block':'none'}}>
                                <CloseIcon />
                            </IconButton> 
                            <IconButton size="small" color="success" onClick={()=>setIsEditing(true)} sx={{display: supplierExists(formik_project_expense.values.supplier_name) && !isEditing ? 'block':'none'}}>
                                <EditIcon />
                            </IconButton>
                            </Stack>

                            </Stack>
                            <TextField label="Bank Name" size="small" variant="outlined" name="bank_name" fullWidth 
                            onChange={formik_project_expense.handleChange} value={formik_project_expense.values.bank_name} 
                            error={
                            formik_project_expense.touched.bank_name && Boolean(formik_project_expense.errors.bank_name)
                            }
                            helperText={
                            formik_project_expense.touched.bank_name && formik_project_expense.errors.bank_name
                            } 
                            InputProps={{
                            readOnly: supplierExists(formik_project_expense.values.supplier_name) && !isEditing,
                            }}
                            />  
                            <Stack direction="column">
                            <TextField label="Account Name." size="small" variant="outlined" name="account_name" fullWidth 
                            onChange={formik_project_expense.handleChange} value={formik_project_expense.values.account_name} 
                            error={
                            formik_project_expense.touched.account_name && Boolean(formik_project_expense.errors.account_name)
                            }
                            helperText={
                            formik_project_expense.touched.account_name && formik_project_expense.errors.account_name
                            }
                            InputProps={{
                            readOnly: (supplierExists(formik_project_expense.values.supplier_name) && !isEditing) ||formik_project_expense.values.set_account_name,
                            }}
                            />  
                            <FormControlLabel control={<Checkbox name="set_account_name" size="small"
                            checked={formik_project_expense.values.set_account_name} 
                            inputProps={{
                            disabled: supplierExists(formik_project_expense.values.supplier_name) && !isEditing
                            }}
                            onChange={(event)=>{
                            
                            formik_project_expense.setFieldValue('set_account_name', event.target.checked)
                            if(event.target.checked === true){
                                formik_project_expense.setFieldValue('account_name', formik_project_expense.values.supplier_name)
                            }else{
                                formik_project_expense.setFieldValue('account_name', '')
                            }
                            
                            }}  />} label="Set as the same as supplier name." />
                            </Stack>
                            <TextField label="Account No." size="small" variant="outlined" name="account_number" fullWidth 
                            onChange={formik_project_expense.handleChange} value={formik_project_expense.values.account_number} 
                            error={
                            formik_project_expense.touched.account_number && Boolean(formik_project_expense.errors.account_number)
                            }
                            helperText={
                            formik_project_expense.touched.account_number && formik_project_expense.errors.account_number
                            }
                            InputProps={{
                            readOnly: supplierExists(formik_project_expense.values.supplier_name) && !isEditing,
                            }}
                            />  
                            <TextField label="IBAN" size="small" variant="outlined" name="iban" fullWidth 
                            onChange={formik_project_expense.handleChange} value={formik_project_expense.values.iban} 
                            error={
                            formik_project_expense.touched.iban && Boolean(formik_project_expense.errors.iban)
                            }
                            helperText={
                            formik_project_expense.touched.iban && formik_project_expense.errors.iban
                            }
                            InputProps={{
                            readOnly: supplierExists(formik_project_expense.values.supplier_name) && !isEditing,
                            }}  
                            />  
                        
                            </React.Fragment>: null }
                      </Stack>
                    {/* </Grid>
                    <Grid item xl={8} lg={8} md={7} sm={12}> */}
                    
                    {file && <Stack direction="column" sx={{flexGrow: 1}}>
                     
                        <AppBar position="static">
                            <Toolbar variant='dense'>
                            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                                Invoice
                            </Typography>
                            </Toolbar>
                        </AppBar>
                       
                        <PdfViewer file={file} />
                        </Stack>}
                    {/* </Grid> */}
                </Stack>
            </Grid>
            {formik_project_expense.values.file !== null ?<React.Fragment><Grid item>
              <Divider />
            </Grid>
            <Grid item>
              <LoadingButton sx={{float: 'right'}} variant='contained' color='success' onClick={formik_project_expense.handleSubmit} loading={loading}>Submit Expense</LoadingButton>        
            </Grid></React.Fragment> : null }
        </Grid>
     )
}
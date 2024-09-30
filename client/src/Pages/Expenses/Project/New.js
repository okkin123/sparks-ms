import {Autocomplete, Box, AppBar, Divider, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Paper, Select, Stack, TextField, Toolbar, Typography, Alert, Collapse, IconButton} from '@mui/material';
import React, {useState, useEffect} from 'react';
import PdfViewer from '../../../Components/PdfViewer';
import FileUpload from '../../../Components/FileUpload';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import AxiosFileInstance from '../../../AxiosFileInstance';
import AxiosInstance from '../../../AxiosInstance';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoadingButton from '@mui/lab/LoadingButton';

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
    .required('This field is required!')
});




export default function New(){
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [supplierDetails, setSupplierDetails] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState([])

    const [response, setResponse] = useState({
      open: false,
      severity: "",
      message: ""
    })

    const [fileAlert, setFileAlert] = useState(false)

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
        vat_percentage: "",
        currency: ""
      },
      validateOnChange: false,
      validationSchema: ProjectExpenseSchema,
      onSubmit: (values, {validateForm})=>{
        setLoading(true)
        const formData = new FormData();
        formData.append('file', values.file);
        formData.append('values', JSON.stringify(values))
        
        AxiosFileInstance.post("/project_expense/insert", formData)
        .then(function(response){
          if(response.data.status === 'SUCCESS'){
            setLoading(false)
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
              ...result.data.supplier_details.map(element => ({
                supplier_name: element.supplier_name
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
        currency: ""
      })
      setFile(null);
      setFileAlert(false)
      
     }



    return(
        <React.Fragment>
            <Toolbar />
            <Paper>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>
              <Grid item>
                <Typography variant="h6">NEW PROJECT EXPENSE</Typography>
              </Grid>
              <Grid item>
                 <Divider />
              </Grid>
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
              <Grid item container direction="row" spacing={2}>
                <Grid item xl={4} lg={4} md={5} sm={12}>
                    <Stack direction="column" spacing={2}>
                      <Typography variant="body1">Attached Supplier Invoice:</Typography>
                      <FileUpload onFileUpload={handleFileUpload} fileTypes={['application/pdf']} mainError={formik_project_expense.touched.file && formik_project_expense.errors.file} alertOpen={fileAlert}/>
                      {formik_project_expense.values.file !== null ? <React.Fragment>
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
                      <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        onFocus={()=>handleGetSupplierDetails()}
                        options={supplierDetails.map((option) => option.supplier_name)}
                        value={formik_project_expense.values.supplier_name}
                        onChange={(event, value)=>formik_project_expense.setFieldValue('supplier_name', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Supplier Name"
                            name="supplier_name"
                            value={formik_project_expense.values.supplier_name}
                            onChange={formik_project_expense.handleChange}
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
                        formik_project_expense.setFieldValue('amount_without_vat', value)
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

                      { formik_project_expense.values.is_vat ? 
                          (
                            <React.Fragment>
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
                            </React.Fragment>
                          ) : null } 

                      
                      <LoadingButton variant='contained' color='success' onClick={formik_project_expense.handleSubmit} loading={loading}>Submit</LoadingButton>
                      </React.Fragment>: null }
                    </Stack>
                </Grid>
                <Grid item xl={8} lg={8} md={7} sm={12}>
                {file && <React.Fragment><Box sx={{ flexGrow: 1}}>
                    <AppBar position="static">
                      <Toolbar variant='dense'>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          Supplier Invoice
                        </Typography>
                      </Toolbar>
                    </AppBar>
                  </Box>
                  <PdfViewer file={file} /></React.Fragment>}
                </Grid>
              </Grid>
            </Grid>
            </Paper>
        </React.Fragment>
    )
}

// npm install @react-pdf-viewer/core @react-pdf-viewer/default-layout react-dropzone


// // App.js
// import React, { useState } from 'react';
// import FileUpload from './FileUpload';
// import PdfViewer from './PdfViewer';

// const App = () => {
//   const [file, setFile] = useState(null);

//   const handleFileUpload = (file) => {
//     const fileUrl = URL.createObjectURL(file);
//     setFile(fileUrl);
//   };

//   return (
//     <div>
//       <h1>PDF Viewer</h1>
//       <FileUpload onFileUpload={handleFileUpload} />
//       {file && <PdfViewer file={file} />}
//     </div>
//   );
// };

// export default App;

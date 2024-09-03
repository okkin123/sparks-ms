import React, {useState, useEffect} from 'react';
import {Toolbar,
        Grid,
        Typography,
        Button,
        TextField,
        Divider,
        FormControl,
        OutlinedInput,
        InputAdornment,
        IconButton,
        FormHelperText,
        Alert,
        Collapse,
        Stack
} from '@mui/material';

import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ErrorIcon from "@mui/icons-material/Error";

import AxiosInstance from "../AxiosInstance";
import * as Yup from 'yup';
import { useFormik } from 'formik';


const CompanyAddressSchema = Yup.object().shape({
  company_address: Yup.string()
    .required('Company Address is required!')
  });


const TRNSchema = Yup.object().shape({
  trn: Yup.string()
    .required('TRN value is required!')
    .matches(/^\d+$/, 'Only whole numbers are allowed')
  });

const CurrencySchema = Yup.object().shape({
  currency: Yup.string()
    .required('Currency value is required!')
  });

const VATSchema = Yup.object().shape({
  vat: Yup.string()
    .required('VAT % value is required!')
    .matches(/^\d+$/, 'Only whole numbers are allowed')
  });

const BankAccountSchema = Yup.object().shape({
  benificiary: Yup.string()
    .required('This field is required!'),
  name: Yup.string()
    .required('This field is required!'),
  address: Yup.string()
    .required('This field is required!'),
  account_number: Yup.string()
    .required('This field is required!')
    .matches(/^\d+$/, 'Only whole numbers are allowed'),
  iban: Yup.string()
    .required('This field is required!'),
  swift_code: Yup.string()
    .required('This field is required!'),
  routing_code: Yup.string()
    .required('This field is required!'),
  });

export default function Preferences(){

  const [edit, setEdit] = useState({
    company_address: false,
    trn: false,
    currency: false,
    vat: false,
    bank_account: false
  })

  const [alert, setAlert] = useState({
    company_address: {
      open: false,
      icon: null,
      message: '',
      severity: ''
    },
    trn: {
      open: false,
      icon: null,
      message: '',
      severity: ''
    },
    currency: {
      open: false,
      icon: null,
      message: '',
      severity: ''
    },
    vat: {
      open: false,
      icon: null,
      message: '',
      severity: ''
    },
    bank_account: {
      open: false,
      icon: null,
      message: '',
      severity: ''
    }
  })

  const formik_company_address = useFormik({
    initialValues:{
      company_address: ""
    },
    validateOnChange: false,
    validationSchema: CompanyAddressSchema,
    onSubmit:(values, {validateForm})=>{
      AxiosInstance.post("/preferences/setCompanyAddress", values)
      .then(function(response){
        if(response.data.status === "SUCCESS")
        {
          setEdit({...edit, company_address: false})
          setAlert({
            ...alert,
            company_address: {
                ...alert.company_address,
                open: true,
                icon: (<CheckIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'success'
            }
           });
        }
        else
        {
          setAlert({
            ...alert,
            company_address: {
                ...alert.company_address,
                open: true,
                icon: (<ErrorIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'error'
            }
           });
        }
      })
      .catch(function(error){
        console.log(error)
      })
    }
  })


  const formik_trn = useFormik({
    initialValues:{
      trn: ""
    },
    validateOnChange: false,
    validationSchema: TRNSchema,
    onSubmit:(values, {validateForm})=>{
      AxiosInstance.post("/preferences/setTRN", values)
      .then(function(response){
        if(response.data.status === "SUCCESS")
        {
          setEdit({...edit, trn: false})
          setAlert({
            ...alert,
            trn: {
                ...alert.trn,
                open: true,
                icon: (<CheckIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'success'
            }
           });
        }
        else
        {
          setAlert({
            ...alert,
            trn: {
                ...alert.trn,
                open: true,
                icon: (<ErrorIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'error'
            }
           });
        }
      })
      .catch(function(error){
        console.log(error)
      })
    }
  })

  const formik_currency = useFormik({
    initialValues:{
      currency: ""
    },
    validateOnChange: false,
    validationSchema: CurrencySchema,
    onSubmit:(values, {validateForm})=>{
      AxiosInstance.post("/preferences/setCurrency", values)
      .then(function(response){
        if(response.data.status === "SUCCESS")
        {
          setEdit({...edit, currency: false})
          setAlert({
            ...alert,
            currency: {
                ...alert.currency,
                open: true,
                icon: (<CheckIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'success'
            }
           });
        }
        else
        {
          setAlert({
            ...alert,
            currency: {
                ...alert.currency,
                open: true,
                icon: (<ErrorIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'error'
            }
           });
        }
      })
      .catch(function(error){
        console.log(error)
      })
    }
  })


  const formik_vat = useFormik({
    initialValues:{
      vat: ""
    },
    validateOnChange: false,
    validationSchema: VATSchema,
    onSubmit:(values, {validateForm})=>{
      AxiosInstance.post("/preferences/setVAT", values)
      .then(function(response){
        if(response.data.status === "SUCCESS")
        {
          setEdit({...edit, vat: false})
          setAlert({
            ...alert,
            vat: {
                ...alert.vat,
                open: true,
                icon: (<CheckIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'success'
            }
           });
        }
        else
        {
          setAlert({
            ...alert,
            vat: {
                ...alert.vat,
                open: true,
                icon: (<ErrorIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'error'
            }
           });
        }
      })
      .catch(function(error){
        console.log(error)
      })
    }
  })


  const formik_bank_account = useFormik({
    initialValues:{
      benificiary: "",
      name: "",
      address: "",
      account_number: "",
      iban: "",
      swift_code: "",
      routing_code: ""
    },
    validateOnChange: false,
    validationSchema: BankAccountSchema,
    onSubmit:(values, {validateForm})=>{
      AxiosInstance.post("/preferences/setBankAccount", values)
      .then(function(response){

        if(response.data.status === "SUCCESS")
        {
          setEdit({...edit, bank_account: false})
          setAlert({
            ...alert,
            bank_account: {
                ...alert.bank_account,
                open: true,
                icon: (<CheckIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'success'
            }
         });
        }
        else
        {
          setAlert({
            ...alert,
            bank_account: {
                ...alert.bank_account,
                open: true,
                icon: (<ErrorIcon fontSize="inherit" />),
                message: response.data.message,
                severity: 'error'
            }
         });
        }
      })
      .catch(function(error){
        console.log(error)
      })
    }
  })  


  useEffect(()=>{
    AxiosInstance.get("/preferences/company_address")
    .then(function(result){
      formik_company_address.setFieldValue("company_address",result.data.company_address);
      
    })
    .catch(function(error){
      console.log(error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[edit.company_address]);



  useEffect(()=>{
    AxiosInstance.get("/preferences/trn")
    .then(function(result){
      formik_trn.setFieldValue("trn",result.data.trn);
      
    })
    .catch(function(error){
      console.log(error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[edit.trn]);

  useEffect(()=>{
    AxiosInstance.get("/preferences/currency")
    .then(function(result){
      formik_currency.setFieldValue("currency",result.data.currency);
      
    })
    .catch(function(error){
      console.log(error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[edit.currency]);

  useEffect(()=>{
    AxiosInstance.get("/preferences/vat")
    .then(function(result){
      formik_vat.setFieldValue("vat",result.data.vat);
      
    })
    .catch(function(error){
      console.log(error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[edit.vat]);


  useEffect(()=>{
    AxiosInstance.get("/preferences/bank_account")
    .then(function(result){
      formik_bank_account.setValues({
        benificiary: result.data.benificiary,
        name: result.data.name,
        address: result.data.address,
        account_number: result.data.account_number,
        iban: result.data.iban,
        swift_code: result.data.swift_code,
        routing_code: result.data.routing_code
      });
      
    })
    .catch(function(error){
      console.log(error)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[edit.bank_account]);



    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="h6">PREFERENCES</Typography>
              </Grid>
              <Grid item>
                <Divider />
              </Grid>

              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Company Address:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                <FormControl
                  variant="outlined"
                  error={
                    formik_company_address.touched.company_address && Boolean(formik_company_address.errors.company_address)
                  }
                  size="small"
                  fullWidth={true}
                >
                  <OutlinedInput
                    name="company_address"
                    value={formik_company_address.values.company_address}
                    onChange={formik_company_address.handleChange}
                    disabled={edit.company_address ? false : true}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          edge="end"
                          onClick={()=>setEdit({...edit, company_address: !edit.company_address})}
                        >
                         { edit.company_address ? (<CloseIcon />) : (<EditIcon />)}   
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText>
                    {formik_company_address.touched.company_address && formik_company_address.errors.company_address}
                  </FormHelperText>
                </FormControl>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                  <Collapse in={alert.company_address.open}>
                    <Alert
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setAlert({...alert, company_address: {...alert.company_address, open: false, message: ''}});
                          }}
                        >
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mb: 2 }}
                      icon={alert.company_address.icon}
                      severity={alert.company_address.severity}
                    >
                      {alert.company_address.message}
                    </Alert>
                  </Collapse>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <Button variant="contained" color="secondary" onClick={formik_company_address.handleSubmit} disabled={edit.company_address ? false : true}>Save Company Address</Button>
                </Grid>
              </Grid>


              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">TRN:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                <FormControl
                  variant="outlined"
                  error={
                    formik_trn.touched.trn && Boolean(formik_trn.errors.trn)
                  }
                  size="small"
                  fullWidth={true}
                >
                  <OutlinedInput
                    name="trn"
                    value={formik_trn.values.trn}
                    onChange={formik_trn.handleChange}
                    disabled={edit.trn ? false : true}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          edge="end"
                          onClick={()=>setEdit({...edit, trn: !edit.trn})}
                        >
                         { edit.trn ? (<CloseIcon />) : (<EditIcon />)}   
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText>
                    {formik_trn.touched.trn && formik_trn.errors.trn}
                  </FormHelperText>
                </FormControl>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                  <Collapse in={alert.trn.open}>
                    <Alert
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setAlert({...alert, trn: {...alert.trn, open: false, message: ''}});
                          }}
                        >
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mb: 2 }}
                      icon={alert.trn.icon}
                      severity={alert.trn.severity}
                    >
                      {alert.trn.message}
                    </Alert>
                  </Collapse>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <Button variant="contained" color="secondary" onClick={formik_trn.handleSubmit} disabled={edit.trn ? false : true}>Save TRN</Button>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">CURRENCY:</Typography>
                </Grid>
               <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
               <FormControl
                 variant="outlined"
                 error={
                   formik_currency.touched.currency && Boolean(formik_currency.errors.currency)
                 }
                 size="small"
                 fullWidth={true}
               >
                 <OutlinedInput
                   name="currency"
                   value={formik_currency.values.currency}
                   onChange={formik_currency.handleChange}
                   disabled={edit.currency ? false : true}
                   endAdornment={
                     <InputAdornment position="end">
                       <IconButton
                         aria-label="toggle password visibility"
                         edge="end"
                         onClick={()=>setEdit({...edit, currency: !edit.currency})}
                       >
                        { edit.currency ? (<CloseIcon />) : (<EditIcon />)}   
                       </IconButton>
                     </InputAdornment>
                   }
                 />
                 <FormHelperText>
                   {formik_currency.touched.currency && formik_currency.errors.currency}
                 </FormHelperText>
               </FormControl>
               </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                  <Collapse in={alert.currency.open}>
                    <Alert
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setAlert({...alert, currency: {...alert.currency, open: false, message: ''}});
                          }}
                        >
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mb: 2 }}
                      icon={alert.currency.icon}
                      severity={alert.currency.severity}
                    >
                      {alert.currency.message}
                    </Alert>
                  </Collapse>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <Button variant="contained" color="secondary" onClick={formik_currency.handleSubmit} disabled={edit.currency ? false : true}>Save Currency</Button>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
               
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">VAT %:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                <FormControl
                  variant="outlined"
                  error={
                    formik_vat.touched.vat && Boolean(formik_vat.errors.vat)
                  }
                  size="small"
                  fullWidth={true}
                >
                  <OutlinedInput
                    name="vat"
                    value={formik_vat.values.vat}
                    onChange={formik_vat.handleChange}
                    disabled={edit.vat ? false : true}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          edge="end"
                          onClick={()=>setEdit({...edit, vat: !edit.vat})}
                        >
                         { edit.vat ? (<CloseIcon />) : (<EditIcon />)}   
                        </IconButton>
                      </InputAdornment>
                    }
                  />
                  <FormHelperText>
                    {formik_vat.touched.vat && formik_vat.errors.vat}
                  </FormHelperText>
                </FormControl>
                </Grid>
              </Grid>


              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                  <Collapse in={alert.vat.open}>
                    <Alert
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setAlert({...alert, vat: {...alert.vat, open: false, message: ''}});
                          }}
                        >
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mb: 2 }}
                      icon={alert.vat.icon}
                      severity={alert.vat.severity}
                    >
                      {alert.vat.message}
                    </Alert>
                  </Collapse>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <Button variant="contained" color="secondary" onClick={formik_vat.handleSubmit} disabled={edit.vat ? false : true}>Save VAT</Button>
                </Grid>
              </Grid>

              <Grid item>
                <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subitle1">BANK ACCOUNT</Typography>
                <IconButton
                  aria-label="toggle password visibility"
                  edge="end"
                  onClick={()=>setEdit({...edit, bank_account: !edit.bank_account})}
                >
                  { edit.bank_account ? (<CloseIcon />) : (<EditIcon />)}   
                </IconButton>
                </Stack>
              </Grid>
              <Grid item>
                <Divider />
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Name of Benificiary:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth 
                    name="benificiary"
                    value={formik_bank_account.values.benificiary}
                    onChange={formik_bank_account.handleChange}
                    disabled={edit.bank_account ? false : true}
                    error={
                      formik_bank_account.touched.benificiary && Boolean(formik_bank_account.errors.benificiary)
                    }
                    helperText={formik_bank_account.touched.benificiary && formik_bank_account.errors.benificiary}
                     />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Name of Bank:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth 
                      name="name"
                      value={formik_bank_account.values.name}
                      onChange={formik_bank_account.handleChange}
                      disabled={edit.bank_account ? false : true}
                      error={
                        formik_bank_account.touched.name && Boolean(formik_bank_account.errors.name)
                      }
                      helperText={formik_bank_account.touched.name && formik_bank_account.errors.name} />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Address of Bank:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth 
                     name="address"
                     value={formik_bank_account.values.address}
                     onChange={formik_bank_account.handleChange}
                     disabled={edit.bank_account ? false : true}
                     error={
                       formik_bank_account.touched.address && Boolean(formik_bank_account.errors.address)
                     }
                     helperText={formik_bank_account.touched.address && formik_bank_account.errors.address}
                     multiline
                     rows={2} />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Account Number:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth 
                     name="account_number"
                     value={formik_bank_account.values.account_number}
                     onChange={formik_bank_account.handleChange}
                     disabled={edit.bank_account ? false : true}
                     error={
                       formik_bank_account.touched.account_number && Boolean(formik_bank_account.errors.account_number)
                     }
                     helperText={formik_bank_account.touched.account_number && formik_bank_account.errors.account_number} />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">IBAN:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth 
                     name="iban"
                     value={formik_bank_account.values.iban}
                     onChange={formik_bank_account.handleChange}
                     disabled={edit.bank_account ? false : true}
                     error={
                       formik_bank_account.touched.iban && Boolean(formik_bank_account.errors.iban)
                     }
                     helperText={formik_bank_account.touched.iban && formik_bank_account.errors.iban} />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Swift Code:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth 
                     name="swift_code"
                     value={formik_bank_account.values.swift_code}
                     onChange={formik_bank_account.handleChange}
                     disabled={edit.bank_account ? false : true}
                     error={
                       formik_bank_account.touched.swift_code && Boolean(formik_bank_account.errors.swift_code)
                     }
                     helperText={formik_bank_account.touched.swift_code && formik_bank_account.errors.swift_code} />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                    <Typography variant="body1">Routing Code:</Typography>
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <TextField variant="outlined" size="small" fullWidth 
                     name="routing_code"
                     value={formik_bank_account.values.routing_code}
                     onChange={formik_bank_account.handleChange}
                     disabled={edit.bank_account ? false : true}
                     error={
                       formik_bank_account.touched.routing_code && Boolean(formik_bank_account.errors.routing_code)
                     }
                     helperText={formik_bank_account.touched.routing_code && formik_bank_account.errors.routing_code} />
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
            
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                  <Collapse in={alert.bank_account.open}>
                    <Alert
                      action={
                        <IconButton
                          aria-label="close"
                          color="inherit"
                          size="small"
                          onClick={() => {
                            setAlert({...alert, bank_account: {...alert.bank_account, open: false, message: ''}});
                          }}
                        >
                          <CloseIcon fontSize="inherit" />
                        </IconButton>
                      }
                      sx={{ mb: 2 }}
                      icon={alert.bank_account.icon}
                      severity={alert.bank_account.severity}
                    >
                      {alert.bank_account.message}
                    </Alert>
                  </Collapse>
                </Grid>
              </Grid>
              <Grid item container direction="row" spacing={2} alignItems="center">
                <Grid item xl={2} lg={2} md={3} sm={12} xs={12}>
                   
                </Grid>
                <Grid item xl={5} lg={5} md={7} sm={12} xs={12}>
                    <Button variant="contained" color="secondary" onClick={formik_bank_account.handleSubmit} disabled={edit.bank_account ? false : true}>Save Bank Account</Button>
                </Grid>
              </Grid>
            </Grid>
        </React.Fragment>
    )
}

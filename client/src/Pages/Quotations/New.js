import React, { useState, useEffect} from 'react';
import { styled } from '@mui/material/styles';
import * as Yup from "yup";
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom'; 
import { Toolbar, 
         Typography, 
         Grid, 
         TextField, 
         Paper, 
         Divider, 
         Stack,
         Table,
         TableBody,
         TableContainer,
         TableHead,
         TableFooter,
         TableRow,
         Button,
         Alert,
         Collapse,
         FormHelperText,
         MenuItem,
         Select,
         FormControl,
         InputLabel,
         IconButton} from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import Autocomplete from '@mui/material/Autocomplete';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';

import Dialog from '../../Components/Dialog';
import AxiosInstance from '../../AxiosInstance';



const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    whiteSpace: 'nowrap'
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    whiteSpace: 'nowrap'
  },
  [`&.${tableCellClasses.footer}`]: {
    fontSize: 14,
    color: theme.palette.common.black,
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  }
}));

const StyledDiscountCell= styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.footer}`]: {
    fontSize: 14,
    color: theme.palette.error.main,
    fontWeight: 'bold',
    whiteSpace: 'nowrap'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // hide last border
  'td,th': {
    border: '1px solid gray',
  },
}));

const CustomInput = styled(TextField)(({ theme }) => ({
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          border: 'none'
        },
        '& input': {
            fontSize: 14,
            fontWeight: 'bold',
            color: theme.palette.error.main 
        },
      },
 }));

const QuotationDetailSchema = Yup.object().shape({
  description: Yup.string()
    .required('This field is required!'),
  quantity: Yup.number()
      .integer('Only whole numbers are allowed')
      .notOneOf([0], 'Quantity is 0 or leave this field as blank'),
  total_cost: Yup.string()
    .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
    .required('This field is required!')
  });


  const QuotationSchema = Yup.object().shape({  
    date: Yup.date().required('Date is required'),
    client_name: Yup.string()
    .required('This field is required!'),
    attention_to: Yup.string()
    .required('This field is required!'),
    project_name: Yup.string()
    .required('This field is required!'),
    // project_description: Yup.string()
    // .required('This field is required!'),
    currency: Yup.string()
    .required('This field is required!'),
    discount: Yup.string()
     .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
      .required('This field is required!')
  });
export default function New(){

    const [modal, setModal] = useState({
      add: {
        open: false
      },
    })
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [quotationNumber, setQuotationNumber] = useState("");
    const [quotationDetails, setQuotationDetails] = useState([]);
    const [quotationBreakdown, setQuotationBreakdown] = useState({
      total_cost_without_vat: "",
      total_cost_with_discount: "",
      vat_amount: "",
      total_cost_with_vat: ""
    })
    const [clientDetails, setClientDetails] = useState({
      client_name: [],
      attention_to: []
    })
    const [vatPrices, setVatPrices] = useState([]);
    const [error, setError] = useState(false);
    const [seriesQuotationNumbers, setSeriesQuotationNumbers] = useState({
      series_quotation_numbers : []
    });
    const handleEditQuotaionDetails = (index) => {

      quotationDetails.map((quotationDetail, i) => 
           i === index ? 
           formik_quotation_detail.setValues({
            description:quotationDetail.description,
            quantity: quotationDetail.quantity,
            total_cost: quotationDetail.total_cost
           })
           : null
      );

      setQuotationDetails(quotationDetails.map((quotationDetail, i) =>
        i === index ? { ...quotationDetail, edit_open: true } : quotationDetail
      ));
    };

    const handleClearForms = ()=>{
      formik_quotation_detail.resetForm();
      formik_quotation_detail.setValues({
        description: '',
        quantity: '',
        total_cost: '',
      });

    }

    const handleEditCancel = (index)=>{
      handleClearForms();
      setQuotationDetails(quotationDetails.map((quotationDetail, i) =>
        i === index ? { ...quotationDetail, edit_open: false } : quotationDetail
      ));
    }

    const handleUpdateQuotationDetails = (index)=>{
      formik_quotation_detail.validateForm().then((errors)=>{
        if (Object.keys(errors).length === 0) {
         handleClearForms();
         setQuotationDetails(quotationDetails.map((quotationDetail, i) =>
            i === index ? { ...quotationDetail, 
              edit_open: false,
              description: formik_quotation_detail.values.description,
              unit_cost: formik_quotation_detail.values.quantity === '' ? '' : (parseFloat(formik_quotation_detail.values.total_cost) / parseInt(formik_quotation_detail.values.quantity)).toFixed(2),
              quantity: formik_quotation_detail.values.quantity === '' ? '' : formik_quotation_detail.values.quantity,
              total_cost: parseFloat(formik_quotation_detail.values.total_cost).toFixed(2)
            } : quotationDetail
          ));
        } else {
          // Handle validation errors
          formik_quotation_detail.setTouched({
            ...Object.keys(errors).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {})
          });
        }
      });

    }
    
    const handleRemoveQuotationDetails = (index) => {
      setQuotationDetails((quotationDetails) => {
        const quotationDetail = [...quotationDetails];
        quotationDetail.splice(index, 1);
        return quotationDetail;
      });
    };

   
    const formik_quotation_detail = useFormik({
      initialValues: {
        description: "",
        quantity: "",
        total_cost: ""
      },
      validationSchema: QuotationDetailSchema,
      validateOnChange: false,
      onSubmit: (values, {validateForm})=>{
      
        handleClearForms();
        setModal((modal) => ({
          ...modal,
            add: {
              ...modal.add,
              open: false,
            }
          }))
        setQuotationDetails((quotationDetails)=>[
          ...quotationDetails,
          {
            edit_open: false,
            description: values.description,
            quantity: values.quantity === '' ? '' : values.quantity,
            unit_cost: values.quantity === '' ? '' : (parseFloat(values.total_cost) / parseInt(values.quantity)).toFixed(2),
            total_cost: parseFloat(values.total_cost).toFixed(2)
          }
        ]);

      }
    })


    const formik_quotation = useFormik({
      initialValues: {
        is_series: false,
        quotation_number: "",
        is_vat: false,
        date: null,
        client_name: "",
        attention_to: "",
        project_name: "",
        project_description: "",
        currency: "",
        vat_percentage: 0,
        discount: 0,
        notes: ""
      },
      validateOnChange: false,
      validationSchema: QuotationSchema,
      onSubmit: (values, {validateForm})=>{
        setLoading(true)
        if(quotationDetails.length === 0)
        {
          setError(true)
          setLoading(false)
        }
        else
        {
          setError(false)
          AxiosInstance.post("/quotation/insert", {
            quotation_number: quotationNumber,
            values: values,
            details: quotationDetails,
            amount_without_vat: quotationBreakdown.total_cost_without_vat,
          })
          .then(function(response){
            if(response.data.status === "SUCCESS")
            {
              setLoading(false)
              navigate('/', {
                state: {
                  quotation_created_updated: true,
                  message: response.data.message
                }
              })
            }
            else
            {
              console.log(response.data.message)
            }
          })
          .catch(function(error){
            console.log(error)
          })
        }
      }
    })

    useEffect(()=>{

      const total_cost_without_vat = quotationDetails.reduce((accumulator, currentItem) => {
        return accumulator + parseFloat(currentItem.total_cost);
      }, 0);

      setQuotationBreakdown({
        total_cost_without_vat: total_cost_without_vat,
        total_cost_with_discount: (total_cost_without_vat-formik_quotation.values.discount),
        vat_amount: (total_cost_without_vat-formik_quotation.values.discount) * (formik_quotation.values.vat_percentage / 100),
        total_cost_with_vat: (total_cost_without_vat-formik_quotation.values.discount)  + ((total_cost_without_vat-formik_quotation.values.discount)  * (formik_quotation.values.vat_percentage / 100))
      })

          // eslint-disable-next-line react-hooks/exhaustive-deps
    },[quotationDetails, formik_quotation.values.vat_percentage, formik_quotation.values.discount])


  function generateQuotationNumber(is_series){
   AxiosInstance.post("/quotation/generateQuotationNumber", {is_series: is_series})
    .then(function(result){
        if(result.data.status === "SUCCESS")
        {
          setQuotationNumber(result.data.quotation_number);
          // const fetchSeriesQuotationNumbers = result.data.series_quotation_numbers.map((series_quotation_numbers)=>({
          //   series_quotation_numbers: series_quotation_numbers
          // }))
           setSeriesQuotationNumbers({
            ...seriesQuotationNumbers,
            series_quotation_numbers: result.data.series_quotation_numbers.map(element => element)
          })
          // setSeriesQuotationNumbers((seriesQuotationNumbers)=>[
          // ...seriesQuotationNumbers,
          //  result.data.series_quotation_numbers
          //  ]);

        }
        else
        {
          console.log(result.data)
        }
    }) 
    .catch(function(error){
      console.log(error)
    })

  }

   useEffect(()=>{
 
   generateQuotationNumber(false);
    AxiosInstance.get("/preferences/vat_pricing")
    .then(function(result){
      setVatPrices((vatPrices)=>{
        return result.data.vat_pricing.map((element)=>({
          currency: element.currency,
          vat_percentage: element.vat_percentage
        }))
      });
    })
    .catch(function(error){
      console.log(error)
    })


 // eslint-disable-next-line  
   }, [])

   function handleGetClientDetails(field_name, client_name){
    AxiosInstance.post("/quotation/get_quotation_client_details", {field_name: field_name, client_name: client_name})
    .then(function(result){
        if(result.data.status === 'SUCCESS'){

          setClientDetails({
            ...clientDetails,
            [field_name]: result.data.client_details.map(element => element[field_name])
          })

        }else{
          console.log(result.data.message)
        }
    })
    .catch(function(error){
      console.log(error)
    })
   }

    return(
        <React.Fragment>
            <Toolbar />
            <Paper>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>
                <Stack direction="row" justifyContent="space-between" sx={{paddingLeft: 2, paddingRight: 2}}>
                    <Typography variant="h6">NEW QUOTATION</Typography>

                </Stack>
              <Grid item>
                 <Divider />
              </Grid>
               <Grid item>
                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                    <FormControl
                      fullWidth
                      size="small"
                      error={formik_quotation.touched.is_series && Boolean(formik_quotation.errors.is_series)}
                    >
                      <InputLabel>Series Quotation:</InputLabel>
                      <Select
                      name="is_series"
                      value={formik_quotation.values.is_series}
                      label="Series Quotation"
                      onChange={(event)=>{

                         formik_quotation.setFieldValue('is_series', event.target.value)
                         generateQuotationNumber(event.target.value)

                      }}
                      >
                          <MenuItem value={true}>
                              Yes
                          </MenuItem>
                          <MenuItem value={false}>
                              No
                          </MenuItem>
                      </Select>
                      {/* <FormHelperText>
                      {formik_quotation.touched.is_vat && formik_quotation.errors.is_vat}
                      </FormHelperText> */}
                  </FormControl>
                    {!formik_quotation.values.is_series ? <TextField size="small" variant="outlined" label="Quotation #" value={quotationNumber} readOnly fullWidth />
                    : <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        //onFocus={()=>handleGetClientDetails('attention_to')}
                        options={seriesQuotationNumbers.series_quotation_numbers.map((option) => option)}
                        value={formik_quotation.values.quotation_number}
                        onChange={(event, value)=>formik_quotation.setFieldValue('quotation_number', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Quotation #: "
                            name="quotation_number"
                            value={formik_quotation.values.quotation_number}
                            onChange={formik_quotation.handleChange}
                            fullWidth
                            size="small"
                            error={
                            formik_quotation.touched.quotation_number && Boolean(formik_quotation.errors.quotation_number)
                            }
                            helperText={
                            formik_quotation.touched.quotation_number && formik_quotation.errors.quotation_number
                            }
                          />
                        )}
                        fullWidth
                      />}
                    <FormControl
                      fullWidth
                      size="small"
                      error={formik_quotation.touched.is_vat && Boolean(formik_quotation.errors.is_vat)}
                    >
                      <InputLabel>Vat Appicable</InputLabel>
                      <Select
                      name="is_vat"
                      value={formik_quotation.values.is_vat}
                      label="Vat Applicable"
                      onChange={(event)=>{

                        formik_quotation.setFieldValue('is_vat', event.target.value)
                        const selectedElement = vatPrices.find(element => element.currency === formik_quotation.values.currency);
                      
                        if (selectedElement) {
                          const vatPercentage = selectedElement.vat_percentage;
                          if(event.target.value){
                            formik_quotation.setFieldValue('vat_percentage', parseFloat(vatPercentage));
                          }else{
                              formik_quotation.setFieldValue('vat_percentage', 0);
                          }

                        } 


                      }}
                      >
                          <MenuItem value={true}>
                              Yes
                          </MenuItem>
                          <MenuItem value={false}>
                              No
                          </MenuItem>
                      </Select>
                      <FormHelperText>
                      {formik_quotation.touched.is_vat && formik_quotation.errors.is_vat}
                      </FormHelperText>
                  </FormControl>
                
                  <FormControl
                      fullWidth
                      size="small"
                      error={formik_quotation.touched.currency && Boolean(formik_quotation.errors.currency)}
                    >
                      <InputLabel>Currency</InputLabel>
                      <Select
                      name="currency"
                      value={formik_quotation.values.currency}
                      label="Currency"
                      onChange={(event) => {
                        const selectedCurrency= event.target.value;
                        formik_quotation.setFieldValue('currency', selectedCurrency);
                      
                        
                        const selectedElement = vatPrices.find(element => element.currency === selectedCurrency);
                      
                        if (selectedElement) {
                          const vatPercentage = selectedElement.vat_percentage;
                          if (formik_quotation.values.is_vat) {
                            formik_quotation.setFieldValue('vat_percentage', parseFloat(vatPercentage));
                          }
                        } 
                      }}
                      
                    >
                      {vatPrices.map((element, index) => (
                        <MenuItem key={index} value={element.currency}>
                          {element.currency}
                        </MenuItem>
                      ))}
                    </Select>

                      <FormHelperText>
                      {formik_quotation.touched.currency && formik_quotation.errors.currency}
                      </FormHelperText>
                  </FormControl>
                  
                 </Stack>
               </Grid>
               <Grid item>
                
                 <Stack direction="row" spacing={2}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker 
                      value={dayjs(formik_quotation.values.date)}
                      onChange={(value)=>formik_quotation.setFieldValue('date', dayjs(new Date(value)).format('YYYY-MM-DD'))}
                      slotProps={{
                          textField: {
                            label: 'Date',
                            variant: 'outlined',
                            name: 'date',
                            size: 'small', 
                            fullWidth: true,
                            error: Boolean(formik_quotation.errors.date),
                            helperText:formik_quotation.touched.date && formik_quotation.errors.date
                          },
                        }} />
                    </LocalizationProvider>
                        <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        onFocus={()=>handleGetClientDetails('client_name', '')}
                        options={clientDetails.client_name.map((option) => option)}
                        value={formik_quotation.values.client_name}
                        onChange={(event, value)=>formik_quotation.setFieldValue('client_name', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Client Name"
                            name="client_name"
                            fullWidth
                            size="small"
                            value={formik_quotation.values.client_name}
                            onChange={formik_quotation.handleChange}
                            error={
                            formik_quotation.touched.client_name && Boolean(formik_quotation.errors.client_name)
                            }
                            helperText={
                            formik_quotation.touched.client_name && formik_quotation.errors.client_name
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
                        onFocus={()=>handleGetClientDetails('attention_to', formik_quotation.values.client_name)}
                        options={clientDetails.attention_to.map((option) => option)}
                        value={formik_quotation.values.attention_to}
                        onChange={(event, value)=>formik_quotation.setFieldValue('attention_to', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Attention to "
                            name="attention_to"
                            value={formik_quotation.values.attention_to}
                            onChange={formik_quotation.handleChange}
                            fullWidth
                            size="small"
                            error={
                            formik_quotation.touched.attention_to && Boolean(formik_quotation.errors.attention_to)
                            }
                            helperText={
                            formik_quotation.touched.attention_to && formik_quotation.errors.attention_to
                            }
                          />
                        )}
                        fullWidth
                      />
                 </Stack>
               </Grid>
               <Grid item>
                    <TextField variant='outlined' label="Project Name"
                    name="project_name"
                    value={formik_quotation.values.project_name}
                    onChange={formik_quotation.handleChange}
                    size="small"
                    error={
                      formik_quotation.touched.project_name && Boolean(formik_quotation.errors.project_name)
                      }
                    helperText={
                      formik_quotation.touched.project_name && formik_quotation.errors.project_name
                      }
                     fullWidth />
                </Grid>
                <Grid item>
                    <TextField variant='outlined' label="Project Description"
                    name="project_description"
                    value={formik_quotation.values.project_description}
                    onChange={formik_quotation.handleChange}
                    size="small"
                    // error={
                    //   formik_quotation.touched.project_description && Boolean(formik_quotation.errors.project_description)
                    //   }
                    // helperText={
                    //   formik_quotation.touched.project_description && formik_quotation.errors.project_description
                    //   }
                     multiline rows={2} fullWidth />
                </Grid>
                <Grid item>
                <Stack 
                  direction="row" 
                  sx={{width: "100%", alignItems: "center"}}
                >
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => {
                      setModal((modal) => ({
                        ...modal,
                        add: {
                          ...modal.add,
                          open: true,
                        }
                      }));
                    }} 
                    sx={{ width: 'fit-content',  whiteSpace: 'nowrap'}}
                  >
                    Add Details
                  </Button>
                  <Collapse in={error} sx={{ mb: 2, width: 'stretch' }}>
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setError(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  
                    icon={<ErrorIcon color='inherit' />}
                    severity="error"

                  >
                    Quotation Details is empty!
                  </Alert>
                  </Collapse>

                </Stack>

                  </Grid>
                 <Dialog open={modal.add.open} content={
                  <Grid container direction="column" spacing={2}>
                    <Grid item>
                      <Typography variant="h6">ADD DETAILS</Typography>
                    </Grid>
                    <Grid item>
                      <TextField 
                       label="Description"
                       variant="outlined"
                       name="description"
                       multiline
                       rows={3}
                       value={formik_quotation_detail.values.description}
                       size="small"
                       onChange={formik_quotation_detail.handleChange}
                       error={
                        formik_quotation_detail.touched.description && Boolean(formik_quotation_detail.errors.description)
                        }
                        helperText={
                          formik_quotation_detail.touched.description && formik_quotation_detail.errors.description
                        }
                       fullWidth
                      />
                    </Grid>
                    <Grid item>
                      <TextField 
                       label="Quantity"
                       variant="outlined"
                       name="quantity"
                       value={formik_quotation_detail.values.quantity}
                       size="small"
                       onChange={formik_quotation_detail.handleChange}
                       error={
                        formik_quotation_detail.touched.quantity && Boolean(formik_quotation_detail.errors.quantity)
                        }
                        helperText={
                          formik_quotation_detail.touched.quantity && formik_quotation_detail.errors.quantity
                        }
                       fullWidth
                      />
                    </Grid>
                    <Grid item>
                      <TextField 
                       label="Total Cost"
                       variant="outlined"
                       name="total_cost"
                       value={formik_quotation_detail.values.total_cost}
                       size="small"
                       onChange={formik_quotation_detail.handleChange}
                       error={
                        formik_quotation_detail.touched.total_cost && Boolean(formik_quotation_detail.errors.total_cost)
                        }
                        helperText={
                          formik_quotation_detail.touched.total_cost && formik_quotation_detail.errors.total_cost
                        }
                       fullWidth
                      />
                    </Grid>
                    <Grid item container justifyContent="flex-end">
                        <Grid item>
                            <Button variant="text" color="primary" onClick={()=>setModal((modal) => ({
                              ...modal,
                                add: {
                                  ...modal.add,
                                  open: false,
                                }
                              }))}>Cancel</Button>
                        </Grid>
                        <Grid item>
                           <Button variant="contained" color="secondary" onClick={formik_quotation_detail.handleSubmit}>Save</Button>
                        </Grid>
                    </Grid>
                  </Grid>
                 } />
                
                <Grid item>
                    <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                <StyledTableRow>
                                    <StyledTableCell align="left">SN</StyledTableCell>
                                    <StyledTableCell sx={{ minWidth: 400 }}>DESCRIPTION</StyledTableCell>
                                    <StyledTableCell align="center">QUANTITY</StyledTableCell>
                                    <StyledTableCell align="right">UNIT COST {formik_quotation.values.currency}</StyledTableCell>
                                    <StyledTableCell align="right">TOTAL COST {formik_quotation.values.currency}</StyledTableCell>
                                    <StyledTableCell align="center">ACTION</StyledTableCell>
                                </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                {quotationDetails.map((quotationDetail, i) => (
                                    <StyledTableRow
                                    key={i}
                                    >
                                    <StyledTableCell align="left">{i+1}</StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                        {quotationDetail.description}
                                    </StyledTableCell>
                                    
                                    <StyledTableCell align="center">
                                      {quotationDetail.quantity}</StyledTableCell>
                                    <StyledTableCell align="right">{quotationDetail.unit_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    <StyledTableCell align="right">{quotationDetail.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    <StyledTableCell align="center">
                                    <IconButton size='small' color="success" onClick={()=>handleEditQuotaionDetails(i)}>
                                      <EditIcon fontSize='inherit' />
                                    </IconButton>
                                    <Dialog open={quotationDetail.edit_open} content={
                                      <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                          <Typography variant="h6">EDIT DETAILS</Typography>
                                        </Grid>
                                        <Grid item>
                                          <TextField 
                                          label="Description"
                                          variant="outlined"
                                          name="description"
                                          multiline
                                          rows={3}
                                          value={formik_quotation_detail.values.description}
                                          size="small"
                                          onChange={formik_quotation_detail.handleChange}
                                          error={
                                            formik_quotation_detail.touched.description && Boolean(formik_quotation_detail.errors.description)
                                            }
                                            helperText={
                                              formik_quotation_detail.touched.description && formik_quotation_detail.errors.description
                                            }
                                          fullWidth
                                          />
                                        </Grid>
                                        <Grid item>
                                          <TextField 
                                          label="Quantity"
                                          variant="outlined"
                                          name="quantity"
                                          value={formik_quotation_detail.values.quantity}
                                          size="small"
                                          onChange={formik_quotation_detail.handleChange}
                                          error={
                                            formik_quotation_detail.touched.quantity && Boolean(formik_quotation_detail.errors.quantity)
                                            }
                                            helperText={
                                              formik_quotation_detail.touched.quantity && formik_quotation_detail.errors.quantity
                                            }
                                          fullWidth
                                          />
                                        </Grid>
                                        <Grid item>
                                          <TextField 
                                          label="Total Cost"
                                          variant="outlined"
                                          name="total_cost"
                                          value={formik_quotation_detail.values.total_cost}
                                          size="small"
                                          onChange={formik_quotation_detail.handleChange}
                                          error={
                                            formik_quotation_detail.touched.total_cost && Boolean(formik_quotation_detail.errors.total_cost)
                                            }
                                            helperText={
                                              formik_quotation_detail.touched.total_cost && formik_quotation_detail.errors.total_cost
                                            }
                                          fullWidth
                                          />
                                        </Grid>
                                        <Grid item container justifyContent="flex-end">
                                            <Grid item>
                                                <Button variant="text" color="primary" onClick={()=>handleEditCancel(i)}>Cancel</Button>
                                            </Grid>
                                            <Grid item>
                                              <Button variant="contained" color="success" onClick={()=>handleUpdateQuotationDetails(i)}>Update</Button>
                                            </Grid>
                                        </Grid>
                                      </Grid>
                                    } />
                                    <IconButton size='small' onClick={()=>handleRemoveQuotationDetails(i)} color="error">
                                      <DeleteIcon fontSize='inherit' />
                                    </IconButton>
                                    </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                                </TableBody>
                                {
                                  formik_quotation.values.is_vat ? (
                                    <TableFooter>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right"  >TOTAL COST w/o VAT:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_quotation.values.currency+' '+parseFloat(quotationBreakdown.total_cost_without_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                                            <StyledTableRow>
                                      <StyledDiscountCell colSpan={5} align="right">DISCOUNT: </StyledDiscountCell>
                                      <StyledTableCell align="center">
                                      <CustomInput 
                                            name="discount" 
                                            value={formik_quotation.values.discount} 
                                            variant="outlined" 
                                            fullWidth 
                                            size="small" 
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& input': {
                                                        textAlign: 'center',
                                                    }
                                                }
                                            }}
                                            onChange={formik_quotation.handleChange}
                                            helperText={
                                                formik_quotation.touched.discount && formik_quotation.errors.discount
                                            }
                                            error={Boolean(formik_quotation.touched.discount && formik_quotation.errors.discount)}
                                            autoComplete="off"
                                        />
                                      </StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right">TOTAL COST w/ DISCOUNT: </StyledTableCell>
                                      <StyledTableCell align="center">{formik_quotation.values.currency+' '+(parseFloat(quotationBreakdown.total_cost_without_vat)-formik_quotation.values.discount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right">VAT {formik_quotation.values.vat_percentage}%:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_quotation.values.currency+' '+parseFloat(quotationBreakdown.vat_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right">TOTAL COST w/ VAT:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_quotation.values.currency+' '+parseFloat(quotationBreakdown.total_cost_with_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                  </TableFooter>
                                  ) : (
                                    <TableFooter>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right"  >TOTAL COST:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_quotation.values.currency+' '+parseFloat(quotationBreakdown.total_cost_without_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                     <StyledTableRow>
                                      <StyledDiscountCell colSpan={5} align="right">DISCOUNT: </StyledDiscountCell>
                                      <StyledTableCell align="center">
                                      <CustomInput 
                                            name="discount" 
                                            value={formik_quotation.values.discount} 
                                            variant="outlined" 
                                            fullWidth 
                                            size="small" 
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    '& input': {
                                                        textAlign: 'center',
                                                        
                                                    }
                                                }
                                            }}
                                            onChange={formik_quotation.handleChange}
                                            helperText={
                                                formik_quotation.touched.discount && formik_quotation.errors.discount
                                            }
                                            error={Boolean(formik_quotation.touched.discount && formik_quotation.errors.discount)}
                                            autoComplete="off"
                                        />
                                      </StyledTableCell>
                                    </StyledTableRow>
                                     <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right">TOTAL COST w/ DISCOUNT: </StyledTableCell>
                                      <StyledTableCell align="center">{formik_quotation.values.currency+' '+parseFloat(quotationBreakdown.total_cost_with_discount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                  </TableFooter>
                                  )
                                }
                            </Table>
                        </TableContainer>
                </Grid>
                <Grid item>
                <TextField 
                  label="Notes"
                  variant="outlined"
                  name="notes"
                  value={formik_quotation.values.notes}
                  size="small"
                  onChange={formik_quotation.handleChange}
                  multiline
                  rows={3}
                  fullWidth
                  />
                </Grid>
                <Grid item>
                 <Divider />
                 </Grid>
                 <Grid item>
                     <LoadingButton variant='contained' color='success' sx={{float: 'right'}} onClick={formik_quotation.handleSubmit} loading={loading}>Submit for Verification</LoadingButton>
                 </Grid>
            </Grid>
            </Paper>
           
        </React.Fragment>
    )
}

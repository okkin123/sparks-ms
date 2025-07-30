import React, { useState, useEffect} from 'react';
import { styled } from '@mui/material/styles';
import { theme } from '../../Theme';
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
         FormControl,
         InputLabel,
         Select,
         MenuItem,
         FormHelperText,
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
import NumberFormatCustom from '../../Components/NumberFormatCustom';


const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  [`&.${tableCellClasses.footer}`]: {
    fontSize: 14,
    color: theme.palette.common.black,
    fontWeight: 'bold'
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  // hide last border
  'td,th': {
    border: '1px solid gray',
  },
}));

const InvoiceDetailSchema = Yup.object().shape({
  topics: Yup.string()
    .required('This field is required!'),
  amount_without_vat: Yup.number()
    .typeError('Only numbers and decimal points are allowed!')
    .required('This field is required!'),
  amount_with_vat: Yup.number()
    .typeError('Only numbers and decimal points are allowed!')
    .test('is-required-if', 'This field is required!', function (value) {
      const { amount_without_vat } = this.parent;
      if (isNaN(amount_without_vat) || amount_without_vat === 0) {
        return value !== undefined && value !== null && value !== '';
      }
      return true;
    }),
});


  const InvoiceSchema = Yup.object().shape({
    date: Yup.date().required('Date is required'),
    ref_quotation_number: Yup.string()
    .required('This field is required!'),
    client_trn: Yup.string()
    .test('is-required-if-vat', 'This field is required!', function (value) {
      const { is_vat } = this.parent;
      if (is_vat === 'Yes' && !value) {
        return false;
      }
      return true;
    }),
    po_box: Yup.number()
    .integer('Only whole numbers are allowed')
    .required('This field is required!'),
    po_number: Yup.number()
    .integer('Only whole numbers are allowed'),
    address: Yup.string()
    .required('This field is required!'),
    
  });



  
export default function Edit(props){

    const invoiceNumber = props.invoice_number;
    const quotationNumber = props.quotation_number; 
    const [modal, setModal] = useState({
      add: {
        open: false
      },
    })
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [quotationNumbers, setQuotationNumbers] = useState([]);
    const [invoiceDetails, setInvoiceDetails] = useState([]);
    const [clientDetails, setClientDetails] = useState([]);
    const [quotationBreakdown, setQuotationBreakdown] = useState({
      total_cost_without_vat: "",
      vat_amount: "",
      total_cost_with_vat: ""
    })
   
    const [error, setError] = useState({
      open: false,
      message: ""
    });


    const handleEditInvoiceDetails = (index) => {

      invoiceDetails.map((invoiceDetail, i) => 
           i === index ? 
           formik_invoice_detail.setValues({
            topics:invoiceDetail.topics,
            amount_without_vat: invoiceDetail.amount_without_vat,
            amount_with_vat: invoiceDetail.amount_with_vat
           })
           : null
      );

      setInvoiceDetails(invoiceDetails.map((invoiceDetail, i) =>
        i === index ? { ...invoiceDetail, edit_open: true } : invoiceDetail
      ));
    };

    const handleClearForms = ()=>{
      formik_invoice_detail.resetForm();
      formik_invoice_detail.setValues({
        topics: "",
        amount_without_vat: "",
        amount_with_vat: ""
      });

    }

    const handleEditCancel = (index)=>{
      handleClearForms();
      setInvoiceDetails(invoiceDetails.map((invoiceDetail, i) =>
        i === index ? { ...invoiceDetail, edit_open: false } : invoiceDetail
      ));
    }

    const handleUpdateInvoiceDetails = (index)=>{
      formik_invoice_detail.validateForm().then((errors)=>{
        if (Object.keys(errors).length === 0) {
         handleClearForms();
         setInvoiceDetails(invoiceDetails.map((invoiceDetail, i) =>
            i === index ? { ...invoiceDetail, 
              edit_open: false,
              topics: formik_invoice_detail.values.topics,
              amount_without_vat: parseFloat(formik_invoice_detail.values.amount_without_vat).toFixed(2),
              vat_amount: (parseFloat(formik_invoice_detail.values.amount_without_vat) * (parseFloat(formik_invoice.values.vat_percentage) / 100)).toFixed(2),
              amount_with_vat: (parseFloat(formik_invoice_detail.values.amount_without_vat) + (parseFloat(formik_invoice_detail.values.amount_without_vat) * (parseFloat(formik_invoice.values.vat_percentage)  / 100))).toFixed(2)
            } : invoiceDetail
          ));
        } else {
          // Handle validation errors
          formik_invoice_detail.setTouched({
            ...Object.keys(errors).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {})
          });
        }
      });

    }
    
    const handleRemoveInvoiceDetails = (index) => {
      setInvoiceDetails((invoiceDetails) => {
        const invoiceDetail = [...invoiceDetails];
        invoiceDetail.splice(index, 1);
        return invoiceDetail;
      });
    };
   
    const formik_invoice_detail = useFormik({
      initialValues: {
        topics: "",
        amount_without_vat: "",
        amount_with_vat: ""
      },
      validationSchema: InvoiceDetailSchema,
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
        setInvoiceDetails((invoiceDetails)=>[
          ...invoiceDetails,
          {
            edit_open: false,
            topics: values.topics,
            amount_without_vat: parseFloat(values.amount_without_vat).toFixed(2),
            vat_amount: formik_invoice.values.vat_percentage !== null ? (parseFloat(values.amount_without_vat) * (parseFloat(formik_invoice.values.vat_percentage) / 100)).toFixed(2) : "",
            amount_with_vat: formik_invoice.values.vat_percentage !== null ? (parseFloat(values.amount_without_vat) + (parseFloat(values.amount_without_vat) * (parseFloat(formik_invoice.values.vat_percentage)  / 100))).toFixed(2) : ""
          }
        ]);

      }
    })


    const formik_invoice = useFormik({
      initialValues: {
        is_vat: "No",
        date: null,
        ref_quotation_number: "",
        client_trn: "",
        client_name: "",
        attention_to: "",
        address: "",
        po_box: "",
        po_number:"",
        project_name: "",
        project_description: "",
        vat_percentage: null,
        amount_with_vat: "",
        invoice_amount_with_vat: "",
        currency: "",
        total_invoice_amount_with_vat: "",
        remaining_quotation_balance: ""
      },
      validateOnChange: false,
      validationSchema: InvoiceSchema,
      onSubmit: (values, {validateForm})=>{
        setLoading(true)
        if(invoiceDetails.length === 0)
        {
          setError({
            open: true,
            message: "Invoice details is empty! Please enter details for the invoice."
          })
        }
        else
        {
          //if(parseFloat(quotationBreakdown.total_cost_with_vat.toFixed(2)) > parseFloat(values.remaining_quotation_balance.replace(/,/g, '')))
          //console.log(parseFloat(quotationBreakdown.total_cost_with_vat))
          //console.log(parseFloat(values.remaining_quotation_balance.replace(/,/g, '')))
          if(parseFloat(quotationBreakdown.total_cost_with_vat) > parseFloat(values.remaining_quotation_balance.replace(/,/g, '')))
          {
            setError({
              open: true,
              message: "Total amount for this invoice is invalid! The remaining balan ce for this quotation is insufficient. Please check and try again!" 
            })
          }else{
            setError({
              ...error,
              open: false
            })
            AxiosInstance.post("/invoice/update", {
              invoice_number: invoiceNumber,
              values: values,
              details: invoiceDetails,
              amount_without_vat: quotationBreakdown.total_cost_without_vat
            })
            .then(function(response){
              if(response.data.status === "SUCCESS")
              {
                navigate('/', {
                  state: {
                    invoice_created_updated: true,
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
        setLoading(false)
      }
    })


    const fetchInvoiceDetails = (invoice_number)=>{
      AxiosInstance.post("/invoice/details", {invoice_number : invoice_number})
      .then((result) => {
        if (result.data.status === "SUCCESS") {
          formik_invoice.setValues({
              is_vat: !!result.data.invoice[0].is_vat ? 'Yes' : 'No',
              date: dayjs(new Date(result.data.invoice[0].invoice_date)).format('YYYY-MM-DD'),
              ref_quotation_number: result.data.invoice[0].quotation_number,
              po_box: result.data.invoice[0].po_box,
              po_number: result.data.invoice[0].po_number !== 0 ? result.data.invoice[0].po_number : '',
              client_name: result.data.invoice[0].client_name,
              attention_to: result.data.invoice[0].attention_to,
              project_name: result.data.invoice[0].project_name,
              project_description: result.data.invoice[0].project_description,
              client_trn: result.data.invoice[0].client_trn,
              address: result.data.invoice[0].address,
              vat_percentage: result.data.invoice[0].vat_percentage,
              amount_with_vat: result.data.invoice[0].quotation_cost,
              invoice_amount_with_vat: result.data.invoice[0].amount_with_vat,
              currency: result.data.invoice[0].currency,
              //total_invoice_amount_with_vat: (parseFloat(result.data.invoice[0].total_invoice_amount_with_vat.replace(/,/g, ''))-parseFloat(result.data.invoice[0].amount_with_vat.replace(/,/g, ''))).toFixed(2),
              total_invoice_amount_with_vat: parseFloat(result.data.invoice[0].total_invoice_amount_with_vat)-parseFloat(result.data.invoice[0].amount_with_vat),
              //remaining_quotation_balance:  ((parseFloat(result.data.invoice[0].quotation_cost.replace(/,/g, '')) - parseFloat(result.data.invoice[0].total_invoice_amount_with_vat.replace(/,/g, ''))) + parseFloat(result.data.invoice[0].amount_with_vat.replace(/,/g, ''))).toFixed(2)
               remaining_quotation_balance:  (parseFloat(result.data.invoice[0].quotation_cost) - parseFloat(result.data.invoice[0].total_invoice_amount_with_vat)) + parseFloat(result.data.invoice[0].amount_with_vat)
   

          });

       
          setInvoiceDetails((invoiceDetails) => [
            ...result.data.details.map((element) => ({
              edit_open: false,
              topics: element.topics,
              amount_without_vat: parseFloat(element.amount_without_vat).toFixed(2),
              vat_amount: result.data.invoice[0].vat_percentage !== null ? (parseFloat(element.amount_without_vat) * (parseFloat(result.data.invoice[0].vat_percentage) / 100)).toFixed(2) : "",
              amount_with_vat: result.data.invoice[0].vat_percentage !== null ? (parseFloat(element.amount_without_vat) + (parseFloat(element.amount_without_vat) * (parseFloat(result.data.invoice[0].vat_percentage)  / 100))).toFixed(2) : ""
            })),
          ]);
                
        } else {
          console.log(result.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });
    }

    const handleRefQuotationNumberChange = (quotation_number)=>{
      if(quotation_number === quotationNumber){
          fetchInvoiceDetails(invoiceNumber)
      }else{

        AxiosInstance.post("/invoice/selected_ref_quotation", {quotation_number: quotation_number})
        .then(function(result){
          if(result.data.status === "SUCCESS"){

            formik_invoice.setFieldValue('ref_quotation_number', result.data.quotation[0].quotation_number);
            formik_invoice.setFieldValue('is_vat', !!result.data.quotation[0].is_vat ? 'Yes' : 'No');
            formik_invoice.setFieldValue('client_name', result.data.quotation[0].client_name);
            formik_invoice.setFieldValue('attention_to', result.data.quotation[0].attention_to);
            formik_invoice.setFieldValue('po_box', result.data.quotation[0].po_box);
            formik_invoice.setFieldValue('po_number', result.data.quotation[0].po_number !== 0 ? result.data.quotation[0].po_number : '');
            formik_invoice.setFieldValue('project_name', result.data.quotation[0].project_name);
            formik_invoice.setFieldValue('project_description', result.data.quotation[0].project_description);
            formik_invoice.setFieldValue('vat_percentage', result.data.quotation[0].vat_percentage);
            formik_invoice.setFieldValue('amount_with_vat', result.data.quotation[0].amount_with_vat);
            formik_invoice.setFieldValue('currency', result.data.quotation[0].currency);
            formik_invoice.setFieldValue('total_invoice_amount_with_vat', result.data.quotation[0].total_invoice_amount_with_vat);
            formik_invoice.setFieldValue('remaining_quotation_balance', result.data.quotation[0].remaining_quotation_balance);
            formik_invoice.setFieldValue('address', '');
            formik_invoice.setFieldValue('client_trn', '');
            const updateInvoiceDetails = invoiceDetails.map(invoiceDetail => ({
              ...invoiceDetail,
              vat_amount: (parseFloat(invoiceDetail.amount_without_vat) * (parseFloat(result.data.quotation[0].vat_percentage) / 100)).toFixed(2),
              amount_with_vat: (parseFloat(invoiceDetail.amount_without_vat) + (parseFloat(invoiceDetail.amount_without_vat) * (parseFloat(result.data.quotation[0].vat_percentage)  / 100))).toFixed(2)
            }));
            
            setInvoiceDetails(updateInvoiceDetails);
            
          }else{
            console.log(result.data.message);
          }
  
        })
        .catch(function(error){
          console.log(error)
        })
        
      }
    }

    function handleGetClientDetails(client_name){
      AxiosInstance.post("/invoice/get_invoice_client_details", {client_name: client_name})
      .then(function(result){
          if(result.data.status === 'SUCCESS'){
  
            setClientDetails((clientDetails)=>[
              ...result.data.client_details.map(element => ({
                address: element.address,
                client_trn: element.client_trn,
                po_box: ''+element.po_box
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

    useEffect(()=>{

     const total_cost_without_vat = invoiceDetails.reduce((accumulator, currentItem) => {
        return accumulator + parseFloat(currentItem.amount_without_vat);
      }, 0);

      const vat_amount = invoiceDetails.reduce((accumulator, currentItem) => {
        return accumulator + parseFloat(currentItem.vat_amount);
      }, 0);

      const total_cost_with_vat = invoiceDetails.reduce((accumulator, currentItem) => {
        return accumulator + parseFloat(currentItem.amount_with_vat);
      }, 0);

      setQuotationBreakdown({
        total_cost_without_vat: total_cost_without_vat,
        vat_amount: vat_amount,
        total_cost_with_vat: total_cost_with_vat
      })

          // eslint-disable-next-line react-hooks/exhaustive-deps
    },[invoiceDetails, formik_invoice.values.vat_percentage])

   useEffect(()=>{

      AxiosInstance.get("/invoice/ref_quotation_numbers")
      .then(function(result){
          const filteredQuotationNumbers = result.data.quotations.filter((quotation)=>quotation.quotation_number !== quotationNumber);

          if(result.data.status === "SUCCESS")
          {
            const fetchQuotationNumbers = [
                ...quotationNumbers,
                quotationNumber,
                ...filteredQuotationNumbers.map(quotation => quotation.quotation_number)
            ];
            setQuotationNumbers(fetchQuotationNumbers)
          }
          else
          {
            console.log(result.data)
          }
      }) 
      .catch(function(error){
        console.log(error)
      })

     fetchInvoiceDetails(invoiceNumber)

      // eslint-disable-next-line
   }, [])


    return(
        <React.Fragment>
            <Toolbar />
            <Paper>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>
                <Stack direction="row" justifyContent="space-between" sx={{paddingLeft: 2, paddingRight: 2}}>
                  <Typography variant="h6">EDIT INVOICE</Typography>
                 
                </Stack>
              <Grid item>
                 <Divider />
              </Grid>
               <Grid item>
                <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                      <FormControl
                        fullWidth
                        size="small"
                        error={formik_invoice.touched.ref_quotation_number && Boolean(formik_invoice.errors.ref_quotation_number)}
                        >
                        <InputLabel>Reference Quotation #</InputLabel>
                        <Select
                        name="ref_quotation_number"
                        value={formik_invoice.values.ref_quotation_number}
                        label="Reference Quotation #"
                        onChange={(event)=>handleRefQuotationNumberChange(event.target.value)}
                        >
                        {quotationNumbers.map((element, key) => {
                          return (
                            <MenuItem key={key} value={element}>
                                {element}
                            </MenuItem>
                            );
                        }) }

                        </Select>
                        <FormHelperText>
                        {formik_invoice.touched.ref_quotation_number && formik_invoice.errors.ref_quotation_number}
                        </FormHelperText>
                    </FormControl>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker 
                    value={dayjs(formik_invoice.values.date)}
                    onChange={(value)=>formik_invoice.setFieldValue('date', dayjs(new Date(value)).format('YYYY-MM-DD'))}
                    slotProps={{
                        textField: {
                          label: 'Date',
                          variant: 'outlined',
                          name: 'date',
                          size: 'small', 
                          fullWidth: true,
                          error: Boolean(formik_invoice.errors.date),
                          helperText:formik_invoice.touched.date && formik_invoice.errors.date
                        },
                      }} />
                  </LocalizationProvider>
                 <TextField variant='outlined' label="Vat Applicable"
                    name="is_vat"
                    value={formik_invoice.values.is_vat}
                    size="small"
                    error={
                      formik_invoice.touched.is_vat && Boolean(formik_invoice.errors.is_vat)
                      }
                    helperText={
                      formik_invoice.touched.is_vat && formik_invoice.errors.is_vat
                      }
                    readOnly
                    fullWidth />
                  <TextField size="small" variant="outlined" label="Invoice #" value={invoiceNumber} readOnly fullWidth />

                 </Stack>
               </Grid>
               <Grid item>
                 <Stack direction="row" spacing={2}>

                    <TextField variant='outlined' label="Client Name"
                      name="client_name"
                      value={formik_invoice.values.client_name}
                      size="small"
                      error={
                        formik_invoice.touched.client_name && Boolean(formik_invoice.errors.client_name)
                        }
                      helperText={
                        formik_invoice.touched.client_name && formik_invoice.errors.client_name
                        }
                      readOnly
                      fullWidth />
                    <TextField variant='outlined' label="Attention to"
                      name="attention_to"
                      value={formik_invoice.values.attention_to}
                      size="small"
                      error={
                        formik_invoice.touched.attention_to && Boolean(formik_invoice.errors.attention_to)
                        }
                      helperText={
                        formik_invoice.touched.attention_to && formik_invoice.errors.attention_to
                        } 
                        readOnly
                        fullWidth/>
                      <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        onFocus={()=>handleGetClientDetails(formik_invoice.values.client_name)}
                        options={clientDetails.map((option) => option.client_trn)}
                        value={formik_invoice.values.client_trn}
                        onChange={(event, value)=>formik_invoice.setFieldValue('client_trn', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Client TRN #"
                            name="client_trn"
                            fullWidth
                            size="small"
                            value={formik_invoice.values.client_trn}
                            onChange={formik_invoice.handleChange}
                            error={
                            formik_invoice.touched.client_trn && Boolean(formik_invoice.errors.client_trn)
                            }
                          helperText={
                            formik_invoice.touched.client_trn && formik_invoice.errors.client_trn
                            }
                          />
                        )}
                        fullWidth
                      />
                 </Stack>
               </Grid>
                <Grid item>
                <Stack direction="row" spacing={2}>
                <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        onFocus={()=>handleGetClientDetails(formik_invoice.values.client_name)}
                        options={clientDetails.map((option) => option.address)}
                        value={formik_invoice.values.address}
                        onChange={(event, value)=>formik_invoice.setFieldValue('address', value)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Address"
                            name="address"
                            fullWidth
                            size="small"
                            value={formik_invoice.values.address}
                            onChange={formik_invoice.handleChange}
                            error={
                            formik_invoice.touched.address && Boolean(formik_invoice.errors.address)
                            }
                          helperText={
                            formik_invoice.touched.address && formik_invoice.errors.address
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
                          onFocus={()=>handleGetClientDetails(formik_invoice.values.client_name)}
                          options={clientDetails.map((option) => option.po_box)}
                          value={formik_invoice.values.po_box}
                          onChange={(event, value)=>{
                            formik_invoice.setFieldValue('po_box', value)
  
                          }}
                          renderInput={(params) => (
                            
                              <TextField
                                {...params}
                                label="P.O. Box"
                                name="po_box"
                                value={formik_invoice.values.po_box}
                                onChange={formik_invoice.handleChange}
                                size="small"
                                error={
                                formik_invoice.touched.po_box && Boolean(formik_invoice.errors.po_box)
                                }
                                helperText={
                                formik_invoice.touched.po_box && formik_invoice.errors.po_box
                                }
                                fullWidth />
                          )}
                          fullWidth
                        />
                         <TextField
                          variant="outlined"
                          label="P.O. Number"
                          name="po_number"
                          value={formik_invoice.values.po_number}
                          onChange={formik_invoice.handleChange}
                          size="small"
                          error={
                          formik_invoice.touched.po_number && Boolean(formik_invoice.errors.po_number)
                          }
                          helperText={
                          formik_invoice.touched.po_number && formik_invoice.errors.po_number
                          }
                          fullWidth />
                  </Stack>
                </Grid>
               <Grid item>
                 <Stack direction="row" spacing={2}>
                 <TextField variant='outlined' 
                    sx={{ '& .MuiInputBase-root': {
                        color: theme.palette.primary.main, // You can use theme colors or any valid CSS color value
                        fontWeight: 'bold'
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.primary.main,  // Label color
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main, // Border color
                      },
                    }} label={formik_invoice.values.vat_percentage !== null ? 'Total Quotation Cost w/ Vat: ' : 'Total Quotation Cost: '}
                    name="amount_with_vat"
                    value={formik_invoice.values.amount_with_vat}
                    size="small"
                    readOnly
                    InputProps={{
                    inputComponent: NumberFormatCustom,
                    }}
                    fullWidth />
                    <TextField variant='outlined' 
                    sx={{ '& .MuiInputBase-root': {
                        color: theme.palette.info.main, // You can use theme colors or any valid CSS color value
                        fontWeight: 'bold'
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.info.main,  // Label color
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.info.main, // Border color
                      },
                    }} label={formik_invoice.values.vat_percentage !== null ? 'Total Invoice Amount w/ Vat: ' : 'Total Invoice Amount: '}
                    name="total_invoice_amount_with_vat"
                    value={formik_invoice.values.total_invoice_amount_with_vat}
                    size="small"
                    readOnly
                    InputProps={{
                      inputComponent: NumberFormatCustom,
                    }}
                    fullWidth />
                    <TextField variant='outlined' 
                    sx={{ '& .MuiInputBase-root': {
                        color: theme.palette.secondary.main, // You can use theme colors or any valid CSS color value
                        fontWeight: 'bold'
                      },
                      '& .MuiInputLabel-root': {
                        color: theme.palette.secondary.main,  // Label color
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.secondary.main, // Border color
                      },
                    }} label={formik_invoice.values.vat_percentage !== null ? 'Remaining Balance w/ Vat: ' : 'Remaining Balance: '}
                    name="remaining_quotation_balance"
                    value={formik_invoice.values.remaining_quotation_balance}
                    size="small"
                    readOnly
                    InputProps={{
                      inputComponent: NumberFormatCustom,
                    }}
                    fullWidth />
                     <TextField variant='outlined' label="Currency"
                      name="currency"
                      value={formik_invoice.values.currency}
                      size="small"
                      readOnly
                      fullWidth/>
                 </Stack>
               </Grid>
  
                <Grid item>
                  <TextField variant='outlined' label="Project Name"
                    name="project_name"
                    value={formik_invoice.values.project_name}
                    size="small"
                    error={
                      formik_invoice.touched.project_name && Boolean(formik_invoice.errors.project_name)
                      }
                    helperText={
                      formik_invoice.touched.project_name && formik_invoice.errors.project_name
                      }
                     readOnly
                     fullWidth />
                </Grid>
                <Grid item>
                    <TextField variant='outlined' label="Project Description"
                    name="project_description"
                    value={formik_invoice.values.project_description}
                    size="small"
                    error={
                      formik_invoice.touched.project_description && Boolean(formik_invoice.errors.project_description)
                      }
                    helperText={
                      formik_invoice.touched.project_description && formik_invoice.errors.project_description
                      }
                     readOnly
                     multiline rows={2} fullWidth />
                </Grid>
                <Grid item>
                <Stack 
                  direction="row" 
                  spacing={2}
                  sx={{ width: '100%', alignItems: "center"}}
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
                  <Collapse in={error.open} sx={{ mb: 2, width: 'stretch' }}>
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setError({
                            ...error,
                            open: false
                          });
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  
                    icon={<ErrorIcon color='inherit' />}
                    severity="error"

                  >
                    {error.message}
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
                       label="TOPICS"
                       variant="outlined"
                       name="topics"
                       multiline
                       rows={3}
                       value={formik_invoice_detail.values.topics}
                       size="small"
                       onChange={formik_invoice_detail.handleChange}
                       error={
                        formik_invoice_detail.touched.topics && Boolean(formik_invoice_detail.errors.topics)
                        }
                        helperText={
                          formik_invoice_detail.touched.topics && formik_invoice_detail.errors.topics
                        }
                       fullWidth
                      />
                    </Grid>
                    {formik_invoice.values.vat_percentage !== null ? <React.Fragment>
                    <Grid item>
                      <TextField 
                       label="Amount w/ VAT"
                       variant="outlined"
                       name="amount_with_vat"
                       value={formik_invoice_detail.values.amount_with_vat}
                       size="small"
                       onChange={(event)=>{
                        const value = +event.target.value || 0;
                        const amount_without_vat = (value / (100 + parseInt(formik_invoice.values.vat_percentage))) * 100;
                        formik_invoice_detail.setFieldValue('amount_with_vat', event.target.value)
                        formik_invoice_detail.setFieldValue('amount_without_vat', amount_without_vat)
                       }}
                       error={
                        formik_invoice_detail.touched.amount_with_vat && Boolean(formik_invoice_detail.errors.amount_with_vat)
                        }
                        helperText={
                          formik_invoice_detail.touched.amount_with_vat && formik_invoice_detail.errors.amount_with_vat
                        }
                       fullWidth
                      />
                    </Grid>
                    {/* <Grid item>
                      <TextField 
                       label="Amount w/o VAT"
                       variant="outlined"
                       name="amount_without_vat"
                       value={formik_invoice_detail.values.amount_without_vat}
                       size="small"
                       readOnly
                       fullWidth
                      
                      />
                    </Grid> */}
                    </React.Fragment> : 
                    <Grid item>
                       <TextField 
                       label="Amount"
                       variant="outlined"
                       name="amount_without_vat"
                       value={formik_invoice_detail.values.amount_without_vat}
                       size="small"
                       onChange={formik_invoice_detail.handleChange}
                       fullWidth
                       error={
                        formik_invoice_detail.touched.amount_without_vat && Boolean(formik_invoice_detail.errors.amount_without_vat)
                        }
                        helperText={
                          formik_invoice_detail.touched.amount_without_vat && formik_invoice_detail.errors.amount_without_vat
                       }
                      />
                    </Grid>}
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
                           <Button variant="contained" color="secondary" onClick={formik_invoice_detail.handleSubmit}>Save</Button>
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
                                    <StyledTableCell sx={{ minWidth: 400 }}>TOPICS</StyledTableCell>
                                    <StyledTableCell align="right">AMOUNT ({formik_invoice.values.currency})</StyledTableCell>
                                    {
                                      formik_invoice.values.vat_percentage !== null ? (
                                        <React.Fragment>
                                          <StyledTableCell align="right">VAT {formik_invoice.values.vat_percentage}%</StyledTableCell>
                                          <StyledTableCell align="right">TOTAL ({formik_invoice.values.currency})</StyledTableCell>
                                        </React.Fragment>
                                      ): (
                                        <React.Fragment>
                                        <StyledTableCell align="right">TOTAL ({formik_invoice.values.currency})</StyledTableCell>
                                        </React.Fragment>
                                      )
                                    }
                                      <StyledTableCell align="center">ACTION</StyledTableCell>
                                </StyledTableRow>
                                </TableHead>
                                <TableBody>
                                {invoiceDetails.map((invoiceDetail, i) => (
                                    <StyledTableRow
                                    key={i}
                                    >
                                    <StyledTableCell align="left">{i+1}</StyledTableCell>
                                    <StyledTableCell component="th" scope="row">
                                        {invoiceDetail.topics}
                                    </StyledTableCell>
                                    {
                                      formik_invoice.values.vat_percentage !== null ? (
                                        <React.Fragment>
                                        <StyledTableCell align="right">{invoiceDetail.amount_without_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                        <StyledTableCell align="right">{invoiceDetail.vat_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                        <StyledTableCell align="right">{invoiceDetail.amount_with_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                        </React.Fragment>
                                      ) : (
                                        <React.Fragment>
                                        <StyledTableCell align="right">{invoiceDetail.amount_without_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                        <StyledTableCell align="right">{invoiceDetail.amount_without_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                        </React.Fragment>
                                      )
                                    }
                                    <StyledTableCell align="center">
                                    <IconButton size='small' color="success" onClick={()=>handleEditInvoiceDetails(i)}>
                                      <EditIcon fontSize='inherit' />
                                    </IconButton>
                                    <Dialog open={invoiceDetail.edit_open} content={
                                      <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                          <Typography variant="h6">EDIT DETAILS</Typography>
                                        </Grid>
                                        <Grid item>
                                          <TextField 
                                          label="topics"
                                          variant="outlined"
                                          name="topics"
                                          multiline
                                          rows={3}
                                          value={formik_invoice_detail.values.topics}
                                          size="small"
                                          onChange={formik_invoice_detail.handleChange}
                                          error={
                                            formik_invoice_detail.touched.topics && Boolean(formik_invoice_detail.errors.topics)
                                            }
                                            helperText={
                                              formik_invoice_detail.touched.topics && formik_invoice_detail.errors.topics
                                            }
                                          fullWidth
                                          />
                                        </Grid>
                                        {formik_invoice.values.vat_percentage !== null ? <React.Fragment>
                                          <Grid item>
                                            <TextField 
                                            label="Amount w/ VAT"
                                            variant="outlined"
                                            name="amount_with_vat"
                                            value={formik_invoice_detail.values.amount_with_vat}
                                            size="small"
                                            onChange={(event)=>{
                                              const value = +event.target.value || 0;
                                              const amount_without_vat = (value / (100 + parseInt(formik_invoice.values.vat_percentage))) * 100;
                                              formik_invoice_detail.setFieldValue('amount_with_vat', event.target.value)
                                              formik_invoice_detail.setFieldValue('amount_without_vat', amount_without_vat)
                                            }}
                                            error={
                                              formik_invoice_detail.touched.amount_with_vat && Boolean(formik_invoice_detail.errors.amount_with_vat)
                                              }
                                              helperText={
                                                formik_invoice_detail.touched.amount_with_vat && formik_invoice_detail.errors.amount_with_vat
                                              }
                                            fullWidth
                                            />
                                          </Grid>
                                          {/* <Grid item>
                                            <TextField 
                                            label="Amount w/o VAT"
                                            variant="outlined"
                                            name="amount_without_vat"
                                            value={formik_invoice_detail.values.amount_without_vat}
                                            size="small"
                                            readOnly
                                            fullWidth
                                            
                                            />
                                          </Grid> */}
                                          </React.Fragment> : 
                                          <Grid item>
                                          <TextField 
                                              label="Amount"
                                              variant="outlined"
                                              name="amount_without_vat"
                                              value={formik_invoice_detail.values.amount_without_vat}
                                              size="small"
                                              onChange={formik_invoice_detail.handleChange}
                                              fullWidth
                                              error={
                                                formik_invoice_detail.touched.amount_without_vat && Boolean(formik_invoice_detail.errors.amount_without_vat)
                                                }
                                                helperText={
                                                  formik_invoice_detail.touched.amount_without_vat && formik_invoice_detail.errors.amount_without_vat
                                              }
                                              />
                                          </Grid>
                                          }
                                        <Grid item container justifyContent="flex-end">
                                            <Grid item>
                                                <Button variant="text" color="primary" onClick={()=>handleEditCancel(i)}>Cancel</Button>
                                            </Grid>
                                            <Grid item>
                                              <Button variant="contained" color="success" onClick={()=>handleUpdateInvoiceDetails(i)}>Update</Button>
                                            </Grid>
                                        </Grid>
                                      </Grid>
                                    } />
                                    <IconButton size='small' onClick={()=>handleRemoveInvoiceDetails(i)} color="error">
                                      <DeleteIcon fontSize='inherit' />
                                    </IconButton>
                                    </StyledTableCell>
                                    </StyledTableRow>
                                ))}
                                </TableBody>
                                {
                                  formik_invoice.values.vat_percentage !== null ? (
                                    <TableFooter>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right"  >TOTAL AMOUNT w/o VAT:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_invoice.values.currency+' '+parseFloat(quotationBreakdown.total_cost_without_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right">VAT {formik_invoice.values.vat_percentage}%:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_invoice.values.currency+' '+parseFloat(quotationBreakdown.vat_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={5} align="right">TOTAL AMOUNT w/ VAT:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_invoice.values.currency+' '+parseFloat(quotationBreakdown.total_cost_with_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                  </TableFooter>
                                  ) : ( 
                                    <TableFooter>
                                    <StyledTableRow>
                                      <StyledTableCell colSpan={4} align="right"  >TOTAL AMOUNT:</StyledTableCell>
                                      <StyledTableCell align="center">{formik_invoice.values.currency+' '+parseFloat(quotationBreakdown.total_cost_without_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                  </TableFooter>
                                  )
                                }
                            </Table>
                        </TableContainer>
                </Grid>
                <Grid item>
                 <Divider />
                 </Grid>
                 <Grid item>
                     <LoadingButton variant='contained' color='success' sx={{float: 'right'}} onClick={formik_invoice.handleSubmit} loading={loading}>Update for Verification</LoadingButton>
                 </Grid>
            </Grid>
            </Paper>
           
        </React.Fragment>
    )
}



import { Grid,
    TableContainer,
    TableHead,
    TableRow,
    Table,
    TableBody,
    TableFooter,
    TextField,
    Stack,
    Button,
    IconButton,
    Autocomplete,
    Paper,
    Collapse,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import LoadingButton from "@mui/lab/LoadingButton";
import { styled } from '@mui/material/styles';  
import React, {useState, useEffect, useMemo} from 'react';

import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import AxiosInstance from '../../../../AxiosInstance';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      whiteSpace: 'nowrap',
      fontSize: 12,
      padding: 4,
      border: '1px solid '+theme.palette.primary.main,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      color: theme.palette.primary.main,
      whiteSpace: 'nowrap',
      padding: 0,
    },
    [`&.${tableCellClasses.footer}`]: {
      fontSize: 12,
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      padding: 4,
      border: '1px solid #ECEFF1'
    }

  }));

  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border
    'td,th': {
        border: '1px solid #ECEFF1'
    }
  }));

  const CustomInput = styled(TextField)({
      '& .MuiOutlinedInput-root': {
        '& fieldset': {
          border: 'none'
        },
        '& input': {
            fontSize: 13,
        },
      },
 })


  const PromoterExpenseSchema = Yup.object().shape({
    project_name: Yup.string()
    .required('This field is required!'),
    currency: Yup.string()
    .required('This field is required!'),
    unit: Yup.string()
    .required('This field is required!'),
    promoters: Yup.array().of(
      Yup.object().shape({
        fullname: Yup.string()
        .required('This field is required!'),
        location: Yup.string()
        .required('This field is required!'),
        date_from: Yup.date().required('Date From is required!'),
        date_to: Yup.date().required('Date To is required!'),
        rate: Yup.string()
        .matches(/^\d*\.?\d*$/, 'Numbers only')
        .required('Required!')
      })
    )
  });


const debouncedHandleChange = debounce((index, event, formik_promoter_expense) => {
    const { name, value } = event.target;
    const updatedExpenses = [...formik_promoter_expense.values.promoters];
    updatedExpenses[index][name.split('.').pop()] = value;
    formik_promoter_expense.setFieldValue('promoters', updatedExpenses);
}, 300);

const debouncedRate = debounce((index, event, formik_promoter_expense) => {
   
    const updatedExpenses = [...formik_promoter_expense.values.promoters];
    updatedExpenses[index] = {
        ...updatedExpenses[index],
        rate: event.target.value,
    };

    formik_promoter_expense.setFieldValue('promoters', updatedExpenses);
}, 300);



export default function NewPromoterExpense(props){

    const [invoiceDetails, setInvoiceDetails] = useState([])
    const [promoterDetails, setPromoterDetails] = useState({
        fullname: [],
        location: []
      })
    const [loading, setLoading] = useState(false)
    
    const [grandTotal, setGrandTotal] = useState({
        total_rate: 0
    })

    const [response, setResponse] = useState({
        open: false,
        severity: "",
        message: ""
      })
    const [updateBtn, setUpdateBtn] = useState(false)
    const [vatPrices, setVatPrices] = useState([]);

    const formik_promoter_expense = useFormik({
        initialValues: props.mode === 'EDIT' ? props.initialValues : {
            invoice_number: "",
            project_name: "",
            currency: "",
            unit:"",
            promoters: 
            [
              {
                date_from: "",
                date_to: "",
                fullname: "",
                location:"",
                rate: "",
              }
            ]
          },
          validateOnChange: false,
          validationSchema: PromoterExpenseSchema,
          onSubmit: (values, { validateForm }) => {
            setLoading(true)
            AxiosInstance.post(props.mode === 'EDIT' ? "/project_expense/update_promoter_expense" : "/project_expense/insert_promoter_expense", {values : values})
            .then(function(reponse){
                if(reponse.data.status === 'SUCCESS'){
                    setResponse({
                        open: true,
                        severity: "success",
                        message: reponse.data.message
                    })
                    handleClearValues();
                    if(props.mode === 'EDIT'){
                        setUpdateBtn(true)
                    }
                }else{
                    setResponse({
                        open: true,
                        severity: "error",
                        message: reponse.data.message
                    })
                }

               setLoading(false)
            })
            .catch(function(error){
              console.log(error)
            })
            
          }
    })



    useEffect(()=>{
        const totalRate = formik_promoter_expense.values.promoters.reduce((accumulator, promoter) => {
            return accumulator + parseFloat(promoter.rate || 0);
          }, 0);


        setGrandTotal({
            total_rate: totalRate,
        })
  
            // eslint-disable-next-line react-hooks/exhaustive-deps
      },[formik_promoter_expense])


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


    function handleGetPromoterDetails(field_name){
        AxiosInstance.post("/project_expense/get_promoter_details", {field_name: field_name})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
              setPromoterDetails({
                ...promoterDetails,
                [field_name]: result.data.promoter_details.map(element => element[field_name])
              })
    
            }else{
              console.log(result.data.message)
            }
        })
        .catch(function(error){
          console.log(error)
        })
    }

    useEffect(()=>{
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



       },[])


       function handleClearValues(){
        formik_promoter_expense.setFieldValue("invoice_number", "")
        formik_promoter_expense.setFieldValue("project_name", "")
        formik_promoter_expense.setFieldValue("currency", "")
        formik_promoter_expense.setFieldValue("unit", "")
        formik_promoter_expense.setFieldValue('promoters',[{
            date_from: "",
            date_to: "",
            fullname: "",
            location: "",
            rate: "",
        }])
        
       }


    const handleChange = (index, event)=>{
        debouncedHandleChange(index, event, formik_promoter_expense)
    }

    const handleRateChange = (index, event) => {
       
        const updatedExpenses = [...formik_promoter_expense.values.promoters];
        updatedExpenses[index].rate = event.target.value;
        formik_promoter_expense.setFieldValue('promoters', updatedExpenses);

        debouncedRate(index, event, formik_promoter_expense);
    };

    const handleAddRecord = () => {
        const newPromoter = {
            date_from: "",
            date_to: "",
            fullname: "",
            location: "",
            rate: "",
        };
        formik_promoter_expense.setFieldValue('promoters', [
            ...formik_promoter_expense.values.promoters,
            newPromoter
        ]);
    };

    const renderedExpenses = useMemo(() => {
        
        return formik_promoter_expense.values.promoters.map((promoter, index)=>(
            <StyledTableRow key={index}>
                {props.mode !== 'EDIT' && <StyledTableCell align='center'>
                    <IconButton color="error"
                       onClick={() => {
                        const updatedExpenses = formik_promoter_expense.values.promoters.filter((_, i) => i !== index);
                        formik_promoter_expense.setFieldValue('promoters', updatedExpenses);

                            // Remove the validation error for the specific promoter
                            const updatedErrors = { ...formik_promoter_expense.errors };
                            if (updatedErrors.promoters) {
                            updatedErrors.promoters = updatedErrors.promoters.filter((_, i) => i !== index);
                            formik_promoter_expense.setErrors(updatedErrors);
                            }

                            // Adjust the touched object as well
                            const updatedTouched = { ...formik_promoter_expense.touched };
                            if (updatedTouched.promoters) {
                            updatedTouched.promoters = updatedTouched.promoters.filter((_, i) => i !== index);
                            formik_promoter_expense.setTouched(updatedTouched);
                            }

                      }}>
                        <DeleteIcon />
                    </IconButton>
                </StyledTableCell> }
                <StyledTableCell align="center">
                    {index+1}
                </StyledTableCell>
                <StyledTableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker 
                        value={dayjs(promoter.date_from)}
                        onChange={(value)=>{
                            const updatedExpenses = [...formik_promoter_expense.values.promoters];
                                updatedExpenses[index] = {
                                    ...updatedExpenses[index],
                                    date_from: dayjs(new Date(value)).format('YYYY-MM-DD')
                                };
                            formik_promoter_expense.setFieldValue('promoters', updatedExpenses);
                        }}
                        slots={{
                            textField: CustomInput
                        }}
                        slotProps={{
                            textField: {
                                name : `promoters[${index}].date_from`,
                                size: 'small', 
                                fullWidth: true,
                                error: Boolean(formik_promoter_expense.errors.promoters?.[index]?.date_from),
                                helperText: formik_promoter_expense.touched.promoters?.[index]?.date_from && formik_promoter_expense.errors.promoters?.[index]?.date_from
                            },
                            }} />
                    </LocalizationProvider>
                </StyledTableCell>
                <StyledTableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker 
                        value={dayjs(promoter.date_to)}
                        onChange={(value)=>{
                            const updatedExpenses = [...formik_promoter_expense.values.promoters];
                                updatedExpenses[index] = {
                                    ...updatedExpenses[index],
                                    date_to: dayjs(new Date(value)).format('YYYY-MM-DD')
                                };
                            formik_promoter_expense.setFieldValue('promoters', updatedExpenses);
                        }}
                        slots={{
                            textField: CustomInput
                        }}
                        slotProps={{
                            textField: {
                                name : `promoters[${index}].date_to`,
                                size: 'small', 
                                fullWidth: true,
                                error: Boolean(formik_promoter_expense.errors.promoters?.[index]?.date_to),
                                helperText: formik_promoter_expense.touched.promoters?.[index]?.date_to && formik_promoter_expense.errors.promoters?.[index]?.date_to
                            },
                            }} />
                    </LocalizationProvider>
                </StyledTableCell>
                <StyledTableCell>
                    <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur={false}
                        handleHomeEndKeys
                        onFocus={() => handleGetPromoterDetails('fullname')}
                        options={promoterDetails.fullname.map((option) => option)}
                        value={promoter.fullname}
                        onChange={(event, value) => {
                        const updatedExpenses = [...formik_promoter_expense.values.promoters];
                        updatedExpenses[index] = {
                            ...updatedExpenses[index],
                            fullname: value,
                        };
                        formik_promoter_expense.setFieldValue('promoters', updatedExpenses);
                        }}
                        renderInput={(params) => (
                        <CustomInput
                            {...params}
                            name={`promoters[${index}].fullname`}
                            fullWidth
                            size="small"
                            value={promoter.fullname}
                            onChange={(event) => handleChange(index, event)}
                            sx={{ width: '100%' }}
                            helperText={
                                formik_promoter_expense.touched.promoters?.[index]?.fullname && formik_promoter_expense.errors.promoters?.[index]?.fullname
                            }
                            error={Boolean(formik_promoter_expense.errors.promoters?.[index]?.fullname)}
                        />
                        )}
                        sx={{ width: '100%' }}
                        componentsProps={{
                        paper: {
                            sx: {
                            '& .MuiAutocomplete-listbox': {
                                fontSize: 13,
                            },
                            },
                        },
                        }}
                        fullWidth
                    />
                </StyledTableCell>
                <StyledTableCell>
                    <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur={false}
                        handleHomeEndKeys
                        onFocus={() => handleGetPromoterDetails('location')}
                        options={promoterDetails.location.map((option) => option)}
                        value={promoter.location}
                        onChange={(event, value) => {
                        const updatedExpenses = [...formik_promoter_expense.values.promoters];
                        updatedExpenses[index] = {
                            ...updatedExpenses[index],
                            location: value,
                        };
                        formik_promoter_expense.setFieldValue('promoters', updatedExpenses);
                        }}
                        renderInput={(params) => (
                        <CustomInput
                            {...params}
                            name={`promoters[${index}].location`}
                            fullWidth
                            size="small"
                            value={promoter.location}
                            onChange={(event) => handleChange(index, event)}
                            sx={{ width: '100%' }}
                            helperText={
                                formik_promoter_expense.touched.promoters?.[index]?.location && formik_promoter_expense.errors.promoters?.[index]?.location
                            }
                            error={Boolean(formik_promoter_expense.errors.promoters?.[index]?.location)}
                        />
                        )}
                        sx={{ width: '100%' }}
                        componentsProps={{
                        paper: {
                            sx: {
                            '& .MuiAutocomplete-listbox': {
                                fontSize: 13,
                            },
                            },
                        },
                        }}
                        fullWidth
                    />
                </StyledTableCell>
                <StyledTableCell align="center">
                    <CustomInput name={`promoters[${index}].rate`} value={promoter.rate} variant='outlined' fullWidth size="small" 
                        onChange={(event) => handleRateChange(index, event)}
                        helperText={
                            formik_promoter_expense.touched.promoters?.[index]?.rate && formik_promoter_expense.errors.promoters?.[index]?.rate
                         }
                         error={Boolean(formik_promoter_expense.errors.promoters?.[index]?.rate )}
                          autoComplete="off"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                            '& input': {
                                textAlign: 'center',
                            }
                            }
                    }} />
                </StyledTableCell>
            </StyledTableRow>
            ))
                // eslint-disable-next-line 
    }, [formik_promoter_expense]);

    return(
        <Grid container direction="column" spacing={1} sx={{paddingLeft: 4, paddingRight: 4, paddingTop: 2 }}>
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
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                    <Stack direction="row" spacing={2} sx={{flexGrow: 1}}>
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
                        formik_promoter_expense.values.invoice_number
                        ? {
                            label: `${formik_promoter_expense.values.invoice_number} - ${formik_promoter_expense.values.project_name}`,
                            value: formik_promoter_expense.values.invoice_number,
                            projectName: formik_promoter_expense.values.project_name
                        }
                        : null
                    }
                    onChange={(event, newValue) => {
                        if (newValue) {
                            formik_promoter_expense.setFieldValue('invoice_number', newValue.value)
                            formik_promoter_expense.setFieldValue('project_name', newValue.projectName)
                        } else {
                            formik_promoter_expense.setFieldValue('invoice_number', '')
                            formik_promoter_expense.setFieldValue('project_name', '')
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Project Name"
                        name="project_name"
                        onChange={formik_promoter_expense.handleChange}
                        value={formik_promoter_expense.values.project_name}
                        variant='outlined'
                        size="small"
                        helperText={
                            formik_promoter_expense.touched.project_name && formik_promoter_expense.errors.project_name
                        }
                        error={Boolean(formik_promoter_expense.errors.project_name)}
        
                        />
                    )}
                    sx={{minWidth: 520}}
                    />
                    <FormControl
                      size="small"
                      error={formik_promoter_expense.touched.currency && Boolean(formik_promoter_expense.errors.currency)}
                      sx={{minWidth: 120}}
                    >
                      <InputLabel>Currency</InputLabel>
                        <Select
                        name="currency"
                        value={formik_promoter_expense.values.currency}
                        label="Currency"
                        onChange={(event) => {
                            formik_promoter_expense.setFieldValue('currency', event.target.value);
                        }}
                        
                        >
                        {vatPrices.map((element, index) => (
                            <MenuItem key={index} value={element.currency}>
                            {element.currency}
                            </MenuItem>
                        ))}
                        </Select>
                      <FormHelperText>
                      {formik_promoter_expense.touched.currency && formik_promoter_expense.errors.currency}
                      </FormHelperText>
                  </FormControl>

                  <FormControl
                      size="small"
                      error={formik_promoter_expense.touched.currency && Boolean(formik_promoter_expense.errors.currency)}
                      sx={{minWidth: 120}}
                    >
                      <InputLabel>Unit</InputLabel>
                        <Select
                        name="unit"
                        value={formik_promoter_expense.values.unit}
                        label="Unit"
                        onChange={(event) => {
                            formik_promoter_expense.setFieldValue('unit', event.target.value)
                        }}
                        
                        >
                            <MenuItem value="Hour">
                                Hour
                            </MenuItem>
                            <MenuItem value="Day">
                                Day
                            </MenuItem>
                            <MenuItem value="Week">
                                Week
                            </MenuItem>
                            <MenuItem value="Month">
                                Month
                            </MenuItem>
                       
                        </Select>
                      <FormHelperText>
                      {formik_promoter_expense.touched.unit && formik_promoter_expense.errors.unit}
                      </FormHelperText>
                  </FormControl>
                  </Stack>
                   { props.mode!=='EDIT' && <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        onClick={()=>handleAddRecord()}>
                        Add Record
                    </Button> }
                </Stack>
            </Grid> 

            <Grid item>
              <TableContainer component={Paper} style={{ maxHeight: window.innerHeight - 330, maxWidth: '100%', overflow: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <StyledTableRow>
                        
                            {props.mode !== 'EDIT' && <StyledTableCell align="center">REMOVE</StyledTableCell>}
                            <StyledTableCell align="center">SN</StyledTableCell>
                            <StyledTableCell align="center" sx={{width: "10%"}}>DATE FROM</StyledTableCell>
                            <StyledTableCell align="center" sx={{width: "10%"}}>DATE TO</StyledTableCell>
                            <StyledTableCell align="left" sx={{width: "20%"}}>FULLNAME</StyledTableCell>
                            <StyledTableCell align="left" sx={{width: "25%"}}>LOCATION</StyledTableCell>
                            <StyledTableCell align="center">RATE {`(${formik_promoter_expense.values.currency})`}</StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        { renderedExpenses }
                    </TableBody>
                    <TableFooter>
                        <StyledTableRow style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 1}}>
                            <StyledTableCell colSpan={props.mode !== 'EDIT' ? 6 : 6} align="right">GRAND TOTAL:</StyledTableCell>
                            <StyledTableCell align="center">{parseFloat(grandTotal.total_rate).toFixed(2)+` ${formik_promoter_expense.values.currency}`}</StyledTableCell>
                        </StyledTableRow>
                    </TableFooter>
                </Table>
            </TableContainer>
            </Grid>
            <Grid item>
            
            <LoadingButton variant='contained' 
                disabled={updateBtn}
                color='success' 
                sx={{float: 'right'}} 
                onClick={formik_promoter_expense.handleSubmit} 
                loading={loading}>
                {props.mode === 'EDIT' ? 'Update promoters ': 'Submit promoters'}</LoadingButton>
            </Grid>
        </Grid>
    )
}
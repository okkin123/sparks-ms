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
    Checkbox,
    Paper,
    Collapse,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
    FormControlLabel
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


  const ProjectVendorExpenseSchema = Yup.object().shape({
    project_name: Yup.string()
    .required('This field is required!'),
    currency: Yup.string()
    .required('This field is required!'),
    expenses: Yup.array().of(
      Yup.object().shape({
        date: Yup.date().required('Date is required!'),
        vendor_name: Yup.string()
        .required('This field is required!'),
        location: Yup.string()
        .required('This field is required!'),
        description: Yup.string()
        .required('This field is required!'),
        amount_without_vat: Yup.string()
        .matches(/^\d*\.?\d*$/, 'Numbers only')
        .required('Required!'),
        amount_with_vat: Yup.string()
        .matches(/^\d*\.?\d*$/, 'Numbers only!')
        .required('Required!')
      })
    )
  });



  const updateAllVat = (is_vat, vat_percentage, formik_vendor_expense) => {
    const vat = is_vat ? parseInt(vat_percentage) : 0;
    const updatedExpenses = formik_vendor_expense.values.expenses.map(expense => ({
        ...expense,
        vat_percentage: vat,
        vat_amount: (parseFloat(expense.amount_without_vat || 0) * (vat / 100)).toFixed(2),
        amount_with_vat: (parseFloat(expense.amount_without_vat || 0) + (parseFloat(expense.amount_without_vat || 0) * (vat / 100))).toFixed(2),
        is_vat: is_vat
    }));

    formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
};

const updateAllVatCurrencyChange = (vat_percentage, formik_vendor_expense) => {
    const vat = parseInt(vat_percentage, 10);
    if (isNaN(vat)) {
        console.error('Invalid VAT percentage');
        return;
    }

    const updatedExpenses = formik_vendor_expense.values.expenses.map(expense => {
        if (expense.is_vat) {
            const amountWithoutVat = parseFloat(expense.amount_without_vat || 0);
            const vatAmount = (amountWithoutVat * (vat / 100)).toFixed(2);
            const amountWithVat = (amountWithoutVat + parseFloat(vatAmount)).toFixed(2);

            return {
                ...expense,
                vat_percentage: vat,
                vat_amount: vatAmount,
                amount_with_vat: amountWithVat,
            };
        }
        return expense; // Return the expense unchanged if is_vat is false
    });

    formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
};

  const debounceVatApplicableOnChange = debounce((is_vat, vat_percentage, index, formik_vendor_expense)=>{
    const updatedExpenses = [...formik_vendor_expense.values.expenses];
    const value = updatedExpenses[index].amount_without_vat || 0;
    const vat = isNaN(vat_percentage) ? 0 : vat_percentage;
    if (is_vat) {
        updatedExpenses[index] = {
            ...updatedExpenses[index],
            vat_percentage: vat,
            vat_amount: (value * (vat / 100)).toFixed(2),
            amount_with_vat: (parseFloat(value) + (parseFloat(value) * (vat / 100))).toFixed(2),
            is_vat: is_vat
        };
       
    } else {
        updatedExpenses[index] = {
            ...updatedExpenses[index],
            vat_percentage: 0,
            vat_amount: 0.00,
            amount_with_vat: value,
            is_vat: is_vat
        };
    }
    formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
   }, 300);

const debouncedHandleChange = debounce((index, event, formik_vendor_expense) => {
    const { name, value } = event.target;
    const updatedExpenses = [...formik_vendor_expense.values.expenses];
    updatedExpenses[index][name.split('.').pop()] = value;
    formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
}, 300);

const debouncedAmountWOVat = debounce((index, event, expense, formik_vendor_expense) => {
   
    const numericValue = +event.target.value || 0;
    const vat = expense.vat_percentage;
    const updatedExpenses = [...formik_vendor_expense.values.expenses];
    updatedExpenses[index] = {
        ...updatedExpenses[index],
        amount_without_vat: event.target.value,
        vat_amount: (numericValue * (parseInt(vat) / 100)).toFixed(2),
        amount_with_vat: (numericValue + (numericValue * (parseInt(vat) / 100))).toFixed(2),
    };

    formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
}, 300);


const debouncedAmountWVat = debounce((index, event, expense, formik_vendor_expense) => {
   
        const updateValue = +event.target.value || 0;
        const vat = expense.vat_percentage;
        const updatedExpenses = [...formik_vendor_expense.values.expenses];

        const amount_without_vat = updateValue / (1 + (vat / 100));
        const vat_amount = updateValue - amount_without_vat;

        updatedExpenses[index] = {
            ...updatedExpenses[index],
            amount_with_vat: event.target.value,
            vat_amount: vat_amount.toFixed(2),
            amount_without_vat: amount_without_vat.toFixed(2),
        };

        formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
}, 300);





export default function NewVendorExpense(props){

    const [invoiceDetails, setInvoiceDetails] = useState([])
    const [vendorDetails, setVendorDetails] = useState({
        vendor_name: [],
        location: [],
        description: []
      })
    const [loading, setLoading] = useState(false)
    
    const [grandTotal, setGrandTotal] = useState({
        total_amount_without_vat: 0,
        total_vat_amount: 0,
        total_amount_with_vat: 0
    })

    const [response, setResponse] = useState({
        open: false,
        severity: "",
        message: ""
      })
    const [updateBtn, setUpdateBtn] = useState(false)
    const [vatPrices, setVatPrices] = useState([]);

    const formik_vendor_expense = useFormik({
        initialValues: props.mode === 'EDIT' ? props.initialValues : {
            ref_invoice_number: "",
            project_name: "",
            currency: "",
            vat_percentage: 0,
            expenses: 
            [
              {
                is_vat: false,
                date: "",
                vendor_name: "",
                location: "",
                description: "",
                amount_without_vat: "",
                vat_percentage: 0,
                vat_amount: "",
                amount_with_vat: ""
              }
            ]
          },
          validateOnChange: false,
          validationSchema: ProjectVendorExpenseSchema,
          onSubmit: (values, { validateForm }) => {
            setLoading(true)
            AxiosInstance.post(props.mode === 'EDIT' ? "/project_expense/update_vendor_expense" : "/project_expense/insert_vendor_expense", {values : values})
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
        const totalAmountWithoutVat = formik_vendor_expense.values.expenses.reduce((accumulator, expense) => {
            return accumulator + parseFloat(expense.amount_without_vat || 0);
          }, 0);
        const totalVatAmount = formik_vendor_expense.values.expenses.reduce((accumulator, expense) => {
        return accumulator + parseFloat(expense.vat_amount || 0);
        }, 0);
        const totalAmountWithVat = formik_vendor_expense.values.expenses.reduce((accumulator, expense) => {
        return accumulator + parseFloat(expense.amount_with_vat || 0);
        }, 0);


        setGrandTotal({
            total_amount_without_vat: totalAmountWithoutVat,
            total_vat_amount: totalVatAmount,
            total_amount_with_vat: totalAmountWithVat
        })
  
            // eslint-disable-next-line react-hooks/exhaustive-deps
      },[formik_vendor_expense])


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


    function handleGetVendorDetails(field_name){
        AxiosInstance.post("/project_expense/get_vendor_details", {field_name: field_name})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
              setVendorDetails({
                ...vendorDetails,
                [field_name]: result.data.vendor_details.map(element => element[field_name])
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
        formik_vendor_expense.setFieldValue("ref_invoice_number", "")
        formik_vendor_expense.setFieldValue("project_name", "")
        formik_vendor_expense.setFieldValue('expenses',[{
                is_vat: false,
                date: "",
                vendor_name: "",
                location: "",
                description: "",
                amount_without_vat: "",
                vat_percentage: 0,
                vat_amount: "",
                amount_with_vat: ""
        }])
        
       }

    const handleVatApplicableOnChange = (is_vat, index)=>{
        const updatedExpenses = [...formik_vendor_expense.values.expenses];
        updatedExpenses[index].is_vat = is_vat;
        formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
        debounceVatApplicableOnChange(is_vat, formik_vendor_expense.values.vat_percentage, index, formik_vendor_expense)
    }

    const handleAmountWOVatChange = (index, event, expense) => {
       
        const updatedExpenses = [...formik_vendor_expense.values.expenses];
        updatedExpenses[index].amount_without_vat = event.target.value;
        formik_vendor_expense.setFieldValue('expenses', updatedExpenses);

        debouncedAmountWOVat(index, event, expense, formik_vendor_expense);
    };

    
    const handleAmountWVatChange = (index, event, expense) => {
       
        const updatedExpenses = [...formik_vendor_expense.values.expenses];
        updatedExpenses[index].amount_with_vat = event.target.value;
        formik_vendor_expense.setFieldValue('expenses', updatedExpenses);

        debouncedAmountWVat(index, event, expense, formik_vendor_expense);
    };

    const handleChange = (index, event)=>{
        debouncedHandleChange(index, event, formik_vendor_expense)
    }

    const handleAddRecord = () => {
        const newExpense = {
            is_vat: false,
            date: "",
            vendor_name: "",
            location: "",
            description: "",
            amount_without_vat: "",
            vat_percentage: 0,
            vat_amount: "",
            amount_with_vat: ""
        };
        formik_vendor_expense.setFieldValue('expenses', [
            ...formik_vendor_expense.values.expenses,
            newExpense
        ]);
    };

    const renderedExpenses = useMemo(() => {
        
        return formik_vendor_expense.values.expenses.map((expense, index)=>(
            <StyledTableRow key={index}>
                {props.mode !== 'EDIT' && <StyledTableCell align='center'>
                    <IconButton color="error"
                       onClick={() => {
                        const updatedExpenses = formik_vendor_expense.values.expenses.filter((_, i) => i !== index);
                        formik_vendor_expense.setFieldValue('expenses', updatedExpenses);

                            // Remove the validation error for the specific expense
                            const updatedErrors = { ...formik_vendor_expense.errors };
                            if (updatedErrors.expenses) {
                            updatedErrors.expenses = updatedErrors.expenses.filter((_, i) => i !== index);
                            formik_vendor_expense.setErrors(updatedErrors);
                            }

                            // Adjust the touched object as well
                            const updatedTouched = { ...formik_vendor_expense.touched };
                            if (updatedTouched.expenses) {
                            updatedTouched.expenses = updatedTouched.expenses.filter((_, i) => i !== index);
                            formik_vendor_expense.setTouched(updatedTouched);
                            }

                      }}>
                        <DeleteIcon />
                    </IconButton>
                </StyledTableCell> }
                <StyledTableCell align="center">
                    {index+1}
                </StyledTableCell>
                <StyledTableCell align="center">
                    <Checkbox 
                     onChange={(event)=>handleVatApplicableOnChange(event.target.checked, index)}
                     checked={expense.is_vat} 
                     color="default" />
                </StyledTableCell>
                <StyledTableCell>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker 
                        value={dayjs(expense.date)}
                        onChange={(value)=>{
                            const updatedExpenses = [...formik_vendor_expense.values.expenses];
                                updatedExpenses[index] = {
                                    ...updatedExpenses[index],
                                    date: dayjs(new Date(value)).format('YYYY-MM-DD')
                                };
                            formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
                        }}
                        slots={{
                            textField: CustomInput
                        }}
                        slotProps={{
                            textField: {
                                name : `expenses[${index}].date`,
                                size: 'small', 
                                fullWidth: true,
                                error: Boolean(formik_vendor_expense.errors.expenses?.[index]?.date),
                                helperText: formik_vendor_expense.touched.expenses?.[index]?.date && formik_vendor_expense.errors.expenses?.[index]?.date
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
                        onFocus={() => handleGetVendorDetails('vendor_name')}
                        options={vendorDetails.vendor_name.map((option) => option)}
                        value={expense.vendor_name}
                        onChange={(event, value) => {
                        const updatedExpenses = [...formik_vendor_expense.values.expenses];
                        updatedExpenses[index] = {
                            ...updatedExpenses[index],
                            vendor_name: value,
                        };
                        formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
                        }}
                        renderInput={(params) => (
                        <CustomInput
                            {...params}
                            name={`expenses[${index}].vendor_name`}
                            fullWidth
                            size="small"
                            value={expense.vendor_name}
                            onChange={(event) => handleChange(index, event)}
                            sx={{ width: '100%' }}
                            helperText={
                                formik_vendor_expense.touched.expenses?.[index]?.vendor_name && formik_vendor_expense.errors.expenses?.[index]?.vendor_name
                            }
                            error={Boolean(formik_vendor_expense.errors.expenses?.[index]?.vendor_name)}
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
                        onFocus={() => handleGetVendorDetails('location')}
                        options={vendorDetails.location.map((option) => option)}
                        value={expense.location}
                        onChange={(event, value) => {
                            const updatedExpenses = [...formik_vendor_expense.values.expenses];
                            updatedExpenses[index] = {
                                ...updatedExpenses[index],
                                location: value,
                            };
                            formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
                           
                        }}
                        renderInput={(params) => (
                            <CustomInput
                                {...params}
                                name={`expenses[${index}].location`}
                                fullWidth
                                size="small"
                                value={expense.location}
                                onChange={(event) => handleChange(index, event)}
                                sx={{ width: '100%' }}
                                helperText={
                                    formik_vendor_expense.touched.expenses?.[index]?.location && formik_vendor_expense.errors.expenses?.[index]?.location
                                }
                                error={Boolean(formik_vendor_expense.errors.expenses?.[index]?.location)}
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
                <StyledTableCell align="left">
                <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur={false}
                        handleHomeEndKeys
                        onFocus={() => handleGetVendorDetails('description')}
                        options={vendorDetails.description.map((option) => option)}
                        value={expense.description}
                        onChange={(event, value) => {
                            const updatedExpenses = [...formik_vendor_expense.values.expenses];
                            updatedExpenses[index] = {
                                ...updatedExpenses[index],
                                description: value,
                            };
                            formik_vendor_expense.setFieldValue('expenses', updatedExpenses);
                        }}
                        renderInput={(params) => (
                            <CustomInput {...params} name={`expenses[${index}].description`} value={expense.description} variant='outlined' fullWidth size="small"
                            onChange={(event) => handleChange(index, event)}
                            helperText={
                                formik_vendor_expense.touched.expenses?.[index]?.description && formik_vendor_expense.errors.expenses?.[index]?.description
                             }
                             error={Boolean(formik_vendor_expense.errors.expenses?.[index]?.description)}
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
                <CustomInput 
                    name={`expenses[${index}].amount_without_vat`} 
                    value={expense.amount_without_vat} 
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
                    onChange={(event) => handleAmountWOVatChange(index, event, expense)}  
                    helperText={
                        formik_vendor_expense.touched.expenses?.[index]?.amount_without_vat && 
                        formik_vendor_expense.errors.expenses?.[index]?.amount_without_vat
                    }
                    error={Boolean(formik_vendor_expense.errors.expenses?.[index]?.amount_without_vat)}
                    autoComplete="off"
                />

                </StyledTableCell>
                <StyledTableCell align="center">
                    {expense.vat_amount}
                </StyledTableCell>
                <StyledTableCell align="center">
                    <CustomInput  value={expense.amount_with_vat} variant='outlined' fullWidth size="small" 
                        onChange={(event)=>handleAmountWVatChange(index, event, expense)}
                        helperText={
                            formik_vendor_expense.touched.expenses?.[index]?.amount_with_vat && formik_vendor_expense.errors.expenses?.[index]?.amount_with_vat
                         }
                         error={Boolean(formik_vendor_expense.errors.expenses?.[index]?.amount_with_vat )}
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
    }, [formik_vendor_expense]);

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
                        formik_vendor_expense.values.ref_invoice_number
                        ? {
                            label: `${formik_vendor_expense.values.ref_invoice_number} - ${formik_vendor_expense.values.project_name}`,
                            value: formik_vendor_expense.values.ref_invoice_number,
                            projectName: formik_vendor_expense.values.project_name
                        }
                        : null
                    }
                    onChange={(event, newValue) => {
                        if (newValue) {
                            formik_vendor_expense.setFieldValue('ref_invoice_number', newValue.value)
                            formik_vendor_expense.setFieldValue('project_name', newValue.projectName)
                        } else {
                            formik_vendor_expense.setFieldValue('ref_invoice_number', '')
                            formik_vendor_expense.setFieldValue('project_name', '')
                        }
                    }}
                    renderInput={(params) => (
                        <TextField
                        {...params}
                        label="Project Name"
                        name="project_name"
                        onChange={formik_vendor_expense.handleChange}
                        value={formik_vendor_expense.values.project_name}
                        variant='outlined'
                        size="small"
                        helperText={
                            formik_vendor_expense.touched.project_name && formik_vendor_expense.errors.project_name
                        }
                        error={Boolean(formik_vendor_expense.errors.project_name)}
        
                        />
                    )}
                    sx={{minWidth: 520}}
                    />
                    <FormControl
                      size="small"
                      error={formik_vendor_expense.touched.currency && Boolean(formik_vendor_expense.errors.currency)}
                      sx={{minWidth: 120}}
                    >
                      <InputLabel>Currency</InputLabel>
                        <Select
                        name="currency"
                        value={formik_vendor_expense.values.currency}
                        label="Currency"
                        onChange={(event) => {
                            const selectedCurrency= event.target.value;
                            formik_vendor_expense.setFieldValue('currency', selectedCurrency);
                        
                            
                            const selectedElement = vatPrices.find(element => element.currency === selectedCurrency);
                        
                            if (selectedElement) {
                            const vatPercentage = selectedElement.vat_percentage;
                            formik_vendor_expense.setFieldValue('vat_percentage', parseFloat(vatPercentage));
                            updateAllVatCurrencyChange(parseFloat(vatPercentage), formik_vendor_expense)
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
                      {formik_vendor_expense.touched.currency && formik_vendor_expense.errors.currency}
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
                            <StyledTableCell align="center"><FormControlLabel control={<Checkbox
                                        onChange={(event)=>updateAllVat(event.target.checked, formik_vendor_expense.values.vat_percentage, formik_vendor_expense)}
                                        sx={{
                                            color: 'white',
                                            '&.Mui-checked': {
                                                color: 'white',
                                            },
                                        }}
                                        checked={formik_vendor_expense.values.expenses.every((expense)=> expense.is_vat ? true : false)}
                            />} label="VAT" labelPlacement="top" /></StyledTableCell>
                            <StyledTableCell align="center" sx={{width: "10%"}}>DATE</StyledTableCell>
                            <StyledTableCell align="left" sx={{width: "15%"}}>VENDOR NAME</StyledTableCell>
                            <StyledTableCell align="left" sx={{width: "15%"}}>LOCATION</StyledTableCell>
                            <StyledTableCell align="left" sx={{width: "20%"}}>DESCRIPTION</StyledTableCell>
                            <StyledTableCell align="center">AMOUNT {`(${formik_vendor_expense.values.currency})`}</StyledTableCell>
                            <StyledTableCell align="center">VAT {`(${formik_vendor_expense.values.vat_percentage}%)`}</StyledTableCell>
                            <StyledTableCell align="center">TOTAL AMOUNT {`(${formik_vendor_expense.values.currency})`}</StyledTableCell>
                            {/* <StyledTableCell align="center">REMARKS</StyledTableCell> */}
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        { renderedExpenses }
                    </TableBody>
                    <TableFooter>
                        <StyledTableRow style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', zIndex: 1}}>
                            <StyledTableCell colSpan={props.mode !== 'EDIT' ? 7 : 6} align="right">GRAND TOTAL:</StyledTableCell>
                            <StyledTableCell align="center">{parseFloat(grandTotal.total_amount_without_vat).toFixed(2)+` ${formik_vendor_expense.values.currency}`}</StyledTableCell>
                            <StyledTableCell align="center">{parseFloat(grandTotal.total_vat_amount).toFixed(2)+` ${formik_vendor_expense.values.currency}`}</StyledTableCell>
                            <StyledTableCell align="center">{parseFloat(grandTotal.total_amount_with_vat).toFixed(2)+` ${formik_vendor_expense.values.currency}`}</StyledTableCell>
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
                onClick={formik_vendor_expense.handleSubmit} 
                loading={loading}>
                {props.mode === 'EDIT' ? 'Update Expenses ': 'Submit Expenses'}</LoadingButton>
            </Grid>
        </Grid>
    )
}
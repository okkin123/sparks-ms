import React, { useState } from 'react';
import {TextField, Stack, Autocomplete, Button} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import AxiosInstance from '../../../../AxiosInstance';
import * as Yup from 'yup';
import { useFormik } from 'formik';


const SearchSchema = Yup.object().shape({
   value: Yup.string()
    .required('This field is required!'),
    from_date: Yup.date().required('From Date is required'),
    to_date: Yup.date().required('To Date is required')
});

const SupplierExpenseStatementColumnFilter = ({ onFilter, exportDisabled, onExport }) => {

  const [supplierNames, setSupplierNames] = useState([]); 

  const formik_search = useFormik({
    initialValues: {
      value: '',
      from_date: null,
      to_date: null
    },
    validateOnChange: false,
    validationSchema: SearchSchema,
    onSubmit: (values, {validateForm})=>{
      onFilter(values)
    }
  })


  const getSupplierNames = ()=>{
    AxiosInstance.get("/project_expense/get_supplier_details")
    .then(function(result){
      setSupplierNames((supplierNames)=>[
        ...result.data.suppliers.map(element => ({
          supplier_name: element.supplier_name
        }))
      ])
    })
    .catch(function(error){
      console.log(error)
    })
    
  }


  return (
    <React.Fragment>
      <Stack direction="row" spacing={1} alignItems="center">
        <Autocomplete
            freeSolo
            selectOnFocus 
            clearOnBlur
            handleHomeEndKeys
            onFocus={() => getSupplierNames()}
            options={supplierNames.map((option) => option.supplier_name)}
            value={formik_search.values.value}
            onChange={(event, value)=>formik_search.setFieldValue('value', value)}
            renderInput={(params) => (
                <TextField
                {...params}
                label="Supplier Name"
                name="value"
                value={formik_search.values.value}
                fullWidth
                onChange={formik_search.handleChange}
                size="small"
                error={
                  formik_search.touched.value && Boolean(formik_search.errors.value)
                }
                helperText={
                  formik_search.touched.value && formik_search.errors.value
                }
                />
            )}
            fullWidth
            />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
            value={dayjs(formik_search.values.from_date)}
            onChange={(value)=>formik_search.setFieldValue('from_date',  dayjs(new Date(value)).format('YYYY-MM-DD'))}
            slotProps={{
                textField: {
                    label: 'Date From',
                    variant: 'outlined',
                    name: 'from_date',
                    size: 'small', 
                    fullWidth: true,
                    error: Boolean(formik_search.errors.from_date),
                    helperText:formik_search.touched.from_date && formik_search.errors.from_date
                },
                }} />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
            value={dayjs(formik_search.values.to_date)}
            onChange={(value)=>formik_search.setFieldValue('to_date',  dayjs(new Date(value)).format('YYYY-MM-DD'))}
            slotProps={{
                textField: {
                    label: 'Date To',
                    variant: 'outlined',
                    name: 'to_date',
                    size: 'small', 
                    fullWidth: true,
                    error: Boolean(formik_search.errors.to_date),
                    helperText:formik_search.touched.to_date && formik_search.errors.to_date
                },
                }} />
        </LocalizationProvider>
        <Button size="small" variant="contained" color="secondary" onClick={formik_search.handleSubmit}>
          Search
        </Button>
        <Button disabled={exportDisabled} size="small" variant="contained" color="info" fullWidth onClick={onExport}>
          Export Statement
        </Button>
      </Stack>

    
      </React.Fragment>
  )
};


export default SupplierExpenseStatementColumnFilter;

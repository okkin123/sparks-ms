import React, { useState } from 'react';
import {TextField, Stack, Autocomplete, Button} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import AxiosInstance from '../../../../AxiosInstance';

const SupplierExpenseStatementColumnFilter = ({ onFilter}) => {

  const [filters, setFilters] = useState({ value: '', from_date: null, to_date: null });
  const [supplierNames, setSupplierNames] = useState([]); 
 
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };

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
            value={filters.value}
            onChange={(event, value)=>setFilters({...filters, value})}
            renderInput={(params) => (
                <TextField
                {...params}
                label="Supplier Name"
                name="value"
                value={filters.value}
                fullWidth
                onChange={handleFilterChange}
                size="small"
                />
            )}
            fullWidth
            />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
            value={dayjs(filters.from_date)}
            onChange={(value)=>setFilters({...filters, from_date: dayjs(new Date(value)).format('YYYY-MM-DD')})}
            slotProps={{
                textField: {
                    label: 'Date From',
                    variant: 'outlined',
                    name: 'from_date',
                    size: 'small', 
                    fullWidth: true,
                    error: false
                    // helperText:formik_project_expense.touched.date_issued && formik_project_expense.errors.date_issued
                },
                }} />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker 
            value={dayjs(filters.to_date)}
            onChange={(value)=>setFilters({...filters, to_date: dayjs(new Date(value)).format('YYYY-MM-DD')})}
            slotProps={{
                textField: {
                    label: 'Date To',
                    variant: 'outlined',
                    name: 'to_date',
                    size: 'small', 
                    fullWidth: true,
                    error: false
                    // helperText:formik_project_expense.touched.date_issued && formik_project_expense.errors.date_issued
                },
                }} />
        </LocalizationProvider>
        <Button variant="contained" color="secondary" onClick={()=>handleApplyFilters()}>
          Search
        </Button>
      </Stack>

    
      </React.Fragment>
  )
};


export default SupplierExpenseStatementColumnFilter;

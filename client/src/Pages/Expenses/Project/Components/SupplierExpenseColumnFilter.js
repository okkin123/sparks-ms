import React, { useState } from 'react';
import {Select, MenuItem, TextField, Typography, Chip, Stack, Button} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Dialog from '../../../../Components/Dialog';
import { NumericFormat } from 'react-number-format';

const SupplierExpenseColumnFilter = ({ columns, onFilter, total_amount_wo_vat, total_vat_amount, total_amount_with_vat, total_payments, remaining_balance}) => {
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({ column: 'project_name', value: '', fromDate: '', toDate: '' });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    onFilter(filters);
  };





  return (
    <Stack direction="column" spacing={2} sx={{padding: 2}}>
     <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="subtitle1">
        Search By:
      </Typography>
      <Select
        name="column"
        value={filters.column}
        onChange={handleFilterChange}
        displayEmpty
        size="small"
      >
        <MenuItem value="" disabled>Select Column</MenuItem>
        {columns.map((column, i) => (
          <MenuItem key={column.accessorKey} value={column.accessorKey}>
            {column.header}
          </MenuItem>
        ))}
      </Select>
      <TextField
        size="small"
        name="value"
        value={filters.value}
        onChange={handleFilterChange}
        placeholder="Keyword..."
        variant="outlined"
        sx={{ minWidth: '18rem'}}
        onKeyDown={(e)=>e.key === 'Enter' ? handleApplyFilters() : null}
      />
      <Button variant="contained" color="secondary" onClick={()=>setOpen(true)}>
        Advanced Search
      </Button>
      <Dialog open={open} content={
        <Stack direction="column" spacing={2}>
          <Typography variant="h6">ADVANCED SEARCH</Typography>
          <Stack direction="row" alignItems="center">
          <Typography variant="subtitle1" sx={{minWidth: '6rem '}}>
            Search By:
          </Typography>
          <Select
            name="column"
            value={filters.column}
            onChange={handleFilterChange}
            displayEmpty
            size="small"
            fullWidth
          >
            <MenuItem value="" disabled>Select Column</MenuItem>
            {columns.map((column, i) => (
              <MenuItem key={column.accessorKey} value={column.accessorKey}>
                {column.header}
              </MenuItem>
            ))}
          </Select>
          </Stack>
          <TextField
            size="small"
            name="value"
            value={filters.value}
            onChange={handleFilterChange}
            placeholder="Keyword..."
            variant="outlined"
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 
              value={dayjs(filters.fromDate)}
              onChange={(value)=>setFilters({...filters, fromDate: dayjs(new Date(value)).format('YYYY-MM-DD')})}
              slotProps={{
                  textField: {
                      label: 'Date From',
                      variant: 'outlined',
                      name: 'fromDate',
                      size: 'small', 
                      fullWidth: true,
                      // error: Boolean(formik_project_expense.errors.date_issued),
                      // helperText:formik_project_expense.touched.date_issued && formik_project_expense.errors.date_issued
                  },
                  }} />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 
              value={dayjs(filters.toDate)}
              onChange={(value)=>setFilters({...filters, toDate: dayjs(new Date(value)).format('YYYY-MM-DD')})}
              slotProps={{
                  textField: {
                      label: 'Date To',
                      variant: 'outlined',
                      name: 'toDate',
                      size: 'small', 
                      fullWidth: true,
                      // error: Boolean(formik_project_expense.errors.date_issued),
                      // helperText:formik_project_expense.touched.date_issued && formik_project_expense.errors.date_issued
                  },
                  }} />
            </LocalizationProvider>
          </Stack>
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button size="small" onClick={()=>setOpen(false)}>Cancel</Button>
            <Button size="small" variant="contained" color="secondary" onClick={()=>{
              handleApplyFilters()
              setOpen(false)
            }}>Search</Button>
          </Stack>
        </Stack>
      } />
      </Stack>
    
      <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
        <Chip variant="outlined" label={<>Total Amount w/o Vat: <NumericFormat
            value={total_amount_wo_vat}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="info" />
       <Chip variant="outlined" label={<>Total Vat Amount: <NumericFormat
            value={total_vat_amount}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="error" />
        <Chip label={<>Total Amount w/ Vat: <NumericFormat
            value={total_amount_with_vat}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="info" />
                  <Chip label={<>Total Payments: <NumericFormat
            value={total_payments}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="error" />
            <Chip label={<>Remaining Balance: <NumericFormat
            value={remaining_balance}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="warning" />
      </Stack>
    </Stack>
  );
};

export default SupplierExpenseColumnFilter;

import React, { useState } from 'react';
import {Select, MenuItem, TextField, Typography, Chip, Stack, Button} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { NumericFormat } from 'react-number-format';

const SupplierExpenseColumnFilter = ({ columns, onFilterChange, total_amount_wo_vat, total_vat_amount, total_amount_with_vat, total_payments, remaining_balance }) => {
  const [selectedColumn, setSelectedColumn] = useState('project_name');
  const [filterValue, setFilterValue] = useState('');

  const handleColumnChange = (event) => {
    setSelectedColumn(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilterValue(event.target.value);
  };

  const handleApplyFilters = () => {
    onFilterChange(selectedColumn, filterValue);
  };

  return (
    <Stack direction="column" spacing={2} sx={{padding: 2}}>
     <Stack direction="row" spacing={1} alignItems="center">
      <Typography variant="subtitle1">
        Search By:
      </Typography>
      <Select
        value={selectedColumn}
        onChange={handleColumnChange}
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
        value={filterValue}
        onChange={handleFilterChange}
        placeholder="Keyword..."
        variant="outlined"
        sx={{ minWidth: '18rem'}}
        onKeyDown={(e)=>e.key === 'Enter' ? handleApplyFilters() : null}
      />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker 
        // value={dayjs(formik_invoice.values.date)}
        // onChange={(value)=>formik_invoice.setFieldValue('date', dayjs(new Date(value)).format('YYYY-MM-DD'))}
        slotProps={{
            textField: {
              label: 'From',
              variant: 'outlined',
              name: 'from_date',
              size: 'small', 
              // error: Boolean(formik_invoice.errors.date),
              // helperText:formik_invoice.touched.date && formik_invoice.errors.date
            },
          }} />
      </LocalizationProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker 
        // value={dayjs(formik_invoice.values.date)}
        // onChange={(value)=>formik_invoice.setFieldValue('date', dayjs(new Date(value)).format('YYYY-MM-DD'))}
        slotProps={{
            textField: {
              label: 'To',
              variant: 'outlined',
              name: 'to_date',
              size: 'small', 
              // error: Boolean(formik_invoice.errors.date),
              // helperText:formik_invoice.touched.date && formik_invoice.errors.date
            },
          }} />
      </LocalizationProvider>
      <Button variant="contained" color="secondary" onClick={handleApplyFilters}>
        Search
      </Button>
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="flex-start" alignItems="center">
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

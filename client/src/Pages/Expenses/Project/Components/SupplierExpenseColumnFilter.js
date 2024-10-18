import React, { useState } from 'react';
import {Select, MenuItem, TextField, Typography, Stack, Button} from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Dialog from '../../../../Components/Dialog';

const SupplierExpenseColumnFilter = ({ columns, onFilter}) => {
  const [open, setOpen] = useState(false);

  const [filters, setFilters] = useState({ column: 'supplier_name', value: '', fromDate: null, toDate: null });

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = () => {
    onFilter(filters);
    setFilters({
      ...filters,
      fromDate: null,
      toDate: null
    })
  };





  return (
    <React.Fragment>
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
          onKeyDown={(e)=>{
            if(e.key === 'Enter'){
            

              handleApplyFilters()
              
            }
          }}
        />
        <Button size="small" variant="contained" color="secondary" onClick={()=>setOpen(true)}>
          Advanced Search
        </Button>
      </Stack>

     
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
                      error: false
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
                      error: false
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
      </React.Fragment>
  )
};


export default SupplierExpenseColumnFilter;

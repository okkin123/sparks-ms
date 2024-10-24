import React, { useState } from 'react';
import {Select, MenuItem, TextField, Typography, Stack} from '@mui/material';
const VendorExpenseColumnFilter = ({ columns, onFilterChange, total_amount }) => {
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
      {/* <Button variant="contained" color="info" onClick={handleApplyFilters}>
        Search
      </Button> */}
         
        </Stack>
  );
};

export default VendorExpenseColumnFilter;

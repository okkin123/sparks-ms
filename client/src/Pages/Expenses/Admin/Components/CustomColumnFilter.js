import React, { useState } from 'react';
import {Select, MenuItem, TextField, Typography, Chip, Stack} from '@mui/material';

import { NumericFormat } from 'react-number-format';

const CustomColumnFilter = ({ columns, onFilterChange, total_amount_wo_vat, total_vat_amount, total_amount_with_vat }) => {
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
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{padding: 2}}>
     <Stack direction="row" spacing={1} alignItems="center">
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip label={<>Total Amount w/o Vat: <NumericFormat
            value={total_amount_wo_vat}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="secondary" />
       <Chip label={<>Total Vat Amount: <NumericFormat
            value={total_vat_amount}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="warning" />
        <Chip label={<>Total Amount w/ Vat: <NumericFormat
            value={total_amount_with_vat}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          /></>} color="success" />
      </Stack>
    </Stack>
  );
};

export default CustomColumnFilter;

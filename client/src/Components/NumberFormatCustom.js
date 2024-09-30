import React from 'react'
import { NumericFormat } from 'react-number-format';

export default function NumberFormatCustom(props) {
    const { inputRef, onChange, value, ...other } = props;
    return (
      <NumericFormat
        {...other}
        getInputRef={inputRef}
        value={value}
        displayType={'text'}
        thousandSeparator={true}
        decimalScale={2}
        fixedDecimalScale={true}
      />
    );
  }
import React, {useState, useRef, useEffect} from 'react'
import {Stack, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,TableFooter} from '@mui/material'
import SupplierExpenseStatementColumnFilter from './SupplierExpenseStatementColumnFilter'
import AxiosInstance from '../../../../AxiosInstance';
import dayjs from 'dayjs';
import { theme } from '../../../../Theme';
import { NumericFormat } from 'react-number-format';

export default function SupplierExpenseStatement(){
    const [supplierStatement, setSupplierStatement] = useState([]);
    const [breakDown, setBreakDown] = useState({
        total_debit: 0,
        total_credit: 0,
        balance: 0
    })
    const handleFilter = (filters) => {
        // const newFilteredData = projectExpenses.filter(row => {
        //   const columnMatch = filters.column
        //     ? row[filters.column].toString().toLowerCase().includes(filters.value.toLowerCase())
        //     : true;
        //   const dateMatch = filters.fromDate && filters.toDate
        //     ? dayjs(new Date(row.date)).isBetween(filters.fromDate, filters.toDate, null, '[]')
        //     : true;
        //   return columnMatch && dateMatch;
        // });
        // setFilteredData(newFilteredData);

        AxiosInstance.post("/project_expense/get_supplier_statement", {supplier_name: filters.value, 
            from_date: filters.from_date, 
            to_date: filters.to_date})
        .then(function(result){
            if(result.data.status === 'SUCCESS')
            {
                const fetchSupplierStatement = result.data.supplier_statement.map((element) => ({
                    date_issued: dayjs(new Date(element.date_issued)).format('YYYY-MM-DD'),
                    project_name: element.project_name,
                    invoice_number: element.invoice_number,
                    mode_of_payment: element.mode_of_payment === null ? '': element.mode_of_payment ,
                    date_paid: element.date_paid === null ? '' : dayjs(new Date(element.date_paid)).format('YYYY-MM-DD'),
                    cheque_no: element.cheque_no === null || element.cheque_no === 0 ? '': element.cheque_no ,
                    reference_no: element.reference_no === null ? '' : element.reference_no,
                    debit: element.debit,
                    credit: element.credit === null ? '': element.credit,
                    currency: element.currency
                  })); 
                
                  setBreakDown(
                    result.data.supplier_statement.reduce((accumulator, currentItem) => {
                      const currentDebit = parseFloat(currentItem.debit);
                      const currentCredit = currentItem.credit === null ? 0 : parseFloat(currentItem.credit);
                  
                      return {
                        debit: accumulator.debit + currentDebit,
                        credit: accumulator.credit + currentCredit,
                        balance: (accumulator.debit + currentDebit) - (accumulator.credit + currentCredit),
                      };
                    }, { debit: 0, credit: 0 })
                  );
                  
                  
                  setSupplierStatement(fetchSupplierStatement)
            }
            else
            {
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })

      };

      const stackRef = useRef(null);
      const [box, setBox] = useState({
          width: 0,
          height: 0
      });
  
  
      useEffect(() => {
      const updateBox = () => {
          if (stackRef.current) {
          setBox({
              width: stackRef.current.offsetWidth,
              height: 500
          });
          }
      };
  
      updateBox();
      window.addEventListener('resize', updateBox);
  
      return () => {
          window.removeEventListener('resize', updateBox);
      };
      }, []);

    return(
        <Stack
        direction="column"
        spacing={2}
        sx={{p:2, width: '100%'}}
        ref={stackRef}
        >
            <SupplierExpenseStatementColumnFilter onFilter={handleFilter} />
            <TableContainer sx={{ maxHeight: box.height, 
                        maxWidth: box.width,
                        overflowX: 'auto',
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': {
                        width: '6px',
                        height: '6px',
                        },
                        '&::-webkit-scrollbar-track': {
                        backgroundColor: '#f1f1f1',
                        },
                        '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.primary.light,
                        borderRadius: '6px',
                        },
                        '&::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: '#555',
                        }
                        }}>
                <Table size="small" stickyHeader>
                    <TableHead sx={{ 
                                backgroundColor: theme.palette.primary.main, 
                                '& th': { // Increase specificity
                                    backgroundColor: theme.palette.primary.main, 
                                    color: 'white'
                                }
                            }}>
                        <TableRow>
                            <TableCell>Date Issued</TableCell>
                            <TableCell>Project Name</TableCell>
                            <TableCell>Invoice No.</TableCell>
                            <TableCell>Mode Of Payment</TableCell>
                            <TableCell>Cheque No.</TableCell>
                            <TableCell>Reference No.</TableCell>
                            <TableCell>Date Paid</TableCell>
                            <TableCell>Debit</TableCell>
                            <TableCell>Credit</TableCell>
                            <TableCell>Currency</TableCell>
                        </TableRow>
                    </TableHead> 
                    <TableBody
                   >
                        {supplierStatement.map((row)=>(
                             <TableRow>
                             <TableCell>{row.date_issued}</TableCell>
                             <TableCell>{row.project_name}</TableCell>
                             <TableCell>{row.invoice_number}</TableCell>
                             <TableCell>{row.mode_of_payment}</TableCell>
                             <TableCell>{row.cheque_no}</TableCell>
                             <TableCell>{row.reference_no}</TableCell>
                             <TableCell>{row.date_paid}</TableCell>
                             <TableCell>
                                 <NumericFormat
                                    value={row.debit}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                             </TableCell>
                             <TableCell>
                                 <NumericFormat
                                    value={row.credit}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                             </TableCell>
                             <TableCell>{row.currency}</TableCell>
                             </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter sx={{ position: 'sticky', bottom: 0, 'td,th': {
                        border: 'none',
                        }}}>
                        <TableRow>
                             <TableCell colSpan={7}></TableCell>
                             <TableCell colSpan={2} sx={{
                                backgroundColor: theme.palette.success.main, 
                                color: 'white'
                                }}>Total Debit</TableCell>
                            <TableCell sx={{
                            backgroundColor: theme.palette.success.main, 
                            color: 'white'
                            }}>
                                <NumericFormat
                                    value={breakDown.debit}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={7}></TableCell>
                            <TableCell colSpan={2} sx={{
                            backgroundColor: theme.palette.error.main, 
                            color: 'white'
                            }}>Total Credit</TableCell>
                            <TableCell sx={{
                            backgroundColor: theme.palette.error.main, 
                            color: 'white'
                            }}>
                                <NumericFormat
                                    value={breakDown.credit}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={7}></TableCell>
                            <TableCell colSpan={2} sx={{
                            backgroundColor: theme.palette.warning.main, 
                            color: 'white'
                            }}>Balance</TableCell>
                            <TableCell sx={{
                            backgroundColor: theme.palette.warning.main, 
                            color: 'white'
                            }}>
                                <NumericFormat
                                    value={breakDown.balance}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                />
                            </TableCell>
                        </TableRow>
                    </TableFooter>   
                </Table>
            </TableContainer>
        </Stack>
    )
}
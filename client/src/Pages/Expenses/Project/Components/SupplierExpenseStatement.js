import React, {useState, useRef, useEffect} from 'react'
import {Stack, TableContainer, Table, TableHead, TableRow, TableCell, TableBody,TableFooter, Paper, Box} from '@mui/material'
import SupplierExpenseStatementColumnFilter from './SupplierExpenseStatementColumnFilter'
import AxiosInstance from '../../../../AxiosInstance';
import dayjs from 'dayjs';
import { theme } from '../../../../Theme';
import { NumericFormat } from 'react-number-format';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { jsPDF } from 'jspdf'; //or use your library of choice here
import autoTable from 'jspdf-autotable';
const columns = [
    {
        accessorKey: 'date_issued',
        header: 'DATE ISSUED',
        size: 'fit-content',
    },
    {
        accessorKey: 'project_name',
        header: 'PROJECT NAME',
        size: 'fit-content',
    },
    {
        accessorKey: 'invoice_number',
        header: 'INVOICE NO.',
        size: 'fit-content',
    },
    {
        accessorKey: 'mode_of_payment',
        header: 'MODE OF PAYMENT',
        size: 'fit-content',
    },
    {
        accessorKey: 'date_paid',
        header: 'DATE PAID',
        size: 'fit-content',
    },
    {
        accessorKey: 'cheque_no',
        header: 'CHEQUE NO.',
        size: 'fit-content',
    },
    {
        accessorKey: 'reference_no',
        header: 'REFERENCE NO.',
        size: 'fit-content',
    },
    {
        accessorKey: 'debit',
        header: 'DEBIT',
        size: 'fit-content',
        Cell: ({ renderedCellValue }) => (
            <NumericFormat
            value={renderedCellValue}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          />
        )
    },
    {
        accessorKey: 'credit',
        header: 'CREDIT',
        size: 'fit-content',
        Cell: ({ renderedCellValue }) => (
            <NumericFormat
            value={renderedCellValue}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          />
        )
    },
    {
        accessorKey: 'balance',
        header: 'BALANCE',
        size: 'fit-content',
        Cell: ({ renderedCellValue }) => (
            <NumericFormat
            value={renderedCellValue}
            displayType={'text'}
            thousandSeparator={true}
            decimalScale={2}
            fixedDecimalScale={true}
          />
        )
    }
]
export default function SupplierExpenseStatement(){
    const [supplierStatement, setSupplierStatement] = useState([]);
    const [breakDown, setBreakDown] = useState({
        total_debit: 0,
        total_credit: 0,
        balance: 0
    })
    const [loading, setLoading] = useState(false)
    const handleFilter = (filters) => {
        setLoading(true)
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
                    balance: parseFloat(element.debit) - (element.credit === null ? 0 : parseFloat(element.credit))
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

            setLoading(false)
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


    const handleExportRows = (rows) => {
        const doc = new jsPDF({
            orientation: 'landscape',
        })
        const tableData = rows.map((row) => Object.values(row.original));
        const tableHeaders = columns.map((c) => c.header);

        autoTable(doc, {
            head: [tableHeaders],
            body: tableData,
            theme: 'grid',
            styles: {
            fontSize: 8.5,
            font: 'Verdana, sans-serif',
            },
        });

        doc.save('mrt-pdf-example.pdf');
    };

    return(
        // <Paper square>
        <Box
        sx={{width: '100%'}}
        ref={stackRef}
        >
         <MaterialReactTable
            enableColumnFilters={false}
            enableColumnActions={false}
            enableDensityToggle={false}
            enableHiding={false}
            enableGlobalFilter={false}
            enableFullScreenToggle={false}
            enablePagination={false}
            initialState={{
                density: 'compact',
                isLoading: loading
            }}
            state={{
                isLoading: loading
            }} 
            muiTableHeadCellProps={{
                sx:{
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                '& .MuiTableSortLabel-root': {
                    color: 'white',
                    '&.Mui-active': {
                    color: 'white',
                    },
                    '& .MuiTableSortLabel-icon': {
                    color: 'white !important',
                    },
                },
                }
            }}
            muiSelectAllCheckboxProps={{
                sx: {
                color: 'white',
                '&.Mui-checked': {
                    color: 'white',
                },
                },
            }}
            // muiPaginationProps={{
            //     rowsPerPageOptions: [10, 20, { label: 'All', value: filteredData.length}],
            //     variant: 'filled',
            // }}
            paginationDisplayMode='pages'
            muiTableContainerProps={{
                sx: { maxHeight: box.height, 
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
                    },
            }}

            muiTableHeadProps={{
                sx: {
                position: 'sticky',
                top: 0,
                zIndex: 1,
                },
            }}
            muiTablePaperProps={{
                sx: { borderRadius: 0, 
                 },
            }}
            renderTopToolbarCustomActions={({table}) => (
                <SupplierExpenseStatementColumnFilter onFilter={handleFilter} exportDisabled={table.getPrePaginationRowModel().rows.length === 0} onExport={()=>handleExportRows(table.getPrePaginationRowModel().rows)} />
                )}
            renderBottomToolbarCustomActions={() => (
                 <TableContainer>
                    <Table size="small">
                        <TableFooter sx={{ position: 'sticky', bottom: 0, 'td,th': {
                            border: 'none',
                            }}}>
                            <TableRow>
                                <TableCell align="center" sx={{
                                    backgroundColor: theme.palette.success.main, 
                                    color: 'white',
                                    fontWeight: 'bold'
                                    }}>
                                        TOTAL DEBIT:&nbsp;
                                        <NumericFormat
                                            value={breakDown.debit}
                                            displayType={'text'}
                                            thousandSeparator={true}
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                        />
                                </TableCell>
                                <TableCell align="center" sx={{
                                    backgroundColor: theme.palette.error.main, 
                                    color: 'white',
                                    fontWeight: 'bold'
                                    }}>
                                        TOTAL CREDIT:&nbsp;
                                    <NumericFormat
                                        value={breakDown.credit}
                                        displayType={'text'}
                                        thousandSeparator={true}
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                    />
                                </TableCell>
                                <TableCell align="center" sx={{
                                    backgroundColor: theme.palette.warning.main, 
                                    color: 'white',
                                    fontWeight: 'bold'
                                    }}>
                                        REMAINING BALANCE:&nbsp;
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
    
                )}
            columns={columns} data={supplierStatement} />
        </Box>
        // </Paper>
    )
}
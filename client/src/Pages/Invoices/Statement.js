import React, {useState, useRef, useEffect} from 'react'
import {TableContainer, Table, TableRow, TableCell, TableFooter, Box, Paper, Grid, Typography, Toolbar, Chip    } from '@mui/material'
import {
  MaterialReactTable,
} from 'material-react-table';
import AxiosInstance from '../../AxiosInstance';
import dayjs from 'dayjs';
import StatementFilter from './StatementFilter';
import { theme } from '../../Theme';
import { NumericFormat } from 'react-number-format';
import { jsPDF } from 'jspdf'; //or use your library of choice here
import autoTable from 'jspdf-autotable';
import numeral from 'numeral';
import bsLogo from "../../Assets/BS LOGO.png";


const columns = [
    {
        accessorKey: 'invoice_date',
        header: 'INVOICE DATE'
    },
    {
        accessorKey: 'invoice_number',
        header: 'INVOICE NO.'
    },
    {
      accessorKey: 'project_name',
      header: 'PROJECT NAME'
    },
    {
      accessorKey: 'debit',
      header: 'DEBIT'
    },
    {
        accessorKey: 'credit',
        header: 'CREDIT'
    },
    {
        accessorKey: 'balance',
        header: 'BALANCE'
        
    },
    {
      accessorKey: 'currency',
      header: 'CURRENCY'
    },
    {
        accessorKey: 'remarks',
        header: 'REMARKS',
        Cell: ({ renderedCellValue }) => (
          <Chip 
            label={renderedCellValue} 
            size="small"
            color={
              renderedCellValue === "RECEIVED" ? "success" :
              renderedCellValue === "VERIFIED" ? "secondary" :
              renderedCellValue === "RETURNED FOR REVISION" ? "warning" :
              renderedCellValue === "WAITING FOR VERIFICATION" ? "info" :
              "error"
            } 
          />
        )
      },

  ];

  const formatNumber = (number) => {
    return numeral(number).format('0,0.00');
    };


export default function Statement() {
    const [clientStatement, setClientStatement] = useState([]);
    const [breakDown, setBreakDown] = useState({
        total_debit: 0,
        total_credit: 0,
        balance: 0
    })
    const [filters, setFilters] = useState(null)
    const [loading, setLoading] = useState(false)
    const handleFilter = (filters) => {
        setLoading(true)
        setFilters(filters)
        AxiosInstance.post("/invoice/get_statement", {client_name: filters.value, 
            from_date: filters.from_date, 
            to_date: filters.to_date})
        .then(function(result){
            if(result.data.status === 'SUCCESS')
            {
                const fetchClientStatement = result.data.client_statement.map((element) => ({
                    invoice_date: dayjs(new Date(element.invoice_date)).format('YYYY-MM-DD'),
                    invoice_number: element.invoice_number,
                    project_name: element.project_name,
                    debit: formatNumber(element.debit),
                    credit: formatNumber(element.credit),
                    balance: formatNumber(element.balance),
                    currency: element.currency,
                    remarks: element.remarks
                  })); 
                
                  setBreakDown(
                    result.data.client_statement.reduce((accumulator, currentItem) => {
                      const currentDebit = parseFloat(currentItem.debit);
                      const currentCredit = currentItem.credit === null ? 0 : parseFloat(currentItem.credit);
                      const currentBalance = parseFloat(currentItem.balance);
                      return {
                        debit: accumulator.debit + currentDebit,
                        credit: accumulator.credit + currentCredit,
                        balance: accumulator.balance + currentBalance,
                      };
                    }, { debit: 0, credit: 0, balance: 0})
                  );
                  
                  
                  setClientStatement(fetchClientStatement)
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
            orientation: 'portrait',
        });
    
        // Prepare table data
        const tableData = rows.map((row) => Object.values(row.original));
        const tableHeaders = columns.map((c) => c.header);
        const img = new Image();
        img.src = bsLogo;
        img.onload = function() {

        const imageWidth = 50; // Set the desired image width
        const aspectRatio = img.height / img.width;
        const imageHeight = imageWidth * aspectRatio;

        // Add the image to the PDF in the top-left corner
        doc.addImage(img, 'PNG', 10, 10, imageWidth, imageHeight);
        // Add title and client information with proper alignment
        doc.setFontSize(10);
        doc.text('STATEMENT OF ACCOUNT', doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
        doc.setFontSize(8);
        doc.text('Client: ' + filters.value, 10, 45);
        doc.text('From: ' + filters.from_date, 10, 50);
        doc.text('To: ' + filters.to_date, 10, 55);
    
        // Add the table with proper margins
        autoTable(doc, {
            startY: 65,
            startX: 10,
            head: [tableHeaders],
            body: tableData,
            theme: 'grid',
            headStyles: {
                fillColor: theme.palette.primary.main,
                textColor: '#fff'
            },
            styles: {
                fontSize: 6.5,
                font: 'Verdana, sans-serif',
                margin: { top: 10, left: 10, right: 10, bottom: 0 }
            },
            didDrawPage: function (data) {
                const pageWidth = doc.internal.pageSize.getWidth();
                const rightAlignX = pageWidth - 10; // Adjust the value to position text closer to the right edge
    
                // Add total information at the bottom of the table
                doc.text('Total Debit:', pageWidth - 50, data.cursor.y + 10);
                doc.text('Total Credit:', pageWidth - 50, data.cursor.y + 15);
                doc.text('Total Balance:', pageWidth - 50, data.cursor.y + 20);

                doc.text(''+formatNumber(breakDown.debit), rightAlignX, data.cursor.y + 10, { align: 'right' });
                doc.text(''+formatNumber(breakDown.credit), rightAlignX, data.cursor.y + 15, { align: 'right' });
                doc.text(''+formatNumber(breakDown.balance), rightAlignX, data.cursor.y + 20, { align: 'right' });
            }
        });
    
        // Save the PDF
        doc.save('soa-sample.pdf');
        };
    };
    
    return(
        <React.Fragment>
        <Toolbar />
        <Grid container direction="column" spacing={2}>
          
          <Grid item>
            <Typography variant="h6">STATMENT OF ACCOUNTS</Typography>
          </Grid> 
          <Grid item>
          <Paper>
            <Box 
            sx={{width: '100%'}}
            ref={stackRef}>
           
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
                <Box sx={{paddingTop: 1, paddingLeft: 1, paddingRight: 1, display: 'flex', width: '100%' }}>
                <StatementFilter onFilter={handleFilter} exportDisabled={table.getPrePaginationRowModel().rows.length === 0} onExport={()=>handleExportRows(table.getPrePaginationRowModel().rows)} />
                </Box>
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
            columns={columns} data={clientStatement} />
            
             </Box>
             </Paper>
          </Grid>
        </Grid>
    </React.Fragment>
    )
}
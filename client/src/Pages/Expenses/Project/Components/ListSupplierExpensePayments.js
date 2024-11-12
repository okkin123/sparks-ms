import React, {useEffect, useState, useRef} from 'react' 
import {Box, Chip, IconButton, Typography, Stack, Button, Tooltip, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Checkbox} from '@mui/material'
import AxiosInstance from '../../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../../Theme';
import dayjs from 'dayjs';
import SupplierExpenseColumnFilter from './SupplierExpenseColumnFilter';
import { NumericFormat } from 'react-number-format';
import DownloadIcon from '@mui/icons-material/Download';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Dialog from '../../../../Components/Dialog';

const columns=[
    {
        accessorKey: 'supplier_name',
        header: 'SUPPLIER_NAME'
    },    
    {
        accessorKey: 'total_amount',
        header: 'TOTAL AMOUNT PAID',
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
        accessorKey: 'currency',
        header: 'CURRENCY',
        size: 'fit-content',
    }, 
];



export default function ListSupplierExpensePayments(){
   const [supplierPayments, setSupplierPayments] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [loading, setLoading] = useState({
    make_payment: false,
    table: false
   })
   const [voidDialog, setVoidDialog] = useState({
    open: false,
    content: null,
    supporting_doc_name: ''
   })

   const [refresh, setRefresh] = useState(false)


   const downloadFile = async (filename, filepath) => {
    try {
      const response = await AxiosInstance.post(`/project_expense/download_file`, {filepath: filepath}, {
        responseType: 'blob',
      });
  
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        console.error('Error: File not found or server error');
      }
    } catch (error) {
      console.error('Error downloading the file:', error);
    }
  };

  function voidPayment(supporting_doc_name){
    AxiosInstance.post("/project_expense/void_supplier_payments", {supporting_doc_name: supporting_doc_name})
    .then(function(response){
        setVoidDialog({
            open: false,
            content: null,
            supporting_doc_name: ''
        })
        alert(response.data.message)
        if (response.data.status === 'SUCCESS') {
            setRefresh(!refresh)
        }
    })
    .catch(function(error){
        console.log(error)
    })
  }


    useEffect(()=>{
        setLoading((loading)=>({...loading, table: true}))
        AxiosInstance.get("/project_expense/get_supplier_payments")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedSupplierPayments = result.data.supplier_payments.map((element) => ({
                    supplier_name: element.supplier_name,
                    mode_of_payment: element.mode_of_payment,
                    total_amount: element.total_amount,
                    currency: element.currency,
                    //canVoid: JSON.parse(element.reporting_to).user_id.includes(result.data.user_id),
                    subRows: element.details
                  })); 
                
                  setSupplierPayments(fetchedSupplierPayments)
                  setFilteredData(fetchedSupplierPayments);
                  setLoading((loading)=>({...loading, table: false}))
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })
    },[refresh])


    const handleFilter = (filters) => {
        const newFilteredData = supplierPayments.filter(row => {
          const columnMatch = filters.column
            ? row[filters.column].toString().toLowerCase().includes(filters.value.toLowerCase())
            : true;
          const dateMatch = filters.fromDate && filters.toDate
            ? dayjs(new Date(row.date)).isBetween(filters.fromDate, filters.toDate, null, '[]')
            : true;
          return columnMatch && dateMatch;
        });
        setFilteredData(newFilteredData);
      };




    const stackRef = useRef(null);
    const tableBodyRef = useRef(null);
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
        <Box
        ref={stackRef}
        sx={{ width: '100%'}}
            >
            <MaterialReactTable
                enableColumnFilters={false}
                enableColumnActions={false}
                enableDensityToggle={false}
                enableHiding={false}
                enableGlobalFilter={false}
                enableFullScreenToggle={false}
                enableExpandAll={false}
                enableRowActions
                initialState={{
                    density: 'compact',
                    expanded: false,
                    isLoading: loading.table,
                }}
                state={{
                    isLoading: loading.table,
                    columnPinning: { left: ['mrt-row-expand', 'mrt-row-actions']}
                }}
                renderRowActions={({ row }) => (
                    <Stack direction="row">
                        <Tooltip title="Void Payment">
                            <IconButton color="error">
                                <RemoveCircleIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Download File">
                            <IconButton color="secondary">
                                <DownloadIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                )}
                muiDetailPanelProps={() => ({
                    sx: (theme) => ({
                      padding: 0
                    }),
    
                  })}
                  //custom expand button rotation
                  muiExpandButtonProps={({ row, table }) => ({
                    onClick: () => {
                        table.setExpanded({ [row.id]: !row.getIsExpanded() });
                    }, 
                    sx: {
                      transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s',
                    },
                  })}
                renderDetailPanel={({ row }) => {
                    const subRows = row.original.subRows;
                    return (
                      <Paper square sx={{ padding: 1 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableCell>SELECT</TableCell>
                                <TableCell>STATUS</TableCell>
                                <TableCell>PE NUMBER</TableCell>
                                <TableCell>INVOICE NO.</TableCell>
                                <TableCell>PROJECT NAME</TableCell>
                                <TableCell>MODE OF PAYMENT</TableCell>
                                <TableCell>DATE PAID</TableCell>
                                <TableCell>CHEQUE NO.</TableCell>
                                <TableCell>REFERENCE NO.</TableCell>
                                <TableCell>AMOUNT</TableCell>
                                <TableCell>PROCESSED BY</TableCell>
                                <TableCell>VOIDED BY</TableCell>
                              </TableHead>
                              <TableBody>
                              {subRows.map((subRow, index) => (
                                <TableRow>
                                    <TableCell>
                                        {subRow.status==="PAID" &&<Checkbox
                                            size="small"
                                        />}
                                    </TableCell>
                                    <TableCell><Chip size="small" label={subRow.status} color={subRow.status==="PAID" ? "success" : "error"} /></TableCell>
                                    <TableCell>{subRow.pe_number}</TableCell>
                                    <TableCell>{subRow.invoice_number}</TableCell>
                                    <TableCell>{subRow.project_name}</TableCell>
                                    <TableCell><Chip size="small" label={subRow.mode_of_payment} color={subRow.mode_of_payment==="Cheque Deposit" ? "info" : subRow.mode_of_payment==="Online Transfer" ? "warning" : "secondary"}/></TableCell>
                                    <TableCell>{dayjs(subRow.date_paid).format('DD-MMM-YYYY')}</TableCell>
                                    <TableCell>{subRow.cheque_no===0 ? '' : subRow.cheque_no}</TableCell>
                                    <TableCell>{subRow.reference_no}</TableCell>
                                    <TableCell><NumericFormat
                                              value={subRow.amount}
                                              displayType={'text'}
                                              thousandSeparator={true}
                                              decimalScale={2}
                                              fixedDecimalScale={true}
                                          /></TableCell>
                                    <TableCell>{subRow.processed_by}</TableCell>
                                    <TableCell>{subRow.voided_by}</TableCell>
                                </TableRow>))}
                              </TableBody>
                            </Table>
                        </TableContainer>
                        </Paper>
                    )
                }}
                muiTablePaperProps={{
                    sx: { borderRadius: 0 },
                }}
                muiTableHeadCellProps={{
                    sx: {
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
                muiPaginationProps={{
                    rowsPerPageOptions: [10, 20, { label: 'All', value: filteredData.length }],
                    variant: 'filled',
                }}
                paginationDisplayMode='pages'
                muiTableContainerProps={{
                    sx: {
                    maxHeight: box.height,
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
                muiTableBodyRowProps={({ row }) => ({
                    sx: {
                        backgroundColor: !row.original.subRows ? '#ECEFF1': 'white',
                    },
                })}
                muiTableBodyProps={{
                    ref: tableBodyRef,
                }}
                muiTableHeadProps={{
                    sx: {
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    },
                }}
                renderTopToolbarCustomActions={() => (
                    <SupplierExpenseColumnFilter
                    columns={
                        columns.filter((column) =>
                        column.accessorKey === 'supplier_name' 
                        )
                    }
                    onFilter={handleFilter}
                    />
                )}
                columns={columns}
                data={filteredData}
                />
        </Box>
    )
}
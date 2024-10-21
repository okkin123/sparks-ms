import React, {useEffect, useState, useRef} from 'react' 
import {Box, Chip, IconButton, Typography, Stack, Button} from '@mui/material'
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
        accessorKey: 'pe_number',
        header: 'PE NO.',
        size: 'fit-content',
    }, 
    {
        accessorKey: 'invoice_number',
        header: 'INVOICE NO.',
        size: 'fit-content',
    }, 
    {
        accessorKey: 'project_name',
        header: 'PROJECT NAME',
        size: 'fit-content',
    }, 
    {
        accessorKey: 'status',
        header: 'STATUS',
        size: 'fit-content',
        Cell: ({ renderedCellValue }) => (
            <Chip 
                label={renderedCellValue} 
                size="small"
                color={renderedCellValue === 'PAID' ? 'success' : 'error' }
            /> 
            )
    },  
    {
        accessorKey: 'mode_of_payment',
        header: 'MODE OF PAYMENT',
        size: 'fit-content',
        Cell: ({ renderedCellValue }) => (
        <Chip 
            label={renderedCellValue} 
            size="small"
            color={renderedCellValue === 'Cash' ? 'secondary' : renderedCellValue === 'Online Transfer' ? 'warning' : 'info' }
        /> 
        )
    },  
    {
        accessorKey: 'date',
        header: 'DATE',
        size: 'fit-content',
        Cell: ({renderedCellValue}) => {
            return dayjs(new Date(renderedCellValue)).format('DD-MMM-YYYY')
        }
    },  
    {
        accessorKey: 'cheque_no',
        header: 'CHEQUE NO.',
        size: 'fit-content',
        Cell: ({ renderedCellValue }) => (
            renderedCellValue === 0 ? '' : renderedCellValue
        )
    },  
    {
        accessorKey: 'reference_no',
        header: 'REFERENCE NO.',
        size: 'fit-content',
    },  
    {
        accessorKey: 'amount',
        header: 'AMOUNT',
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
    {
        accessorKey: 'processed_by',
        header: 'PROCESSED BY',
        size: 'fit-content',
    },  
    {
        accessorKey: 'voided_by',
        header: 'VOIDED BY',
        size: 'fit-content',
        
    }
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
                    filepath: element.supporting_doc_path,
                    filename: element.supporting_doc_name,
                    supplier_name: element.supplier_name,
                    status: element.status,
                    mode_of_payment: element.mode_of_payment,
                    date: element.date_paid,
                    cheque_no: element.cheque_no,
                    reference_no: element.reference_no,
                    amount: element.amount,
                    currency: element.currency,
                    processed_by: element.processed_by,
                    voided_by: element.voided_by,
                    canVoid: JSON.parse(element.reporting_to).user_id.includes(result.data.user_id),
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
                enableExpandAll={false} // hide expand all double arrow in column header
                enableExpanding
                filterFromLeafRows={true} // apply filtering to all rows instead of just parent rows
                getSubRows={(row) => row.subRows} // default
                paginateExpandedRows={false} 
                enableRowActions
                initialState={{
                    density: 'compact',
                    expanded: false,
                    isLoading: loading.table,
                    columnPinning: { left: ['mrt-row-expand', 'mrt-row-actions', 'supplier_name', 'status'] }
                }}
                state={{
                    isLoading: loading.table
                }}
                renderRowActions={({ row }) => (
                    row.original.status !== 'VOIDED' ? <Box>
                        {row.original.filepath &&<IconButton color="secondary" onClick={()=>downloadFile(row.original.filename, row.original.filepath)}>
                        <DownloadIcon />
                        </IconButton>}
                        {
                         row.original.canVoid ? <IconButton color="error" onClick={() => setVoidDialog({
                            open: true,
                            content: (<React.Fragment>
                              <Stack direction="row" gap={1} justifyContent="flex-start" alignItems="flex-start" flexWrap="wrap">
                                 <Chip color="primary" label={<Typography variant="body2">Amount: <b><NumericFormat
                                    value={row.original.amount}
                                    displayType={'text'}
                                    thousandSeparator={true}
                                    decimalScale={2}
                                    fixedDecimalScale={true}
                                    /></b></Typography>} />
                                  <Chip 
                                    label={<>Supplier Name: <b>{row.original.supplier_name}</b></>}
                                    size="small"
                                  /> 
                                 <Chip 
                                    label={<>Mode of Payment: <b>{row.original.mode_of_payment}</b></>}
                                    size="small"
                                    color={row.original.mode_of_payment === 'Cash' ? 'secondary' : row.original.mode_of_payment === 'Online Transfer' ? 'warning' : 'info' }
                                  /> 
                                   {row.original.mode_of_payment !== 'Cash' ? <Chip 
                                    label={<>{row.original.mode_of_payment==='Cheque Deposit' ? 'Cheque No.: ' : row.original.mode_of_payment==='Online Transfer' ? 'Reference No.: ' : ''} 
                                    <b>{row.original.mode_of_payment==='Cheque Deposit' ? row.original.cheque_no : row.original.mode_of_payment==='Online Transfer' ? row.original.reference_no : ''}</b></>}
                                    size="small"
                                  /> : null }
                                  <Chip 
                                   label={<>Date: <b>{dayjs(new Date(row.original.date)).format('DD-MMM-YYYY')}</b></>}
                                    size="small"
                                  /> 
                                  <Chip 
                                    label={<>Processed By: <b>{row.original.processed_by}</b></>}
                                    size="small"
                                  /> 

                              </Stack></React.Fragment>
                              ),
                              supporting_doc_name: row.original.filename
                        })}>
                        <RemoveCircleIcon />
                        </IconButton> : null }
                        
                    </Box> : null
                )}
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
                <Dialog open={voidDialog.open} content={
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1">VOID PAYMENT</Typography>
                        <Typography variant="body1">Do you want to void this payment?</Typography>
                        {voidDialog.content}
                        <Stack direction="row" justifyContent="flex-end">
                            <Button size="small" onClick={()=>setVoidDialog({...voidDialog, open: false})}>No</Button>
                            <Button size="small" variant="contained" color="secondary" onClick={()=>voidPayment(voidDialog.supporting_doc_name)}>Yes</Button>
                        </Stack>
                    </Stack>
                } />
        </Box>
    )
}
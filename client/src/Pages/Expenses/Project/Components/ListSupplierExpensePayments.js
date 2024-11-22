import React, {useEffect, useState, useRef} from 'react' 
import {Box, Chip, Typography, Stack, Button, Link, Tooltip} from '@mui/material'
import AxiosInstance from '../../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../../Theme';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import Dialog from '../../../../Components/Dialog';
import SupplierExpenseColumnFilter from './SupplierExpenseColumnFilter';


const columns=[
    {
        accessorKey: 'supplier_name',
        header: 'SUPPLIER NAME',
        size: 'fit-content'
    },
    {
        accessorKey: 'status',
        header: 'STATUS',
        size: 'fit-content',
        Cell: ({renderedCellValue})=>(
            <Chip size="small" label={renderedCellValue} color={renderedCellValue==="PAID" ? "success" : "error"} />
        )
    },
    {
        accessorKey: 'pe_number',
        header: 'PE NUMBER',
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
        accessorKey: 'mode_of_payment',
        header: 'MODE OF PAYMENT',
        size: 'fit-content',
        Cell: ({renderedCellValue})=>(
            <Chip size="small" label={renderedCellValue} color={renderedCellValue==="Cheque Deposit" ? "info" : renderedCellValue==="Online Transfer" ? "warning" : "secondary"}/>
        )
    },
    {
        accessorKey: 'date_paid',
        header: 'DATE PAID',
        size: 'fit-content',
        Cell: ({renderedCellValue})=>{
            return dayjs(renderedCellValue).format('DD-MMM-YYYY')
        }
    },
    {
        accessorKey: 'cheque_no',
        header: 'CHEQUE NO.',
        size: 'fit-content',
        Cell: ({renderedCellValue, row})=>{
            return renderedCellValue!==0&&(
                <Tooltip title="Download File" placement="right">
                <Link href="#" color="secondary" variant="outlined" onClick={async ()=>{
                     try {
                        const response = await AxiosInstance.post(`/project_expense/download_file`, {filepath: row.original.supporting_doc_path}, {
                          responseType: 'blob',
                        });
                    
                        if (response.status === 200) {
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', row.original.supporting_doc_name);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } else {
                          console.error('Error: File not found or server error');
                        }
                      } catch (error) {
                        console.error('Error downloading the file:', error);
                      }
                }}>{renderedCellValue}</Link>
                </Tooltip>
            )
        }
    },
    {
        accessorKey: 'reference_no',
        header: 'REFERENCE_NO',
        size: 'fit-content',
        Cell: ({renderedCellValue, row})=>(
                <Tooltip title="Download File" placement="right">
                <Link href="#" color="secondary" variant="outlined" onClick={async ()=>{
                     try {
                        const response = await AxiosInstance.post(`/project_expense/download_file`, {filepath: row.original.supporting_doc_path}, {
                          responseType: 'blob',
                        });
                    
                        if (response.status === 200) {
                          const url = window.URL.createObjectURL(new Blob([response.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', row.original.supporting_doc_name);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                        } else {
                          console.error('Error: File not found or server error');
                        }
                      } catch (error) {
                        console.error('Error downloading the file:', error);
                      }
                }}>{renderedCellValue}</Link>
                </Tooltip>
        )
        
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
          />)
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
]


export default function ListSupplierExpensePayments(){
   const [supplierPayments, setSupplierPayments] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [loading, setLoading] = useState({
    make_payment: false,
    table: false
   })
   const [voidDialog, setVoidDialog] = useState({
    open: false
   })

   const [refresh, setRefresh] = useState(false)

  function handleVoidPayment(){


    const selectedRowData = Object.keys(rowSelection).map((rx) => {
        return filteredData.find((ry) => ry.project_supplier_expense_id+''+ry.status === rx && ry.status !== 'VOIDED');
    }).filter(Boolean); 


    if(selectedRowData.length > 0){
    AxiosInstance.post("/project_expense/void_supplier_payments", {project_supplier_expense_ids: selectedRowData.map(row => row.project_supplier_expense_id)})
    .then(function(response){
        
        setVoidDialog({open:false})
       
        alert(response.data.message)
        if (response.data.status === 'SUCCESS') {
            
           setRefresh(!refresh)
        }
    })
    .catch(function(error){
        console.log(error)
    })
    }else{
        alert('There is no paid selection! Please try again.')
    }

  }


    useEffect(()=>{
        setLoading((loading)=>({...loading, table: true}))
        AxiosInstance.get("/project_expense/get_supplier_payments")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedSupplierPayments = result.data.supplier_payments.map((element) => ({
                    supplier_name: element.supplier_name,
                    subRows: element.details,
                    user_id: result.data.user_id
                  })); 
                
                  setSupplierPayments(fetchedSupplierPayments)
                  
                  if(active.id > -1){
                  
                    setFilteredData(fetchedSupplierPayments[active.id].subRows);
                    setPaymentDetails(fetchedSupplierPayments[active.id].subRows)
                  }
                 
                  setRowSelection({})
                  setLoading((loading)=>({...loading, table: false}))
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })
          // eslint-disable-next-line
    },[refresh])


    const stackRef = useRef(null);
    const [paymentDetails, setPaymentDetails] = useState([])
    const [active, setActive] = useState({
        id: -1,
        label: ""
    });
    const [rowSelection, setRowSelection] = useState({});
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

    const handleFilter = (filters) => {
        const newFilteredData = paymentDetails.filter(row => {
          const columnMatch = filters.column
            ? row[filters.column].toString().toLowerCase().includes(filters.value.toLowerCase())
            : true;
          const dateMatch = filters.fromDate && filters.toDate
            ? dayjs(new Date(row.date_paid)).isBetween(filters.fromDate, filters.toDate, null, '[]')
            : true;
          return columnMatch && dateMatch;
        });
        setFilteredData(newFilteredData);
     };

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
            enableRowSelection={(row)=>{
                if(row.original.reporting_to!==null && row.original.reporting_to!==undefined){
                    return JSON.parse(row.original.reporting_to).user_id.includes(supplierPayments[0].user_id)
                }
       
                return false;
            }}
            enableFullScreenToggle={false}
            getRowId={(row) => row.project_supplier_expense_id+''+row.status} //give each row a more useful id
            onRowSelectionChange={setRowSelection} //connect internal row selection state to your own
            initialState={{
                density: 'compact',
                isLoading: loading.table,
                columnPinning: { left: ['mrt-row-select','pe_number', 'supplier_name', 'status'] }
            }}
            state={{
                rowSelection: rowSelection,
                isLoading: loading.table
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
            muiPaginationProps={{
                rowsPerPageOptions: [10, 20, { label: 'All', value: paymentDetails.length}],
                variant: 'filled',
            }}
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
            renderTopToolbarCustomActions={() => (
                <Stack spacing={2} sx={{paddingTop: 1, paddingLeft: 1, paddingRight: 1}}>
                
                    <Stack direction="row" spacing={2} alignItems="center">
                        {
                            supplierPayments.map((supplierPayment, index)=>(
                                <Chip key={index} color={active.label === supplierPayment.supplier_name ? "primary" : "default"} size="small" label={supplierPayment.supplier_name} 
                                onClick={()=>{setPaymentDetails(supplierPayment.subRows)
                                    setFilteredData(supplierPayment.subRows);
                                    setActive({id: index, label: supplierPayment.supplier_name+''+supplierPayment.currency})
                                }} />
                            ))
                        }
                    </Stack>
                    {active.label && <SupplierExpenseColumnFilter 
                    columns={
                        columns.filter((column)=> column.accessorKey==='invoice_number'
                        || column.accessorKey==='project_name')
                    } 
                    onFilter={handleFilter}
                    />}
                </Stack>
                )}
            muiToolbarAlertBannerProps={{
                sx: {
                position: 'absolute', left: 0, top: 0, transform: 'translateY(0)', padding: 0,
                backgroundColor: '#FFEBEE'
                },
                children: (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="contained" size="small" color="error" onClick={()=>setVoidDialog({...voidDialog, open: true})}>
                        VOID PAYMENT
                    </Button>
                </Box>
                ),
            }}
            columns={columns} data={filteredData} />   
            <Dialog open={voidDialog.open} content={
                <Stack direction="column" spacing={2}>
                    <Typography variant="subtitle1">VOID PAYMENT</Typography>
                    <Typography variant="body1">Are you sure you want to void the selected payment/s?</Typography>
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button onClick={()=>setVoidDialog({...voidDialog, open: false})}>No</Button>
                        <Button variant="contained" color="secondary" onClick={()=>handleVoidPayment()}>Yes</Button>
                    </Stack>
                </Stack>
            } />
        </Box>
    )
}
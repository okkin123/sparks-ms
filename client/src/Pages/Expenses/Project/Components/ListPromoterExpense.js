import React, {useEffect, useState, useRef} from 'react' 
import {Box, Typography, Stack, Button, TextField, Autocomplete} from '@mui/material'
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
        accessorKey: 'status',
        header: 'STATUS',
        width: 'fit-content'
    },
    {
        accessorKey: 'project_name',
        header: 'PROJECT NAME',
        width: 'fit-content'
    },
    {
        accessorKey: 'fullname',
        header: 'FULLNAME',
        width: 'fit-content'
    },
    {
        accessorKey: 'location',
        header: 'LOCATION',
        width: 'fit-content'
    },
    {
        accessorKey: 'work_period',
        header: 'WORK PERIOD',
        width: 'fit-content'
    },
    {
        accessorKey: 'rate',
        header: 'RATE',
        width: 'fit-content',
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
        accessorKey: 'unit',
        header: 'UNIT',
        width: 'fit-content'
    },
    {
        accessorKey: 'currency',
        header: 'CURRENCY',
        width: 'fit-content'
    },
    {
        accessorKey: 'created_by',
        header: 'CREATED BY',
        width: 'fit-content',
    },
    
];


export default function ListPromoterExpense(){
   const [promoters, setPromoters] = useState([])
   const [promoterExpenses, setPromoterExpenses] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [selectedPromoter, setSelectedPromoter] = useState({
    id: -1,
    fullname: "",
    subRows: []
   })
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
        AxiosInstance.get("/project_expense/list_promoter_expense")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedPromoterExpenses = result.data.promoter_expenses.map((element) => ({
                    fullname: element.fullname,
                    subRows: element.details,
                    user_id: result.data.user_id
                  })); 
                
                  setPromoters(fetchedPromoterExpenses)
                  if(selectedPromoter.id > -1){
                  
                    setFilteredData(fetchedPromoterExpenses[selectedPromoter.id].subRows);
                    setPromoterExpenses(fetchedPromoterExpenses[selectedPromoter.id].subRows)
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
        const newFilteredData = promoterExpenses.filter(row => {
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
            // enableRowSelection={(row)=>{
            //     if(row.original.reporting_to!==null && row.original.reporting_to!==undefined){
            //         return JSON.parse(row.original.reporting_to).user_id.includes(supplierPayments[0].user_id)
            //     }
       
            //     return false;
            // }}
            enableRowSelection
            enableFullScreenToggle={false}
            getRowId={(row) => row.project_promoter_expense_id} //give each row a more useful id
            onRowSelectionChange={setRowSelection} //connect internal row selection state to your own
            initialState={{
                density: 'compact',
                isLoading: loading.table,
                //columnPinning: { left: ['mrt-row-select','pe_number', 'supplier_name', 'status'] }
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
                rowsPerPageOptions: [10, 20, { label: 'All', value: promoterExpenses.length}],
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
                <Stack direction="row" spacing={2} sx={{paddingTop: 1, paddingLeft: 1, paddingRight: 1}}>
                    <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        options={promoters.map((option, index) => ({
                            label: option.fullname,
                            value: index,
                            subRows: option.subRows
                        }))}
                        onChange={(event, newValue) => {

                            if (newValue) {
                                setPromoterExpenses(newValue.subRows);
                                setFilteredData(newValue.subRows);
                                setSelectedPromoter({id: newValue.value, fullname: newValue.label })
                            }
        
                        }}
                        onInputChange={(event, newInputValue) => {
                            if (newInputValue === '') {
                                setSelectedPromoter({ id: '', fullname: '' }); // Reset to empty
                            }
                        }}
                        value={
                            selectedPromoter.fullname
                            ? {
                                label: selectedPromoter.fullname,
                                value: selectedPromoter.id,
                            }
                            : null
                        }
                        renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            size="small"
                        />
                        )}
                        sx={{minWidth: 520}}
                        fullWidth
                    />
                    {/* {active.label && <SupplierExpenseColumnFilter 
                    columns={
                        columns.filter((column)=> column.accessorKey==='invoice_number'
                        || column.accessorKey==='project_name')
                    } 
                    onFilter={handleFilter}
                    />} */}
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
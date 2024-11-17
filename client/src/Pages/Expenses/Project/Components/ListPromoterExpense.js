import React, {useEffect, useState, useRef} from 'react' 
import {Box, Typography, Stack, Button, TextField, Autocomplete, Chip, Select, MenuItem, FormControl, InputLabel} from '@mui/material'
import AxiosInstance from '../../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../../Theme';
import { NumericFormat } from 'react-number-format';
import Dialog from '../../../../Components/Dialog';


const columns=[
    {
        accessorKey: 'STATUS',
        header: 'STATUS',
        width: 'fit-content',
        Cell: ({renderedCellValue})=>(
            <Chip size="small" label={renderedCellValue} color={renderedCellValue==='PAID' ? "success" : renderedCellValue==="VOIDED" ? "error" : "info"} />
        )
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
        Cell: ({renderedCellValue})=>(
            <Chip size="small" label={renderedCellValue} />
        )
    },
    
];


export default function ListPromoterExpense(){
   const [promoters, setPromoters] = useState([])
   const [promoterExpenses, setPromoterExpenses] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [selectedPromoter, setSelectedPromoter] = useState({
    id: -1,
    field_name: "",
    keyword:"",
    subRows: []
   })
   const [loading, setLoading] = useState({
    make_payment: false,
    table: false
   })
   const [voidDialog, setVoidDialog] = useState({
    open: false
   })


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
            
       
        }
    })
    .catch(function(error){
        console.log(error)
    })
    }else{
        alert('There is no paid selection! Please try again.')
    }

  }


    function ListPromoterExpenses(field_name, id){
        setLoading((loading)=>({...loading, table: true}))
        AxiosInstance.post("/project_expense/list_promoter_expense", {field_name: field_name})
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedPromoterExpenses = result.data.promoter_expenses.map((element) => ({
                    keyword: element[field_name],
                    subRows: element.details,
                    user_id: result.data.user_id
                  })); 
                  setPromoters(fetchedPromoterExpenses)
                 
                  if(id === -1){
                    setFilteredData([]);
                    setPromoterExpenses([])
                  }else{
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
    }

    
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
            layoutMode='grid-no-grow'
            enableRowSelection
            enableFullScreenToggle={false}
            getRowId={(row) => row.project_promoter_expense_id} //give each row a more useful id
            onRowSelectionChange={setRowSelection} //connect internal row selection state to your own
            initialState={{
                density: 'compact',
                isLoading: loading.table,
                columnPinning: { left: ['mrt-row-select','STATUS', 'project_name', 'fullname'] }
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
                    <FormControl
                      size="small"
                      sx={{minWidth: 200}}
                    >
                      <InputLabel>Search By</InputLabel>
                        <Select
                        value={selectedPromoter.field_name}
                        label="Search By"
                        onChange={(event) => {
                            setSelectedPromoter({field_name: event.target.value, id: -1, keyword: ''})
                            ListPromoterExpenses(event.target.value, -1)
                        }}
                        >
                            <MenuItem value="fullname">
                                PROMOTER
                            </MenuItem>
                            <MenuItem value="project_name">
                                PROJECT
                            </MenuItem>
                    </Select>
                  </FormControl>
                    <Autocomplete
                        freeSolo
                        selectOnFocus
                        clearOnBlur
                        handleHomeEndKeys
                        options={promoters.map((option, index) => ({
                            label: option.keyword,
                            value: index,
                            subRows: option.subRows
                        }))}
                        onChange={(event, newValue) => {

                            if (newValue) {
                                setPromoterExpenses(newValue.subRows);
                                setFilteredData(newValue.subRows);
                                setSelectedPromoter({...selectedPromoter, id: newValue.value, keyword: newValue.label })
                            }
        
                        }}
                        onInputChange={(event, newInputValue) => {
                            if (newInputValue === '') {
                                setSelectedPromoter({...selectedPromoter, id: -1, keyword: '' }); // Reset to empty
                            }
                        }}
                        value={
                            selectedPromoter.keyword
                            ? {
                                label: selectedPromoter.keyword,
                                value: selectedPromoter.id,
                            }
                            : null
                        }
                        renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            size="small"
                            label="Search Keyword..."
                        />
                        )}
                        sx={{minWidth: 420}}
                        fullWidth
                    />
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
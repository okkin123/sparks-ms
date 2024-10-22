import React, {useEffect, useState, useRef} from 'react' 
import {Typography, Chip, Stack, Box, Button} from '@mui/material'
import LoadingButton from "@mui/lab/LoadingButton";
import AxiosInstance from '../../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../../Theme';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import VendorExpenseColumnFilter from './VendorExpenseColumnFilter';
import { useNavigate } from 'react-router-dom';
const columns=[
    {
        accessorKey: 'ref_invoice_number',
        header: 'INVOICE NO.'
    },
    {
        accessorKey: 'project_name',
        header: 'PROJECT NAME'
    },
    {
        accessorKey: 'vendor_name',
        header: 'VENDOR NAME'
    },
    {
        accessorKey: 'location',
        header: 'LOCATION'
    },
    {
        accessorKey: 'description',
        header: 'DESCRIPTION'
    },
    {
        accessorKey: 'created_by',
        header: 'CREATED BY',
        Cell: ({ renderedCellValue }) => (
        <Chip 
            variant='outlined'
            label={renderedCellValue} 
            size="small"
            color="info" 
        />
        )
    },
    {
        accessorKey: 'date_paid',
        header: 'DATE'
    },  
    {
        accessorKey: 'vat_applicable',
        header: 'VAT APPLICABLE'
    },
    {
        accessorKey: 'amount_without_vat',
        header: 'AMOUNT w/o VAT',
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
        accessorKey: 'vat_percent',
        header: 'VAT %',
        Cell: ({renderedCellValue, row})=><Typography variant="p" color="error">{renderedCellValue}</Typography>
    },
    {
        accessorKey: 'vat_amount',
        header: 'VAT AMOUNT',
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
        accessorKey: 'amount_with_vat',
        header: 'AMOUNT w/ VAT',
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
        header: 'CURRENCY'
    },
    
];

export default function ListVendorExpense(){
    const [vendorExpenses, setVendorExpenses] = useState([]);
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [refresh, setRefresh] = useState(false)
    useEffect(()=>{
        setLoading(true)
        AxiosInstance.get("/project_expense/list_vendor_expense")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchVendorExpenses = result.data.vendor_expenses.map((element) => ({
                    project_vendor_expense_id: element.project_vendor_expense_id,
                    is_vat: !!element.vat_applicable,
                    ref_invoice_number: element.invoice_number,
                    project_name: element.project_name,
                    vendor_name: element.vendor_name,
                    location: element.location,
                    description: element.description,
                    created_by: element.created_by_email,
                    date_paid: dayjs(new Date(element.date)).format('DD-MMM-YYYY'),
                    date: dayjs(new Date(element.date)).format('YYYY-MM-DD'),
                    vat_applicable: !!element.vat_applicable ? 'Yes' : 'No',
                    vat_percent: !!element.vat_applicable ? element.vat_percentage+'%' : '',
                    vat_percentage: !!element.vat_applicable ? element.vat_percentage : 0,
                    amount_without_vat: element.amount_without_vat,
                    vat_amount: !!element.vat_applicable ? element.vat_amount: 0.00,
                    amount_with_vat: element.amount_with_vat,
                    currency: element.currency
                  })); 
                
                  setVendorExpenses(fetchVendorExpenses)
                  setLoading(false)
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })
    },[refresh])

    const [columnFilters, setColumnFilters] = useState({});

    const handleFilterChange = (column, value) => {
      setColumnFilters((prevFilters) => ({
        ...prevFilters,
        [column]: value,
      }));
    };
  
    const filteredData = vendorExpenses.filter((row) =>
      Object.entries(columnFilters).every(([column, value]) =>
        row[column]?.toString().toLowerCase().includes(value.toLowerCase())
      )
    );


    const total_amount_wo_vat = filteredData.reduce((sum, row) => sum + (row.amount_without_vat || 0), 0);
    const total_vat_amount = filteredData.reduce((sum, row) => sum + (row.vat_amount || 0), 0);
    const total_amount_with_vat = filteredData.reduce((sum, row) => sum + (row.amount_with_vat || 0), 0);
    
    const [rowSelection, setRowSelection] = useState({});

    const handleEditSelectedRows = () => {
        const selectedRowData = Object.keys(rowSelection).map((rx, x) => {

            return filteredData.find((ry, y) => ry.project_vendor_expense_id === parseInt(rx));
        });
       
        navigate('/', {
            state: {
                vendor_expense_edit: true,
                initialValues: selectedRowData
            }
        })
    };

    const handleDeleteSelectedRows = () => {
        setLoading(true)
        const selectedRowData = Object.keys(rowSelection).map((rx, x) => {

            return filteredData.find((ry, y) => ry.project_vendor_expense_id === parseInt(rx));
        });

        AxiosInstance.post("/project_expense/delete_vendor_expense", {values : selectedRowData})
        .then(function(response){
            if(response.data.status === 'SUCCESS'){
                alert(response.data.message)
                setRefresh(!refresh)
            }else{
                console.log(response.data.message)
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
  
    return(

           <Box ref={stackRef}
            sx={{
                width: "100%"
            }}>
            <MaterialReactTable
            columns={columns}
            data={filteredData}
            enableColumnFilters={false}
            enableColumnActions={false}
            enableDensityToggle={false}
            enableHiding={false}
            enableGlobalFilter={false}
            enableRowSelection={true}
            enableFullScreenToggle={false}
            getRowId={(row) => row.project_vendor_expense_id} //give each row a more useful id
            onRowSelectionChange={setRowSelection} //connect internal row selection state to your own
            
            initialState={{
                density: 'compact',
                isLoading: loading,
                columnPinning: { left: ['mrt-row-select','invoice_number', 'project_name']}
            }}
            state={{
                rowSelection: rowSelection,
                isLoading: loading
            }}
            muiTableHeadCellProps={{
                sx: {
                backgroundColor: theme.palette.primary.main,
                color: 'white'
                }
            }}
            muiPaginationProps={{
                rowsPerPageOptions: [10, 20],
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
                <VendorExpenseColumnFilter 
                columns={
                    columns.filter((column)=>column.accessorKey==='ref_invoice_number' 
                    || column.accessorKey==='project_name' 
                    || column.accessorKey==='vendor_name')
                } 
                onFilterChange={handleFilterChange}
                />
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
            )}
            muiToolbarAlertBannerProps={{
                sx: {
                position: 'absolute', left: 0, top: 0, transform: 'translateY(0)', padding: 0
                },
                children: (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" size="small" color="success" onClick={handleEditSelectedRows}>
                        EDIT SELECTED ROWS
                    </Button>
                    <LoadingButton variant="outlined" size="small" color="error" loading={loading} loadingIndicator="Deleting..." onClick={handleDeleteSelectedRows}>
                        DELETE SELECTED ROWS
                    </LoadingButton>
                </Box>
                ),
                }}
             />
            </Box>
    )
}
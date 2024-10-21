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
import CustomColumnFilter from './VendorExpenseColumnFilter';
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
    const [boxWidth, setBoxWidth] = useState(0);
  
    useEffect(() => {
      const updateBoxWidth = () => {
        if (stackRef.current) {
          setBoxWidth(stackRef.current.offsetWidth  );
        }
      };
  
      updateBoxWidth();
      window.addEventListener('resize', updateBoxWidth);
  
      return () => {
        window.removeEventListener('resize', updateBoxWidth);
      };
    }, []);
  
    return(
        <Stack
        direction="column"
        ref={stackRef}
        sx={{ flexGrow: 1, width: '100%', maxWidth: '100vw' }}
        >
            <CustomColumnFilter 
            columns={
                columns.filter((column)=>column.accessorKey==='ref_invoice_number' 
                || column.accessorKey==='project_name' 
                || column.accessorKey==='vendor_name')
            } 
            onFilterChange={handleFilterChange}
            total_amount_wo_vat={total_amount_wo_vat}
            total_vat_amount={total_vat_amount}
            total_amount_with_vat={total_amount_with_vat}
            />
           <Box sx={{
                width: boxWidth,
                overflowX: 'auto',
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
                variant: 'outlined',
            }}
            paginationDisplayMode='pages'
            muiToolbarAlertBannerProps={{
                    sx: {
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
        </Stack>
    )
}
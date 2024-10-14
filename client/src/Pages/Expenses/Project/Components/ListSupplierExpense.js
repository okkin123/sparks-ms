import React, {useEffect, useState, useRef} from 'react' 
import {Typography, Chip, Link, Box, Stack, Button} from '@mui/material'
import AxiosInstance from '../../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../../Theme';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import SupplierExpenseColumnFilter from './SupplierExpenseColumnFilter';

const parentHeight = window.innerHeight;
const parentWidth = window.innerWidth;

// Calculate the center position
const top = (window.innerHeight - parentHeight) / 2;
const left = (window.innerWidth - parentWidth) / 2;

let openedWindows = {};

function openWindow(url, name, specs) {
    if (openedWindows[url] && !openedWindows[url].closed) {
        // Window is already open, bring it to focus
        openedWindows[url].focus();
    } else {
        // Open a new window and store the reference
        openedWindows[url] = window.open(url, name, specs);
    }
}

const columns=[
    {
        accessorKey: 'pe_number',
        header: 'PE NO.',
        Cell: ({ renderedCellValue, row }) =>(
        <Link href="#" color="secondary" variant="outlined" onClick={()=>{
            //const locked = row.original.locked;

            //if(!locked)
            //{
            // Usage
            const url = window.location.pathname + `project_expense/details?pe_number=${renderedCellValue}`;
            const specs = `location=yes,height=${parentHeight},width=${parentWidth},scrollbars=yes,status=yes,left=${left},top=${top}`;


            // Open a new window with the quotation details
            openWindow(
                url,
                "_blank",
                specs
            );

            // // Create the handler with the specific quotation number
            // const messageHandler = createMessageHandler(row.original.refresh.navigate, renderedCellValue, row.original.quotation_number, row.original.refresh.setRefresh, row.original.refresh.refresh);

            // // Add the event listener
            // window.addEventListener('message', messageHandler);
            // }
            // else
            // {
            // alert(`Invoice Number: ${renderedCellValue} is already opened by another user!`);
            // }

              //}
            }}>{renderedCellValue}</Link>
        )
    },
    {
        accessorKey: 'status',
        header: 'STATUS',
        Cell: ({ renderedCellValue }) => (
        <Chip 
            label={renderedCellValue} 
            size="small"
            color={renderedCellValue === 'PAID' ? 'success' : renderedCellValue === 'PARTIALLY PAID' ? 'warning' : renderedCellValue === 'UNPAID' ? 'info' : 'error'}
        />
        )
    },
    {
        accessorKey: 'project_name',
        header: 'PROJECT NAME'
    },
    {
        accessorKey: 'supplier_name',
        header: 'SUPPLIER NAME'
    },
    {
        accessorKey: 'invoice_number',
        header: 'INVOICE NO.'
    },
    {
        accessorKey: 'created_by_email',
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
        accessorKey: 'date_issued',
        header: 'DATE ISSUED'
    },  
    {
        accessorKey: 'is_vat',
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
        accessorKey: 'vat_percentage',
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
    {
        accessorKey: 'total_payments',
        header: 'PAYMENTS',
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
        accessorKey: 'remaining_balance',
        header: 'BALANCE',
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
    
];

export default function ListSupplierExpense(){
    const [projectExpenses, setProjectExpenses] = useState([]);
    const [loading, setLoading] = useState(false)
    
    useEffect(()=>{
        setLoading(true)
        AxiosInstance.get("/project_expense/list")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedProjectExpenses = result.data.project_expenses.map((element) => ({
                    pe_number: element.pe_number,
                    status: element.STATUS,
                    project_name: element.project_name,
                    supplier_name: element.supplier_name,
                    invoice_number: element.invoice_number,
                    created_by_email: element.created_by_email,
                    date_issued: dayjs(new Date(element.date_issued)).format('DD-MMM-YYYY'),
                    is_vat: !!element.is_vat ? 'Yes' : 'No',
                    amount_without_vat: element.amount_without_vat,
                    vat_percentage: !!element.is_vat ? element.vat_percentage+'%' : '',
                    vat_amount: !!element.is_vat ? element.vat_amount: '',
                    amount_with_vat: element.amount_with_vat,
                    currency: element.currency,
                    total_payments: element.total_payments,
                    remaining_balance: element.remaining_balance
                  })); 
                
                  setProjectExpenses(fetchedProjectExpenses)
                  setLoading(false)
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })
    },[])

    const [columnFilters, setColumnFilters] = useState({});

    const handleFilterChange = (column, value) => {
        setColumnFilters((prevFilters) => ({
          ...prevFilters,
          [column]: value,
        }));
      };
    
      const filteredData = projectExpenses.filter((row) =>
        Object.entries(columnFilters).every(([column, value]) =>
          row[column]?.toString().toLowerCase().includes(value.toLowerCase())
        )
      );

        const total_amount_wo_vat = filteredData.reduce((sum, row) => sum + (row.amount_without_vat || 0), 0);
        const total_vat_amount = filteredData.reduce((sum, row) => sum + (row.vat_amount || 0), 0);
        const total_amount_with_vat = filteredData.reduce((sum, row) => sum + (row.amount_with_vat || 0), 0);
        const total_payments = filteredData.reduce((sum, row) => sum + (row.total_payments || 0), 0);
        const remaining_balance = filteredData.reduce((sum, row) => sum + (row.remaining_balance || 0), 0);
        const [rowSelection, setRowSelection] = useState({});

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
            <SupplierExpenseColumnFilter 
            columns={
                columns.filter((column)=>column.accessorKey==='invoice_number' 
                || column.accessorKey==='supplier_name'
                || column.accessorKey==='project_name')
            } 
            onFilterChange={handleFilterChange}
            total_amount_wo_vat={total_amount_wo_vat}
            total_vat_amount={total_vat_amount}
            total_amount_with_vat={total_amount_with_vat}
            total_payments={total_payments}
            remaining_balance={remaining_balance}
            />
             <Box sx={{
                width: boxWidth,
                overflowX: 'auto',
            }}>
            <MaterialReactTable
            enableColumnFilters={false}
            enableColumnActions={false}
            enableDensityToggle={false}
            enableHiding={false}
            enableGlobalFilter={false}
            enableRowSelection={true}
            enableFullScreenToggle={false}
            getRowId={(row) => row.project_expense_id} //give each row a more useful id
            onRowSelectionChange={setRowSelection} //connect internal row selection state to your own
            initialState={{
                density: 'compact',
                isLoading: loading,
                columnPinning: { left: ['mrt-row-select','pe_number', 'status', 'supplier_name'] },
                showGlobalFilter: true,
            }}
            state={{
                rowSelection: rowSelection,
                isLoading: loading
            }} 
            muiTableHeadCellProps={{
                sx:{
                backgroundColor: theme.palette.primary.main,
                color: 'white'
                }
            }}
            muiPaginationProps={{
                rowsPerPageOptions: [10, 20, { label: 'All', value: filteredData.length}],
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
                    <Button variant="outlined" size="small" color="secondary">
                        GENERATE STATEMENT
                    </Button>
                </Box>
                ),
            }}
            columns={columns} data={filteredData} />
         </Box>
         </Stack>
    )
}
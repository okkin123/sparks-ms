import React, {useEffect, useState} from 'react' 
import {Grid, Toolbar, Paper, Typography, Chip, Link, Box} from '@mui/material'
import AxiosInstance from '../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../Theme';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';


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

// function createMessageHandler(navigate, invoice_number, quotation_number, setRefresh, refresh) {

//     return function HandleMessage(event) {
      
//         if (event.data.childClosed || event.data.childSubmit) {
          
//             AxiosInstance.post("/quotation/unlock", { quotation_number: invoice_number })
//                 .then(function(response) {
//                   setRefresh(!refresh)
//                 })
//                 .catch(function(error) {
//                     console.error("Axios error:", error.response ? error.response.data : error.message);
//                 });
           
//         }
//         else if(event.data.childEdit) {
//           navigate('/', { 
//             state: {
//               invoice_edit: true,
//               invoice_number: invoice_number,
//               quotation_number: quotation_number
//             }
//            });
//         }
  
//         window.removeEventListener('message', HandleMessage);
        
//     };
//   }
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
    
];


export default function List(){
    const [projectExpenses, setProjectExpenses] = useState([]);
    const [loading, setLoading] = useState(false)

    useEffect(()=>{
        setLoading(true)
        AxiosInstance.get("/project_expense/list")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedProjectExpenses = result.data.project_expenses.map((element) => ({
                    pe_number: element.pe_number,
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
                    currency: element.currency
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
    return(
        <React.Fragment>
            <Toolbar />
            <Paper>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>
              <Grid item>
                <Typography variant="h6">LIST OF PROJECT EXPENSE</Typography>
              </Grid>
              <Grid item>
              <Paper>
                <Box 
                sx={{
                  width: window.innerWidth - 290,
                  overflowX: 'auto'
                }}>
               
                 <MaterialReactTable
                 enableColumnFilters={false}
                 enableColumnActions={false}
                 enableDensityToggle={false}
                 enableHiding={false}
                 enableGlobalFilter={true}
                 enableRowSelection={false}
                 positionGlobalFilter='left'
                 initialState={{
                  density: 'compact',
                  isLoading: loading,
                  columnPinning: { left: ['pe_number', 'supplier_name', 'invoice_number'] },
                  showGlobalFilter: true,
                 }}
                 state={{
                  isLoading: loading
                 }} 
                 muiTableHeadCellProps={{
                  sx:{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white'
                  }
                 }}
                 muiSearchTextFieldProps={{
                  placeholder: 'Search Keyword...',
                  sx: { minWidth: '18rem'},
                  variant: 'outlined',
                }}
                 muiPaginationProps={{
                  rowsPerPageOptions: [10, 20],
                  variant: 'outlined',
                 }}
                paginationDisplayMode='pages'
                 columns={columns} data={projectExpenses} />
                
                 </Box>
                 </Paper>
              </Grid>
            </Grid>
            </Paper>
        </React.Fragment>
    )
}
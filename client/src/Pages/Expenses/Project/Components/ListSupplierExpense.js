import React, {useEffect, useState, useRef} from 'react' 
import {Typography, Chip, Link, Box, Stack, Button, TextField, FormControl, Select, MenuItem, FormHelperText, InputLabel, Divider, Alert} from '@mui/material'
import AxiosInstance from '../../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../../Theme';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import SupplierExpenseColumnFilter from './SupplierExpenseColumnFilter';
import Dialog from '../../../../Components/Dialog';
import FileUpload from '../../../../Components/FileUpload';
import * as Yup from 'yup';
import { useFormik } from 'formik'
import AxiosFileInstance from '../../../../AxiosFileInstance';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import LoadingButton from '@mui/lab/LoadingButton';

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
        accessorKey: 'date',
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

const MakePaymentSchema = Yup.object().shape({
    mode_of_payment: Yup.string().required('This field is required!'),
    date: Yup.date().required('Date is required'),
    reference_number: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed!')
    .test('is-required-if', 'This field is required!', function (value) {
        const { mode_of_payment } = this.parent;
        if (mode_of_payment === 'Cheque Deposit' || mode_of_payment === 'Online Transfer') {
            return value !== undefined && value !== null && value !== '';
        }
        return true;
    }),
    amount: Yup.string()
      .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
      .required('This field is required!')
  });

export default function ListSupplierExpense(){
   const [projectExpenses, setProjectExpenses] = useState([]);
   const [filteredData, setFilteredData] = useState([]);
   const [rowSelection, setRowSelection] = useState({});
   const [loading, setLoading] = useState(false)
   const [fileAlert, setFileAlert] = useState(false)
   const [fileError, setFileError] = useState('')
   const [amountAlert, setAmountAlert] = useState('');
   const [makePayment, setMakePayment] = useState({
    open: false,
    ref_invoice_numbers: [],
    total_amount: 0
   })
   const formik_make_payment = useFormik({
        initialValues: {
            project_expense_id: 0,
            mode_of_payment: "",
            reference_number: "",
            name: "",
            date: null,
            amount: "",
            file: null
        },
        validateOnChange: false,
        validationSchema: MakePaymentSchema,
        onSubmit: (values, {validateForm})=>{
                if(values.file === null){
                    setFileError('Supporting Document is required!')
                    setFileAlert(true)
                }else if(parseFloat(values.amount) !== makePayment.total_amount)
                {
                    setAmountAlert('The amount is invalid! The total amount is not equal to the amount entered. Please check and try again!')
                }
                else{
                    setLoading({...loading, make_payment: true})
                    const formData = new FormData();
                    formData.append('file', values.file);
                    formData.append('values', JSON.stringify(values))
                    
                    AxiosFileInstance.post("/project_expense/insert_payment", formData)
                    .then(function(response){
                    if(response.data.status === 'SUCCESS'){
                        
                        alert(response.data.message)
                        window.location.reload()
                    }else{
                        console.log(response.data.message)
                    }
                    setLoading({...loading, make_payment: false})
                    })
                    .catch(function(error){
                    console.log(error)
                    })
                }
        
        }
    })

    const handleFileUpload = (file) => {
        formik_make_payment.setFieldValue('file', file);
        setFileAlert(true)
    };
    
    useEffect(()=>{
        setLoading(true)
        AxiosInstance.get("/project_expense/list")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchedProjectExpenses = result.data.project_expenses.map((element) => ({
                    project_expense_id: element.project_expense_id,
                    pe_number: element.pe_number,
                    status: element.STATUS,
                    project_name: element.project_name,
                    supplier_name: element.supplier_name,
                    invoice_number: element.invoice_number,
                    created_by_email: element.created_by_email,
                    date: dayjs(new Date(element.date_issued)).format('DD-MMM-YYYY'),
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
                  setFilteredData(fetchedProjectExpenses);
                  setLoading(false)
            }else{
                console.log(result.data.message)
            }
        })
        .catch(function(error){
            console.log(error)
        })
    },[])


    const handleFilter = (filters) => {
        const newFilteredData = projectExpenses.filter(row => {
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


    const total_amount_wo_vat = filteredData
    .filter(row => row.status !== 'VOIDED')
    .reduce((sum, row) => sum + (row.amount_without_vat || 0), 0);
    const total_vat_amount = filteredData
    .filter(row => row.status !== 'VOIDED')
    .reduce((sum, row) => sum + (row.vat_amount || 0), 0);
    const total_amount_with_vat = filteredData
    .filter(row => row.status !== 'VOIDED')
    .reduce((sum, row) => sum + (row.amount_with_vat || 0), 0);
    const total_payments = filteredData
    .filter(row => row.status !== 'VOIDED')
    .reduce((sum, row) => sum + (row.total_payments || 0), 0);
    const remaining_balance = filteredData
    .filter(row => row.status !== 'VOIDED')
    .reduce((sum, row) => sum + (row.remaining_balance || 0), 0);

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


    const handleMakePayment = () => {
        const selectedRowData = Object.keys(rowSelection).map((rx) => {
            return filteredData.find((ry) => ry.project_expense_id === parseInt(rx) && ry.status !== 'VOIDED');
        }).filter(Boolean); // Filter out any undefined values if no match is found
    
        const totalAmount = selectedRowData.reduce((sum, row) => sum + row.remaining_balance, 0);
    
        setMakePayment({
            open: true,
            ref_invoice_numbers: selectedRowData,
            total_amount: totalAmount
        });
    };

    return(
        <Stack
        direction="column"
        ref={stackRef}
        sx={{ flexGrow: 1, width: '100%', maxWidth: '100vw'}}
        >
            <SupplierExpenseColumnFilter 
            columns={
                columns.filter((column)=>column.accessorKey==='invoice_number' 
                || column.accessorKey==='supplier_name'
                || column.accessorKey==='project_name')
            } 
            onFilter={handleFilter}
            total_amount_wo_vat={total_amount_wo_vat}
            total_vat_amount={total_vat_amount}
            total_amount_with_vat={total_amount_with_vat}
            total_payments={total_payments}
            remaining_balance={remaining_balance}
            />
             <Box sx={{
                maxWidth: boxWidth,
                position: 'relative'
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
              muiTableBodyProps={{
                sx: {
                    display: 'block',
                    maxHeight: '400px', // Adjust the height as needed
                    overflowY: 'auto',
                    position: 'relative',
                },
              }}
              muiTableHeadProps={{
                sx: {
                    display: 'table',
                    width: '100%',
                    tableLayout: 'fixed',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                },
              }}
              muiTableProps={{
                sx: {
                  display: 'table',
                  width: '100%',
                  tableLayout: 'fixed',
                },
              }}
            muiToolbarAlertBannerProps={{
                sx: {
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                },
                children: (
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button variant="outlined" size="small" color="info" onClick={handleMakePayment}>
                        MAKE PAYMENT
                    </Button>
                    <Dialog open={makePayment.open} content={
                        <Stack direction="column" spacing={2}>
                        <Typography varian="subtitle1">MAKE PAYMENT</Typography>
                        <Typography variant="body2">Reference Invoice Nos.</Typography>
                        <div style={{height: 100, overflowY: 'auto'}}>
                        <Stack direction="row" gap={1} justifyContent="flex-start" alignItems="center" flexWrap="wrap">{
                            makePayment.ref_invoice_numbers.map((ref_invoice_number)=>(
                                <Chip size="small" label={
                                    <>
                                      {ref_invoice_number.invoice_number} - {ref_invoice_number.project_name} (
                                      <NumericFormat
                                        value={ref_invoice_number.remaining_balance}
                                        displayType={'text'}
                                        thousandSeparator={true}
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                      /> )
                                    </> } />
                            ))
                        }</Stack></div>
                        <Stack direction="row" spacing={2} alignItems="center" size="small">
                            <Typography variant="body2">Total Amount: </Typography>
                            <Chip size="small" color="success" label={<><NumericFormat
                            value={makePayment.total_amount}
                            displayType={'text'}
                            thousandSeparator={true}
                            decimalScale={2}
                            fixedDecimalScale={true}
                            /></>} />
                        </Stack>
                        <Divider />
                        {amountAlert && <Alert severity="error">{amountAlert}</Alert> }
                        <FormControl
                            fullWidth
                            size="small"
                            error={formik_make_payment.touched.mode_of_payment && Boolean(formik_make_payment.errors.mode_of_payment)}
                            >
                            <InputLabel>Mode of Payment</InputLabel>
                            <Select
                            name="mode_of_payment"
                            value={formik_make_payment.values.mode_of_payment}
                            label="Mode of Payment"
                            onChange={(event)=>formik_make_payment.setFieldValue('mode_of_payment',event.target.value)}
                            >
                                <MenuItem value={'Cheque Deposit'}>
                                    Cheque Deposit
                                </MenuItem>
                                <MenuItem value={'Online Transfer'}>
                                    Online Transfer
                                </MenuItem>
                                <MenuItem value={'Cash'}>
                                    Cash
                                </MenuItem>
                            </Select>
                            <FormHelperText>
                            {formik_make_payment.touched.mode_of_payment && formik_make_payment.errors.mode_of_payment}
                            </FormHelperText>
                        </FormControl> 
                        
                       <TextField label="Reference No." size="small" variant="outlined" name="reference_number" fullWidth 
                        onChange={formik_make_payment.handleChange} value={formik_make_payment.values.reference_number} 
                        error={
                            formik_make_payment.touched.reference_number && Boolean(formik_make_payment.errors.reference_number)
                        }
                        helperText={
                            formik_make_payment.touched.reference_number && formik_make_payment.errors.reference_number
                        } /> 
                
                        <Stack direction="row" spacing={2}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker 
                                value={dayjs(formik_make_payment.values.date)}
                                onChange={(value)=>formik_make_payment.setFieldValue('date', dayjs(new Date(value)).format('YYYY-MM-DD'))}
                                slotProps={{
                                    textField: {
                                    label: 'Date',
                                    variant: 'outlined',
                                    name: 'date',
                                    size: 'small', 
                                    fullWidth: true,
                                    error: Boolean(formik_make_payment.errors.date),
                                    helperText:formik_make_payment.touched.date && formik_make_payment.errors.date
                                    },
                                }} />
                            </LocalizationProvider>
                            <TextField label="Amount" name="amount" onChange={formik_make_payment.handleChange} size="small" variant="outlined" 
                            fullWidth value={formik_make_payment.values.amount}
                            error={
                                formik_make_payment.touched.amount && Boolean(formik_make_payment.errors.amount)
                            }
                            helperText={
                                formik_make_payment.touched.amount && formik_make_payment.errors.amount
                            } />
                        </Stack>
                    
                        <Typography variant="subtitle1">Supporting Doc:</Typography>
                        <FileUpload onFileUpload={handleFileUpload} fileTypes={['application/pdf']} mainError={fileError} alertOpen={fileAlert} />
                        <Stack direction="row" justifyContent="flex-end" spacing={2}>
                            <Button size="small" onClick={()=>{
                                setMakePayment({
                                    open: false,
                                    ref_invoice_numbers: [],
                                    total_amount: 0
                                })
                                // formik_make_payment.setValues({
                                //     project_expense_id: 0,
                                //     mode_of_payment: "",
                                //     cheque_no: "",
                                //     name: "",
                                //     date: null,
                                //     amount: "",
                                //     file: null
                                // })
                                setMakePayment({...makePayment, open: false})
                            }}>Cancel</Button>
                            <LoadingButton variant='contained' color='secondary' onClick={formik_make_payment.handleSubmit} loading={loading.make_payment}>Save Payment</LoadingButton>
                        </Stack>  
                        </Stack>

                    } />
                    <div
                        style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '16px', // Adjust width as needed
                        height: '100%',
                        backgroundColor: 'transparent',
                        pointerEvents: 'none',
                        }}
                    />
                    <Button variant="outlined" size="small" color="success">
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
import React, {useEffect, useState, useRef} from 'react' 
import {Typography, Chip, Stack, Box, Button, Paper, IconButton, Checkbox} from '@mui/material'
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
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import Dialog from '../../../../Components/Dialog'

const columns=[
    {
        accessorKey: 'ref_invoice_number',
        header: 'INVOICE NO.',
        width: 'fit-content'
    },
    {
        accessorKey: 'project_name',
        header: 'PROJECT NAME',
        width: 'fit-content'
    },
    // {
    //     accessorKey: 'vendor_name',
    //     header: 'VENDOR NAME',
    //     width: 'fit-content'
    // },
    // {
    //     accessorKey: 'location',
    //     header: 'LOCATION',
    //     width: 'fit-content'
    // },
    // {
    //     accessorKey: 'description',
    //     header: 'DESCRIPTION',
    //     width: 'fit-content'
    // },
    {
        accessorKey: 'created_by',
        header: 'CREATED BY',
        width: 'fit-content',
        Cell: ({ renderedCellValue }) => (
        <Chip 
            variant='outlined'
            label={renderedCellValue} 
            size="small"
            color="info" 
        />
        )
    },
    // {
    //     accessorKey: 'date_paid',
    //     header: 'DATE',
    //     width: 'fit-content',
    // },  
    // {
    //     accessorKey: 'vat_applicable',
    //     header: 'VAT APPLICABLE',
    //     width: 'fit-content',
    // },
    // {
    //     accessorKey: 'amount_without_vat',
    //     header: 'AMOUNT w/o VAT',
    //     width: 'fit-content',
    //     Cell: ({ renderedCellValue }) => (
    //         <NumericFormat
    //         value={renderedCellValue}
    //         displayType={'text'}
    //         thousandSeparator={true}
    //         decimalScale={2}
    //         fixedDecimalScale={true}
    //       />
    //     )
    // },
    // {
    //     accessorKey: 'vat_percent',
    //     header: 'VAT %',
    //     width: 'fit-content',
    //     Cell: ({renderedCellValue, row})=><Typography variant="p" color="error">{renderedCellValue}</Typography>
    // },
    // {
    //     accessorKey: 'vat_amount',
    //     header: 'VAT AMOUNT',
    //     width: 'fit-content',
    //     Cell: ({ renderedCellValue }) => (
    //         <NumericFormat
    //         value={renderedCellValue}
    //         displayType={'text'}
    //         thousandSeparator={true}
    //         decimalScale={2}
    //         fixedDecimalScale={true}
    //       />
    //     )
    // },
    {
        accessorKey: 'amount',
        header: 'AMOUNT',
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
    const [confirmDialog, setConfirmDialog] = useState({
        verify: {
            open: false,
            content: null
        },
        delete: {
            open: false,
            content: null
        }
    }) 
    const [verifications, setVerifications] = useState({
        ref_invoice_number: "",
        waiting_for_verification: 0,
        verified: 0,
    });
    useEffect(()=>{
        setLoading(true)
        AxiosInstance.get("/project_expense/list_vendor_expense")
        .then(function(result){
            if(result.data.status === 'SUCCESS'){
                const fetchVendorExpenses = result.data.vendor_expenses
                .map((element) => ({
                    // project_vendor_expense_id: element.project_vendor_expense_id,
                    // is_vat: !!element.vat_applicable,
                    ref_invoice_number: element.invoice_number,
                    project_name: element.project_name,
                    // vendor_name: element.vendor_name,
                    // location: element.location,
                    // description: element.description,
                    created_by: element.created_by_email,
                    reporting_to: element.reporting_to,
                    // date_paid: dayjs(new Date(element.date)).format('DD-MMM-YYYY'),
                    // date: dayjs(new Date(element.date)).format('YYYY-MM-DD'),
                    // vat_applicable: !!element.vat_applicable ? 'Yes' : 'No',
                    // vat_percent: !!element.vat_applicable ? element.vat_percentage+'%' : '',
                    // vat_percentage: !!element.vat_applicable ? element.vat_percentage : 0,
                    // amount_without_vat: element.amount_without_vat,
                    // vat_amount: !!element.vat_applicable ? element.vat_amount: 0.00,
                    // amount_with_vat: element.amount_with_vat,
                    amount: element.amount,
                    currency: element.currency,
                    subRows: element.details,
                    user_email: result.data.user_email,
                    user_id: result.data.user_id
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


    const total_amount = filteredData.reduce((sum, row) => sum + (row.amount || 0), 0);
    

    const handleEditVendorExpense = (ref_invoice_number, currency) => {

        const selectedRows = vendorExpenses
        .filter((row) => row.ref_invoice_number === ref_invoice_number && row.currency === currency)
        .map((row) => ({
          ...row,
          subRows: row.subRows
            .filter((subRow) => subRow.selected === true)
            .map((subRow) => ({
              ...subRow,
              is_vat: true,
              date: dayjs(new Date(subRow.date)).format('YYYY-MM-DD')
            })),
        }));

        if(selectedRows[0].subRows.length > 0){
            navigate('/', {
                state: {
                    vendor_expense_edit: true,
                    initialValues: {
                        ref_invoice_number: ref_invoice_number,
                        project_name: selectedRows[0].project_name,
                        expenses: selectedRows[0].subRows
                    }
                }
            })
        }else{
            alert('Please select the expenses you want to edit!')
        }
      


   
        
    };

    const handleDeleteSelectedRows = (ref_invoice_number, currency) => {
      const selectedRows = vendorExpenses
      .filter((row) => row.ref_invoice_number === ref_invoice_number && row.currency === currency)
      .map((row) => ({
        ...row,
        subRows: row.subRows
          .filter((subRow) => subRow.selected === true)
      }));

      if(selectedRows[0].subRows.length > 0){
          setLoading(true)
          AxiosInstance.post("/project_expense/delete_vendor_expense", {values : selectedRows[0].subRows})
          .then(function(response){
              if(response.data.status === 'SUCCESS'){
                 
                  alert(response.data.message)
                  setRefresh(!refresh)
              }else{
                  console.log(response.data.message)
              }
              setLoading(false)
              setConfirmDialog({...confirmDialog, delete: {...confirmDialog.delete, open:false}})
          })
          .catch(function(error){
              console.log(error)
          })

      }else{
          alert('Please select the expenses you want to delete!')
      }
       
    };

        
    const handleVerifySelectedRows = (ref_invoice_number, currency) => {
        const selectedRows = vendorExpenses
        .filter((row) => row.ref_invoice_number === ref_invoice_number && row.currency === currency)
        .map((row) => ({
          ...row,
          subRows: row.subRows
            .filter((subRow) => subRow.selected === true)
        }));

        setLoading(true)
        AxiosInstance.post("/project_expense/verify_vendor_expense", {values : selectedRows[0].subRows})
        .then(function(response){
            if(response.data.status === 'SUCCESS'){
                 
                alert(response.data.message)
                setRefresh(!refresh)
            }else{
                console.log(response.data.message)
            }
            setLoading(false)
            setConfirmDialog({...confirmDialog, verify: {...confirmDialog.verify, open:false}})
        })
        .catch(function(error){
            console.log(error)
        })
    }



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

    const handleCheckboxChange = (ref_invoice_number, project_vendor_expense_id, event) => {
        setVendorExpenses((vendorExpenses) => {
          const updatedVendorExpenses = vendorExpenses.map((row) =>
            row.ref_invoice_number === ref_invoice_number
              ? {
                  ...row,
                  subRows: row.subRows.map((subRow) =>
                    subRow.project_vendor_expense_id === project_vendor_expense_id
                      ? { ...subRow, selected: event.target.checked }
                      : subRow
                  ),
                }
              : row
          );
      
          // Calculate countVerifications using the updated state
          const countWaitingForVerifications = updatedVendorExpenses
            .filter((row) => row.ref_invoice_number === ref_invoice_number)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.project_vendor_expense_id === project_vendor_expense_id &&
                subRow.is_verified === 0 &&
                subRow.selected === true
              ).length;
            }, 0);


            const countVerified = updatedVendorExpenses
            .filter((row) => row.ref_invoice_number === ref_invoice_number)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.project_vendor_expense_id === project_vendor_expense_id &&
                subRow.is_verified === 1 &&
                subRow.selected === true
              ).length;
            }, 0);
      
          
          setVerifications({ref_invoice_number: ref_invoice_number, waiting_for_verification: countWaitingForVerifications, verified: countVerified});
      
          return updatedVendorExpenses;
        });
      };


      
  
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
            enableFullScreenToggle={false}
            enableExpandAll={false}
            enableRowActions
            initialState={{
                density: 'compact',
                isLoading: loading,
                columnPinning: { left: ['mrt-row-expand', 'mrt-row-actions', 'ref_invoice_number', 'project_name']}
            }}
            state={{
                isLoading: loading
            }}
            renderRowActions={({ row }) => (
                <Stack direction="row">
                    {row.original.created_by === row.original.user_email && <>
                    <IconButton color="success" onClick={()=>handleEditVendorExpense(row.original.ref_invoice_number, row.original.currency)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={()=>setConfirmDialog(
                        {...confirmDialog, delete: {open: true, 
                        content: (
                            <Stack direction="column" spacing={2}>
                                <Typography variant="subtitle1">DELETE</Typography>
                                <Typography variant="body1">Do you want to delete the selected expense?</Typography>
                                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                    <Button onClick={()=>setConfirmDialog({...confirmDialog, delete: {...confirmDialog.delete, open: false}})}>
                                        No
                                    </Button>
                                    <LoadingButton variant="contained" color="secondary" 
                                        onClick={()=>handleDeleteSelectedRows(confirmDialog.delete.ref_invoice_number, confirmDialog.delete.currency)}
                                        loading={loading}>
                                        Yes
                                    </LoadingButton>
                                </Stack>
                            </Stack>
                        )}})}>
                        <DeleteIcon />
                    </IconButton></> }
                    {(row.original.reporting_to === null || JSON.parse(row.original.reporting_to).user_id.some((user_id)=>user_id===row.original.user_id)) &&
                    
                    <>
                    <IconButton disabled={row.original.ref_invoice_number===verifications.ref_invoice_number && verifications.verified > 0 ? false : true} color="error" >
                        <UndoIcon />
                    </IconButton>
                    <IconButton disabled={row.original.ref_invoice_number===verifications.ref_invoice_number && verifications.waiting_for_verification > 0 ? false : true} 
                    color="secondary"
                    onClick={()=>setConfirmDialog(
                        {...confirmDialog, verify: {open: true, 
                        content: (
                            <Stack direction="column" spacing={2}>
                                <Typography variant="subtitle1">VERIFY</Typography>
                                <Typography variant="body1">Do you want to verify the selected expense?</Typography>
                                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                    <Button onClick={()=>setConfirmDialog({...confirmDialog, verify: {...confirmDialog.verify, open: false}})}>
                                        No
                                    </Button>
                                    <LoadingButton variant="contained" color="secondary" 
                                        onClick={()=>handleVerifySelectedRows(row.original.ref_invoice_number, row.original.currency)}
                                        loading={loading}>
                                        Yes
                                    </LoadingButton>
                                </Stack>
                            </Stack>
                        )}})} >
                        <CheckIcon />
                    </IconButton>
                    </>
                     
                    }
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
                    setVendorExpenses((vendorExpenses) =>
                        vendorExpenses.map((row) => ({
                          ...row,
                          subRows: row.subRows.map((subRow) => ({
                            ...subRow,
                            selected: false,
                          })),
                        }))
                      )

                    setVerifications({ref_invoice_number: "", count: 0})
                }, 
                sx: {
                  transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                },
              })}
              //conditionally render detail panel
              renderDetailPanel={({ row }) => {
                const subRows = row.original.subRows.filter((subRow)=>subRow.invoice_number === row.original.ref_invoice_number)
                return subRows.map((subRow, index)=>(
                 
                 <Stack direction="column"
                  >
                    <Paper square sx={{padding: 1}}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                   
                    {(subRow.is_verified===0 || subRow.is_returned===0) && 
                    <Checkbox size="small" checked={subRow.selected} onChange={(event)=>handleCheckboxChange(subRow.invoice_number, subRow.project_vendor_expense_id, event)} />}
                    <Box  sx={{
                        display: 'grid',
                        margin: 'auto',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                        width: '100%',
                        whiteSpace:'nowrap',
                        alignItems: 'center'
                    }}>
                    <Chip size="small" color={subRow.is_verified===1 ? "secondary" : subRow.is_returned === 1 ? "warning" : "info"} label={subRow.status} sx={{mr: 2}} />   
                    <Typography variant="body2"><b>Date: </b>{dayjs(new Date(subRow.date)).format('DD-MMM-YYYY')}</Typography>
                    <Typography variant="body2"><b>Vendor Name: </b>{subRow.vendor_name}</Typography>
                    <Typography variant="body2"><b>Location: </b>{subRow.location}</Typography>
                    <Typography variant="body2"><b>Description: </b>{subRow.description}</Typography>
                    <Typography variant="body2"><b>Amount w/o Vat: </b> 
                    &nbsp;<NumericFormat
                        value={subRow.amount_without_vat}
                        displayType={'text'}
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale={true}
                    /></Typography>
                    <Typography variant="body2"><b>Vat Amount:</b> 
                    &nbsp;<NumericFormat
                        value={subRow.vat_amount}
                        displayType={'text'}
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale={true}
                    /></Typography>
                    <Typography variant="body2"><b>Amount w/ Vat:</b> 
                    &nbsp;<NumericFormat
                        value={subRow.amount_with_vat}
                        displayType={'text'}
                        thousandSeparator={true}
                        decimalScale={2}
                        fixedDecimalScale={true}
                    /></Typography>
                    </Box>
                    </Stack>
                    </Paper>
                  </Stack>
                ))
                   
                  
              }}
                
               
                //) : null
            
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
                <Box sx={{paddingTop: 1, paddingLeft: 1, paddingRight: 1, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <VendorExpenseColumnFilter 
                columns={
                    columns.filter((column)=>column.accessorKey==='ref_invoice_number' 
                    || column.accessorKey==='project_name' 
                    || column.accessorKey==='vendor_name')
                } 
                onFilterChange={handleFilterChange}
                />
                   <Chip label={<>Total Amount: <NumericFormat
                    value={total_amount}
                    displayType={'text'}
                    thousandSeparator={true}
                    decimalScale={2}
                    fixedDecimalScale={true}
                    /></>} color="secondary" />
               </Box>
            )}
             />

             <Dialog open={confirmDialog.delete.open} content={confirmDialog.delete.content} />
             <Dialog open={confirmDialog.verify.open} content={confirmDialog.verify.content} />
            </Box>
    )
}
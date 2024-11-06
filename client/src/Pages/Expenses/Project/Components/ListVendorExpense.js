import React, {useEffect, useState, useRef} from 'react' 
import {Typography, Chip, Stack, Box, Button, Paper, IconButton, Checkbox, Tooltip, Badge} from '@mui/material'
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
        accessorKey: 'status',
        header: 'STATUS',
        width: 'fit-content',
        Cell: ({ renderedCellValue }) => (
        <Chip 
            label={renderedCellValue} 
            size="small"
            color={renderedCellValue === "VERIFIED" ? "secondary" : renderedCellValue==="RETURNED" ? "warning" : "info"} 
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
      accessorKey: 'amount_without_vat',
      header: 'AMOUNT w/o VAT',
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
    accessorKey: 'vat_amount',
    header: 'VAT AMOUNT',
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
        accessorKey: 'amount_with_vat',
        header: 'AMOUNT w/ VAT',
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
        accessorKey: 'currency',
        header: 'CURRENCY',
        width: 'fit-content',
    },
    {
      accessorKey: 'reporting_to_email',
      header: 'VERIFIER',
      width: 'fit-content',
      Cell: ({ renderedCellValue, row }) => {
        const emails = JSON.parse(renderedCellValue).email_address;
        return (
          <div>
            {emails.map((email, index) => (
              <Chip key={index} size="small" variant='outlined' label={email === null ? row.original.created_by : email} color={index % 2 === 0  ? 'secondary' : 'warning'} />
            ))}
          </div>
        );
      }
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
        return: {
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
        status: "",
        waiting_for_verification: 0,
        verified: 0,
        returned: 0
    });
    const [selectedStatus, setSelectedStatus] = useState({
      waiting_for_verification: true,
      returned: false,
      verified: false
    })

    const [countStatus, setCountStatus] = useState({
      waiting_for_verification: 0,
      returned: 0
    })
    useEffect(()=>{
      handleListVendorExpenses("WAITING FOR VERIFICATION")
    },[refresh])

    const handleListVendorExpenses = (status)=>{
      if(status === "WAITING FOR VERIFICATION"){
        setSelectedStatus({waiting_for_verification: true, returned: false, verified: false})
      }else if(status==="RETURNED"){
        setSelectedStatus({waiting_for_verification: false, returned: true, verified: false})
      }else{
        setSelectedStatus({waiting_for_verification: false, returned: false, verified: true})
      }
      setLoading(true)
      AxiosInstance.get("/project_expense/list_vendor_expense")
      .then(function(result){
          if(result.data.status === 'SUCCESS'){
              const fetchVendorExpenses = result.data.vendor_expenses
              .filter((element)=>element.status==="RETURNED" && element.report_to===null ? element.status===status : 
              element.status==="RETURNED" && element.report_to!==null ? element.created_by_email === result.data.user_email && element.status===status : element.status===status)
              .map((element) => ({
                  status: element.status,
                  ref_invoice_number: element.invoice_number,
                  project_name: element.project_name,
                  created_by: element.created_by_email,
                  reporting_to: element.reporting_to,
                  reporting_to_email: element.reporting_to_email,
                  amount_without_vat: element.amount_without_vat,
                  vat_amount: element.vat_amount,
                  amount_with_vat: element.amount_with_vat,
                  currency: element.currency,
                  vat_percentage: element.vat_percentage,
                  subRows: element.details.filter((detail)=>detail.status==="RETURNED" ? detail.created_by_email===result.data.user_email:detail.status===status),
                  waiting_count: element.details.filter((detail)=>detail.status==="WAITING FOR VERIFICATION").length,
                  returned_count: element.details.filter((detail)=>detail.status==="RETURNED" ? detail.created_by_email===result.data.user_email:detail.status===status).length,
                  user_email: result.data.user_email,
                  user_id: result.data.user_id,
                })); 
     
                const waitingStatus = result.data.vendor_expenses
                .filter(element => element.status === "WAITING FOR VERIFICATION")
                .map(element => ({
                    count: element.details.filter(detail => detail.status === "WAITING FOR VERIFICATION").length
                }));

                const returnedStatus = result.data.vendor_expenses
                .filter(element => element.status === "RETURNED")
                .map(element => ({
                    count: element.details.filter((detail)=>detail.status==="RETURNED" ? detail.created_by_email===result.data.user_email:detail.status===status).length
                }));

                const waiting_for_verification_count = waitingStatus.reduce((acc, curr) => acc + curr.count, 0);
                const returned_count = returnedStatus.reduce((acc, curr) => acc + curr.count, 0);

                
                setCountStatus({waiting_for_verification: waiting_for_verification_count, returned: returned_count})

                setVendorExpenses(fetchVendorExpenses)
                setLoading(false)
          }else{
              console.log(result.data.message)
          }
      })
      .catch(function(error){
          console.log(error)
      })
    }

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
           console.log(selectedRows[0])
            navigate('/', {
                state: {
                    vendor_expense_edit: true,
                    initialValues: {
                        ref_invoice_number: ref_invoice_number,
                        project_name: selectedRows[0].project_name,
                        currency: selectedRows[0].currency,
                        vat_percentage: selectedRows[0].vat_percentage,
                        expenses: selectedRows[0].subRows
                    }
                }
            })
        }else{
            alert('Please select the expenses you want to edit!')
        }
      


   
        
    };

    const handleDeleteSelectedRows = (ref_invoice_number, created_by, currency) => {
      const selectedRows = vendorExpenses
      .filter((row) => row.ref_invoice_number === ref_invoice_number && row.created_by === created_by && row.currency === currency)
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
              setVerifications({
                ref_invoice_number: "",
                created_by: "",
                waiting_for_verification: 0,
                verified: 0,
                returned: 0
              })
          })
          .catch(function(error){
              console.log(error)
          })

      }else{
          alert('Please select the expenses you want to delete!')
      }
       
    };

        
    const handleVerifySelectedRows = (ref_invoice_number,created_by, currency) => {
        const selectedRows = vendorExpenses
        .filter((row) => row.ref_invoice_number === ref_invoice_number && row.created_by === created_by && row.currency === currency)
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
            setVerifications({
                ref_invoice_number: "",
                waiting_for_verification: 0,
                verified: 0,
                returned: 0
              })
        })
        .catch(function(error){
            console.log(error)
        })
    }

    const handleReturnSelectedRows = (ref_invoice_number, created_by, currency) => {
        const selectedRows = vendorExpenses
        .filter((row) => row.ref_invoice_number === ref_invoice_number && row.created_by === created_by && row.currency === currency)
        .map((row) => ({
          ...row,
          subRows: row.subRows
            .filter((subRow) => subRow.selected === true)
        }));

        setLoading(true)
        AxiosInstance.post("/project_expense/return_vendor_expense", {values : selectedRows[0].subRows})
        .then(function(response){
            if(response.data.status === 'SUCCESS'){
                 
                alert(response.data.message)
                setRefresh(!refresh)
            }else{
                console.log(response.data.message)
            }
            setLoading(false)
            setConfirmDialog({...confirmDialog, return: {...confirmDialog.return, open:false}})
            setVerifications({
                ref_invoice_number: "",
                created_by: "",
                waiting_for_verification: 0,
                verified: 0,
                returned: 0
              })
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

    const handleCheckboxChange = (ref_invoice_number, status, project_vendor_expense_id, event) => {

        setVendorExpenses((vendorExpenses) => {
            const updatedVendorExpenses = vendorExpenses.map((row) => {
                if (row.ref_invoice_number === ref_invoice_number) {
                  const isAnyUnverifiedChecked = row.subRows.some(
                    (subRow) =>
                      subRow.project_vendor_expense_id === project_vendor_expense_id &&
                      subRow.is_verified === 0 &&
                      subRow.is_returned === 0 && 
                      event.target.checked
                  );
                  const isAnyVerifiedChecked = row.subRows.some(
                    (subRow) =>
                      subRow.project_vendor_expense_id === project_vendor_expense_id &&
                      subRow.is_verified === 1 &&
                      subRow.is_returned === 0 &&
                      event.target.checked
                  );
                  const isAnyReturnedChecked = row.subRows.some(
                    (subRow) =>
                      subRow.project_vendor_expense_id === project_vendor_expense_id &&
                      subRow.is_returned === 1 &&
                      subRow.is_verified === 0 &&
                      event.target.checked
                  );
              
                  return {
                    ...row,
                    subRows: row.subRows.map((subRow) => {
                      if (isAnyUnverifiedChecked && (subRow.is_verified === 1 || subRow.is_returned ===1) && subRow.selected) {
                        return { ...subRow, selected: false };
                      } 
                      else if (isAnyVerifiedChecked && subRow.is_verified === 0 && subRow.selected) {
                        return { ...subRow, selected: false };
                      } 
                      else if (isAnyReturnedChecked && subRow.is_returned === 0 && subRow.selected) {
                        return { ...subRow, selected: false };
                      } 
              
                      if (
                        subRow.project_vendor_expense_id === project_vendor_expense_id &&
                        subRow.is_verified === 0 &&
                        !isAnyReturnedChecked
                      ) {
                        return { ...subRow, selected: event.target.checked };
                      } 
                      else if (
                        subRow.project_vendor_expense_id === project_vendor_expense_id &&
                        subRow.is_verified === 1 &&
                        !isAnyReturnedChecked
                      ) {
                        return { ...subRow, selected: event.target.checked };
                      } 
                      else if (
                        subRow.project_vendor_expense_id === project_vendor_expense_id &&
                        subRow.is_returned === 1 &&
                        isAnyReturnedChecked
                      ) {
                        return { ...subRow, selected: event.target.checked };
                      } 
                      return subRow;
                    }),
                  };
                }
                return row;
              });
              
      
          // Calculate countVerifications using the updated state
          const countWaitingForVerifications = updatedVendorExpenses
            .filter((row) => row.ref_invoice_number === ref_invoice_number)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.is_verified === 0 &&
                subRow.selected === true 
              ).length;
            }, 0);

            const countReturned = updatedVendorExpenses
            .filter((row) => row.ref_invoice_number === ref_invoice_number)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.is_returned === 1 &&
                subRow.selected === true 
              ).length;
            }, 0);


            const countVerified = updatedVendorExpenses
            .filter((row) => row.ref_invoice_number === ref_invoice_number)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.is_verified === 1 &&
                subRow.selected === true
              ).length;
            }, 0);
      
          
          setVerifications({ref_invoice_number: ref_invoice_number, status: status, waiting_for_verification: countWaitingForVerifications, returned: countReturned, verified: countVerified});
      
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
                    {(row.original.created_by === row.original.user_email && selectedStatus.returned) && <>
                    <Tooltip title="Edit">
                        <IconButton disabled={row.original.ref_invoice_number===verifications.ref_invoice_number && row.original.status === verifications.status && verifications.returned > 0 ? false : true}  color="success" onClick={()=>handleEditVendorExpense(row.original.ref_invoice_number, row.original.currency)}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                    <IconButton disabled={row.original.ref_invoice_number===verifications.ref_invoice_number && row.original.status === verifications.status && verifications.returned  > 0 ? false : true}  color="error" onClick={()=>setConfirmDialog(
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
                                        onClick={()=>handleDeleteSelectedRows(row.original.ref_invoice_number, row.original.created_by, row.original.currency)}
                                        loading={loading}>
                                        Yes
                                    </LoadingButton>
                                </Stack>
                            </Stack>
                        )}})}>
                        <DeleteIcon />
                    </IconButton>
                    </Tooltip></> }
                    {((row.original.reporting_to === null || JSON.parse(row.original.reporting_to).user_id.some((user_id)=>user_id===row.original.user_id)) && (selectedStatus.waiting_for_verification || selectedStatus.verified)) &&
                    
                    <>
                    <Tooltip title="Return">
                        <IconButton disabled={row.original.ref_invoice_number===verifications.ref_invoice_number && row.original.status === verifications.status && (verifications.verified || verifications.waiting_for_verification) > 0 && verifications.returned === 0 ? false :
                        row.original.ref_invoice_number===verifications.ref_invoice_number && row.original.status === verifications.status && (verifications.verified || verifications.waiting_for_verification) === 0 && verifications.returned > 0 ? false : true} color="warning" 
                         onClick={()=>setConfirmDialog(
                            {...confirmDialog, return: {open: true, 
                            content: (
                                <Stack direction="column" spacing={2}>
                                    <Typography variant="subtitle1">RETURN</Typography>
                                    <Typography variant="body1">Do you want to return the selected expense?</Typography>
                                    <Stack direction="row" justifyContent="flex-end" spacing={2}>
                                        <Button onClick={()=>setConfirmDialog({...confirmDialog, return: {...confirmDialog.return, open: false}})}>
                                            No
                                        </Button>
                                        <LoadingButton variant="contained" color="secondary" 
                                            onClick={()=>handleReturnSelectedRows(row.original.ref_invoice_number, row.original.created_by, row.original.currency)}
                                            loading={loading}>
                                            Yes
                                        </LoadingButton>
                                    </Stack>
                                </Stack>
                            )}})} >
                            <UndoIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Verify">
                    <IconButton disabled={row.original.ref_invoice_number===verifications.ref_invoice_number && row.original.status === verifications.status && verifications.waiting_for_verification > 0 && verifications.returned === 0 ? false :
                        row.original.ref_invoice_number===verifications.ref_invoice_number && row.original.status === verifications.status && verifications.waiting_for_verification === 0 && verifications.returned > 0 ? true : true}
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
                                        onClick={()=>handleVerifySelectedRows(row.original.ref_invoice_number, row.original.created_by, row.original.currency)}
                                        loading={loading}>
                                        Yes
                                    </LoadingButton>
                                </Stack>
                            </Stack>
                        )}})} >
                        <CheckIcon />
                    </IconButton>
                    </Tooltip>
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

                    setVerifications({
                      ref_invoice_number: "",
                      created_by: "",
                      waiting_for_verification: 0,
                      verified: 0,
                      returned: 0
                    })
                }, 
                sx: {
                  transform: row.getIsExpanded() ? 'rotate(180deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                },
              })}
              //conditionally render detail panel
              renderDetailPanel={({ row }) => {
                const subRows = row.original.subRows.filter(subRow => subRow.invoice_number === row.original.ref_invoice_number);
            
                return (
                    <Stack direction="column">
                        <Paper square sx={{ padding: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="body2"><b>SELECT </b></Typography>
                                <Box
                                    sx={{
                                        display: 'grid',
                                        margin: 'auto',
                                        gridTemplateColumns: 'repeat(8, 1fr)',
                                        width: '100%',
                                        whiteSpace: 'nowrap',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Typography variant="body2"><b>CREATED BY </b></Typography>
                                    <Typography variant="body2"><b>DATE</b></Typography>
                                    <Typography variant="body2"><b>VENDOR NAME </b></Typography>
                                    <Typography variant="body2"><b>LOCATION </b></Typography>
                                    <Typography variant="body2"><b>DESCRIPTION </b></Typography>
                                    <Typography variant="body2"><b>AMOUNT w/o VAT </b></Typography>
                                    <Typography variant="body2"><b>VAT AMOUNT </b></Typography>
                                    <Typography variant="body2"><b>AMOUNT w/ VAT: </b></Typography>
                                </Box>
                            </Stack>
                        </Paper>
            
                        {subRows.map((subRow, index) => (
                            <Stack key={index} direction="column">
                                <Paper square sx={{ padding: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        {(subRow.is_verified === 0 || subRow.is_returned === 0) && (
                                            <Checkbox
                                                size="small"
                                                checked={subRow.selected}
                                                onChange={(event) => handleCheckboxChange(subRow.invoice_number, subRow.status, subRow.project_vendor_expense_id, event)}
                                            />
                                        )}
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                margin: 'auto',
                                                gridTemplateColumns: 'repeat(8, 1fr)',
                                                width: '100%',
                                                whiteSpace: 'nowrap',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Chip
                                                size="small"
                                                variant="outlined"
                                                color={subRow.is_verified === 1 ? "secondary" : subRow.is_returned === 1 ? "warning" : "info"}
                                                label={subRow.created_by_email}
                                                sx={{ mr: 2 }}
                                            />
                                            <Typography variant="body2">{dayjs(new Date(subRow.date)).format('DD-MMM-YYYY')}</Typography>
                                            <Typography variant="body2">{subRow.vendor_name}</Typography>
                                            <Typography variant="body2">{subRow.location}</Typography>
                                            <Typography variant="body2">{subRow.description}</Typography>
                                            <Typography variant="body2">
                                                <NumericFormat
                                                    value={subRow.amount_without_vat}
                                                    displayType={'text'}
                                                    thousandSeparator={true}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                            </Typography>
                                            <Typography variant="body2">
                                                <NumericFormat
                                                    value={subRow.vat_amount}
                                                    displayType={'text'}
                                                    thousandSeparator={true}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                            </Typography>
                                            <Typography variant="body2">
                                                <NumericFormat
                                                    value={subRow.amount_with_vat}
                                                    displayType={'text'}
                                                    thousandSeparator={true}
                                                    decimalScale={2}
                                                    fixedDecimalScale={true}
                                                />
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Stack>
                        ))}
                    </Stack>
                );
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
                <Box sx={{paddingTop: 1, paddingLeft: 1, paddingRight: 1, display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <VendorExpenseColumnFilter 
                  columns={
                      columns.filter((column)=>column.accessorKey==='ref_invoice_number' 
                      || column.accessorKey==='project_name' 
                      || column.accessorKey==='vendor_name')
                  } 
                  onFilterChange={handleFilterChange}
                  />
                  <Stack direction="row" spacing={2}>
                  <Badge
                    color="error"
                    badgeContent={countStatus.waiting_for_verification}>
                  <Chip variant={selectedStatus.waiting_for_verification ? "filled" : "outlined"} label="WAITING FOR VERIFICATION" color="info" onClick={()=>handleListVendorExpenses("WAITING FOR VERIFICATION")} />
                  </Badge>
                  <Badge
                    color="error"
                    badgeContent={countStatus.returned}>
                  <Chip variant={selectedStatus.returned ? "filled" : "outlined"} label="RETURNED" color="warning" onClick={()=>handleListVendorExpenses("RETURNED")} />
                  </Badge>
                  <Chip variant={selectedStatus.verified ? "filled" : "outlined"} label="VERIFIED" color="secondary" onClick={()=>handleListVendorExpenses("VERIFIED")} />
                  </Stack>
               </Box>
            )}
             />

             <Dialog open={confirmDialog.delete.open} content={confirmDialog.delete.content} />
             <Dialog open={confirmDialog.return.open} content={confirmDialog.return.content} />
             <Dialog open={confirmDialog.verify.open} content={confirmDialog.verify.content} />
            </Box>
    )
}
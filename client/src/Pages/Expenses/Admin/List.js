import React, {useEffect, useState, useRef} from 'react' 
import {Grid, Toolbar, Divider, Typography, Chip, Stack, Box, Button, Paper, IconButton, Checkbox, Tooltip, Badge, Table, TableHead, TableContainer, TableCell, TableRow, TableBody} from '@mui/material'
import LoadingButton from "@mui/lab/LoadingButton";
import AxiosInstance from '../../../AxiosInstance';
import {
    MaterialReactTable,
  } from 'material-react-table';
import { theme } from '../../../Theme';
import dayjs from 'dayjs';
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import UndoIcon from '@mui/icons-material/Undo';
import Dialog from '../../../Components/Dialog'
import numeral from 'numeral';

const columns=[
    
    {
        accessorKey: 'date',
        header: 'DATE',
        width: 'fit-content'
    },
    {
        accessorKey: 'created_by',
        header: 'CREATED BY',
        width: 'fit-content',
        Cell: ({ renderedCellValue, row }) => {
          const { status, user_reporting_to, user_email, created_by } = row.original;
        
          if (user_reporting_to === null && status==="VERIFIED") return null;
        
          const variant = status === "VERIFIED" || status === "RETURNED" 
            ? "filled" 
            : status === "WAITING FOR VERIFICATION" && user_email === created_by 
            ? "filled" 
            : "outlined";
        
          const color = status === "VERIFIED" 
            ? "secondary" 
            : status === "RETURNED" 
            ? "warning" 
            : "info";
        
          return (
            <Chip 
              label={renderedCellValue} 
              size="small"
              variant={variant}
              color={color}
            />
          );
        }
    },
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
              <Chip key={index} size="small" label={email === null ? row.original.created_by : email} />
            ))}
          </div>
        );
      }
  },
    
];

const formatNumber = (number) => {
  return numeral(number).format('0.00');
  };


export default function List(){
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
        date: "",
        created_by: "",
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

    const [vatPrices, setVatPrices] = useState([]);
   
    useEffect(()=>{
        handleListAdminExpenses("WAITING FOR VERIFICATION")
    },[refresh])

    const handleListAdminExpenses = (status)=>{
      
      setLoading(true)
      if(status === "WAITING FOR VERIFICATION"){
        setSelectedStatus({waiting_for_verification: true, returned: false, verified: false})
      }else if(status==="RETURNED"){
        setSelectedStatus({waiting_for_verification: false, returned: true, verified: false})
      }else if(status==="VERIFIED"){
        setSelectedStatus({waiting_for_verification: false, returned: false, verified: true})
      }
      AxiosInstance.get("/admin_expense/list")
      .then(function(result){
          if(result.data.status === 'SUCCESS'){
              const fetchVendorExpenses = result.data.admin_expenses
              .filter((element)=>(element.status==="RETURNED" || (element.status==="WAITING FOR VERIFICATION" && result.data.reporting_to!==null) || (element.status==="VERIFIED" && result.data.reporting_to!==null)) ? element.created_by_email === result.data.user_email && element.status === status
              : element.status==="WAITING FOR VERIFICATION" && element.reporting_to !== null && result.data.reporting_to===null ? JSON.parse(element.reporting_to).user_id.filter((user_id)=>user_id===result.data.user_id) && element.status===status
              : element.status === status)
              .map((element) => ({
                
                  date: dayjs(new Date(element.date)).format('DD-MMM-YYYY'),
                  raw_date: element.date,
                  status: element.status,
                  created_by: element.created_by_email,
                  reporting_to: element.reporting_to,
                  reporting_to_email: element.reporting_to_email,
                  amount_without_vat: element.amount_without_vat,
                  vat_amount: element.vat_amount,
                  amount_with_vat: element.amount_with_vat,
                  currency: element.currency,
                  vat_percentage: element.vat_percentage,
                  subRows: element.details,
                  user_reporting_to: result.data.reporting_to,
                  user_email: result.data.user_email,
                  user_id: result.data.user_id, 
                })); 


                // Merging logic
                const verifiedVendorExpenses = Object.values(fetchVendorExpenses.reduce((acc, curr) => {
                  const key = curr.invoice_number; // Use invoice number as key
                  if (!acc[key]) {
                    acc[key] = { ...curr }; // Initialize if not exists
                  } else {
                    // If exists, sum the amounts
                    acc[key].amount_without_vat += curr.amount_without_vat;
                    acc[key].vat_amount += curr.vat_amount;
                    acc[key].amount_with_vat += curr.amount_with_vat;
                    acc[key].subRows = acc[key].subRows.concat(curr.subRows);
                    // You can also merge other fields if necessary
                  }
                  return acc;
                }, {}));

                const waitingStatus = result.data.admin_expenses
                .filter(element => element.status === "WAITING FOR VERIFICATION")
                .map(element => ({
                    count: result.data.reporting_to !== null ? element.details.filter(detail => detail.created_by_email===result.data.user_email).length : element.details.length
                }));

                const returnedStatus = result.data.admin_expenses
                .filter(element => element.status === "RETURNED")
                .map(element => ({
                    count: element.details.filter((detail)=>detail.created_by_email===result.data.user_email).length
                }));

                const waiting_for_verification_count = waitingStatus.reduce((acc, curr) => acc + curr.count, 0);
                const returned_count = returnedStatus.reduce((acc, curr) => acc + curr.count, 0);

                
                setCountStatus({waiting_for_verification: waiting_for_verification_count, returned: returned_count})
                
                if(result.data.reporting_to === null && status==="VERIFIED"){
                  setVendorExpenses(verifiedVendorExpenses)
                }else{
                  setVendorExpenses(fetchVendorExpenses)
                }
                
                setLoading(false)
          }else{
              console.log(result.data.message)
          }
      })
      .catch(function(error){
          console.log(error)
      })
    }



   

    const handleEditAdminExpense = (raw_date, currency) => {

        const selectedRows = vendorExpenses
        .filter((row) => row.raw_date === raw_date && row.currency === currency)
        .map((row) => ({
          ...row,
          subRows: row.subRows
            .filter((subRow) => subRow.selected === true)
            // .map((subRow) => ({
            //   ...subRow,
            //   is_vat: true,
            //   date: dayjs(new Date(subRow.date)).format('YYYY-MM-DD')
            // })),
        }));
        if(selectedRows[0].subRows.length > 0){

          const selectedCurrency = vatPrices.find(element => element.currency === selectedRows[0].currency);
          
            navigate('/', {
                state: {
                    admin_expense_edit: true,
                    initialValues: {
                       
                        currency: selectedRows[0].currency,
                        vat_percentage: parseFloat(selectedCurrency.vat_percentage),
                        expenses: selectedRows[0].subRows.map((element)=>({
                          admin_expense_id: element.admin_expense_id,
                          date: dayjs(new Date(selectedRows[0].date)).format('YYYY-MM-DD'),
                          is_vat: element.vat_applicable,
                          description: element.description,
                          amount_without_vat: formatNumber(element.amount_without_vat),
                          vat_percentage: element.vat_percentage,
                          vat_amount: formatNumber(element.vat_amount),
                          amount_with_vat: formatNumber(element.amount_with_vat)
                        }))
                    }
                }
            })
        }else{
            alert('Please select the expenses you want to edit!')
        }
      


   
        
    };

    const handleDeleteSelectedRows = (raw_date, created_by, currency) => {
      const selectedRows = vendorExpenses
      .filter((row) => row.raw_date === raw_date && row.created_by === created_by && row.currency === currency)
      .map((row) => ({
        ...row,
        subRows: row.subRows
          .filter((subRow) => subRow.selected === true)
      }));

      if(selectedRows[0].subRows.length > 0){
          AxiosInstance.post("/admin_expense/delete_admin_expense", {values : selectedRows[0].subRows})
          .then(function(response){
              if(response.data.status === 'SUCCESS'){
                 
                  alert(response.data.message)
                  handleListAdminExpenses("RETURNED")
              }else{
                  console.log(response.data.message)
              }
             
              setConfirmDialog({...confirmDialog, delete: {...confirmDialog.delete, open:false}})
              setVerifications({
                date: "",
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

        
    const handleVerifySelectedRows = (raw_date,created_by, currency) => {
        const selectedRows = vendorExpenses
        .filter((row) => row.raw_date === raw_date && row.created_by === created_by && row.currency === currency)
        .map((row) => ({
          ...row,
          subRows: row.subRows
            .filter((subRow) => subRow.selected === true)
        }));

        AxiosInstance.post("/admin_expense/verify_admin_expense", {values : selectedRows[0].subRows})
        .then(function(response){
            if(response.data.status === 'SUCCESS'){
                 
                alert(response.data.message)
                handleListAdminExpenses("WAITING FOR VERIFICATION")
            }else{
                console.log(response.data.message)
            }
            setConfirmDialog({...confirmDialog, verify: {...confirmDialog.verify, open:false}})
            setVerifications({
                date: "",
                waiting_for_verification: 0,
                verified: 0,
                returned: 0
              })
        })
        .catch(function(error){
            console.log(error)
        })
    }

    const handleReturnSelectedRows = (raw_date, created_by, currency) => {
        const selectedRows = vendorExpenses
        .filter((row) => row.raw_date === raw_date && row.created_by === created_by && row.currency === currency)
        .map((row) => ({
          ...row,
          subRows: row.subRows
            .filter((subRow) => subRow.selected === true)
        }));

        AxiosInstance.post("/admin_expense/return_admin_expense", {values : selectedRows[0].subRows})
        .then(function(response){
            if(response.data.status === 'SUCCESS'){
                 
                alert(response.data.message)
                setRefresh(!refresh)
            }else{
                console.log(response.data.message)
            }
            setConfirmDialog({...confirmDialog, return: {...confirmDialog.return, open:false}})
            setVerifications({
                date: "",
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

    useEffect(()=>{
      AxiosInstance.get("/preferences/vat_pricing")
      .then(function(result){
        setVatPrices((vatPrices)=>{
          return result.data.vat_pricing.map((element)=>({
            currency: element.currency,
            vat_percentage: element.vat_percentage
          }))
        });
      })
      .catch(function(error){
        console.log(error)
      })



     },[])

    const handleCheckboxChange = (date, created_by, status, admin_expense_id, event) => {

        setVendorExpenses((vendorExpenses) => {
            const updatedVendorExpenses = vendorExpenses.map((row) => {
                if (row.raw_date === date) {
                  const isAnyUnverifiedChecked = row.subRows.some(
                    (subRow) =>
                      subRow.admin_expense_id === admin_expense_id &&
                      subRow.is_verified === 0 &&
                      subRow.is_returned === 0 && 
                      event.target.checked
                  );
                  const isAnyVerifiedChecked = row.subRows.some(
                    (subRow) =>
                      subRow.admin_expense_id === admin_expense_id &&
                      subRow.is_verified === 1 &&
                      subRow.is_returned === 0 &&
                      event.target.checked
                  );
                  const isAnyReturnedChecked = row.subRows.some(
                    (subRow) =>
                      subRow.admin_expense_id === admin_expense_id &&
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
                        subRow.admin_expense_id === admin_expense_id &&
                        subRow.is_verified === 0 &&
                        !isAnyReturnedChecked
                      ) {
                        return { ...subRow, selected: event.target.checked };
                      } 
                      else if (
                        subRow.admin_expense_id === admin_expense_id &&
                        subRow.is_verified === 1 &&
                        !isAnyReturnedChecked
                      ) {
                        return { ...subRow, selected: event.target.checked };
                      } 
                      else if (
                        subRow.admin_expense_id === admin_expense_id &&
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
            .filter((row) => row.raw_date === date)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.is_verified === 0 &&
                subRow.selected === true 
              ).length;
            }, 0);

            const countReturned = updatedVendorExpenses
            .filter((row) => row.raw_date === date)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.is_returned === 1 &&
                subRow.selected === true 
              ).length;
            }, 0);


            const countVerified = updatedVendorExpenses
            .filter((row) => row.raw_date === date)
            .reduce((count, row) => {
              return count + row.subRows.filter((subRow) =>
                subRow.is_verified === 1 &&
                subRow.selected === true
              ).length;
            }, 0);
      
          
          setVerifications({date: date, created_by: created_by, status: status, waiting_for_verification: countWaitingForVerifications, returned: countReturned, verified: countVerified});
      
          return updatedVendorExpenses;
        });
      };


      
  
    return(
        <React.Fragment>
        <Toolbar />
        {/* <Paper> */}
        <Grid container direction="column" spacing={2} sx={{paddingLeft: 2, paddingRight: 2, paddingTop: 2}}>
          <Grid item>
            <Typography variant="h6">LIST OF ADMIN EXPENSE</Typography>
          </Grid>

          <Grid item>
             <Divider />
          </Grid>

          </Grid>
          <Grid container direction="column" sx={{mt: 2, paddingLeft: 2, paddingRight: 2}}>
            <Grid item>

                <Box ref={stackRef}
                sx={{
                    width: "100%"
                }}>
                <MaterialReactTable
                columns={columns}
                data={vendorExpenses}
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
                    columnPinning: { left: ['mrt-row-expand', 'mrt-row-actions', 'invoice_number', 'project_name']}
                }}
                state={{
                    isLoading: loading
                }}
                renderRowActions={({ row }) => (
                    <Stack direction="row">
                        {(row.original.created_by === row.original.user_email && selectedStatus.returned) && <>
                        <Tooltip title="Edit">
                            <IconButton disabled={row.original.raw_date===verifications.date && row.original.status === verifications.status && verifications.returned > 0 ? false : true}  color="success" onClick={()=>handleEditAdminExpense(row.original.raw_date, row.original.currency)}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                        <IconButton disabled={row.original.raw_date===verifications.date && row.original.status === verifications.status && verifications.returned  > 0 ? false : true}  color="error" onClick={()=>setConfirmDialog(
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
                                            onClick={()=>handleDeleteSelectedRows(row.original.raw_date, row.original.created_by, row.original.currency)}
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
                            <IconButton disabled={(row.original.status==="WAITING FOR VERIFICATION" ? row.original.raw_date===verifications.date && row.original.created_by===verifications.created_by : row.original.raw_date===verifications.date) && row.original.status === verifications.status && (verifications.verified || verifications.waiting_for_verification) > 0 && verifications.returned === 0 ? false :
                            (row.original.status==="WAITING FOR VERIFICATION" ? row.original.raw_date===verifications.date && row.original.created_by===verifications.created_by : row.original.raw_date===verifications.date) && row.original.status === verifications.status && (verifications.verified || verifications.waiting_for_verification) === 0 && verifications.returned > 0 ? false : true} color="warning" 
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
                                                onClick={()=>handleReturnSelectedRows(row.original.raw_date, row.original.created_by, row.original.currency)}
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
                        {(row.original.status === "WAITING FOR VERIFICATION") && <IconButton disabled={row.original.raw_date===verifications.date && row.original.created_by===verifications.created_by && verifications.waiting_for_verification > 0 ? false : true}
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
                                            onClick={()=>handleVerifySelectedRows(row.original.raw_date, row.original.created_by, row.original.currency)}
                                            loading={loading}>
                                            Yes
                                        </LoadingButton>
                                    </Stack>
                                </Stack>
                            )}})} >
                            <CheckIcon />
                        </IconButton>}
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
                        date: "",
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
                    const subRows = row.original.subRows.filter(subRow => subRow.date === row.original.raw_date);
        
                    return (
                    <Paper square sx={{ padding: 1 }}>
                        <TableContainer>
                            <Table size="small">
                            <TableHead>
                                <TableCell>SELECT</TableCell>
                                {row.original.user_reporting_to === null && row.original.status==="VERIFIED" ? <TableCell>CREATED BY</TableCell> : null}
                                <TableCell>DESCRIPTION</TableCell>
                                <TableCell>AMOUNT w/o VAT</TableCell>
                                <TableCell>VAT AMOUNT</TableCell>
                                <TableCell>AMOUNT w/ VAT</TableCell>
                                {row.original.status==="VERIFIED" ? <TableCell>VERIFIED BY</TableCell> : row.original.status==="RETURNED" ? <TableCell>RETURNED BY</TableCell>:null}
                            </TableHead>
                            <TableBody>
                            {subRows.map((subRow, index) => (
                                <TableRow>
                                <TableCell>{(subRow.is_verified === 0 || subRow.is_returned === 0) && (
                                        <Checkbox
                                            size="small"
                                            checked={subRow.selected}
                                            onChange={(event) => handleCheckboxChange(subRow.date, subRow.created_by_email, subRow.status, subRow.admin_expense_id, event)}
                                        />
                                    )}</TableCell>
                                        {row.original.user_reporting_to === null && subRow.is_verified===1 ?<TableCell><Chip color="secondary" label={subRow.created_by_email} size="small" /></TableCell> : null}
                                
                                        <TableCell>{subRow.description}</TableCell>
                                        <TableCell>
                                            <NumericFormat
                                                value={subRow.amount_without_vat}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <NumericFormat
                                                value={subRow.vat_amount}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <NumericFormat
                                                value={subRow.amount_with_vat}
                                                displayType={'text'}
                                                thousandSeparator={true}
                                                decimalScale={2}
                                                fixedDecimalScale={true}
                                            />
                                        </TableCell>
                                        {subRow.is_verified===1 ? 
                                        <TableCell><Chip
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        label={subRow.returned_or_verified_by}
                                        /></TableCell>
                                        : subRow.is_returned===1 ? 
                                        <TableCell><Chip
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                        label={subRow.returned_or_verified_by}
                                        /></TableCell>
                                        :null}
                                        </TableRow> ))}
                            </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
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

                    <Stack direction="row" spacing={2}>
                    <Badge
                        color="error"
                        badgeContent={countStatus.waiting_for_verification}>
                    <Chip disabled={loading} variant={selectedStatus.waiting_for_verification ? "filled" : "outlined"} label="WAITING FOR VERIFICATION" color="info" onClick={()=>handleListAdminExpenses("WAITING FOR VERIFICATION")} />
                    </Badge>
                    <Badge
                        color="error"
                        badgeContent={countStatus.returned}>
                    <Chip disabled={loading} variant={selectedStatus.returned ? "filled" : "outlined"} label="RETURNED" color="warning" onClick={()=>handleListAdminExpenses("RETURNED")} />
                    </Badge>
                    <Chip disabled={loading} variant={selectedStatus.verified ? "filled" : "outlined"} label="VERIFIED" color="secondary" onClick={()=>handleListAdminExpenses("VERIFIED")} />
                    </Stack>
                </Box>
                )}
                />

                <Dialog open={confirmDialog.delete.open} content={confirmDialog.delete.content} />
                <Dialog open={confirmDialog.return.open} content={confirmDialog.return.content} />
                <Dialog open={confirmDialog.verify.open} content={confirmDialog.verify.content} />
                </Box>
            </Grid>
        </Grid>
        {/* </Paper> */}
    </React.Fragment>

    )
}
import React, {useState, useEffect, useMemo, useContext} from 'react';
import {Toolbar, Typography, Grid, Chip, Link, Checkbox, Button, Box, Paper} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';
// import { DataGrid } from "@mui/x-data-grid";
import AxiosInstance from '../../AxiosInstance';
import { theme } from '../../Theme';
import { blue } from '@mui/material/colors';


function createMessageHandler(quotation_number, setRefresh, refresh) {
  return function handleMessage(event) {
      if (event.data === "childClosed") {
          AxiosInstance.post("/quotation/unlock", { quotation_number: quotation_number })
              .then(function(response) {
                setRefresh(!refresh)
              })
              .catch(function(error) {
                  console.error("Axios error:", error.response ? error.response.data : error.message);
              });
          window.removeEventListener('message', handleMessage);
      }
  };
}



// const calculateColumnWidth = (rows, field) => {
//   const maxLength = Math.max(
//     ...rows.map(row => String(row[field]).length),
//     field.length
//   );
//   return maxLength * 10; // Adjust multiplier as needed
// }

    const parentHeight = window.innerHeight;
    const parentWidth = window.innerWidth;
  
    // Calculate the center position
    const top = (window.innerHeight - parentHeight) / 2;
    const left = (window.innerWidth - parentWidth) / 2;

const columns = [
    {
      accessorKey: 'quotation_number', //normal accessorKey
      header: 'QUOTATION NO.',
      Cell: ({ renderedCellValue, row }) =>(
        <Link href="#" color="secondary" variant="outlined" onClick={()=>{
       
           // Open a new window with the quotation details
           window.open(
                `https://3000-okkin123-sparksms-3bd5wpxfxws.ws-us115.gitpod.io/quotation/details?quotation_number=${renderedCellValue}&ref=${row.original.refresh.refresh}`,
                "_blank",
                `location=yes,height=${parentHeight},width=${parentWidth},scrollbars=yes,status=yes,left=${left},top=${top}`
            );

            // Create the handler with the specific quotation number
            const messageHandler = createMessageHandler(renderedCellValue, row.original.refresh.setRefresh, row.original.refresh.refresh);

            // Add the event listener
            window.addEventListener('message', messageHandler);
        }}>{renderedCellValue}</Link>
      )
    },
    {
      accessorKey: 'status',
      header: 'STATUS',
      Cell: ({renderedCellValue, row}) => (
      <Typography variant="p"
      sx={{
        color: renderedCellValue === "APPROVED" ? theme.palette.success.main : renderedCellValue === "RETURNED" ? theme.palette.warning.main : renderedCellValue === "WAITING FOR APPROVAL" ? theme.palette.primary.main : theme.palette.error.main
      }}
      >{renderedCellValue}</Typography>
      )
    },
    {
      accessorKey: 'created_by',
      header: 'CREATED BY',
      Cell: ({renderedCellValue, row}) =>  <Chip label={renderedCellValue} />
    },
    {
      accessorKey: 'client_name',
      header: 'CLIENT NAME'
    },
    {
      accessorKey: 'attention_to',
      header: 'ATTENTION TO'
    },
    {
      accessorKey: 'project_name',
      header: 'PROJECT NAME'
    },
    {
      accessorKey: 'project_description',
      header: 'PROJECT DESCRIPTION'
    },
    {
      accessorKey: 'cost_without_vat',
      header: 'COST w/o VAT'
    },
    {
      accessorKey: 'vat_amount',
      header: 'VAT AMOUNT'
    },
    {
      accessorKey: 'cost_with_vat',
      header: 'COST w/ VAT'
    },
    {
      accessorKey: 'assigned_to',
      header: 'ASSIGNED TO',
      Cell: ({renderedCellValue, row})=>{
            const emails = JSON.parse(renderedCellValue).email_address;
            return (
              <div>
                {emails.map((email, index) => (
                  <Chip key={index} label={email} color={index % 2 === 0  ? 'secondary' : 'success'} />
                ))}
              </div>
            );
      }
    },
  ];

export default function List(props){
  const [quotations, setQuotations] = useState([]);
  const [adjustedColumns, setAdjustedColumns] = useState(columns);
  const [refresh, setRefresh] = useState(false)
  const [loading, setLoading] = useState(false)


  useEffect(() => {

    setLoading(true)
    AxiosInstance.get("/quotation/list")
      .then((result) => {
        if (result.data.status === "SUCCESS") {
          const fetchedQuotations = result.data.quotations.map((element) => ({
            //locked: !!element.locked,
            quotation_number: element.quotation_number,
            status: element.STATUS,
            created_by: element.created_by_email,
            client_name: element.client_name,
            attention_to: element.attention_to,
            project_name: element.project_name,
            project_description: element.project_description,
            cost_without_vat: element.amount_without_vat,
            vat_amount: element.vat_amount,
            cost_with_vat: element.amount_with_vat,
            assigned_to: element.assigned_to_email,
            refresh: {setRefresh: setRefresh, refresh: refresh}
          })); 
          setQuotations(fetchedQuotations);

          setLoading(false)


          // const updatedColumns = columns.map(column => ({
          //   ...column,
          //   width: calculateColumnWidth(fetchedQuotations, column.field),
          // }));
          // setAdjustedColumns(updatedColumns);

         
        } else {
          console.log(result.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });


       // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);



    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
              
              <Grid item>
                <Typography variant="h6">QUOTATION LIST</Typography>
              </Grid> 
              {props.message}
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
                  columnPinning: { left: ['quotation_number', 'status'] },
                  showGlobalFilter: true,
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
                 columns={columns} data={quotations} />
                
                 </Box>
                 </Paper>
              </Grid>
              {/* <Grid item sx={{ width: "100%"}}>
                <DataGrid
                  autoHeight  
                  rows={quotations}
                  columns={adjustedColumns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[10, 20]}
                  disableRowSelectionOnClick
                  density="compact"
                />
              </Grid> */}
            </Grid>
        </React.Fragment>
    )
}
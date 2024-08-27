import React, {useState, useEffect, useMemo, useContext} from 'react';
import {Toolbar, Typography, Grid, Chip, Link, Checkbox, Button} from '@mui/material';
import {
  MaterialReactTable,
  useMaterialReactTable
} from 'material-react-table';
// import { DataGrid } from "@mui/x-data-grid";
import AxiosInstance from '../../AxiosInstance';
import { theme } from '../../Theme';


function createMessageHandler(quotation_number) {
  return function handleMessage(event) {
      if (event.data === "childClosed") {
          AxiosInstance.post("/quotation/unlock", { quotation_number: quotation_number })
              .then(function(response) {
              })
              .catch(function(error) {
                  console.error("Axios error:", error.response ? error.response.data : error.message);
              });
          window.removeEventListener('message', handleMessage);
      }
  };
}

// const columns = [
//     {field: "locked",headerName:"LOCKED",headerAlign: 'center', renderCell:(params)=><Checkbox checked={params.value} />},
    // { field: "id", headerName: "QUOTATION #", renderCell: (params) => {
    //   const parentHeight = window.innerHeight;
    //   const parentWidth = window.innerWidth;
    
    //     // Calculate the center position
    //     const top = (window.innerHeight - parentHeight) / 2;
    //     const left = (window.innerWidth - parentWidth) / 2;
        
    //     if(!params.row.locked)
    //     { 
    //     return (
    //       <Link
    //         href="#"
    //         onClick={() => {
    //           // Open a new window with the quotation details
    //        window.open(
    //             `http://localhost:3000/quotation/details?quotation_number=${params.value}&ref=${params.row.refresh.refresh}`,
    //             "_blank",
    //             `location=yes,height=${parentHeight},width=${parentWidth},scrollbars=yes,status=yes,left=${left},top=${top}`
    //         );

    //         // Create the handler with the specific quotation number
    //         const messageHandler = createMessageHandler(params.value);

    //         // Add the event listener
    //         window.addEventListener('message', messageHandler);

    //         } }
    //         variant="outlined"
    //         color="secondary"
    //       >
    //         {params.value}
    //       </Link>
    //     )
    //     }
    //     else
    //     {
    //       return params.value
    //     }

    //   }},
//     { field: "status", headerName: "STATUS", renderCell: (params)=>(
//       <Typography variant="p"
//       sx={{
//         color: params.value === "APPROVED" ? theme.palette.success.main : params.value === "RETURNED" ? theme.palette.warning.main : params.value === "WAITING FOR APPROVAL" ? theme.palette.primary.main : theme.palette.error.main
//       }}
//       >{params.value}</Typography>
//     )},
//     { field: "created_by", headerName: "CREATED BY", renderCell: (params)=>(
//       <Chip label={params.value} />
//     )},
//     { field: "client_name", headerName: "CLIENT NAME" },
//     { field: "attention_to", headerName: "ATTENTION TO" },
//     { field: "project_name", headerName: "PROJECT NAME" },
//     { field: "project_description", headerName: "PROJECT DESCRIPTION"},
//     { field: "assigned_to", headerName: "ASSIGNED TO", renderCell: (params) => {
//       const emails = JSON.parse(params.value).email_address;
//       return (
//         <div>
//           {emails.map((email, index) => (
//             <Chip key={index} label={email} color={index % 2 === 0  ? 'warning' : 'success'} />
//           ))}
//         </div>
//       );
//     }}
    
//   ];




// const calculateColumnWidth = (rows, field) => {
//   const maxLength = Math.max(
//     ...rows.map(row => String(row[field]).length),
//     field.length
//   );
//   return maxLength * 10; // Adjust multiplier as needed
// }


const columns = [
    {
      accessorKey: 'quotation_number', //normal accessorKey
      header: 'QOUTATION NO',
    },
    {
      accessorKey: 'status',
      header: 'STATUS'
    },
    {
      accessorKey: 'created_by',
      header: 'CREATED BY'
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
      accessorKey: 'created_by',
      header: 'CREATED BY'
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
            //refresh: {setRefresh: setRefresh, refresh: refresh}
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
                 <MaterialReactTable
                 enableDensityToggle={false}
                 enableColumnFilters={false}
                 enableSorting={false}
                 enableColumnFilters={false}
                 enableColumnActions={false}
                 initialState={{
                  density: 'compact',
                  isLoading: loading
                 }}
                 columns={columns} data={quotations} />
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
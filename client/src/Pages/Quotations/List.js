import React, {useState, useEffect} from 'react';
import {Toolbar, Typography, Grid, Chip, Link, IconButton, Stack} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataGrid } from "@mui/x-data-grid";
import AxiosInstance from '../../AxiosInstance';


const columns = [
    { field: "actions", headerName: "ACTIONS", renderCell: (params)=>{

          if(params.value.current_user_email === params.value.created_by){
            return (
              <div>
                {
                params.value.status === "RETURNED" ? (
                <Stack direction="row">
                  <IconButton color="success">
                      <EditIcon />
                  </IconButton>
                    <IconButton color="error" onClick={()=>handleDeleteQuotation(params.value.quotation_number, params.value.set_refresh, params.value.refresh)}>
                    <DeleteIcon />
                  </IconButton>
                  </Stack>
              ) : params.value.status === "pending for approval" ? (
                  <IconButton color="error" onClick={()=>handleDeleteQuotation(params.value.quotation_number)}>
                      <DeleteIcon />
                  </IconButton>
              ) : null}
            </div>
            )
          }  
          
          return null;

    }},
    { field: "id", headerName: "QUOTATION #", renderCell: (params) => {
      const parentHeight = window.innerHeight;
      const parentWidth = window.innerWidth;
    
        // Calculate the center position
        const top = (window.innerHeight - parentHeight) / 2;
        const left = (window.innerWidth - parentWidth) / 2;
        
        return (
          <Link
            href="#"
            onClick={() =>
              window.open(
                `https://reimagined-invention-4rw965xj75ghq599-3000.app.github.dev/quotation/details?quotation_number=${params.value}`,
                //`http://localhost:3000/quotation/details?quotation_number=${params.value}`,
                "_blank",
                `location=yes,height=${parentHeight},width=${parentWidth},scrollbars=yes,status=yes,left=${left},top=${top}`
              )
            }
            variant="outlined"
            color="secondary"
          >
            {params.value}
          </Link>
        );
      }},
    { field: "status", headerName: "STATUS"},
    { field: "created_by", headerName: "CREATED BY", renderCell: (params)=>(
      <Chip label={params.value} />
    )},
    { field: "client_name", headerName: "CLIENT NAME" },
    { field: "attention_to", headerName: "ATTENTION TO" },
    { field: "project_name", headerName: "PROJECT NAME" },
    { field: "project_description", headerName: "PROJECT DESCRIPTION"},
    { field: "assigned_to", headerName: "ASSIGNED TO", renderCell: (params) => {
      const emails = JSON.parse(params.value).email_address;
      return (
        <div>
          {emails.map((email, index) => (
            <Chip key={index} label={email} color={index % 2 === 0  ? 'warning' : 'success'} />
          ))}
        </div>
      );
    }}
    
  ];

const calculateColumnWidth = (rows, field) => {
  const maxLength = Math.max(
    ...rows.map(row => String(row[field]).length),
    field.length
  );
  return maxLength * 10; // Adjust multiplier as needed
};

const handleDeleteQuotation = (quotation_number, setRefresh, refresh)=>{
  AxiosInstance.post("/quotation/delete", {quotation_number: quotation_number})
  .then(function(response){
    alert(response.data.message)
    setRefresh(!refresh)
  })
  .catch(function(error){
    console.log(error)
  })
}


export default function List(props){
  const [quotations, setQuotations] = useState([]);
  const [adjustedColumns, setAdjustedColumns] = useState(columns);
  const [refresh, setRefresh] = useState(false)

  useEffect(() => {
 
    AxiosInstance.get("/quotation/list")
      .then((result) => {
        if (result.data.status === "SUCCESS") {
          const fetchedQuotations = result.data.quotations.map((element) => ({
            actions: {quotation_number: element.quotation_number, 
              status: element.STATUS, 
              created_by: element.created_by_email, 
              current_user_email: props.current_user_email,
              set_refresh : setRefresh, refresh: refresh},
            id: element.quotation_number,
            status: element.STATUS,
            created_by: element.created_by_email,
            client_name: element.client_name,
            attention_to: element.attention_to,
            project_name: element.project_name,
            project_description: element.project_description,
            assigned_to: element.assigned_to_email
          }));
          setQuotations(fetchedQuotations);

          const updatedColumns = columns.map(column => ({
            ...column,
            width: calculateColumnWidth(fetchedQuotations, column.field),
          }));
          setAdjustedColumns(updatedColumns);
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
              <Grid item sx={{ width: "100%"}}>
                <DataGrid
                  autoHeight  
                  rows={quotations}
                  columns={adjustedColumns}
                  initialState={{
                    pagination: {
                      paginationModel: { page: 0, pageSize: 20 },
                    },
                  }}
                  pageSizeOptions={[10, 20]}
                  disableRowSelectionOnClick
                  checkboxSelection
                  density="compact"
                />
              </Grid>
            </Grid>
        </React.Fragment>
    )
}
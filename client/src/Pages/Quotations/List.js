import React, {useState, useEffect} from 'react';
import {Toolbar, Typography, Grid, Chip, Link, Collapse, IconButton, Alert} from '@mui/material';
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import AxiosInstance from '../../AxiosInstance';


const columns = [
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
    { field: "status", headerName: "STATUS" },
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

export default function List(props){
  const [quotations, setQuotations] = useState([]);
  const [adjustedColumns, setAdjustedColumns] = useState(columns);
  const [open, setOpen] = useState(props.alertMessage === null ? false : true)

  useEffect(() => {
    AxiosInstance.get("/quotation/list")
      .then((result) => {
        if (result.data.status === "SUCCESS") {
          const fetchedQuotations = result.data.quotations.map((element) => ({
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
  }, []);

    


    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
              
              <Grid item>
                <Typography variant="h6">QUOTATION LIST</Typography>
              </Grid>
              <Grid item>
                { !props.alertMessage ? null : <Collapse in={open}>
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="success"
                  >
                    {props.alertMessage}
                  </Alert>
                </Collapse> }
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
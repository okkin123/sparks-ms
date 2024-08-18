import React, {useState, useEffect} from 'react';
import { Toolbar, Typography, Grid} from '@mui/material';
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import dayjs from 'dayjs';
import AxiosInstance from '../../AxiosInstance';

const columns: GridColDef[] = [
    { field: "id", headerName: "QUOTATION #", width: 100 },
    { field: "status", headerName: "STATUS", width: 200 },
    { field: "created_by", headerName: "CREATED BY", width: 130 },
    { field: "created_on", headerName: "CREATED ON", width: 130 },
    { field: "assigned_to", headerName: "ASSIGNED TO", width: 130 },
    { field: "client_name", headerName: "CLIENT NAME", width: 250 },
    { field: "attention_to", headerName: "ATTENTION TO", width: 130 },
    { field: "project_name", headerName: "PROJECT NAME", width: 130 },
    { field: "project_description", headerName: "PROJECT DESCRIPTION", width: 130 },
  
    
  ];

export default function List(){
    const [quotations, setQuotations] = useState([]);

    useEffect(()=>{
        setQuotations([]);
        AxiosInstance.get("/quotation/list")
          .then((result) => {
            console.log(result.data)
            if(result.data.status === "SUCCESS")
            {
                setQuotations((quotations) => [
                    ...result.data.quotations.map((element) => ({
                      id: element.quotation_number,
                      status: element.STATUS,
                      created_by: element.created_by_email,
                      created_on: dayjs(new Date(element.created_on)).format('YYYY-MM-DD'),
                      assigned_to: element.assigned_to_email,
                      client_name: element.client_name,
                      attention_to: element.attention_to,
                      project_name: element.project_name,
                      project_description: element.project_description
                    })),
                  ]);
            }
            else
            {
                console.log(result.data.message)
            }

          })
          .catch((error) => {
            console.log(error);
          });
    }, [])
    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
               <Grid item>
                 <Typography variant="h6">QUOTATION LIST</Typography>
               </Grid>
               <Grid item style={{ height: 500, width: "100%" }}>
                <DataGrid
                    rows={quotations}
                    columns={columns}
                    initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 10 },
                    },
                    }}
                    pageSizeOptions={[5, 10]}
                    checkboxSelection
                />
                </Grid>
            </Grid>
        </React.Fragment>
    )
}
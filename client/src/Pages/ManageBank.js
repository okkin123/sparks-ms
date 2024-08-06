import React, {useEffect, useState} from 'react';
import { Typography, Grid, Toolbar, Button, Modal, Box, TextField} from '@mui/material';
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import AxiosInstance from "../AxiosInstance";
import * as Yup from 'yup';
import { useFormik } from 'formik';

const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "name", headerName: "NAME", width: 200 },
    { field: "address", headerName: "ADDRESS", width: 250 },
    { field: "account_number", headerName: "ACCOUNT #", width: 130 },
    { field: "iban", headerName: "IBAN #", width: 130 },
    { field: "swift_code", headerName: "SWIFT CODE", width: 130 },
    { field: "routing_code", headerName: "ROUTING CODE", width: 130 },
    { field: "date_time_added", headerName: "ADDED ON", width: 130 },
  ];

const style = {
position: "absolute",
top: "50%",
left: "50%",
transform: "translate(-50%, -50%)",
width: 500,
bgcolor: "background.paper",
boxShadow: 15,
p: 2,
};

const BankSchema = Yup.object().shape({
    name: Yup.string().required("This field is required!"),
    address: Yup.string().required("This field is required!"),
    account_number: Yup.number()
    .typeError("Please enter numbers only!")
    .positive("Must be positive numbers")
    .required("This field is required!"),
    iban: Yup.string().required("This field is required!"),
    swift_code: Yup.string().required("This field is required!"),
    routing_code: Yup.string().required("This field is required!"),
});


export default function ManageBank(){
    const [banks, setBanks] = useState([]);
    const [open, setOpen] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [refresh, setRefresh] = useState(false);
    
    useEffect(()=>{
        setBanks([]);
        AxiosInstance.get("/bank/list")
        .then(function(result){
            setBanks((banks) => [
                ...result.data.map((element) => ({
                  id: element.bank_id,
                  name: element.name,
                  address: element.address,
                  account_number: element.account_number,
                  iban: element.iban,
                  swift_code: element.swift_code,
                  routing_code: element.routing_code,
                  date_time_added: element.date_time_added,
                })),
              ]);
        })
        .catch(function(error){
            console.log(error)
        })
    },[refresh])

    const formik = useFormik({
        initialValues: {
          name: "",
          address: "",
          account_number: "",
          iban: "",
          swift_code: "",
          routing_code: "",
        },
        validationSchema: BankSchema,
        validateOnChange: false,
        onSubmit: (values, { validateForm }) => {
            AxiosInstance.post("/bank/add", values)
            .then(function(response){
                if(response.data.status === "SUCCESS")
                {
                    setOpen(false);
                    setResponseMessage(response.data.message);
                    setRefresh(!refresh);
                }
                else
                {
                    validateForm(values)
                }
            })
            .catch(function(error){
                console.log(error)
            })
        },
      });

    return(
        <React.Fragment>
            <Toolbar />
            <Grid container direction="column" spacing={2}>
                <Grid item container justifyContent="space-between">
                    <Grid item>
                      <Typography>Manage Banks</Typography>
                    </Grid>
                    <Grid item>
                      <Button variant="contained" color="secondary" onClick={()=>setOpen(true)}>Add Bank</Button>
                      <Modal
                        open={open}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                        >
                        <Box sx={style}>
                            <Grid container direction="column" spacing={2}>
                                <Grid item>
                                <Typography variant="h6">
                                    ADD BANK
                                </Typography>
                                </Grid>
                                <Grid item>
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    name="name"
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    error={
                                      formik.touched.name && Boolean(formik.errors.name)
                                    }
                                    helperText={
                                      formik.touched.name && formik.errors.name
                                    }
                                    fullWidth
                                    />
                                </Grid>
                                <Grid item>
                                    <TextField
                                        label="Address"
                                        variant="outlined"
                                        name="address"
                                        multiline
                                        rows={2}
                                        value={formik.values.address}
                                        onChange={formik.handleChange}
                                        error={
                                        formik.touched.address && Boolean(formik.errors.address)
                                        }
                                        helperText={
                                        formik.touched.address && formik.errors.address
                                        }
                                        fullWidth
                                        />
                                </Grid>
                                <Grid item>
                                <TextField
                                    label="Account Number"
                                    variant="outlined"
                                    name="account_number"
                                    value={formik.values.account_number}
                                    onChange={formik.handleChange}
                                    error={
                                      formik.touched.account_number && Boolean(formik.errors.account_number)
                                    }
                                    helperText={
                                      formik.touched.account_number && formik.errors.account_number
                                    }
                                    fullWidth
                                    />
                                </Grid>
                                <Grid item>
                                <TextField
                                    label="IBAN Number"
                                    variant="outlined"
                                    name="iban"
                                    value={formik.values.iban}
                                    onChange={formik.handleChange}
                                    error={
                                      formik.touched.iban && Boolean(formik.errors.iban)
                                    }
                                    helperText={
                                      formik.touched.iban && formik.errors.iban
                                    }
                                    fullWidth
                                    />
                                </Grid>
                                <Grid item>
                                <TextField
                                    label="Swift Code"
                                    variant="outlined"
                                    name="swift_code"
                                    value={formik.values.swift_code}
                                    onChange={formik.handleChange}
                                    error={
                                      formik.touched.swift_code && Boolean(formik.errors.swift_code)
                                    }
                                    helperText={
                                      formik.touched.swift_code && formik.errors.swift_code
                                    }
                                    fullWidth
                                    />
                                </Grid>
                                <Grid item>
                                <TextField
                                    label="Routing Code"
                                    variant="outlined"
                                    name="routing_code"
                                    value={formik.values.routing_code}
                                    onChange={formik.handleChange}
                                    error={
                                      formik.touched.routing_code && Boolean(formik.errors.routing_code)
                                    }
                                    helperText={
                                      formik.touched.routing_code && formik.errors.routing_code
                                    }
                                    fullWidth
                                    />
                                </Grid>
                                <Grid item container justifyContent="flex-end">
                                    <Grid item>
                                        <Button variant="text" color="secondary" onClick={()=>setOpen(false)}>Cancel</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" color="secondary" onClick={formik.handleSubmit}>Save</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                        </Modal>
                    </Grid>
                </Grid>
                {responseMessage === '' ? 
                <Grid item>
                    <Typography variant="subtitle1">{responseMessage}</Typography>
                </Grid>: null}
                <Grid item style={{ height: 500, width: "100%" }}>
                    <DataGrid
                        rows={banks}
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
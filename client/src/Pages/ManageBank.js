import React, {useEffect, useState} from 'react';
import { Typography, 
  Grid, 
  Toolbar, 
  Button, 
  Modal, 
  Box, 
  TextField,
  Card,
  CardHeader,
  CardContent,
  IconButton,
  Collapse,
  Alert} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';

import { format } from 'date-fns';
import AxiosInstance from "../AxiosInstance";
import * as Yup from 'yup';
import { useFormik } from 'formik';


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
    benificiary: Yup.string().required("This field is required!"),
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

const BankDetails = (props)=>
{
  return(
    <Modal
      open={props.open}
      >
      <Box sx={style}>
          <Grid container direction="column" spacing={2}>
              <Grid item>
              <Typography variant="h6">
                  {props.title}
              </Typography>
              </Grid>
              
              <Grid item>
              <TextField
                  label="Benificiary"
                  variant="outlined"
                  name="benificiary"
                  value={props.benificiary_value}
                  onChange={props.benificiary_onChange}
                  error={
                    props.benificiary_error
                  }
                  helperText={
                    props.benificiary_helperText
                  }
                  fullWidth
                  />
              </Grid>
              {/* <Grid item>
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
              </Grid> */}
              <Grid item container justifyContent="flex-end">
                  <Grid item>
                      <Button variant="text" color="primary" onClick={props.onCancel}>Cancel</Button>
                  </Grid>
                  <Grid item>
                      {props.action}
                  </Grid>
              </Grid>
          </Grid>
      </Box>
    </Modal>
  )
  
}


export default function ManageBank(){
    const [banks, setBanks] = useState([]);
    const [open, setOpen] = useState(false);
    const [response, setResponse] = useState({
      icon: null,
      open: false,
      message: '',
      severity: ''
    })
    const [refresh, setRefresh] = useState(false);
    
    useEffect(()=>{
        setBanks([]);
        AxiosInstance.get("/bank/list")
        .then(function(result){
            setBanks((banks) => [
                ...result.data.map((element) => ({
                  editMode: false,
                  bank_id: element.bank_id,
                  benificiary: element.benificiary,
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
          benificiary: "",
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
                   
                    setRefresh(!refresh);
                    setResponse({
                      icon: (<CheckIcon color='inherit'/>),
                      open: true,
                      message: response.data.message,
                      severity: response.data.status.toLowerCase()
                    });
                }
                else
                {
                    validateForm(values)
                    setResponse({
                      icon: (<ErrorIcon color='inherit'/>),
                      open: true,
                      message: response.data.message,
                      severity: response.data.status.toLowerCase()
                    });
                }

              
            })
            .catch(function(error){
                console.log(error)
            })
        },
      });

    const handleDelete = (bank_id)=>
    {
      AxiosInstance.post("/bank/delete", {bank_id: bank_id})
      .then(function(response){
        if(response.data.status === "SUCCESS")
          {
              setRefresh(!refresh);
              setResponse({
                icon: (<CheckIcon color='inherit'/>),
                open: true,
                message: response.data.message,
                severity: response.data.status.toLowerCase()
              });
          }
          else
          {
              setResponse({
                icon: (<ErrorIcon color='inherit'/>),
                open: true,
                message: response.data.message,
                severity: response.data.status.toLowerCase()
              });
          }

      })
      .catch(function(error){
        console.log(error);
      })
    }

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
                      <BankDetails 
                      open={open}
                      title="ADD BANK" 
                      benificiary_value={formik.values.benificiary}
                      benificiary_onChange={formik.handleChange}
                      benificiary_error={
                        formik.touched.benificiary && Boolean(formik.errors.benificiary)
                      }
                      benificiary_helperText={
                        formik.touched.benificiary && formik.errors.benificiary
                      }
                      onCancel={()=>setOpen(false)}
                      action={<Button variant="contained" color="secondary" onClick={formik.handleSubmit}>Save</Button>}
                      />
                    </Grid>
                </Grid>
                <Grid item>
                   <Collapse in={response.open}>
                      <Alert
                        action={
                          <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={() => {
                              setResponse({
                                ...response,
                                open: false
                              });
                            }}
                          >
                            <CloseIcon fontSize="inherit" />
                          </IconButton>
                        }
                        sx={{ mb: 2 }}
                        icon={response.icon}
                        severity={response.severity}
                      >
                        {response.message}
                      </Alert>
                    </Collapse>
                </Grid>
                <Grid item container spacing={2}>
                  {
                    banks.map((bank, key)=>
                    {
                      return(
                        <Grid key={key} item xl={4} lg={4} md={6} xs={12}>
                          <Card>
                          <CardHeader
                              action={
                                <React.Fragment>
                                  <IconButton color="success" onClick={
                                    ()=>{
                                      setBanks((banks) =>
                                        banks.map((bank, index) =>
                                          index === key
                                            ? { ...bank, editMode: true }
                                            : null
                                        ))
                                      formik.setFieldValue('benificiary', bank.benificiary);
                                    }
                                    }>
                                    <EditIcon />
                                    <BankDetails 
                                        open={bank.editMode}
                                        title="EDIT BANK" 
                                        benificiary_value={formik.values.benificiary}
                                        benificiary_onChange={formik.handleChange}
                                        benificiary_error={
                                          formik.touched.benificiary && Boolean(formik.errors.benificiary)
                                        }
                                        benificiary_helperText={
                                          formik.touched.benificiary && formik.errors.benificiary
                                        }
                                        onCancel={
                                        ()=>  setBanks((banks) =>
                                          banks.map((bank, i) =>
                                            i === key ? { ...bank, editMode: false } : bank
                                          )
                                        )}
                                        action={<Button variant="contained" color="success" onClick={formik.handleSubmit}>Update</Button>}
                                        />
                                  </IconButton>
                                  
                                  <IconButton color="error" onClick={()=>handleDelete(bank.bank_id)}>
                                    <DeleteIcon />
                                  </IconButton>
                                </React.Fragment>
                              }
                              title={bank.name}
                              subheader={"Date Added:  "+format(new Date(bank.date_time_added), 'MMM dd, yyyy')}
                            />
                              <CardContent>
                                <Typography variant="body2">Benificiary : {bank.benificiary}</Typography>
                                <Typography variant="body2">Address : {bank.address}</Typography>
                                <Typography variant="body2">Account # : {bank.account_number}</Typography>
                                <Typography variant="body2">IBAN # : {bank.iban}</Typography>
                                <Typography variant="body2">Swift Code : {bank.swift_code}</Typography>
                                <Typography variant="body2">Routing Code : {bank.routing_code}</Typography>
                              </CardContent>
                        
                          </Card>
                        </Grid>
                      )
                    })
                  }
                  
                </Grid>
            </Grid>
            
        </React.Fragment>
    )
}
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
  Alert,
  Backdrop} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';

import { format } from 'date-fns';
import AxiosInstance from "../AxiosInstance";
import * as Yup from 'yup';
import { useFormik, useFormikContext, FieldArray, FormikProvider } from 'formik';


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

const BankDetails = (props)=>
{
  const { values, handleChange, errors, touched } = useFormikContext();

  return(
    <Modal
      open={props.open}
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      >
      <Box sx={style}>
          <Grid container direction="column" spacing={2}>
              <Grid item>
              <Typography variant="h6">
                  {props.title}
              </Typography>
              </Grid>

              <FieldArray
                name="fields"
                render={() => (
                  <Grid item>
                    {values.fields.map((field, index) => (
                        field.name!=="bank_id" ? <TextField
                        key={index}
                        label={field.label}
                        variant="outlined"
                        name={`fields[${index}].value`}
                        value={field.value}
                        size="small"
                        onChange={handleChange}
                        error={touched.fields && touched.fields[index] && Boolean(errors.fields && errors.fields[index] && errors.fields[index].value)}
                        helperText={touched.fields && touched.fields[index] && errors.fields && errors.fields[index] && errors.fields[index].value}
                        fullWidth
                        sx={{marginBottom: '8px'}}
                        /> : null
                    ))}
                  </Grid>
                )}
              />
              <Grid item>
                { props.errorAlert }
              </Grid>
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


export default function BankAccounts(){
    const [banks, setBanks] = useState([]);
    const [dialog, setDialog] = useState({
      route: '',
      add: {
        open: false,
      },
      edit: {
        open: false,
      }
    });

    const [response, setResponse] = useState({
      icon: null,
      open: false,
      message: '',
      severity: ''
    })
    const [error, setError] = useState({
      open: false,
      message: ''
    })



    const [refresh, setRefresh] = useState(false);
    
    useEffect(()=>{
        setBanks([]);
        AxiosInstance.get("/bank/list")
        .then(function(result){
            setBanks((banks) => [
                ...result.data.map((element) => ({
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
          fields: [
            { label: 'Benificiary', name: 'benificiary', value: '' },
            { label: 'Name', name: 'name', value: '' },
            { label: 'Address', name: 'address', value: '' },
            { label: 'Account Number', name: 'account_number', value: '' },
            { label: 'IBAN', name: 'iban', value: '' },
            { label: 'Swift Code', name: 'swift_code', value: '' },
            { label: 'Routing Code', name: 'routing_code', value: '' },
            { name: 'bank_id', value: 0}
          ]
        },
        // validationSchema: Yup.object({
        //   fields: Yup.array().of(
        //     Yup.object({
        //       value: Yup.string().required('Required')
        //     })
        //   ),
        // }),
        validationSchema: Yup.object({
          fields: Yup.array().of(
            Yup.object({
              value: Yup.string().test(
                'required-if-not-bank_id',
                'Required',
                function (value) {
                  const { name } = this.parent;
                  return name === 'bank_id' || !!value;
                }
              ),
              name: Yup.string().required('Name is required'),
            })
          ),
        }),
        validateOnChange: false,
        onSubmit: (values, { validateForm }) => {
            AxiosInstance.post(dialog.route, values)
            .then(function(response){
                if(response.data.status === "SUCCESS")
                {
                    setDialog((dialog) => ({
                      ...dialog,
                        add: {
                          ...dialog.add,
                          open: false,
                        },
                        edit: {
                          ...dialog.edit, 
                          open:false
                        }
                      }));
                  
                   
                    setResponse({
                      icon: (<CheckIcon color='inherit'/>),
                      open: true,
                      message: response.data.message,
                      severity: response.data.status.toLowerCase()
                    });
                    setError({
                      open: false,
                      message: '',
                    });
                    setRefresh(!refresh);
                }
                else
                {
                  validateForm(values)
                    setError({
                      open: true,
                      message: response.data.message,
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
                      <Typography variant="h6">BANK ACCOUNTS</Typography>
                    </Grid>
                    <Grid item>
                      <Button variant="contained" color="secondary" onClick={()=>{
                         formik.setFieldValue(`fields[${0}].value`, '');
                         formik.setFieldValue(`fields[${1}].value`, '');
                         formik.setFieldValue(`fields[${2}].value`, '');
                         formik.setFieldValue(`fields[${3}].value`, '');
                         formik.setFieldValue(`fields[${4}].value`, '');
                         formik.setFieldValue(`fields[${5}].value`, '');
                         formik.setFieldValue(`fields[${6}].value`, '');
                         formik.setFieldValue(`fields[${7}].value`, '');
                         setDialog((dialog) => ({
                          ...dialog,
                            route: "/bank/add",
                            add: {
                              ...dialog.add,
                              open: true,
                            }
                          }));
                      }}>Add Bank Account</Button>
                      <FormikProvider value={formik}>
                          <BankDetails title="ADD BANK ACCOUNT" open={dialog.add.open} onCancel={()=>setDialog((dialog) => ({
                          ...dialog,
                            route: "",
                            add: {
                              ...dialog.add,
                              open: false,
                            }
                          }))}
                          errorAlert={
                            <Collapse in={error.open}>
                              <Alert
                                action={
                                  <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                    onClick={() => {
                                      setError({
                                        ...error,
                                        open: false
                                      });
                                    }}
                                  >
                                    <CloseIcon fontSize="inherit" />
                                  </IconButton>
                                }
                                sx={{ mb: 2 }}
                                icon={<ErrorIcon color='inherit'/>}
                                severity="error"
                              >
                                {error.message}
                              </Alert>
                            </Collapse>
                          }
                          action={<Button variant="contained" color="secondary" onClick={formik.handleSubmit}>Save</Button>} />
                  
                      </FormikProvider>
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

                                      formik.setFieldValue(`fields[${0}].value`, bank.benificiary);
                                      formik.setFieldValue(`fields[${1}].value`, bank.name);
                                      formik.setFieldValue(`fields[${2}].value`, bank.address);
                                      formik.setFieldValue(`fields[${3}].value`, bank.account_number);
                                      formik.setFieldValue(`fields[${4}].value`, bank.iban);
                                      formik.setFieldValue(`fields[${5}].value`, bank.swift_code);
                                      formik.setFieldValue(`fields[${6}].value`, bank.routing_code);
                                      formik.setFieldValue(`fields[${7}].value`, bank.bank_id);
                                      setDialog((dialog) => ({
                                        ...dialog,
                                          route: "/bank/edit",
                                          edit: {
                                            ...dialog.edit,
                                            open: true,
                                          }
                                        }));
                                      // setBanks((banks) =>
                                      //   banks.map((bank, index) =>
                                      //     index === key
                                      //       ? { ...bank, editMode: true }
                                      //       : null
                                      //   ))
                                    }
                                    }>
                                    <EditIcon />
                                  </IconButton>
                                  <FormikProvider value={formik}>
                                      <BankDetails title="EDIT BANK ACCOUNT" open={dialog.edit.open}
                                      onCancel={
                                        ()=>{
                                          setDialog((dialog) => ({
                                            ...dialog,
                                              route: "",
                                              edit: {
                                                ...dialog.edit,
                                                open: false,
                                              }
                                            }));
                                          // setBanks((banks) =>
                                          //   banks.map((bank, index) =>
                                          //     index === key
                                          //       ? { ...bank, editMode: false }
                                          //       : null
                                          //     ))
                                        }}
                                      action={<Button variant="contained" color="success" onClick={formik.handleSubmit}>Update</Button>} />
                              
                                  </FormikProvider>
                                  {/* <BankDetails 
                                    key={key}
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
                                    address_value={formik.values.address}
                                    address_onChange={formik.handleChange}
                                    address_error={
                                      formik.touched.address && Boolean(formik.errors.address)
                                    }
                                    address_helperText={
                                      formik.touched.address && formik.errors.address
                                    }
                                    onCancel={
                                      ()=>{
                                      
                                        setBanks((banks) =>
                                          banks.map((bank, index) =>
                                            index === key
                                              ? { ...bank, editMode: false }
                                              : null
                                            ))
                                      }}
                                    action={<Button variant="contained" color="success" onClick={formik.handleSubmit}>Update</Button>}
                                    /> */}
                                  
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
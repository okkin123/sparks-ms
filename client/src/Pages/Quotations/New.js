import React, { useState, useEffect} from 'react';

import * as Yup from "yup";
import { useFormik } from 'formik';

import { Toolbar, 
         Typography, 
         Grid, 
         TextField, 
         Paper, 
         Divider, 
         Stack,
         Table,
         TableBody,
         TableCell,
         TableContainer,
         TableHead,
         TableFooter,
         TableRow,
         Button,
         Alert,
         Collapse,
         IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';

import Dialog from '../../Components/Dialog';


const QuotationDetailSchema = Yup.object().shape({
  description: Yup.string()
    .required('This field is required!'),
  quantity: Yup.string()
    .matches(/^\d+$/, 'Only whole numbers are allowed')
    .required('This field is required!'),
  total_cost: Yup.string()
    .matches(/^\d*\.?\d*$/, 'Only numbers and decimal points are allowed!')
    .required('This field is required!')
  });


  const QuotationSchema = Yup.object().shape({
    client_name: Yup.string()
    .required('This field is required!'),
    attention_to: Yup.string()
    .required('This field is required!'),
    project_name: Yup.string()
    .required('This field is required!'),
    project_description: Yup.string()
    .required('This field is required!'),
    
  });
export default function New(){

    const [modal, setModal] = useState({
      add: {
        open: false
      },
    })
    const [quotationDetails, setQuotationDetails] = useState([]);
    const [quotationBreakdown, setQuotationBreakdown] = useState({
      total_cost_without_vat: "",
      vat_amount: "",
      total_cost_with_vat: ""
    })
    const [error, setError] = useState(false);


    const handleEditQuotaionDetails = (index) => {

      quotationDetails.map((quotationDetail, i) => 
           i === index ? 
           formik_quotation_detail.setValues({
            description:quotationDetail.description,
            quantity: quotationDetail.quantity,
            total_cost: quotationDetail.total_cost
           })
           : null
      );

      setQuotationDetails(quotationDetails.map((quotationDetail, i) =>
        i === index ? { ...quotationDetail, edit_open: true } : quotationDetail
      ));
    };

    const handleClearForms = ()=>{
      formik_quotation_detail.resetForm();
      formik_quotation_detail.setValues({
        description: '',
        quantity: '',
        total_cost: '',
      });

    }

    const handleEditCancel = (index)=>{
      handleClearForms();
      setQuotationDetails(quotationDetails.map((quotationDetail, i) =>
        i === index ? { ...quotationDetail, edit_open: false } : quotationDetail
      ));
    }

    const handleUpdateQuotationDetails = (index)=>{
      formik_quotation_detail.validateForm().then((errors)=>{
        if (Object.keys(errors).length === 0) {
         handleClearForms();
         setQuotationDetails(quotationDetails.map((quotationDetail, i) =>
            i === index ? { ...quotationDetail, 
              edit_open: false,
              description: formik_quotation_detail.values.description,
              unit_cost: (parseFloat(formik_quotation_detail.values.total_cost) / parseInt(formik_quotation_detail.values.quantity)).toFixed(2),
              quantity: formik_quotation_detail.values.quantity,
              total_cost: parseFloat(formik_quotation_detail.values.total_cost).toFixed(2)
            } : quotationDetail
          ));
        } else {
          // Handle validation errors
          formik_quotation_detail.setTouched({
            ...Object.keys(errors).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {})
          });
        }
      });

    }
    
    const handleRemoveQuotationDetails = (index) => {
      setQuotationDetails((quotationDetails) => {
        const quotationDetail = [...quotationDetails];
        quotationDetail.splice(index, 1);
        return quotationDetail;
      });
    };

   
    const formik_quotation_detail = useFormik({
      initialValues: {
        description: "",
        quantity: "",
        total_cost: ""
      },
      validationSchema: QuotationDetailSchema,
      validateOnChange: false,
      onSubmit: (values, {validateForm})=>{
      
        handleClearForms();
        setModal((modal) => ({
          ...modal,
            add: {
              ...modal.add,
              open: false,
            }
          }))
        setQuotationDetails((quotationDetails)=>[
          ...quotationDetails,
          {
            edit_open: false,
            description: values.description,
            quantity: values.quantity,
            unit_cost: (parseFloat(values.total_cost) / parseInt(values.quantity)).toFixed(2),
            total_cost: parseFloat(values.total_cost).toFixed(2)
          }
        ]);

      }
    })


    const formik_quotation = useFormik({
      initialValues: {
        client_name: "",
        attention_to: "",
        project_name: "",
        project_description: "",
      },
      validateOnChange: false,
      validationSchema: QuotationSchema,
      onSubmit: (values, {validateForm})=>{

        if(quotationDetails.length === 0)
        {
          setError(true)
        }
        else
        {
          setError(false)
        }
      }
    })

    useEffect(()=>{

      const total_cost_without_vat = quotationDetails.reduce((accumulator, currentItem) => {
        return accumulator + parseFloat(currentItem.total_cost);
      }, 0);

      setQuotationBreakdown({
        total_cost_without_vat: total_cost_without_vat,
        vat_amount: total_cost_without_vat * 0.05,
        total_cost_with_vat: total_cost_without_vat + (total_cost_without_vat * 0.05)
      })

      
    },[quotationDetails])



    return(
        <React.Fragment>
            <Toolbar />
            <Paper>
            <Grid container direction="column" spacing={2} sx={{padding: 2  }}>

                <Stack direction="row" justifyContent="space-between" sx={{paddingLeft: 2, paddingRight: 2}}>
                <Typography variant="h6">NEW QUOTATION</Typography>
                <Typography variant="subtitle1">Quotation #:</Typography>
                </Stack>
              
              <Grid item>
                 <Divider />
              </Grid>
               <Grid item>
                 <Stack direction="row" spacing={2}>
                    <TextField variant='outlined' label="Client Name"
                      name="client_name"
                      value={formik_quotation.values.client_name}
                      onChange={formik_quotation.handleChange}
                      error={
                        formik_quotation.touched.client_name && Boolean(formik_quotation.errors.client_name)
                        }
                      helperText={
                        formik_quotation.touched.client_name && formik_quotation.errors.client_name
                        }
                    fullWidth />
                    <TextField variant='outlined' label="Attention to"
                      name="attention_to"
                      value={formik_quotation.values.attention_to}
                      onChange={formik_quotation.handleChange}
                      error={
                        formik_quotation.touched.attention_to && Boolean(formik_quotation.errors.attention_to)
                        }
                      helperText={
                        formik_quotation.touched.attention_to && formik_quotation.errors.attention_to
                        } fullWidth/>
                 </Stack>
               </Grid>
               <Grid item>
                    <TextField variant='outlined' label="Project Name"
                    name="project_name"
                    value={formik_quotation.values.project_name}
                    onChange={formik_quotation.handleChange}
                    error={
                      formik_quotation.touched.project_name && Boolean(formik_quotation.errors.project_name)
                      }
                    helperText={
                      formik_quotation.touched.project_name && formik_quotation.errors.project_name
                      }
                     fullWidth />
                </Grid>
                <Grid item>
                    <TextField variant='outlined' label="Project Description"
                    name="project_description"
                    value={formik_quotation.values.project_description}
                    onChange={formik_quotation.handleChange}
                    error={
                      formik_quotation.touched.project_description && Boolean(formik_quotation.errors.project_description)
                      }
                    helperText={
                      formik_quotation.touched.project_description && formik_quotation.errors.project_description
                      }
                     multiline rows={2} fullWidth />
                </Grid>
                <Grid item>
                <Stack 
                  direction="row" 
                  spacing={2}
                  sx={{ width: '100%', alignItems: "center"}}
                >
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={() => {
                      setModal((modal) => ({
                        ...modal,
                        add: {
                          ...modal.add,
                          open: true,
                        }
                      }));
                    }} 
                    sx={{ width: 'fit-content', whiteSpace: 'nowrap' }}
                  >
                    Add Quotation Details
                  </Button>
                  <Collapse in={error} sx={{ mb: 2, width: 'stretch' }}>
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setError(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                  
                    icon={<ErrorIcon color='inherit' />}
                    severity="error"

                  >
                    Quotation Details is empty!
                  </Alert>
                  </Collapse>
                </Stack>

                  </Grid>
                 <Dialog open={modal.add.open} content={
                  <Grid container direction="column" spacing={2}>
                    <Grid item>
                      <Typography variant="h6">ADD QUOTATION DETAILS</Typography>
                    </Grid>
                    <Grid item>
                      <TextField 
                       label="Description"
                       variant="outlined"
                       name="description"
                       multiline
                       rows={3}
                       value={formik_quotation_detail.values.description}
                       size="small"
                       onChange={formik_quotation_detail.handleChange}
                       error={
                        formik_quotation_detail.touched.description && Boolean(formik_quotation_detail.errors.description)
                        }
                        helperText={
                          formik_quotation_detail.touched.description && formik_quotation_detail.errors.description
                        }
                       fullWidth
                      />
                    </Grid>
                    <Grid item>
                      <TextField 
                       label="Quantity"
                       variant="outlined"
                       name="quantity"
                       value={formik_quotation_detail.values.quantity}
                       size="small"
                       onChange={formik_quotation_detail.handleChange}
                       error={
                        formik_quotation_detail.touched.quantity && Boolean(formik_quotation_detail.errors.quantity)
                        }
                        helperText={
                          formik_quotation_detail.touched.quantity && formik_quotation_detail.errors.quantity
                        }
                       fullWidth
                      />
                    </Grid>
                    <Grid item>
                      <TextField 
                       label="Total Cost (AED)"
                       variant="outlined"
                       name="total_cost"
                       value={formik_quotation_detail.values.total_cost}
                       size="small"
                       onChange={formik_quotation_detail.handleChange}
                       error={
                        formik_quotation_detail.touched.total_cost && Boolean(formik_quotation_detail.errors.total_cost)
                        }
                        helperText={
                          formik_quotation_detail.touched.total_cost && formik_quotation_detail.errors.total_cost
                        }
                       fullWidth
                      />
                    </Grid>
                    <Grid item container justifyContent="flex-end">
                        <Grid item>
                            <Button variant="text" color="primary" onClick={()=>setModal((modal) => ({
                              ...modal,
                                add: {
                                  ...modal.add,
                                  open: false,
                                }
                              }))}>Cancel</Button>
                        </Grid>
                        <Grid item>
                           <Button variant="contained" color="secondary" onClick={formik_quotation_detail.handleSubmit}>Save</Button>
                        </Grid>
                    </Grid>
                  </Grid>
                 } />
                
                <Grid item>
                    <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                <TableRow>
                                    <TableCell align="left">SN</TableCell>
                                    <TableCell sx={{ minWidth: 400 }}>DESCRIPTION</TableCell>
                                    <TableCell align="center">QUANTITY</TableCell>
                                    <TableCell align="right">UNIT COST(AED)</TableCell>
                                    <TableCell align="right">TOTAL COST(AED)</TableCell>
                                    <TableCell align="center">ACTION</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                {quotationDetails.map((quotationDetail, i) => (
                                    <TableRow
                                    key={i}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                    <TableCell align="left">{i+1}</TableCell>
                                    <TableCell component="th" scope="row">
                                        {quotationDetail.description}
                                    </TableCell>
                                    
                                    <TableCell align="center">
                                      {quotationDetail.quantity}</TableCell>
                                    <TableCell align="right">{quotationDetail.unit_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                    <TableCell align="right">{quotationDetail.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</TableCell>
                                    <TableCell align="center">
                                    <IconButton color="success" onClick={()=>handleEditQuotaionDetails(i)}>
                                      <EditIcon />
                                    </IconButton>
                                    <Dialog open={quotationDetail.edit_open} content={
                                      <Grid container direction="column" spacing={2}>
                                        <Grid item>
                                          <Typography variant="h6">EDIT QUOTATION DETAILS</Typography>
                                        </Grid>
                                        <Grid item>
                                          <TextField 
                                          label="Description"
                                          variant="outlined"
                                          name="description"
                                          multiline
                                          rows={3}
                                          value={formik_quotation_detail.values.description}
                                          size="small"
                                          onChange={formik_quotation_detail.handleChange}
                                          error={
                                            formik_quotation_detail.touched.description && Boolean(formik_quotation_detail.errors.description)
                                            }
                                            helperText={
                                              formik_quotation_detail.touched.description && formik_quotation_detail.errors.description
                                            }
                                          fullWidth
                                          />
                                        </Grid>
                                        <Grid item>
                                          <TextField 
                                          label="Quantity"
                                          variant="outlined"
                                          name="quantity"
                                          value={formik_quotation_detail.values.quantity}
                                          size="small"
                                          onChange={formik_quotation_detail.handleChange}
                                          error={
                                            formik_quotation_detail.touched.quantity && Boolean(formik_quotation_detail.errors.quantity)
                                            }
                                            helperText={
                                              formik_quotation_detail.touched.quantity && formik_quotation_detail.errors.quantity
                                            }
                                          fullWidth
                                          />
                                        </Grid>
                                        <Grid item>
                                          <TextField 
                                          label="Total Cost (AED)"
                                          variant="outlined"
                                          name="total_cost"
                                          value={formik_quotation_detail.values.total_cost}
                                          size="small"
                                          onChange={formik_quotation_detail.handleChange}
                                          error={
                                            formik_quotation_detail.touched.total_cost && Boolean(formik_quotation_detail.errors.total_cost)
                                            }
                                            helperText={
                                              formik_quotation_detail.touched.total_cost && formik_quotation_detail.errors.total_cost
                                            }
                                          fullWidth
                                          />
                                        </Grid>
                                        <Grid item container justifyContent="flex-end">
                                            <Grid item>
                                                <Button variant="text" color="primary" onClick={()=>handleEditCancel(i)}>Cancel</Button>
                                            </Grid>
                                            <Grid item>
                                              <Button variant="contained" color="success" onClick={()=>handleUpdateQuotationDetails(i)}>Update</Button>
                                            </Grid>
                                        </Grid>
                                      </Grid>
                                    } />
                                    <IconButton onClick={()=>handleRemoveQuotationDetails(i)} color="error">
                                      <DeleteIcon />
                                    </IconButton>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                                <TableFooter>
                                  <TableRow>
                                    <TableCell colSpan={5} align="right"  >TOTAL AMOUNT COST W/OUT VAT:</TableCell>
                                    <TableCell align="center">{parseFloat(quotationBreakdown.total_cost_without_vat).toFixed(2)}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={5} align="right">VAT 5%:</TableCell>
                                    <TableCell align="center">{parseFloat(quotationBreakdown.vat_amount).toFixed(2)}</TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell colSpan={5} align="right">TOTAL COST INCLUDING VAT:</TableCell>
                                    <TableCell align="center">{parseFloat(quotationBreakdown.total_cost_with_vat).toFixed(2)}</TableCell>
                                  </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                </Grid>
                <Grid item>
                 <Divider />
                 </Grid>
                 <Grid item>
                     <Button variant='contained' color='success' sx={{float: 'right'}} onClick={formik_quotation.handleSubmit}>Submit Quotation for Approval</Button>
                 </Grid>
            </Grid>
            </Paper>
           
        </React.Fragment>
    )
}
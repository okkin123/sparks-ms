import React, { useState, useEffect, useRef } from 'react';
import { styled } from '@mui/material/styles';
import {Typography, 
        Box,
        Grid, 
        Stack,
        Paper,
        Table,
        TableBody,
        TableContainer,
        TableHead,
        TableFooter,
        TableRow,
        TextField,
        InputLabel,
        Select,
        MenuItem,
        FormControl,
        FormHelperText,
        Button} from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import LoadingButton from "@mui/lab/LoadingButton";
import AxiosInstance from '../../AxiosInstance';
import AxiosFileInstance from '../../AxiosFileInstance';
import bsLogo from "../../Assets/BS LOGO.png";
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      whiteSpace: 'nowrap'
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      color: theme.palette.primary.dark
    },
    [`&.${tableCellClasses.footer}`]: {
      fontSize: 14,
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      whiteSpace: 'nowrap'
    }

  }));
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border
    'td,th': {
      border: '1px solid '+theme.palette.primary.light,
    },
    [`& #bankAccount`]: {
      border: 0
    }
  }));

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  


export default function Details(){

    // Get the current URL
    const url = new URL(window.location.href);

    // Create a URLSearchParams object
    const params = new URLSearchParams(url.search);

    // Get the value of the 'param' parameter
    const paramValue = params.get('quotation_number');
    const [quotation, setQuotation] = useState({
        trn: "",
        quotation_number: "",
        status: "",
        created_by: "",
        created_on: "",
        assigned_to: '{"email_address": []}',
        client_name: "",
        attention_to: "",
        project_name: "",
        project_description: "",
    });
    const [bankAccount, setBankAccount] = useState([]);
    const [quotationDetails, setQuotationDetails] = useState([]);

    const [user, setUser] = useState({
      email_address: ""
    })
    const [approvalHistory, setApprovalHistory] = useState([])
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);
    useEffect(()=>{

       window.addEventListener("beforeunload", function(event){
        window.opener.postMessage({
          childClosed: true,
          childSubmit: false,
          childEdit: false
        }, window.location.origin);
       })

        AxiosInstance.post("/quotation/details", {quotation_number : paramValue})
        .then((result) => {
          if (result.data.status === "SUCCESS") {

            setQuotation({
                    quotation_number: result.data.quotation[0].quotation_number,
                    status: result.data.quotation[0].STATUS,
                    created_by: result.data.quotation[0].created_by_email,
                    quotation_date: dayjs(new Date(result.data.quotation[0].quotation_date)).format('DD-MMM-YYYY'),
                    assigned_to: result.data.quotation[0].assigned_to_email,
                    client_name: result.data.quotation[0].client_name,
                    attention_to: result.data.quotation[0].attention_to,
                    project_name: result.data.quotation[0].project_name,
                    project_description: result.data.quotation[0].project_description,
                    cost_without_vat: result.data.quotation[0].amount_without_vat,
                    is_vat: result.data.quotation[0].is_vat,
                    vat_percentage: result.data.quotation[0].vat_percentage,
                    vat_amount: result.data.quotation[0].vat_amount,
                    currency: result.data.quotation[0].currency,
                    company_trn: result.data.quotation[0].company_trn,
                    company_address: result.data.quotation[0].company_address,
                    cost_with_vat: result.data.quotation[0].amount_with_vat
                  });

               
                  
                  setQuotationDetails((quotation_details) => [
                    ...result.data.details.map((element) => ({
                    description: element.description,
                    qty: element.qty,
                    unit_cost: element.unit_cost === null ? '' : parseFloat(element.unit_cost).toFixed(2),
                    total_cost: parseFloat(element.total_cost).toFixed(2)
                    })),
                  ]);
                  
                  formik_update_quotation_status.setFieldValue("quotation_number", result.data.quotation[0].quotation_number)
                  formik_update_quotation_status.setFieldValue("user_id", result.data.quotation[0].created_by)
          } else {
            console.log(result.data.message);
          }
        })
        .catch((error) => {
          console.log(error);
        });


        AxiosInstance.get("/preferences/bank_account")
        .then(function(result){
          setBankAccount({
            benificiary: result.data.benificiary,
            name: result.data.name,
            address: result.data.address,
            account_number: result.data.account_number,
            iban: result.data.iban,
            swift_code: result.data.swift_code,
            routing_code: result.data.routing_code,
            
          });
        })
        .catch(function(error){
          console.log(error)
        })

        AxiosInstance.get("/user/info")
        .then((result) => {
          // assign the message in our result to the message we initialized above
  
          setUser({
            ...user,
            email_address: result.data[0].email_address
          });
        })
        .catch((error) => {
          console.log(error);
        });


        AxiosInstance.post("/quotation/get_approval_history", {quotation_number : paramValue})
        .then(function(result){
          setApprovalHistory((approvalHistory) => [
            ...result.data.approval_history.map((element) => ({
            fullname: element.fullname,
            email_address: element.email_address,
            user_type: element.user_type,
            date_time: element.date_time,
            comments: element.comments,
            supporting_doc_name: element.supporting_doc_name,
            supporting_doc_path : element.supporting_doc_path,
            status: element.status
            })),
          ]);

          
        })
        .catch(function(error){
          console.log(error)
        })

        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const formik_update_quotation_status = useFormik({
      initialValues: {
        quotation_number: "",
        user_id: "",
        comments: "",
        status: "",
        file: null,
        file_name: ""
      },
      validateOnChange: false,
      validationSchema: Yup.object({
        status: Yup.string().required("This field is required!"),
        file: Yup.mixed()
          .required('Supporting document is required!')
          .test(
            'fileSize',
            'File too large',
            value => value && value.size <= 16 * 1024 * 1024 // 16MB
          )
          .test(
            'fileFormat',
            'Unsupported file format!',
            value => value && ['image/jpeg', 'image/png', 'application/pdf'].includes(value.type)
          ),
      }),
      onSubmit: (values, {validateForm})=>{
        setLoading(true)

        const formData = new FormData();
        formData.append('file', values.file);
        formData.append('values', JSON.stringify(values))
        AxiosFileInstance.post("/quotation/update_quotation_status", formData)
        .then(function(response){
           if(response.data.status === "SUCCESS")
            {
              setLoading(false)

              if (window.opener) {
                alert(response.data.message);
                window.opener.postMessage({
                  childClosed: false,
                  childSubmit: true,
                  childEdit: false
                }, window.location.origin);
                window.close(); // Close the child window after sending data
              }


            }
            else
            {
              alert(response.data.message)
            }
        })
        .catch(function(error){
          console.log(error)
        })
      }
    })

    const downloadSupportingDoc = async (filename) => {
      try {
        const response = await AxiosInstance.get(`/download_supporting_doc/${filename}`, {
          responseType: 'blob', // Important for handling binary data
        });
    
        // Create a URL for the file
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename); // Set the file name
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error('Error downloading the file:', error);
      }
    };



    return(
            <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            >
            <Grid container justifyContent="center">
            <Grid item xl={6} lg={8} md={10} sm={10} xs={12}>
            <Paper sx={{paddingTop: 4, 
                        paddingRight: 4, 
                        paddingBottom: 1, 
                        paddingLeft: 4}}>
            <Grid container direction="column" spacing={4}>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <img src={bsLogo} width={220} alt="logo" />
                        <Typography variant="subtitle1" color="info"><strong>STATUS: {quotation.status}</strong></Typography>
                      </Stack>
                    <Typography variant="subtitle1">TRN NUMBER: {quotation.company_trn}</Typography>
                </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1"><strong>QUOTATION #: {quotation.quotation_number}</strong></Typography>
                        <Typography variant="subtitle1">DATE: {quotation.quotation_date}</Typography>
                    </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1">Client Name: {quotation.client_name}</Typography>
                        <Typography variant="subtitle1">Attention To: {quotation.attention_to}</Typography>
                    </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1">Project Name: {quotation.project_name}</Typography>
                    </Stack>
                </Grid>
                <Grid item>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                        <StyledTableRow>
                            <StyledTableCell align="left">SN</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 400 }}>DESCRIPTION</StyledTableCell>
                            <StyledTableCell align="center">QUANTITY</StyledTableCell>
                            <StyledTableCell align="right">UNIT COST ({quotation.currency})</StyledTableCell>
                            <StyledTableCell align="right">TOTAL COST({quotation.currency})</StyledTableCell>
                        </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            <StyledTableRow>
                                <StyledTableCell align="left"></StyledTableCell>
                                <StyledTableCell sx={{ minWidth: 400 }}>{quotation.project_description}</StyledTableCell>
                                <StyledTableCell align="center"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                            </StyledTableRow>
                            {
                                quotationDetails.map((quotationDetail, i)=>(
                                    <StyledTableRow>
                                        <StyledTableCell align="left">{i+1}</StyledTableCell>
                                        <StyledTableCell sx={{ minWidth: 400 }}>{quotationDetail.description}</StyledTableCell>
                                        <StyledTableCell align="center">{quotationDetail.qty}</StyledTableCell>
                                        <StyledTableCell align="right">{quotationDetail.unit_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                        <StyledTableCell align="right">{quotationDetail.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                ))
                            }
                        </TableBody>
                       {
                        quotation.vat_percentage !== null ? (
                          <TableFooter>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right" >TOTAL AMOUNT COST W/OUT VAT:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_without_vat}</StyledTableCell  >
                            </StyledTableRow>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right">VAT {quotation.vat_percentage}%:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.vat_amount}</StyledTableCell>
                            </StyledTableRow>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right">TOTAL COST INCLUDING VAT:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_with_vat}</StyledTableCell>
                            </StyledTableRow>
                          </TableFooter>
                        ) : (
                          <TableFooter>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right" >TOTAL AMOUNT COST:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_without_vat}</StyledTableCell  >
                            </StyledTableRow>
                          </TableFooter>
                        )
                       }
                        
                    </Table>
                </TableContainer>
                </Grid>
                <Grid item>
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <StyledTableRow>
                        <TableCell id="bankAccount" sx={{fontSize: 16}} colSpan={2}><strong>Please transfer the amount to the below UAE bank account details:</strong></TableCell>
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>BENIFICIARY:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.benificiary}</TableCell>
                        
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>BANK NAME:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.name}</TableCell>
                        <TableCell id="bankAccount" sx={{width: 230, fontSize: 16}}><strong>Client Approval:</strong></TableCell>
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>BANK ADDRESS:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.address}</TableCell>
                        <TableCell id="bankAccount">Name:</TableCell>
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>ACCOUNT NUMBER:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.account_number}</TableCell>
                       
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>IBAN:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.iban}</TableCell>
                        <TableCell id="bankAccount">Signature:</TableCell>
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>SWIFT CODE:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.swift_code}</TableCell>
                       
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>ROUTING CODE:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.routing_code}</TableCell>
                      </StyledTableRow>
                    </TableBody>    
                  </Table>
                </TableContainer>
                </Grid>
                <Grid item>
                  
                <TableContainer>
                  <Table size="small">
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4}><strong>WORK HISTORY</strong></TableCell>
                      </TableRow>
                      {
                        approvalHistory.map((approval)=>(
                          <TableRow>
                          <TableCell>
                            <Typography variant="subtitle1">{approval.fullname}</Typography>
                            <Typography variant="body1">{approval.email_address}</Typography>
                            <Typography variant="body1">{approval.user_type}</Typography>
                          </TableCell>
                          <TableCell>{dayjs(approval.date_time).format('YYYY-MM-DD | HH:mm:ss')}</TableCell>
                          
                          <TableCell>{approval.status}</TableCell>
                          <TableCell>{approval.comments}</TableCell>
                          { approval.supporting_doc_name !== '' ? <TableCell>
                            <Button size="small" color="secondary" variant="text" 
                            onClick={()=>downloadSupportingDoc(approval.supporting_doc_name)}>
                              Download</Button>
                            </TableCell> : null }
                        </TableRow>
                        ))
                      }

                    </TableBody>
                  </Table>
                </TableContainer>
                </Grid>
                {
                  JSON.parse(quotation.assigned_to).email_address.map((email) => {
                    if (email === user.email_address && quotation.status === "WAITING FOR VERIFICATION") {
                      return (
                        <React.Fragment key={email}>
                          <Grid item>
                            <TextField label="Comments" variant="outlined" multiline rows={3} fullWidth 
                            name="comments" value={formik_update_quotation_status.values.comments} onChange={formik_update_quotation_status.handleChange} />
                          </Grid>
                          <Grid item>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <LoadingButton loading={loading} variant="text" color="primary"
                                onClick={()=>{
                                  formik_update_quotation_status.setFieldValue("status", "VOIDED")
                                  formik_update_quotation_status.handleSubmit()
                                }}
                                >Void</LoadingButton>
                              <LoadingButton loading={loading} variant="contained" color="primary"
                              onClick={()=>{
                                formik_update_quotation_status.setFieldValue("status", "RETURNED")
                                formik_update_quotation_status.handleSubmit()
                              }}
                              >Return</LoadingButton>
                              <LoadingButton loading={loading} variant="contained" color="secondary" onClick={()=>{
                                formik_update_quotation_status.setFieldValue("status", "VERIFIED")
                                formik_update_quotation_status.handleSubmit()
                              }}>Verify</LoadingButton>
                            </Stack>
                          </Grid>
                        </React.Fragment>
                      );
                    }
                    return null;
                  })
                }

                {
                JSON.parse(quotation.assigned_to).email_address.map((email) => {
                    if (user.email_address === quotation.created_by && quotation.status === "RETURNED") {
                      return (
                        <React.Fragment key={email}>
                          <Grid item>
                          <Stack direction="row" spacing={2} justifyContent="center">
                            <LoadingButton loading={loading} variant="text" color="primary"
                            onClick={()=>{
                              formik_update_quotation_status.setFieldValue("status", "VOIDED")
                              formik_update_quotation_status.handleSubmit()
                            }}
                            >Void</LoadingButton>
                            <Button variant="contained" color="success" onClick={()=>{
       

                              if(window.opener)
                              {
                                window.opener.postMessage({
                                  childClosed: false,
                                  childSubmit: false,
                                  childEdit: true
                                }, window.location.origin);
                                window.close();
                              }
                             
                       
                            }}>Edit</Button>
                          </Stack>
                          </Grid>
                        </React.Fragment>
                      );
                    }
                      
                    return null;
                  })

                }

                {
                JSON.parse(quotation.assigned_to).email_address.map((email) => {
                    if (user.email_address === quotation.created_by && quotation.status === "VERIFIED") {
                      return (
                        <React.Fragment key={email}>
                          <Grid item>
                            
                            <FormControl
                              fullWidth
                              size="small"
                              error={formik_update_quotation_status.touched.status && Boolean(formik_update_quotation_status.errors.status)}
                              >
                              <InputLabel>Client's Feedback</InputLabel>
                              <Select
                              name="status"
                              value={formik_update_quotation_status.values.status}
                              label="Client's Feedback"
                              onChange={(event)=>formik_update_quotation_status.setFieldValue('status', event.target.value)}
                              >
                                <MenuItem value="APPROVED">
                                    APPROVED
                                </MenuItem>
                                <MenuItem value="REVISION">
                                    REVISION
                                </MenuItem>
                                <MenuItem value="NO RESPONSE">
                                    NO RESPONSE
                                </MenuItem>
                                <MenuItem value="REJECTED">
                                    REJECTED
                                </MenuItem>
                              </Select>
                              <FormHelperText>
                              {formik_update_quotation_status.touched.status && formik_update_quotation_status.errors.status}
                              </FormHelperText>
                          </FormControl>

                          </Grid>
                          <Grid item>
                            <TextField label="Comments" variant="outlined" multiline rows={3} fullWidth 
                            name="comments" value={formik_update_quotation_status.values.comments} onChange={formik_update_quotation_status.handleChange} />
                          </Grid>
                          <Grid item>
                          <Stack direction="column" spacing={2}>
                          <Typography variant="subtitle1"><strong>Supporting Document</strong> - Max Size: 16mb</Typography>
                          <Stack direction="row" spacing={2} sx={{whiteSpace: 'nowrap'}}>
                          <Button
                              component="label"
                              role={undefined}
                              variant="contained"
                              color="info"
                              tabIndex={-1}
                              size="small"
                            >
                              Upload File
                              <VisuallyHiddenInput type="file" ref={fileRef} accept=".jpg, .jpeg, .png, .pdf"
                                  name="file"
                                  style={{ display: 'none' }}
                                  onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    formik_update_quotation_status.setFieldValue('file', file);
                                    formik_update_quotation_status.setFieldValue('file_name', file ? file.name : '');
                                  }} />
                            </Button>
                            <Typography variant="subtitle1">{formik_update_quotation_status.values.file_name}</Typography>
                            </Stack>
                            <FormHelperText sx={{color: "red"}}>
                            {formik_update_quotation_status.touched.file && formik_update_quotation_status.errors.file}
                            </FormHelperText>
                            </Stack>
                          </Grid>
                          <Grid item>
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <LoadingButton loading={loading} variant="text" color="primary"
                                onClick={()=>{
                                  formik_update_quotation_status.setFieldValue("status", "VOIDED")
                                  formik_update_quotation_status.handleSubmit()
                                }}
                                >Void</LoadingButton>
                              <LoadingButton loading={loading} variant="contained" color="secondary" onClick={()=>{
                                formik_update_quotation_status.handleSubmit()
                              }}>Submit</LoadingButton>
                            </Stack>
                          </Grid>
                        </React.Fragment>
                      );
                    }
                      
                    return null;
                  })

                }
                
                <Grid item>
                    <Stack direction="row" spacing={2} justifyContent="center">
                     <Typography variant="subtitle1">{quotation.company_address}</Typography>
                    </Stack>  
                </Grid>
            </Grid>
            </Paper>
            </Grid>
            </Grid>
            </Box>
    )
}
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
        Avatar,
        ListItem,
        ListItemAvatar,
        ListItemText,
        Divider,
        List,
        Skeleton,
        Button} from '@mui/material';
        
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import LoadingButton from "@mui/lab/LoadingButton";
import AxiosInstance from '../../AxiosInstance';
import AxiosFileInstance from '../../AxiosFileInstance';
import bsLogo from "../../Assets/BS LOGO.png";
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReactToPrint from 'react-to-print';
import FileUpload from '../../Components/FileUpload';
import "../../Assets/print.css";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      whiteSpace: 'nowrap',
      fontFamily: 'Verdana, sans-serif',
      fontSize: 10.5,
      padding: 4,
    },
    [`&.${tableCellClasses.body}`]: {
      fontFamily: 'Verdana, sans-serif',
      fontSize: 10.5,
      color: theme.palette.primary.dark,
      padding: 4,
     
    },
    [`&.${tableCellClasses.footer}`]: {
      fontFamily: 'Verdana, sans-serif',
      fontSize: 10.5,
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      whiteSpace: 'nowrap',
      padding: 4,
    }

  }));

  const StyledPrintTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.body}`]: {
      fontFamily: 'Verdana, sans-serif',
      fontSize: 10.5,
      color: theme.palette.primary.dark
    },
  }));
  
  
  const StyledTableRow = styled(TableRow)(({ theme }) => ({
    // hide last border
    'td,th': {
      border: '1px solid '+theme.palette.primary.light,
    },
    [`& #bankAccount`]: {
      border: 0,
      padding: 4,
      fontFamily: 'Verdana, sans-serif',
      fontSize: 10.5,
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


  const PrintComponent = React.forwardRef((props, ref)=>{
    const quotation = props.quotation;
    const quotationDetails = props.quotationDetails;
    const bankAccount = props.bankAccount;
  
    return(
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh', // Full viewport height
      }}
      ref={ref}
    >
      <Box
        sx={{padding: 2}}
      >
      <Grid container direction="column" spacing={2}>
        <Grid item>
          <Stack direction="column" spacing={2}>
          <img src={bsLogo} width={220} alt="logo" />
          <Typography variant="body2">TRN NUMBER: {quotation.company_trn}</Typography>
          </Stack>
        </Grid>
        <Grid item>
            <Stack direction="column" spacing={1}>
                <Typography variant="body2"><strong>Quotation No.: {quotation.quotation_number}</strong></Typography>
                <Typography variant="body2">Date: {quotation.quotation_date}</Typography>
            </Stack>
        </Grid>
        <Grid item>
            <Stack direction="column" spacing={1}>
                <Typography variant="body2">Client Name: {quotation.client_name}</Typography>
                <Typography variant="body2">Attention To: {quotation.attention_to}</Typography>
            </Stack>
        </Grid>
      <Grid item>
          <Typography variant="body2">Project Name: {quotation.project_name}</Typography>
      </Grid>
      <Grid item>
      <TableContainer>
          <Table size="small">
              <TableHead>
              <StyledTableRow>
                  <StyledTableCell align="left">SN</StyledTableCell>
                  <StyledTableCell sx={{ minWidth: 300 }}>DESCRIPTION</StyledTableCell>
                  <StyledTableCell align="center">QUANTITY</StyledTableCell>
                  <StyledTableCell align="right">UNIT COST ({quotation.currency})</StyledTableCell>
                  <StyledTableCell align="right">TOTAL COST({quotation.currency})</StyledTableCell>
              </StyledTableRow>
              </TableHead>
              <TableBody>
                  <StyledTableRow>
                      <StyledTableCell align="left"></StyledTableCell>
                      <StyledTableCell sx={{ minWidth: 300 }}><pre>{quotation.project_description}</pre></StyledTableCell>
                      <StyledTableCell align="center"></StyledTableCell>
                      <StyledTableCell align="right"></StyledTableCell>
                      <StyledTableCell align="right"></StyledTableCell>
                  </StyledTableRow>
                  {
                      quotationDetails.map((quotationDetail, i)=>(
                          <StyledTableRow>
                              <StyledTableCell align="left">{i+1}</StyledTableCell>
                              <StyledTableCell sx={{ minWidth: 300 }}>{quotationDetail.description}</StyledTableCell>
                              <StyledTableCell align="center">{quotationDetail.qty}</StyledTableCell>
                              <StyledTableCell align="right">{quotationDetail.unit_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                              <StyledTableCell align="right">{quotationDetail.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                          </StyledTableRow>
                      ))
                  }
                  { quotation.notes !== '' && quotation.notes !== null ? <StyledTableRow>
                                <StyledTableCell align="left"></StyledTableCell>
                                <StyledTableCell sx={{ minWidth: 300}}><strong>NOTES:</strong> <pre>{quotation.notes}</pre></StyledTableCell>
                                <StyledTableCell align="center"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                            </StyledTableRow> : null }
              </TableBody>
              {
              quotation.vat_percentage !== null ? (
                <TableFooter>
                  <StyledTableRow>
                  <StyledTableCell colSpan={4} align="right" >TOTAL COST w/o VAT:</StyledTableCell>
                  <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_without_vat}</StyledTableCell  >
                  </StyledTableRow>
                  <StyledTableRow>
                  <StyledTableCell colSpan={4} align="right">VAT {quotation.vat_percentage}%:</StyledTableCell>
                  <StyledTableCell align="right">{quotation.currency+' '+quotation.vat_amount}</StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow>
                  <StyledTableCell colSpan={4} align="right">TOTAL COST w/ VAT:</StyledTableCell>
                  <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_with_vat}</StyledTableCell>
                  </StyledTableRow>
                </TableFooter>
              ) : (
                <TableFooter>
                  <StyledTableRow>
                  <StyledTableCell colSpan={4} align="right" >TOTAL COST:</StyledTableCell>
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
              <StyledPrintTableCell id="bankAccount" colSpan={2} sx={{fontSize: 11}}><strong>Please transfer the amount to the below UAE bank account details:</strong></StyledPrintTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledPrintTableCell id="bankAccount"><strong>BENIFICIARY:</strong></StyledPrintTableCell>
              <StyledPrintTableCell id="bankAccount">{bankAccount.benificiary}</StyledPrintTableCell>
              
            </StyledTableRow>
            <StyledTableRow>
              <StyledPrintTableCell id="bankAccount"><strong>BANK NAME:</strong></StyledPrintTableCell>
              <StyledPrintTableCell id="bankAccount">{bankAccount.name}</StyledPrintTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledPrintTableCell id="bankAccount"><strong>BANK ADDRESS:</strong></StyledPrintTableCell>
              <StyledPrintTableCell id="bankAccount">{bankAccount.address}</StyledPrintTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledPrintTableCell id="bankAccount"><strong>ACCOUNT NUMBER:</strong></StyledPrintTableCell>
              <StyledPrintTableCell id="bankAccount">{bankAccount.account_number}</StyledPrintTableCell>
              
            </StyledTableRow>
            <StyledTableRow>
              <StyledPrintTableCell id="bankAccount"><strong>IBAN:</strong></StyledPrintTableCell>
              <StyledPrintTableCell id="bankAccount">{bankAccount.iban}</StyledPrintTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledPrintTableCell id="bankAccount"><strong>SWIFT CODE:</strong></StyledPrintTableCell>
              <StyledPrintTableCell id="bankAccount">{bankAccount.swift_code}</StyledPrintTableCell>
              
            </StyledTableRow>
            <StyledTableRow>
              <StyledPrintTableCell id="bankAccount"><strong>ROUTING CODE:</strong></StyledPrintTableCell>
              <StyledPrintTableCell id="bankAccount">{bankAccount.routing_code}</StyledPrintTableCell>
            </StyledTableRow>
          </TableBody>    
        </Table>
      </TableContainer>
      </Grid>
      </Grid>
  
      </Box>


       <Typography sx={{marginTop: 'auto', textAlign: 'center'}} variant="caption">{quotation.company_address}</Typography>
      </Box>
    )
  })
  


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
    const [invoices, setInvoices] = useState([]);
    const [user, setUser] = useState({
      email_address: ""
    })
    const [approvalHistory, setApprovalHistory] = useState([])
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);
    const contentToPrint = useRef(null);
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
                    cost_with_vat: result.data.quotation[0].amount_with_vat,
                    currency: result.data.quotation[0].currency,
                    company_trn: result.data.quotation[0].company_trn,
                    company_address: result.data.quotation[0].company_address,
                    total_invoice_amount_with_vat: result.data.quotation[0].total_invoice_amount_with_vat,
                    notes: result.data.quotation[0].notes
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

        AxiosInstance.post("/quotation/invoices_issued", {quotation_number : paramValue})
        .then(function(result){
          if(result.data.status==='SUCCESS'){
            console.log(result.data.invoices)
            setInvoices((invoices) => [
              ...result.data.invoices.map((element) => ({
              invoice_number: element.invoice_number,
              amount_with_vat: element.amount_with_vat,
              status: element.STATUS
              })),
            ]);
          }else{
            console.log(result.data.message)
          }
          
        })
        .catch(function(error){
          console.log(error)
        })

        // eslint-disable-next-line
    },[])

    const handleFileUpload = (file) => {
      formik_update_quotation_status.setFieldValue('file', file);
     };

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
      validationSchema: quotation.status === "WAITING FOR VERIFICATION" || quotation.status === "VERIFIED" || quotation.status === "APPROVED BY CLIENT" ? Yup.object().shape({
        status: Yup.string().required("This field is required!"),
        // file: Yup.mixed()
        //   .required('Supporting document is required!')
        //   .nullable()
        //   .test(
        //     'fileSize',
        //     'File too large',
        //     value => !value || (value && value.size <= 16 * 1024 * 1024) // 16MB
        //   )
        //   .test(
        //     'fileFormat',
        //     'Unsupported file format!',
        //     value => !value || (value && ['image/jpeg', 'image/png', 'application/pdf'].includes(value.type))
        //   ),
      }) : null,
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
        const response = await AxiosInstance.get(`/quotation/download_supporting_doc/${filename}`, {
          responseType: 'blob',
        });
    
        if (response.status === 200) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          console.error('Error: File not found or server error');
        }
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
            <Grid item xl={7} lg={8} md={10} sm={10} xs={12}>
            <Paper sx={{paddingTop: 4, 
                        paddingRight: 4, 
                        paddingBottom: 1, 
                        paddingLeft: 4}} >
            <Grid container direction="column" spacing={3}>
                <div style={{overflow: 'hidden', height: 0}}>
                  <PrintComponent quotation={quotation} quotationDetails={quotationDetails} bankAccount={bankAccount} ref={contentToPrint} />
                </div>
                {/* <Data quotation={quotation} quotationDetails={quotationDetails} bankAccount={bankAccount} /> */}
                <Grid item>
                    <Stack direction="column" spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <img src={bsLogo} width={220} alt="logo" />
                        { quotation.status === "VERIFIED" || quotation.status === 'APPROVED BY CLIENT' ? <ReactToPrint
                            trigger={() => (
                                <Grid item>
                                <Stack direction="row" spacing={2} justifyContent="center">
                                  <Button variant='contained' color="secondary">Print</Button>
                                </Stack>
                              </Grid>
                            )}
                            content={() => contentToPrint.current}
                            documentTitle={'Bright Spark Q#'+paramValue.replace(/\//g, "-")+' - '+quotation.project_name}
                          /> : null }
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                      { quotation.company_trn ? <Typography variant="subtitle1">TRN NUMBER: {quotation.company_trn}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      
                      </Stack>
                </Stack>
                </Grid>
                <Grid item>
                   <Stack direction="row" justifyContent="space-between">
                      <Stack direction="column" spacing={1}>
                          { quotation.quotation_number ? <Typography variant="subtitle1"><strong>Quotation No.: {quotation.quotation_number}</strong></Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                          { quotation.quotation_date ? <Typography variant="subtitle1">Date: {quotation.quotation_date}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                          { quotation.client_name ? <Typography variant="subtitle1">Client Name: {quotation.client_name}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                          { quotation.attention_to ? <Typography variant="subtitle1">Attention To: {quotation.attention_to}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                          { quotation.project_name ? <Typography variant="subtitle1">Project Name: {quotation.project_name}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      </Stack>
                      <Stack direction="column" spacing={1}>
                      { quotation.status ? <Typography variant="subtitle1" color="info"><strong>STATUS: {quotation.status}</strong></Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      {invoices.length > 0 ? <Typography variant='subtitle1'><strong>INVOICES ISSUED:</strong></Typography> : <Skeleton variant="rounded" width={210} height={15} />}
                      {invoices.length > 0 ? null : <Skeleton variant="rounded" width={210} height={30} />}
                          {invoices.map((invoice, key) => (
                            <React.Fragment key={key}>
                              <Typography variant="subtitle2">#{invoice.invoice_number} - {invoice.amount_with_vat} ({invoice.status})</Typography>
                            </React.Fragment>
                          ))}
                    
                      </Stack>
                    </Stack>
                </Grid>
                <Grid item>
                { quotationDetails.length > 0 ? (<TableContainer>
                    <Table size="small">
                        <TableHead>
                        <StyledTableRow>
                            <StyledTableCell align="left">SN</StyledTableCell>
                            <StyledTableCell sx={{ minWidth: 350 }}>DESCRIPTION</StyledTableCell>
                            <StyledTableCell align="center">QUANTITY</StyledTableCell>
                            <StyledTableCell align="right">UNIT COST ({quotation.currency})</StyledTableCell>
                            <StyledTableCell align="right">TOTAL COST({quotation.currency})</StyledTableCell>
                        </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            <StyledTableRow>
                                <StyledTableCell align="left"></StyledTableCell>
                                <StyledTableCell sx={{ minWidth: 350 }}><pre>{quotation.project_description}</pre></StyledTableCell>
                                <StyledTableCell align="center"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                            </StyledTableRow>
                            {
                                quotationDetails.map((quotationDetail, i)=>(
                                    <StyledTableRow>
                                        <StyledTableCell align="left">{i+1}</StyledTableCell>
                                        <StyledTableCell sx={{ minWidth: 350 }}>{quotationDetail.description}</StyledTableCell>
                                        <StyledTableCell align="center">{quotationDetail.qty}</StyledTableCell>
                                        <StyledTableCell align="right">{quotationDetail.unit_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                        <StyledTableCell align="right">{quotationDetail.total_cost.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                    </StyledTableRow>
                                ))
                            }
                             { quotation.notes !== ''  && quotation.notes !== null ? <StyledTableRow>
                                <StyledTableCell align="left"></StyledTableCell>
                                <StyledTableCell sx={{ minWidth: 350}}><strong>NOTES:</strong><pre>{quotation.notes}</pre></StyledTableCell>
                                <StyledTableCell align="center"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                                <StyledTableCell align="right"></StyledTableCell>
                            </StyledTableRow> : null }
                        </TableBody>
                        {
                        quotation.vat_percentage !== null ? (
                          <TableFooter>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right" >TOTAL COST w/o VAT:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_without_vat}</StyledTableCell  >
                            </StyledTableRow>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right">VAT {quotation.vat_percentage}%:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.vat_amount}</StyledTableCell>
                            </StyledTableRow>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right">TOTAL COST w/ VAT:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_with_vat}</StyledTableCell>
                            </StyledTableRow>
                          </TableFooter>
                        ) : (
                          <TableFooter>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right" >TOTAL COST:</StyledTableCell>
                            <StyledTableCell align="right">{quotation.currency+' '+quotation.cost_without_vat}</StyledTableCell  >
                            </StyledTableRow>
                          </TableFooter>
                        )
                        }
                        
                    </Table>
                </TableContainer>) : <Skeleton variant="rounded" width="100%" height={200} /> }
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
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>BANK ADDRESS:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.address}</TableCell>
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>ACCOUNT NUMBER:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.account_number}</TableCell>
                        
                      </StyledTableRow>
                      <StyledTableRow>
                        <TableCell id="bankAccount"><strong>IBAN:</strong></TableCell>
                        <TableCell id="bankAccount">{bankAccount.iban}</TableCell>
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
                  <Typography variant="body1"><strong>APPROVAL HISTORY</strong></Typography>
                  <List sx={{ bgcolor: 'background.paper' }} dense={true}>
                  {
                   approvalHistory.map((approval ,key)=>(
                    <React.Fragment key={key}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar alt={approval.fullname} src="/static/images/avatar/1.jpg" />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body1">{approval.status}</Typography>
                            <Typography variant="subtitle2">{dayjs(approval.date_time).format('MMM DD,YYYY | hh:mm a ')}</Typography>
                          </Stack>
                        } 
                        secondary={
                          <Stack direction="row" justifyContent="space-between">
                            <Typography
                              sx={{ display: 'inline' }}
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              <strong>{approval.fullname}</strong>
                              {approval.comments !== '' ? ' - '+approval.comments : ''}
                            </Typography>
                             {
                                approval.supporting_doc_name !== '' && approval.supporting_doc_name !== null? 
                                  <Button color="secondary" size="small" justifyContent="flex-end" onClick={()=>downloadSupportingDoc(approval.supporting_doc_name)}>Download Supporting Document</Button> : null 
                             }
                          </Stack>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                    </React.Fragment>
                      ))
                    }
                  </List>
        
                </Grid>
                {
                  JSON.parse(quotation.assigned_to).email_address.map((email) => {
                    if (email === user.email_address && quotation.status === "WAITING FOR VERIFICATION") {
                      return (
                        <React.Fragment key={email}>
                           <Grid item>
                            <FormControl
                              fullWidth
                              size="small"
                              error={formik_update_quotation_status.touched.status && Boolean(formik_update_quotation_status.errors.status)}
                              >
                              <InputLabel>Approval's Feedback</InputLabel>
                              <Select
                              name="status"
                              value={formik_update_quotation_status.values.status}
                              label="Approval's Feedback"
                              onChange={(event)=>formik_update_quotation_status.setFieldValue('status', event.target.value)}
                              >
                                <MenuItem value="VERIFIED">
                                    VERIFY
                                </MenuItem>
                                <MenuItem value="RETURNED FOR REVISION">
                                    RETURN FOR REVISION
                                </MenuItem>
                                <MenuItem value="VOIDED">
                                    VOID
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
                            <Stack direction="row" spacing={2} justifyContent="center">
                                <LoadingButton loading={loading} variant="contained" color="success"
                                onClick={()=>formik_update_quotation_status.handleSubmit()}
                                >Submit</LoadingButton>
                            </Stack>
                          </Grid>
                        </React.Fragment>
                      );
                    }          
                    
                    return null;
                  })
                }
                {
                     user.email_address === quotation.created_by && quotation.status === "RETURNED FOR REVISION" ? 
                       (
                        <React.Fragment>
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
                      ) : null
                }

                {
                    user.email_address === quotation.created_by ?
                       (  
                        <React.Fragment>
                          { quotation.status === "VERIFIED" ? <React.Fragment><Grid item>
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
                                <MenuItem value="APPROVED BY CLIENT">
                                    APPROVED
                                </MenuItem>
                                <MenuItem value="RETURNED FOR REVISION">
                                    RETURN FOR REVISION
                                </MenuItem>
                                <MenuItem value="VOIDED">
                                    VOID
                                </MenuItem>
                                <MenuItem value="NO RESPONSE FROM CLIENT">
                                    NO RESPONSE
                                </MenuItem>
                                <MenuItem value="REJECTED BY CLIENT">
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
                          <FileUpload onFileUpload={handleFileUpload} fileTypes={['image/jpeg', 'image/png', 'application/pdf']} />
                          {/* <Stack direction="row" spacing={2} sx={{whiteSpace: 'nowrap'}}>
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
                            </FormHelperText> */}
                            </Stack>
                          </Grid></React.Fragment> : null }
                          <Grid item>
                            <Stack direction="row" spacing={2} justifyContent="center">
                            { quotation.status === "VERIFIED"  ?
                              <LoadingButton loading={loading} loadingIndicator="Submitting..." variant="contained" color="success" onClick={()=>{
                                formik_update_quotation_status.handleSubmit()
                              }}>Submit</LoadingButton> : null }
                            </Stack>
                          </Grid>
                        </React.Fragment>
                      ) : null
                    }

                {user.email_address === quotation.created_by && quotation.status === "APPROVED BY CLIENT" && parseFloat(quotation.total_invoice_amount_with_vat) === 0 ?
                      (
                        <React.Fragment>
                          <Grid item>
                          <FormControl
                              fullWidth
                              size="small"
                              error={formik_update_quotation_status.touched.status && Boolean(formik_update_quotation_status.errors.status)}
                              >
                              <InputLabel>Client's Feedback Update</InputLabel>
                              <Select
                              name="status"
                              value={formik_update_quotation_status.values.status}
                              label="Client's Feedback Update"
                              onChange={(event)=>formik_update_quotation_status.setFieldValue('status', event.target.value)}
                              >
                                <MenuItem value="RETURNED FOR REVISION">
                                    RETURN FOR REVISION
                                </MenuItem>
                                <MenuItem value="VOIDED">
                                    VOID
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
                          </Grid>
                          <Grid item>
                            <Stack direction="row" spacing={2} justifyContent="center">
                              <LoadingButton loading={loading} variant="contained" color="success"
                                onClick={()=>formik_update_quotation_status.handleSubmit()}
                                >Submit</LoadingButton> 
                              
                            </Stack>
                          </Grid>

                        </React.Fragment>
                      ) : null
                    }
                      



                
                
               
            </Grid>
            </Paper>
            </Grid>
            </Grid>
            </Box>
    )
}

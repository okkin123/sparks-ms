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
        Skeleton,
        List,
        Button} from '@mui/material';
        
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import LoadingButton from "@mui/lab/LoadingButton";
import AxiosInstance from '../../AxiosInstance';
import AxiosFileInstance from '../../AxiosFileInstance';
import bsLogo from "../../Assets/BS LOGO.png";
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ToWords } from 'to-words';
import ReactToPrint from 'react-to-print';

import "../../Assets/print.css";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      whiteSpace: 'nowrap',
      fontSize: 11,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 11,
      color: theme.palette.primary.dark
    },
    [`&.${tableCellClasses.footer}`]: {
      fontSize: 11,
      color: theme.palette.primary.main,
      fontWeight: 'bold',
      whiteSpace: 'nowrap'
    }

  }));

  
  const StyledPrintTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.body}`]: {
      fontSize: 10,
      color: theme.palette.primary.dark
    },
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


  const PrintComponent = React.forwardRef((props, ref)=>{
    const invoice = props.invoice;
    const invoiceDetails = props.invoiceDetails;
    const bankAccount = props.bankAccount;
    const words = props.words;
    return(
      <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Full viewport height
      }}
      ref={ref}
    >
      <Box
      sx={{padding: 2}}
      >
      <Grid container direction="column" spacing={3}>
      <Grid item>
          <Stack direction="column" spacing={2}>
            <img src={bsLogo} width={220} alt="logo" />
            <Stack direction="row" justifyContent="flex-end">
            <Typography variant="body2">TRN #: {invoice.company_trn}</Typography>
            </Stack>
        </Stack>
      </Grid>
      <Grid item>
          <Stack direction="row" justifyContent="center">
              <Typography variant="h5"><strong>{invoice.is_vat ? 'TAX ' : ''}INVOICE #: {invoice.invoice_number}</strong></Typography>
          </Stack>
      </Grid>
    
      <Grid item>
          <Stack direction="column">
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Client Name: {invoice.client_name}</Typography>
                <Typography variant="body2">Date: {invoice.invoice_date}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2">Address: {invoice.address}</Typography>
              <Typography variant="body2">Ref Quotation #: {invoice.quotation_number}</Typography>
            </Stack>
            <Typography variant="body2">TRN #: {invoice.client_trn}</Typography>
            <Typography variant="body2">Attention To: {invoice.attention_to}</Typography>
            <Typography variant="body2">Project Name: {invoice.project_name}</Typography>
          </Stack>
      </Grid>
      <Grid item>
      <TableContainer>
          <Table size="small">
              <TableHead>
              <StyledTableRow>
                  <StyledTableCell align="left">SN</StyledTableCell>
                  <StyledTableCell align="center" sx={{ minWidth: 300 }}>TOPICS</StyledTableCell>
                  <StyledTableCell align="center">AMOUNT {invoice.currency}</StyledTableCell>
                  {
                      invoice.vat_percentage !== null ? (
                      <React.Fragment>
                        <StyledTableCell align="center">VAT {invoice.vat_percentage}%</StyledTableCell>
                        <StyledTableCell align="center">TOTAL {invoice.currency}</StyledTableCell>
                      </React.Fragment>
                    ): (
                      <React.Fragment>
                      <StyledTableCell align="center">TOTAL {invoice.currency}</StyledTableCell>
                      </React.Fragment>
                    )
                  }
              </StyledTableRow>
              </TableHead>
              <TableBody>
                  {
                      invoiceDetails.map((invoiceDetail, i)=>(
                        <StyledTableRow
                        key={i}
                        >
                        <StyledTableCell align="left">{i+1}</StyledTableCell>
                        <StyledTableCell component="th" scope="row">
                            {invoiceDetail.topics}
                        </StyledTableCell>
                        {
                          invoice.vat_percentage !== null ? (
                            <React.Fragment>
                            <StyledTableCell align="center">{invoiceDetail.amount_without_vat}</StyledTableCell>
                            <StyledTableCell align="center">{invoiceDetail.vat_amount}</StyledTableCell>
                            <StyledTableCell align="center">{invoiceDetail.amount_with_vat}</StyledTableCell>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                            <StyledTableCell align="center">{invoiceDetail.amount_without_vat}</StyledTableCell>
                            <StyledTableCell align="center">{invoiceDetail.amount_without_vat}</StyledTableCell>
                            </React.Fragment>
                          )
                        }
                        </StyledTableRow>
                      ))
                  }
              </TableBody>
              {
              invoice.vat_percentage !== null ? (
                <TableFooter>
                  <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell align="left" >GRAND TOTAL:</StyledTableCell>
                  <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_without_vat}</StyledTableCell  >
                  <StyledTableCell align="center">{invoice.currency+' '+invoice.vat_amount}</StyledTableCell>
                  <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_with_vat}</StyledTableCell>
                  </StyledTableRow>
                  <StyledTableRow sx={{backgroundColor: '#EEEEEE'}}>
                    <StyledTableCell colSpan={5}>Amount in words: {words}</StyledTableCell>
                  </StyledTableRow>
                </TableFooter>
              ) : (
                <TableFooter>
                  <StyledTableRow>
                  <StyledTableCell></StyledTableCell>
                  <StyledTableCell align="left" >GRAND TOTAL:</StyledTableCell>
                  <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_with_vat}</StyledTableCell  >
                  <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_with_vat}</StyledTableCell  >
                  </StyledTableRow>
                  <StyledTableRow sx={{backgroundColor: '#EEEEEE'}}>
                    <StyledTableCell colSpan={4}>Amount in words: {words}</StyledTableCell>
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
      <Typography sx={{marginTop: 'auto', textAlign: 'center'}} variant="caption"><strong>Note: </strong>This is a computer generated invoice, hence no signature is required.</Typography>
      <Typography sx={{marginTop: 'auto', textAlign: 'center'}} variant="caption">{invoice.company_address}<br/><u>www.spark-communications.net</u></Typography>
      </Box>
    )
  })



export default function Details(){

    // Get the current URL
    const url = new URL(window.location.href);

    // Create a URLSearchParams object
    const params = new URLSearchParams(url.search);

    // Get the value of the 'param' parameter
    const paramValue = params.get('invoice_number');
    const [invoice, setInvoice] = useState({
        trn: "",
        invoice_number: "",
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
    const [bankLoading, setBankLoading] = useState(false);
    const [invoiceDetails, setInvoiceDetails] = useState([]);

    const [user, setUser] = useState({
      email_address: ""
    })
    const [approvalHistory, setApprovalHistory] = useState([])
    const [loading, setLoading] = useState(false);
    const fileRef = useRef(null);
    const contentToPrint = useRef(null);
    const toWords = new ToWords({localeCode: 'en-AE'});
    const [words, setWords] = useState('')
    useEffect(()=>{

      setBankLoading(true);
       window.addEventListener("beforeunload", function(event){
        window.opener.postMessage({
          childClosed: true,
          childSubmit: false,
          childEdit: false
        }, window.location.origin);
       })

        AxiosInstance.post("/invoice/details", {invoice_number : paramValue})
        .then((result) => {
          if (result.data.status === "SUCCESS") {

            setInvoice({
                    invoice_number: result.data.invoice[0].invoice_number,
                    quotation_number: result.data.invoice[0].quotation_number,
                    status: result.data.invoice[0].STATUS,
                    created_by: result.data.invoice[0].created_by_email,
                    invoice_date: dayjs(new Date(result.data.invoice[0].invoice_date)).format('DD-MMM-YYYY'),
                    assigned_to: result.data.invoice[0].assigned_to_email,
                    client_name: result.data.invoice[0].client_name,
                    attention_to: result.data.invoice[0].attention_to,
                    address: result.data.invoice[0].address,
                    client_trn: result.data.invoice[0].client_trn,
                    project_name: result.data.invoice[0].project_name,
                    project_description: result.data.invoice[0].project_description,
                    amount_without_vat: result.data.invoice[0].amount_without_vat,
                    is_vat: result.data.invoice[0].is_vat,
                    vat_percentage: result.data.invoice[0].vat_percentage,
                    vat_amount: result.data.invoice[0].vat_amount,
                    currency: result.data.invoice[0].currency,
                    company_trn: result.data.invoice[0].company_trn,
                    company_address: result.data.invoice[0].company_address,
                    amount_with_vat: result.data.invoice[0].amount_with_vat
                  });

                  
                  
                  setInvoiceDetails((invoice_detail) => [
                    ...result.data.details.map((element) => ({
                    topics: element.topics,
                    amount_without_vat: parseFloat(element.amount_without_vat).toFixed(2),
                    vat_amount: result.data.invoice[0].vat_percentage !== null ? (parseFloat(element.amount_without_vat) * (parseFloat(result.data.invoice[0].vat_percentage) / 100)).toFixed(2) : "",
                    amount_with_vat: result.data.invoice[0].vat_percentage !== null ? (parseFloat(element.amount_without_vat) + (parseFloat(element.amount_without_vat) * (parseFloat(result.data.invoice[0].vat_percentage)  / 100))).toFixed(2) : ""
                    })),
                  ]);

                 
                  setWords(toWords.convert(parseFloat(result.data.invoice[0].amount_with_vat.replace(/,/g, '')), {currency: true}));
                  
                  
                  formik_update_quotation_status.setFieldValue("invoice_number", result.data.invoice[0].invoice_number)
                  formik_update_quotation_status.setFieldValue("user_id", result.data.invoice[0].created_by)
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
          setBankLoading(false)
        })
        .catch(function(error){
          console.log(error)
        })

        AxiosInstance.get("/user/info")
        .then((result) => {
          setUser({
            ...user,
            email_address: result.data[0].email_address
          });
        })
        .catch((error) => {
          console.log(error);
        });


        AxiosInstance.post("/invoice/get_approval_history", {invoice_number : paramValue})
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
        invoice_number: "",
        user_id: "",
        comments: "",
        status: "",
        file: null,
        file_name: ""
      },
      validateOnChange: false,
      validationSchema: user.email_address === invoice.created_by && invoice.status === "VERIFIED" ? Yup.object({
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
        }) : user.email_address === invoice.created_by && invoice.status === "WAITING FOR VERIFICATION" ? 
        Yup.object({
          status: Yup.string().required("This field is required!")
       }) : null,
      onSubmit: (values, {validateForm})=>{
        setLoading(true)

        const formData = new FormData();
        formData.append('file', values.file); 
        formData.append('values', JSON.stringify(values))
        AxiosFileInstance.post("/invoice/update_invoice_status", formData)
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
        const response = await AxiosInstance.get(`/invoice/download_supporting_doc/${filename}`, {
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
                        paddingLeft: 4}}>
            <Grid container direction="column" spacing={3}>
                <div style={{overflow: 'hidden', height: 0}}>
                  <PrintComponent invoice={invoice} invoiceDetails={invoiceDetails} words={words} bankAccount={bankAccount} ref={contentToPrint} />
                </div>
                r
                <Grid item>
                    <Stack direction="column" spacing={2}>
                      <Stack direction="row" justifyContent="space-between">
                        <img src={bsLogo} width={220} alt="logo" />
                        { invoice.status === "VERIFIED" || invoice.status === "PAYMENT RECEIVED FROM CLIENT" ? 
                                <ReactToPrint
                                trigger={() => (
                                  <Grid item> 
                                <Stack direction="row" spacing={2} justifyContent="center">
                                <Button variant='contained' color="secondary">Print</Button>
                                </Stack>
                                </Grid>)}
                                content={() => contentToPrint.current}
                                documentTitle={'BSMM '+ (invoice.is_vat ? 'Tax ' : '') +'Inv.#'+paramValue.replace(/\//g, "-")+' - '+invoice.project_name}
                              /> : null }
                      
                      </Stack>
                      <Stack direction="row" justifyContent="flex-end">
                      {invoice.status ? <Typography variant="subtitle1" color="info"><strong>STATUS: {invoice.status}</strong></Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      </Stack>
                      <Stack direction="row" justifyContent="flex-end">
                      
                      {invoice.company_trn ? <Typography variant="subtitle1">TRN #: {invoice.company_trn}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      </Stack>
                 </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="row" justifyContent="center">
                    {invoice.invoice_number ? <Typography variant="h4"><strong>{invoice.is_vat ? 'TAX ' : ''}INVOICE #: {invoice.invoice_number}</strong></Typography> : <Skeleton variant="rounded" width={410} height={50} /> }
                        
                    </Stack>
                </Grid>
             
                <Grid item>
                    <Stack direction="column" spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                          {invoice.client_name ? <Typography variant="subtitle1">Client Name: {invoice.client_name}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                          {invoice.invoice_date ? <Typography variant="subtitle1">Date: {invoice.invoice_date}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        { invoice.address ? <Typography variant="subtitle1">Address: {invoice.address}</Typography> : <Skeleton variant="rounded" width={210} height={15} />}
                        { invoice.quotation_number ? <Typography variant="subtitle1">Ref Quotation #: {invoice.quotation_number}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      </Stack>
                      { invoice.client_trn ? <Typography variant="subtitle1">TRN #: {invoice.client_trn}</Typography> : invoice.client_trn === '' ? null : <Skeleton variant="rounded" width={210} height={15} /> }
                      { invoice.attention_to ? <Typography variant="subtitle1">Attention To: {invoice.attention_to}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
                      { invoice.project_name ? <Typography variant="subtitle1">Project Name: {invoice.project_name}</Typography> : <Skeleton variant="rounded" width={210} height={15} />}
                    </Stack>
                </Grid> 
                <Grid item>
                { invoiceDetails.length > 0 ? <TableContainer>
                    <Table size="small">
                        <TableHead>
                        <StyledTableRow>
                            <StyledTableCell align="left">SN</StyledTableCell>
                            <StyledTableCell align="center" sx={{ minWidth: 400 }}>TOPICS</StyledTableCell>
                            <StyledTableCell align="center">AMOUNT {invoice.currency}</StyledTableCell>
                            {
                                invoice.vat_percentage !== null ? (
                                <React.Fragment>
                                  <StyledTableCell align="center">VAT {invoice.vat_percentage}%</StyledTableCell>
                                  <StyledTableCell align="center">TOTAL {invoice.currency}</StyledTableCell>
                                </React.Fragment>
                              ): (
                                <React.Fragment>
                                <StyledTableCell align="center">TOTAL {invoice.currency}</StyledTableCell>
                                </React.Fragment>
                              )
                            }
                        </StyledTableRow>
                        </TableHead>
                        <TableBody>
                            {
                                invoiceDetails.map((invoiceDetail, i)=>(
                                  <StyledTableRow
                                  key={i}
                                  >
                                  <StyledTableCell align="left">{i+1}</StyledTableCell>
                                  <StyledTableCell component="th" scope="row">
                                      {invoiceDetail.topics}
                                  </StyledTableCell>
                                  {
                                    invoice.vat_percentage !== null ? (
                                      <React.Fragment>
                                      <StyledTableCell align="center">{invoiceDetail.amount_without_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                      <StyledTableCell align="center">{invoiceDetail.vat_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                      <StyledTableCell align="center">{invoiceDetail.amount_with_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                      </React.Fragment>
                                    ) : (
                                      <React.Fragment>
                                      <StyledTableCell align="center">{invoiceDetail.amount_without_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                      <StyledTableCell align="center">{invoiceDetail.amount_without_vat.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                                      </React.Fragment>
                                    )
                                  }
                                  </StyledTableRow>
                                ))
                            }
                        </TableBody>
                       {
                        invoice.vat_percentage !== null ? (
                          <TableFooter>
                            <StyledTableRow>
                            <StyledTableCell></StyledTableCell>
                            <StyledTableCell align="left" >GRAND TOTAL:</StyledTableCell>
                            <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_without_vat}</StyledTableCell  >
                            <StyledTableCell align="center">{invoice.currency+' '+invoice.vat_amount}</StyledTableCell>
                            <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_with_vat}</StyledTableCell>
                            </StyledTableRow>
                            <StyledTableRow sx={{backgroundColor: '#EEEEEE'}}>
                              <StyledTableCell colSpan={5}>Amount in words: {words}</StyledTableCell>
                            </StyledTableRow>
                          </TableFooter>
                        ) : (
                          <TableFooter>
                            <StyledTableRow>
                            <StyledTableCell></StyledTableCell>
                            <StyledTableCell align="left" >GRAND TOTAL:</StyledTableCell>
                            <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_with_vat}</StyledTableCell  >
                            <StyledTableCell align="center">{invoice.currency+' '+invoice.amount_with_vat}</StyledTableCell  >
                            </StyledTableRow>
                            <StyledTableRow sx={{backgroundColor: '#EEEEEE'}}>
                              <StyledTableCell colSpan={4}>Amount in words: {words}</StyledTableCell>
                            </StyledTableRow>
                          </TableFooter>
                        )
                       }
                        
                    </Table>
                </TableContainer> : <Skeleton variant="rounded" width="100%" height={200} /> } 
                </Grid>
                <Grid item>
                {!bankLoading ? (<TableContainer>
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
                </TableContainer>) : <Skeleton variant="rounded" width="100%" height={300} />  }
                </Grid>
                <Grid item>
                  {approvalHistory.length > 0 ? (<React.Fragment><Typography variant="body1"><strong>APPROVAL HISTORY</strong></Typography>
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
                  </React.Fragment>) : <Skeleton variant="rounded" width="100%" height={250} />}
        
                </Grid>
                {
                  JSON.parse(invoice.assigned_to).email_address.map((email) => {
                    if (email === user.email_address && invoice.status === "WAITING FOR VERIFICATION") {
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
                             <Stack direction="row" justifyContent="center">
                              <LoadingButton loading={loading} loadingIndicator="Submitting..." variant="contained" color="success" onClick={()=>formik_update_quotation_status.handleSubmit()
                                }>Submit</LoadingButton>
                              </Stack>
                          </Grid>
                        </React.Fragment>
                      );
                    }else if(email === user.email_address)
                    {
                      return(
                        <React.Fragment key={email}>
                          { invoice.status === "VERIFIED" ? 
                            <React.Fragment>
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
                                <MenuItem value="PAYMENT RECEIVED FROM CLIENT">
                                    PAYMENT RECEIVED
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
                          </Grid></React.Fragment>: null }
                          <Grid item>
                            <Stack direction="row" spacing={2} justifyContent="center">
                            { invoice.status === "VERIFIED" ? <React.Fragment>
                              <LoadingButton loading={loading} loadingIndicator="Submitting..." variant="contained" color="success" onClick={()=>{
                                formik_update_quotation_status.handleSubmit()
                              }}>Submit</LoadingButton></React.Fragment> : null }
                            
                            </Stack>
                          </Grid>
                        </React.Fragment>
                      )
                    }
                    return null;
                  })
                }

                {
       
                     user.email_address === invoice.created_by && invoice.status === "RETURNED FOR REVISION" ? 
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

                {/* {
                    invoice.status === 'VERIFIED' || invoice.status === 'PAYMENT RECEIVED FROM CLIENT' ? 
                    (
                      <ReactToPrint
                          trigger={() => (
                              <Grid item>
                              <Stack direction="row" spacing={2} justifyContent="center">
                                <Button variant='contained' color="secondary">Print</Button>
                              </Stack>
                            </Grid>
                          )}
                          content={() => contentToPrint.current}
                        />
                    )
                      : null
                  }
                     */}

            </Grid>
            </Paper>
            </Grid>
            </Grid>
            </Box>
    )
}
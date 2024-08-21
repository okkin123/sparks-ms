import React, { useState, useEffect } from 'react';
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
        Button} from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import AxiosInstance from '../../AxiosInstance';
import bsLogo from "../../Assets/BS LOGO.png";
import dayjs from 'dayjs';



const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      color: theme.palette.primary.dark,
    },
    [`&.${tableCellClasses.footer}`]: {
      fontSize: 14,
      color: theme.palette.primary.main,
      fontWeight: 'bold'
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
        assigned_to: "",
        client_name: "",
        attention_to: "",
        project_name: "",
        project_description: "",
    });

    const [bankAccount, setBankAccount] = useState([]);
    const [address, setAddress] = useState('');
    const [quotationDetails, setQuotationDetails] = useState([]);
    const [quotationBreakdown, setQuotationBreakdown] = useState({
        total_cost_without_vat: "",
        vat_amount: "",
        total_cost_with_vat: ""
    });

    useEffect(()=>{
        AxiosInstance.post("/quotation/details", {quotation_number : paramValue})
        .then((result) => {
          if (result.data.status === "SUCCESS") {

            setQuotation({
                    trn: result.data.trn,
                    quotation_number: result.data.quotation[0].quotation_number,
                    status: result.data.quotation[0].STATUS,
                    created_by: result.data.quotation[0].created_by_email,
                    created_on: dayjs(new Date(result.data.quotation[0].created_on)).format('DD-MMM-YYYY'),
                    assigned_to: result.data.quotation[0].assigned_to_email,
                    client_name: result.data.quotation[0].client_name,
                    attention_to: result.data.quotation[0].attention_to,
                    project_name: result.data.quotation[0].project_name,
                    project_description: result.data.quotation[0].project_description
                  });

                  setQuotationDetails((quotation_details) => [
                    ...result.data.details.map((element) => ({
                    description: element.description,
                    qty: element.qty,
                    unit_cost: parseFloat(element.unit_cost).toFixed(2),
                    total_cost: parseFloat(element.total_cost).toFixed(2)
                    })),
                  ]);


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

        AxiosInstance.get("/preferences/company_address")
        .then(function(result){
          setAddress(result.data.company_address);
          
        })
        .catch(function(error){
          console.log(error)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

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
                        <Typography variant="subtitle1" color="secondary"><strong>STATUS: {quotation.status}</strong></Typography>
                      </Stack>
                    <Typography variant="subtitle1">TRN NUMBER: {quotation.trn}</Typography>
                </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1"><strong>QUOTATION #: {quotation.quotation_number}</strong></Typography>
                        <Typography variant="subtitle1">DATE: {quotation.created_on}</Typography>
                    </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1">Client Name: {quotation.client_name}</Typography>
                        <Typography variant="subtitle1">Attention To: {quotation.attention_to}</Typography>
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
                            <StyledTableCell align="right">UNIT COST(AED)</StyledTableCell>
                            <StyledTableCell align="right">TOTAL COST(AED)</StyledTableCell>
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
                        <TableFooter>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right" >TOTAL AMOUNT COST W/OUT VAT:</StyledTableCell>
                            <StyledTableCell align="center">{parseFloat(quotationBreakdown.total_cost_without_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell  >
                            </StyledTableRow>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right">VAT 5%:</StyledTableCell>
                            <StyledTableCell align="center">{parseFloat(quotationBreakdown.vat_amount).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                            </StyledTableRow>
                            <StyledTableRow>
                            <StyledTableCell colSpan={4} align="right">TOTAL COST INCLUDING VAT:</StyledTableCell>
                            <StyledTableCell align="center">{parseFloat(quotationBreakdown.total_cost_with_vat).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</StyledTableCell>
                            </StyledTableRow>
                        </TableFooter>
                        
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
                    <TextField label="Comments" variant="outlined" multiline rows={3} fullWidth /> 
                </Grid>
                <Grid item>
                    <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="text" color="primary">Return</Button>
                    <Button variant="contained" color="secondary">Approve</Button>
                    </Stack>  
                </Grid>
                <Grid item>
                    <Stack direction="row" spacing={2} justifyContent="center">
                     <Typography variant="subtitle1">{address}</Typography>
                    </Stack>  
                </Grid>
            </Grid>
            </Paper>
            </Grid>
            </Grid>
            </Box>
    )
}
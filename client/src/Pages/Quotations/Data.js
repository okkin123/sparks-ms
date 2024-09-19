import React from 'react';
import { styled } from '@mui/material/styles';
import {Grid, 
        Typography,
        Stack,
        Table,
        TableBody,
        TableContainer,
        TableHead,
        TableFooter,
        TableRow,
        Skeleton
    } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import bsLogo from "../../Assets/BS LOGO.png";


const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      whiteSpace: 'nowrap'
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 12,
      color: theme.palette.primary.dark
    },
    [`&.${tableCellClasses.footer}`]: {
      fontSize: 12,
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

export default function Print(props){
    const quotation = props.quotation;
    const quotationDetails = props.quotationDetails;
    const bankAccount = props.bankAccount;
  
    return(
      <React.Fragment>
        <Grid item>
          <Stack direction="column" spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <img src={bsLogo} width={220} alt="logo" />
              {quotation.status ? <Typography variant="subtitle1" color="info"><strong>STATUS: {quotation.status}</strong></Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
            </Stack>
          { quotation.company_trn ? <Typography variant="subtitle1">TRN NUMBER: {quotation.company_trn}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
      </Stack>
      </Grid>
      <Grid item>
          <Stack direction="column" spacing={1}>
              { quotation.quotation_number ? <Typography variant="subtitle1"><strong>QUOTATION #: {quotation.quotation_number}</strong></Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
              { quotation.quotation_date ? <Typography variant="subtitle1">DATE: {quotation.quotation_date}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
          </Stack>
      </Grid>
      <Grid item>
          <Stack direction="column" spacing={1}>
              { quotation.client_name ? <Typography variant="subtitle1">Client Name: {quotation.client_name}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
              { quotation.attention_to ? <Typography variant="subtitle1">Attention To: {quotation.attention_to}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
          </Stack>
      </Grid>
      <Grid item>
          <Stack direction="column" spacing={1}>
              { quotation.project_name ? <Typography variant="subtitle1">Project Name: {quotation.project_name}</Typography> : <Skeleton variant="rounded" width={210} height={15} /> }
          </Stack>
      </Grid>
      <Grid item>
      { quotationDetails.length > 0 ? (<TableContainer>
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
      </React.Fragment>
    )
  }
  

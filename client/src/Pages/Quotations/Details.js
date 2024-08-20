import React, { useState, useEffect } from 'react';
import {Typography, 
        Grid, 
        Stack,
        Paper,
        Table,
        TableBody,
        TableCell,
        TableContainer,
        TableHead,
        TableFooter,
        TableRow,
        TextField,
        Button} from '@mui/material';
import AxiosInstance from '../../AxiosInstance';
import bsLogo from "../../Assets/BS LOGO.png";
import dayjs from 'dayjs';



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
                    created_on: dayjs(new Date(result.data.quotation[0].created_on)).format('YYYY-MM-DD'),
                    assigned_to: result.data.quotation[0].assigned_to_email,
                    client_name: result.data.quotation[0].client_name,
                    attention_to: result.data.quotation[0].attention_to,
                    project_name: result.data.quotation[0].project_name,
                    project_description: result.data.quotation[0].project_description
                  });

                  setQuotationDetails((quotation_details) => [
                    ...result.data.details.map((element) => ({
                    description: element.description,
                    quantity: element.quantity,
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
            <Paper sx={{padding: 5, marginLeft: 50, marginRight: 50}}>
            <Grid container direction="column" spacing={4}>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                    <img src={bsLogo} width={220} alt="logo" />
                    <Typography variant="subtitle1"><strong>TRN NUMBER:</strong> {quotation.trn}</Typography>
                </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1"><strong>QUOTATION #:</strong> {quotation.quotation_number}</Typography>
                        <Typography variant="subtitle1"><strong>DATE:</strong> {quotation.created_on}</Typography>
                    </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1"><strong>CLIENT NAME:</strong> {quotation.client_name}</Typography>
                        <Typography variant="subtitle1"><strong>ATTENTION TO:</strong> {quotation.attention_to}</Typography>
                    </Stack>
                </Grid>
                <Grid item>
                    <Stack direction="column" spacing={2}>
                        <Typography variant="subtitle1"><strong>PROJECT:</strong> {quotation.project_name}</Typography>
                        <Typography variant="subtitle1"><strong>DESRIPTION:</strong> {quotation.project_description}</Typography>
                    </Stack>
                </Grid>
                <Grid item>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                        <TableRow>
                            <TableCell align="left">SN</TableCell>
                            <TableCell sx={{ minWidth: 400 }}>DESCRIPTION</TableCell>
                            <TableCell align="center">QUANTITY</TableCell>
                            <TableCell align="right">UNIT COST(AED)</TableCell>
                            <TableCell align="right">TOTAL COST(AED)</TableCell>
                        </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                quotationDetails.map((quotationDetail, i)=>(
                                    <TableRow>
                                        <TableCell align="left">{i+1}</TableCell>
                                        <TableCell sx={{ minWidth: 400 }}>{quotationDetail.description}</TableCell>
                                        <TableCell align="center">{quotation.quantity}</TableCell>
                                        <TableCell align="right">{quotationDetail.unit_cost}</TableCell>
                                        <TableCell align="right">{quotationDetail.total_cost}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                            <TableCell colSpan={4} align="right"  >TOTAL AMOUNT COST W/OUT VAT:</TableCell>
                            <TableCell align="center">{parseFloat(quotationBreakdown.total_cost_without_vat).toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell colSpan={4} align="right">VAT 5%:</TableCell>
                            <TableCell align="center">{parseFloat(quotationBreakdown.vat_amount).toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                            <TableCell colSpan={4} align="right">TOTAL COST INCLUDING VAT:</TableCell>
                            <TableCell align="center">{parseFloat(quotationBreakdown.total_cost_with_vat).toFixed(2)}</TableCell>
                            </TableRow>
                        </TableFooter>
                        
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
            </Grid>
            </Paper>
        </React.Fragment>
    )
}
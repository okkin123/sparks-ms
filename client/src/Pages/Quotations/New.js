import React, { useState } from 'react';

import * as Yup from "yup";
import { useFormik, useFormikContext, FieldArray, FormikProvider} from 'formik';

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
         TableRow,
         Button,
         IconButton} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';


const QuotationDetails = (props)=>{
  const { values, handleChange, errors, touched } = useFormikContext();
  return(
    <FieldArray
    name="rows"
    render={() => (
      <React.Fragment>
        {values.rows.map((row, y) => (
        <TableRow
        key={y}
        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
        >
          <TableCell align="left">{y+1}</TableCell>
          <TableCell align="center">
            <TextField
            variant="outlined"
            name={`rows[${y}]`}
            value={row.description}
            onChange={handleChange}
            size="small"
            // error={touched.fields && touched.fields[index] && Boolean(errors.fields && errors.fields[index] && errors.fields[index].value)}
            // helperText={touched.fields && touched.fields[index] && errors.fields && errors.fields[index] && errors.fields[index].value}
            fullWidth
            //sx={{marginBottom: '8px'}}
            />
          </TableCell>
          <TableCell align="center">
          <TextField
          variant="outlined"
          name={`rows[${y}]`}
          value={row.quantity}
          onChange={handleChange}
          size="small"
          InputProps={{
            sx: {
              '& input': {
                textAlign: 'center'
              }
            }
          }}
          // error={touched.fields && touched.fields[index] && Boolean(errors.fields && errors.fields[index] && errors.fields[index].value)}
          // helperText={touched.fields && touched.fields[index] && errors.fields && errors.fields[index] && errors.fields[index].value}
          
          //sx={{marginBottom: '8px'}}
          />
          </TableCell>
          <TableCell align="center">{parseInt(row.quantity) / parseFloat(row.total_cost)}</TableCell>
          <TableCell align="center">
          <TextField
          variant="outlined"
          name={`rows[${y}]`}
          value={row.total_cost}
          onChange={handleChange}
          size="small"
          InputProps={{
            sx: {
              '& input': {
                textAlign: 'center'
              }
            }
          }}
          // error={touched.fields && touched.fields[index] && Boolean(errors.fields && errors.fields[index] && errors.fields[index].value)}
          // helperText={touched.fields && touched.fields[index] && errors.fields && errors.fields[index] && errors.fields[index].value}
          
          //sx={{marginBottom: '8px'}}
          />
          </TableCell>
          {props.removeField}
         
         </TableRow>
        ))}
        </React.Fragment>
      )
     
    
    }
  />
  )

}

export default function New(){

    const [rows, setRows] = useState([{
      id: 1,
      description: "",
      quatity: "",
      total_cost: ""
    }]);


    const getLastRowFieldId = () => {
      if (rows.length === 0) return null;
      return rows[rows.length - 1].id;
    };  


    const handleRemoveRowFields = (id) => {
      setRows(rows => {
        const index = rows.findIndex(row => row.id === id);
        if (index !== -1) {
          const newItems = [...rows];
          newItems.splice(index, 1);
          return newItems;
        }
        return rows;
      });
    };

    const formik = useFormik({
      initialValues: {
        rows: rows
      },
      validateOnChange: false,
      onSubmit: (values, {validateForm})=>{
        console.log(values);
      }
    })

    const handleAddRowFields = ()=>{
      const newRow =  {
        id: getLastRowFieldId() + 1,
        description: "",
        quatity: "",
        total_cost: ""
      };
      const newRows = [...rows, newRow];
      setRows(newRows);
      formik.setValues({ rows: newRows });
    }


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
                    <TextField variant='outlined' label="Client Name" fullWidth />
                    <TextField variant='outlined' label="Attention to" fullWidth/>
                 </Stack>
               </Grid>
               <Grid item>
                    <TextField variant='outlined' label="Project Name" fullWidth />
                </Grid>
                <Grid item>
                    <TextField variant='outlined' label="Project Description" multiline rows={2} fullWidth />
                </Grid>
                <Grid item>
                 <Button variant="contained" color="secondary" onClick={handleAddRowFields}>Add Row Fields</Button>
                </Grid>
                <Grid item>
                    <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                <TableRow>
                                    <TableCell align="left">SN</TableCell>
                                    <TableCell>DESCRIPTION</TableCell>
                                    <TableCell align="center">QUANTITY</TableCell>
                                    <TableCell align="center">UNIT COST(AED)</TableCell>
                                    <TableCell align="center">TOTAL COST(AED)</TableCell>
                                    <TableCell align="center">REMOVE</TableCell>
                                </TableRow>
                                </TableHead>
                                <TableBody>
                                <FormikProvider value={formik}>
                                    <QuotationDetails removeField={
                                        <TableCell align="center">
                                          {/* <IconButton color="error" onClick={()=>handleRemoveRowFields(formi)}>
                                            <DeleteIcon />
                                          </IconButton> */}
                                        </TableCell>
                                    } />
                                </FormikProvider>
                                {/* {rows.map((row, i) => (
                                    <TableRow
                                    key={i}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                    <TableCell align="left">{i+1}</TableCell>
                                    <TableCell component="th" scope="row">
                                        {row.description}
                                    </TableCell>
                                    
                                    <TableCell align="right">
                                      {row.quatity}</TableCell>
                                    <TableCell align="right">{parseInt(row.quantity)/parseFloat(row.total_cost)}</TableCell>
                                    <TableCell align="right">{row.total_cost}</TableCell>
                                    <TableCell align="right">
                                    <IconButton color="error" onClick={()=>handleRemoveRowFields(row.id)}>
                                      <DeleteIcon />
                                    </IconButton>
                                    </TableCell>
                                    </TableRow>
                                ))} */}
                                </TableBody>
                            </Table>
                        </TableContainer>
                </Grid>
                <Grid item>
                 <Divider />
                 </Grid>
                 <Grid item>
                     <Button variant='contained' color='success' sx={{float: 'right'}} onClick={formik.handleSubmit}>Create Quotation</Button>
                 </Grid>
            </Grid>
            </Paper>
           
        </React.Fragment>
    )
}
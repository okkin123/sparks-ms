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


const generateValidationSchema = (rows) => {
  const shape = {};
  rows.forEach(row => {
    shape[`description${row.id}`] = Yup.string().required('This field is required');
    shape[`quantity${row.id}`] = Yup.string().required('This field is required');
    shape[`total_cost${row.id}`] = Yup.string().required('This field is required');
  });
  return Yup.object().shape({
    rows: Yup.array().of(Yup.object().shape(shape))
  });
};

const QuotationDetails = (props)=>{
  const { values, handleChange, errors, touched } = useFormikContext();

  const handleRemoveRowFields = (id) => {
    //  setRows(rows => {
    //   const index = rows.findIndex(row => row.id === id);
    //   if (index !== -1) {
    //     const newItems = [...rows];
    //     newItems.splice(index, 1);
        
    //     return newItems;
    //   }
    //   return rows;
    // });

    const index = values.rows.findIndex(row => row.id === id);
    if (index !== -1) {
      const updatedRows = [...values.rows];
      updatedRows.splice(index, 1);

      console.log(updatedRows)
      //values.setValues({ ...values, rows: updatedRows });
    }
    
  };

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
            name={`description${row.id}`}
            value={row[`description${row.id}`]}
            onChange={handleChange}
            size="small"
            multiline
            rows={2}
            error={touched[`description${row.id}`] && Boolean(errors[`description${row.id}`])}
            helperText={touched[`description${row.id}`] && errors[`description${row.id}`]}
            fullWidth
            //sx={{marginBottom: '8px'}}
            />
          </TableCell>
          <TableCell align="center">
          <TextField
            variant="outlined"
            name={`quantity${row.id}`}
            value={values[`quantity${row.id}`]}
            onChange={handleChange}
            size="small"
            InputProps={{
              sx: {
                '& input': {
                  textAlign: 'center'
                }
              }
            }}
            error={touched[`quantity${row.id}`] && Boolean(errors[`quantity${row.id}`])}
            helperText={touched[`quantity${row.id}`] && errors[`quantity${row.id}`]}
          //sx={{marginBottom: '8px'}}
          />
          </TableCell>
          <TableCell align="center">{0}</TableCell>
          <TableCell align="center">
          <TextField
          variant="outlined"
          name={`unit_cost${row.id}`}
          value={values[`unit_cost${row.id}`]}
          onChange={handleChange}
          size="small"
          InputProps={{
            sx: {
              '& input': {
                textAlign: 'center'
              }
            }
          }}
          error={touched[`unit_cost${row.id}`] && Boolean(errors[`unit_cost${row.id}`])}
          helperText={touched[`unit_cost${row.id}`] && errors[`unit_cost${row.id}`]}
          //sx={{marginBottom: '8px'}}
          />
          </TableCell>
          <TableCell align="center">
            <IconButton color="error" onClick={()=>console.log(row)}>
              <DeleteIcon />
            </IconButton>
          </TableCell>
         
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
      [`description${1}`]: "",
      [`quantity${1}`]: "",
      [`unit_cost${1}`]: ""
    }]);


    const getLastRowFieldId = () => {
      if (rows.length === 0) return null;
      return rows[rows.length - 1].id;
    };  

    const handleAddRowFields = ()=>{
      const newRow =  {
        id: getLastRowFieldId() + 1,
        [`description${getLastRowFieldId() + 1}`]: "",
        [`quantity${getLastRowFieldId() + 1}`]: "",
        [`unit_cost${getLastRowFieldId() + 1}`]: ""
      };
      const newRows = [...rows, newRow];
      setRows(newRows);
      formik.setValues({ rows: newRows });
    }

    const formik = useFormik({
      initialValues: {
        rows: rows 
      },
      //validationSchema: generateValidationSchema(rows),
      validateOnChange: false,
      onSubmit: (values, {validateForm})=>{
        console.log(values.rows)
      }
    })



    


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
                                    <QuotationDetails />
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
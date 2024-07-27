import { 
  Grid,
  Paper,
  TextField,
  Stack,
  Button,
  Typography,
  Box,
} from "@mui/material";

import bsLogo from "../Assets/BS LOGO.png";

import { useNavigate } from "react-router-dom";
import AxiosInstance from "../AxiosInstance";
import * as React from "react"

import { useFormik } from 'formik';
import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(2, 'Field value is too short!')
    .max(45, 'Field value is too long!')
    .required('This field is required!'),
  lastname: Yup.string()
    .min(2, 'Field value is too short!')
    .max(45, 'Field value is too long!')
    .required('This field is required!'),
  email_address: Yup.string().email('Invalid email')
  .required('This field is required!')
  .test('Unique Email','Email Address is already taken!', 
    function(value){return new Promise((resolve, reject) => {
        AxiosInstance.post('/user/findEmail', {'email_address': value})
        .then(res => {if(res.data.status === 'ERROR'){resolve(false)} resolve(true)})
  })}),
  password: Yup.string()
    .min(2, 'Field value is too short!')
    .max(45, 'Field value is too long!')
    .required('This field is required!')
    .matches(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one uppercase, one number and one special case character"),
   confirm_password: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref('password'), null], "Passwords don't match."),
   token: Yup.string()
    .required('This field is required!')
    .test('Unique Token','Invalid Token!', 
      function(value){return new Promise((resolve, reject) => {
          AxiosInstance.post('/user/register', {'token': value})
          .then(res => {if(res.data.message === 'Invalid Token!'){resolve(false)} resolve(true)})
      })})
});


export default function Register() {

  const navigate = useNavigate();
  
  // const handleChange = e => {
  //   const { name, value } = e.target;
  //   setUsers(users => ({
  //       ...users,
  //       [name]: value
  //   }));
  // };

  const formik = useFormik({
    initialValues:{
      firstname: "",
      lastname: "",
      email_address: "",
      password: "",
      confirm_password: "",
      token: ""
    },
    validationSchema : RegisterSchema,
    onSubmit : (values) => {
      // same shape as initial values
      AxiosInstance.post("/user/register", values)
      .then(function(response){
          navigate('/', { state: {
            status: response.data.status,
            message: response.data.message
          }})
        
      })
      .catch(function(error){
        console.log(error)
      })
    }})

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="95vh"
    >
      <Grid container justifyContent="center">
        <Grid item xl={3} lg={4} md={6} sm={8} xs={12}>
          <Paper>
            <Stack direction="column" spacing={2} style={{ padding: 15 }}>
              <Stack direction="row" justifyContent="center">
              <img src={bsLogo} width={250} alt="logo" />
              </Stack>
              <Typography variant="h5">REGISTER</Typography>
                  <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <TextField id="firstname" label="Firstname" variant="outlined" 
                  value={formik.values.firstname} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.firstname && Boolean(formik.errors.firstname)} 
                  helperText={formik.touched.firstname && formik.errors.firstname} 
                  name="firstname" fullWidth />
                  <TextField label="Lastname" variant="outlined"
                  value={formik.values.lastname} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.lastname && Boolean(formik.errors.lastname)} 
                  helperText={formik.touched.lastname && formik.errors.lastname} 
                  name="lastname" fullWidth />
                  </Stack>
                  <TextField label="Email Address" name="email_address" variant="outlined"
                  value={formik.values.email_address} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email_address && Boolean(formik.errors.email_address)} 
                  helperText={formik.touched.email_address && formik.errors.email_address} 
                  fullWidth />
                  <TextField
                  label="Password"
                  variant="outlined"
                  type="password"
                  value={formik.values.password} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)} 
                  helperText={formik.touched.password && formik.errors.password} 
                  name="password"
                  fullWidth
                  />
                  <TextField
                  label="Confirm Password"
                  variant="outlined"
                  type="password"
                  value={formik.values.confirm_password} 
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirm_password && Boolean(formik.errors.confirm_password)} 
                  helperText={formik.touched.confirm_password && formik.errors.confirm_password} 
                  name="confirm_password"
                  fullWidth
                  />
                  <TextField label="Token" name="token" variant="outlined"
                   value={formik.values.token} 
                   onChange={formik.handleChange}
                   onBlur={formik.handleBlur}
                   error={formik.touched.token && Boolean(formik.errors.token)} 
                   helperText={formik.touched.token && formik.errors.token} 
                   fullWidth />
                  <Button variant="contained" type="button" onClick={formik.handleSubmit}>SUBMIT</Button>
                  <Button variant="text" color="info" onClick={()=>navigate('/')}>BACK TO LOGIN</Button>              
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

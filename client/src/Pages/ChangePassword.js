import React, { useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cookies from "universal-cookie";
import {
  Grid,
  Paper,
  TextField,
  Stack,
  Button,
  Typography,
  Box,
} from "@mui/material";
import * as Yup from 'yup';
import { useFormik } from 'formik';
import AxiosInstance from '../AxiosInstance';

const cookies = new Cookies();


const ChangePasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(2, "Field value is too short!")
    .max(45, "Field value is too long!")
    .required("This field is required!")
    .matches(
      /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
      "Password must contain at least 8 characters, one uppercase, one number and one special case character"
    ),
  confirm_password: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password"), null], "Passwords don't match.")
});


export default function ChangePassword() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(()=>{

    if(!location.state)
    {
      cookies.remove("TOKEN", { path: "/" });
      // redirect user to the landing page
      navigate('/');
    }
    

  })

  const formik = useFormik({
    initialValues: {
      user_id: location.state.user.user_id,
      password: "",
      confirm_password: ""
    },
    validationSchema: ChangePasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values, { validateForm }) => {
      // same shape as initial values
      AxiosInstance.post("/forgot/change_password", values)
        .then(function (response) {
          if (response.data.status === "SUCCESS") {
            cookies.remove("TOKEN", { path: "/" });
            navigate("/", {
              state: {
                status: response.data.status,
                message: response.data.message,
              },
            });
          } else {
            validateForm(values);
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    },
  });



  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="90vh"
    >
      <Grid container justifyContent="center">
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Paper>
            <Stack direction="column" spacing={2} style={{ padding: 15 }}>
              <Typography variant="h5">Change Password</Typography>
              <TextField
                label="New Password"
                variant="outlined"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
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
                error={
                  formik.touched.confirm_password &&
                  Boolean(formik.errors.confirm_password)
                }
                helperText={
                  formik.touched.confirm_password &&
                  formik.errors.confirm_password
                }
                name="confirm_password"
                fullWidth
              />
              <Button variant="contained" type="button" onClick={formik.handleSubmit}>Change Password</Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

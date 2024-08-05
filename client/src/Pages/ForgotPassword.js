import * as React from "react";
import {
  Grid,
  Paper,
  TextField,
  Stack,
  Button,
  Typography,
  Box,
} from "@mui/material";

import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";

import AxiosInstance from "../AxiosInstance";
import SendEmail from "../SendEmail";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const ForgotPasswordSchema = Yup.object().shape({
  email_address: Yup.string()
    .email("Invalid email")
    .required("This field is required!")
    .test("Find Email", "Email address is not registered!", function (value) {
      return new Promise((resolve, reject) => {
        AxiosInstance.post("/forgot/send_code", { email_address: value }).then(
          (res) => {
            if (res.data.status === "ERROR") {
              resolve(false);
            } 
            resolve(true);
          }
        );
      });
    }),
});



export default function ForgotPassword() {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email_address: "",
    },
    validationSchema: ForgotPasswordSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values, { validateForm }) => {
      // same shape as initial values
      AxiosInstance.post("/forgot/send_code", values)
        .then(function (response) {
          if (response.data.status === "SUCCESS") {
            cookies.set("TOKEN", response.data.token);
            SendEmail(response.data);
            navigate("/entercode", {state: {
              email_address: response.data.email_address,
              message: response.data.message,
              expiry: response.data.expiry
            }});
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
              <Typography variant="h5">Forgot Password</Typography>
              <TextField
                label="Email Address"
                name="email_address"
                variant="outlined"
                value={formik.values.email_address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.email_address &&
                  Boolean(formik.errors.email_address)
                }
                helperText={
                  formik.touched.email_address && formik.errors.email_address
                }
                fullWidth
              />
              <Button variant="contained" onClick={formik.handleSubmit}>
                Send Code
              </Button>
              <Button
                variant="text"
                color="secondary"
                onClick={() => navigate("/")}
              >
                Back to Login
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

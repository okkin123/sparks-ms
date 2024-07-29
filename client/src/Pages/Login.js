import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import AxiosInstance from "../AxiosInstance";

import {
  FormControlLabel,
  Checkbox,
  Grid,
  Paper,
  TextField,
  Stack,
  Button,
  Typography,
  Box,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";

import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import bsLogo from "../Assets/BS LOGO.png";

const LoginSchema = Yup.object().shape({
  email_address: Yup.string()
    .email("Invalid email")
    .required("This field is required!")
    .test("Email not found!", "Email Address not Found!", function (value) {
      return new Promise((resolve, reject) => {
        AxiosInstance.post("/user/login", { email_address: value }).then(
          (res) => {
            if (res.data.message === "Email Address not Found!") {
              resolve(false);
            }
            resolve(true);
          }
        );
      });
    }),
  password: Yup.string()
    .min(2, "Field value is too short!")
    .max(45, "Field value is too long!")
    .required("This field is required!"),
});

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);
  const formik = useFormik({
    initialValues: {
      email_address: "",
      password: "",
    },
    validationSchema: LoginSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values, { validateForm }) => {
      // same shape as initial values
      AxiosInstance.post("/user/login", values)
        .then(function (response) {
          if (response.data.status !== "ERROR") {
            navigate("/dashboard", {
              state: {
                name: response.data.name,
                email: response.data.email,
                token: response.data.token,
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
        <Grid item xl={3} lg={4} md={6} sm={8} xs={12}>
          <Paper>
            <Stack direction="column" spacing={2} style={{ padding: 15 }}>
              <Stack direction="row" justifyContent="center">
                <img src={bsLogo} width={250} alt="logo" />
              </Stack>
              <Typography variant="h5">LOGIN</Typography>
              <TextField
                label="Email Address"
                variant="outlined"
                name="email_address"
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
              <TextField
                label="Password"
                variant="outlined"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                type="password"
                fullWidth
              />
              <FormControlLabel control={<Checkbox />} label="Remember Me" />

              {location.state !== null ? (
                <Collapse in={open}>
                  <Alert
                    action={
                      <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        <CloseIcon fontSize="inherit" />
                      </IconButton>
                    }
                    sx={{ mb: 2 }}
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="info"
                  >
                    <strong>{location.state.status}!</strong>&nbsp;
                    {location.state.message}
                  </Alert>
                </Collapse>
              ) : null}
              <Button
                variant="contained"
                type="button"
                onClick={formik.handleSubmit}
              >
                LOGIN
              </Button>
              <Button variant="text" color="info">
                Forgot Password
              </Button>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="subtitle1">
                  Dont have an account?
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => navigate("/register")}
                >
                  REGISTER NOW
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

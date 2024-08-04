import React, { useRef, useState } from "react";
import {
  Grid,
  Paper,
  TextField,
  Stack,
  Button,
  Typography,
  Box
} from "@mui/material";

import * as Yup from "yup";
import { useFormik } from "formik";
import AxiosInstance from "../AxiosInstance";
import { useNavigate, useLocation } from 'react-router-dom';

const CodeSchema = Yup.object().shape({
  first_pin: Yup.number()
    .nullable()
    .required()
    .test(
      "noEOrSign", // type of the validator (should be unique)
      "Number had an 'e' or sign.", // error message
      (value) => typeof value === "number" && !/[eE+-]/.test(value.toString())
    ),
  second_pin: Yup.number()
    .nullable()
    .required()
    .test(
      "noEOrSign", // type of the validator (should be unique)
      "Number had an 'e' or sign.", // error message
      (value) => typeof value === "number" && !/[eE+-]/.test(value.toString())
    ),
  third_pin: Yup.number()
    .nullable()
    .required()
    .test(
      "noEOrSign", // type of the validator (should be unique)
      "Number had an 'e' or sign.", // error message
      (value) => typeof value === "number" && !/[eE+-]/.test(value.toString())
    ),
  fourth_pin: Yup.number()
    .nullable()
    .required()
    .test(
      "noEOrSign", // type of the validator (should be unique)
      "Number had an 'e' or sign.", // error message
      (value) => typeof value === "number" && !/[eE+-]/.test(value.toString())
    ),
});

export default function EnterCode() {
  const firstPin = useRef(null);
  const secondPin = useRef(null);
  const thirdPin = useRef(null);
  const fourthPin = useRef(null);
  const location = useLocation();
  const [message, setMessage] = useState(location.state.message);
  const navigate = useNavigate();
  const handleChange = (event, nextRef) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
    nextRef.current.focus();
  };

  const formik = useFormik({
    initialValues: {
      first_pin: "",
      second_pin: "",
      third_pin: "",
      fourth_pin: "",
    },
    validationSchema: CodeSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values, { validateForm }) => {
      // same shape as initial values
      AxiosInstance.post("/forgot/verify_code", values)
        .then(function (response) {
           if(response.data.status==="SUCCESS")
           {
            navigate("/changepassword", {
              state: {
                user: response.data.user
              } 
            });
           }
           else
           {
            setMessage(response.data.message);
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
              <Typography variant="h5">Enter Code</Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  variant="outlined"
                  inputRef={firstPin}
                  onChange={(event) => handleChange(event, secondPin)}
                  type="text"
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center" },
                    maxLength: 1,
                  }}
                  name="first_pin"
                  value={formik.values.first_pin}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.first_pin && Boolean(formik.errors.first_pin)
                  }
                />
                <TextField
                  variant="outlined"
                  inputRef={secondPin}
                  onChange={(event) => handleChange(event, thirdPin)}
                  type="text"
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center" },
                    maxLength: 1,
                  }}
                  name="second_pin"
                  value={formik.values.second_pin}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.second_pin &&
                    Boolean(formik.errors.second_pin)
                  }
                />
                <TextField
                  variant="outlined"
                  inputRef={thirdPin}
                  onChange={(event) => handleChange(event, fourthPin)}
                  type="text"
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center" },
                    maxLength: 1,
                  }}
                  name="third_pin"
                  value={formik.values.third_pin}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.third_pin && Boolean(formik.errors.third_pin)
                  }
                />
                <TextField
                  variant="outlined"
                  inputRef={fourthPin}
                  type="text"
                  inputProps={{
                    min: 0,
                    style: { textAlign: "center" },
                    maxLength: 1,
                  }}
                  name="fourth_pin"
                  value={formik.values.fourth_pin}
                  onChange={(event) => handleChange(event, fourthPin)}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.fourth_pin &&
                    Boolean(formik.errors.fourth_pin)
                  }
                />
              </Stack>
              <Typography variant="subtitle1">{message}</Typography>    
              <Button
                variant="contained"
                type="button"
                onClick={formik.handleSubmit}
              >
                Verify Code
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

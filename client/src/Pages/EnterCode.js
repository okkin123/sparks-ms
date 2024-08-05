import React, { useRef, useState, useEffect} from "react";
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
import SendEmail from "../SendEmail";
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from "universal-cookie";

const cookies = new Cookies();

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

const PinCodeExpired = (props)=>
{
  return(
    <React.Fragment>
    <Grid item>
      <Typography variant="subtitle1">{props.message}</Typography>
    </Grid>
    <Grid item container alignItems="center">
      <Grid item>
        <Typography variant="subtitle1" color="error">Your PIN Code has expired!</Typography>
      </Grid>
      <Grid item>
        <Button variant="text" color="secondary" size="small" onClick={props.OnSendAgain}>Send Again?</Button>
      </Grid>
  </Grid>
  </React.Fragment>
  )

}

const PinWillExpireIn = (props)=>
{
  return(

    <React.Fragment>
      <Grid item>
        <Typography variant="subtitle1">{props.message}</Typography>  
      </Grid>
      <Grid item>
        <Typography variant="subtitle1" color="error">{"Your PIN Code will expire in: "+props.expiry+"s."}</Typography>
      </Grid>
    </React.Fragment>
  )

}

const SendAgain = (values, setCodeData)=>{
  AxiosInstance.post("/forgot/send_code", values)
  .then(function (response) {
    if (response.data.status === "SUCCESS") {
      cookies.set("TOKEN", response.data.token);
      SendEmail(response.data);
      setCodeData({
        email_address: response.data.email_address,
        message: response.data.message,
        expiry: response.data.expiry
      });
    } 
  })
  .catch(function (error) {
    console.log(error);
  });
}

export default function EnterCode() {
  const firstPin = useRef(null);
  const secondPin = useRef(null);
  const thirdPin = useRef(null);
  const fourthPin = useRef(null);
  const location = useLocation();
  const [codeData, setCodeData] = useState({
    message: location.state.message,
    email_address: location.state.email_address,
    expiry: location.state.expiry
  });
  const navigate = useNavigate();
  const handleChange = (event, nextRef) => {
    const { name, value } = event.target;
    formik.setFieldValue(name, value);
    nextRef.current.focus();
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCodeData(codeData => {
        if (codeData.expiry > 0) {
          return { ...codeData, expiry: codeData.expiry - 1 };
        } else {
          cookies.remove('TOKEN');
          return { ...codeData, expiry: 0 };
        }
      });
    }, 1000);
  
    return () => clearInterval(timer);
  }, []);
  
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
            setCodeData({...codeData, message: response.data.message});
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

              { codeData.expiry === 0 ? <PinCodeExpired message={codeData.message} OnSendAgain={()=>SendAgain(codeData, setCodeData)} /> : 
              <PinWillExpireIn message={codeData.message} expiry={codeData.expiry} />}
              
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

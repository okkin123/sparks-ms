import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Grid,
  Button,
  Modal,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  ListItemAvatar,
  Avatar,
  MenuItem,
  Select,
  FormHelperText,
  Skeleton,
} from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import * as Yup from "yup";
import { useFormik } from "formik";
import AxiosInstance from "../AxiosInstance";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "fullname", headerName: "FULLNAME", width: 200 },
  { field: "email_address", headerName: "EMAIL", width: 250 },
  { field: "user_type", headerName: "ROLE", width: 130 },
];

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 15,
  p: 2,
};

const Demo = styled("div")(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const RegistrationCodeSchema = Yup.object().shape({
  registration_code: Yup.string().required("This field is required!"),
  role: Yup.string().required("This field is required!"),
});

export default function ManageUser() {
  const [open, setOpen] = useState(false);
  const [dense, setDense] = React.useState(false);
  const [registrationCodes, setRegistrationCodes] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [generateState, setGenerateState] = useState({
    loading: false,
    disabled: false,
  });
  const [response, setResponse] = useState("");
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleMouseDownCopy = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const formik = useFormik({
    initialValues: {
      registration_code: "",
      role: "",
    },
    validationSchema: RegistrationCodeSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: (values, { validateForm }) => {
      // same shape as initial values
      // refresh
      AxiosInstance.post("/user/add_registration_code", values)
        .then(function (response) {
          if (response.data.status === "SUCCESS") {
            formik.setValues({ registration_code: "", role: "" });
            setRefresh(!refresh);
          } else {
            validateForm(values);
          }
          setResponse(response.data.message);
        })
        .catch(function (error) {
          console.log(error);
        })
        .finally(() => {
          setGenerateState({ ...generateState, disabled: false });
        });
    },
  });

  function OpenRegistrationCodes() {
    setOpen(true);
    setRefresh(!refresh);
  }

  useEffect(() => {
    setUsers([]);
    AxiosInstance.get("/user/list")
      .then((result) => {
        setUsers((users) => [
          ...result.data.map((element) => ({
            id: element.user_id,
            fullname: element.fullname,
            email_address: element.email_address,
            user_type: element.user_type,
          })),
        ]);
      })
      .catch((error) => {
        console.log(error);
      });

    setUserTypes([]);
    AxiosInstance.get("/user/get_user_types")
      .then((result) => {
        setUserTypes((userTypes) => [
          ...result.data.map((element) => ({
            user_type_id: element.user_type_id,
            user_type: element.user_type,
          })),
        ]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  useEffect(() => {
    setRegistrationCodes([]);
    AxiosInstance.get("/user/get_registration_code")
      .then((result) => {
        // assign the message in our result to the message we initialized above
        setRegistrationCodes((registrationCodes) => [
          ...result.data.map((element) => ({
            code: element.code,
            status: element.status,
            isCopied: false,
          })),
        ]);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [refresh]);

  function generateRegistrationCode() {
    setGenerateState({ ...generateState, loading: true });
    AxiosInstance.get("/user/generate_registration_code").then((result) => {
      formik.setFieldValue("registration_code", result.data.registration_code);
      setGenerateState({ loading: false, disabled: true });
    });
  }

  return (
    <React.Fragment>
      <Toolbar />
      <Grid container direction="column" spacing={2}>
        <Grid item container justifyContent="space-between">
          <Typography variant="subtitle1">Manage Users</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={OpenRegistrationCodes}
          >
            Registration Codes
          </Button>
          <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style}>
              <Grid container direction="column" spacing={2}>
                <Grid item container justifyContent="space-between">
                  <Grid item>
                    <Typography variant="subtitle1">
                      REGISTRATION CODES
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => setOpen(false)}
                    >
                      CLOSE
                    </Button>
                  </Grid>
                </Grid>
                <Grid item>
                  {registrationCodes.length > 0 ? (
                    <Demo>
                      <List
                        style={{ maxHeight: "300px", overflow: "auto" }}
                        dense={dense}
                      >
                        {registrationCodes.map((registrationCode, key) => {
                          return (
                            <ListItem
                              key={key}
                              secondaryAction={
                                <IconButton
                                  edge="end"
                                  aria-label="copy"
                                  onMouseDown={handleMouseDownCopy}
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      registrationCode.code
                                    );
                                    setRegistrationCodes((registrationCodes) =>
                                      registrationCodes.map((code, index) =>
                                        index === key
                                          ? { ...code, isCopied: true }
                                          : { ...code, isCopied: false }
                                      )
                                    );
                                  }}
                                >
                                  {registrationCode.isCopied ? (
                                    <Typography variant="body1">
                                      Copied!
                                    </Typography>
                                  ) : (
                                    <ContentCopyIcon />
                                  )}
                                </IconButton>
                              }
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <QrCodeScannerIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  registrationCode.code.substring(0, 40) + "..."
                                }
                                secondary={registrationCode.status}
                                secondaryTypographyProps={{
                                  color:
                                    registrationCode.status === "available"
                                      ? theme.palette.success.main
                                      : theme.palette.error.main,
                                }}
                              />
                            </ListItem>
                          );
                        })}
                      </List>
                    </Demo>
                  ) : (
                    <Typography variant="subtitle1">Loading...</Typography>
                  )}
                </Grid>
                <Grid item>
                  <FormControl
                    variant="outlined"
                    fullWidth
                    error={
                      formik.touched.registration_code &&
                      Boolean(formik.errors.registration_code)
                    }
                  >
                    <InputLabel htmlFor="outlined-adornment-registration-code">
                      Registration Code
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-registration-code"
                      name="registration_code"
                      endAdornment={
                        <InputAdornment position="end">
                          <LoadingButton
                            variant="text"
                            color="secondary"
                            onClick={generateRegistrationCode}
                            loading={generateState.loading}
                            disabled={generateState.disabled}
                          >
                            Generate Code
                          </LoadingButton>
                        </InputAdornment>
                      }
                      label="Registration Code"
                      placeholder="Registration Code"
                      value={formik.values.registration_code}
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                      readOnly
                    />
                    <FormHelperText>
                      {formik.touched.registration_code &&
                        formik.errors.registration_code}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl
                    fullWidth
                    error={formik.touched.role && Boolean(formik.errors.role)}
                  >
                    <InputLabel id="demo-simple-select-label">Role</InputLabel>
                    <Select
                      name="role"
                      value={formik.values.role}
                      label="Role"
                      onBlur={formik.handleBlur}
                      onChange={formik.handleChange}
                    >
                      {userTypes.map((userType, key) => {
                        return (
                          <MenuItem value={userType.user_type_id}>
                            {userType.user_type}
                          </MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText>
                      {formik.touched.role && formik.errors.role}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item>
                  <Typography variant="body1">{response}</Typography>
                </Grid>
                <Grid item>
                  <LoadingButton
                    variant="contained"
                    type="button"
                    color="secondary"
                    loading={false}
                    onClick={formik.handleSubmit}
                  >
                    Add Registration Code
                  </LoadingButton>
                </Grid>
              </Grid>
            </Box>
          </Modal>
        </Grid>
        <Grid item style={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={users}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

import React, { useState, useEffect } from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
  Box,
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
  ListItemText,
  IconButton,
  ListItemAvatar,
  Avatar,
  MenuItem,
  Select,
  FormHelperText,
  Paper,
  Chip,
  Checkbox,
  Stack,
  Divider,
  Alert,
  Collapse
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import LoadingButton from "@mui/lab/LoadingButton";
import * as Yup from "yup";
import { useFormik } from "formik";
import AxiosInstance from "../AxiosInstance";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import {
  MaterialReactTable,
} from 'material-react-table';

const columns = [
  {
    accessorKey: 'id',
    header: 'USER ID'
  },
  {
    accessorKey: 'fullname',
    header: 'NAME'
  },
  {
    accessorKey: 'email_address',
    header: 'EMAIL ADDRESS',
    Cell: ({renderedCellValue, row}) =>  <Chip color="secondary" label={renderedCellValue} />
  },
  {
    accessorKey: 'user_type',
    header: 'ROLE'
  },
  {
    accessorKey: 'reporting_to',
    header: 'REPORTING TO',
    Cell: ({renderedCellValue, row})=>{
      if(renderedCellValue.reporting_to !== null)
      {
        const emails = JSON.parse(renderedCellValue.reporting_to_email).email_address;
        return (
          <div>
            {emails.map((email, index) => (
              <Chip key={index} label={email} color={index % 2 === 0  ? 'info' : 'error'} />
            ))}
            <IconButton size='small' color="success" onClick={()=>renderedCellValue.handleShowReportingTo(row.original.id)}>
              <EditIcon fontSize='inherit' />
            </IconButton>
          </div>

        );
      }else{
        return(
          <IconButton size='small' color="success" onClick={()=>renderedCellValue.OpenReportingTo(row.original.id)}>
            <EditIcon fontSize='inherit' />
          </IconButton>
        )
      }

} 
  }
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
  const [open, setOpen] = useState({
    registrationCodes: false,
    reportingTo: false
  });
  const [registrationCodes, setRegistrationCodes] = useState([]);
  const [reportingTos, setReportingTos] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userTypes, setUserTypes] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [generateState, setGenerateState] = useState({
    loading: false,
    disabled: false,
  });
  const [response, setResponse] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    icon: null,
    message: '',
    severity: ''
  })
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
    setOpen({
      ...open,
      registrationCodes: true
    });
    setRefresh(!refresh);
  }

  function OpenReportingTo(user_id) {
    setOpen({
      ...open,
      reportingTo: true
    });
    setSelectedUser(user_id);
  }

  useEffect(() => {
    setLoading(true)
    AxiosInstance.get("/user/list")
      .then((result) => {
        setUsers((users) => [
          ...result.data.map((element) => ({
            id: element.user_id,
            fullname: element.fullname,
            email_address: element.email_address,
            user_type: element.user_type,
            reporting_to: {reporting_to_email: element.reporting_to_email, handleShowReportingTo: handleShowReportingTo},
            code: element.code
          })),
        ]);
        setLoading(false)
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


      

      // eslint-disable-next-line
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



        // eslint-disable-next-line
  }, [refresh]);

  function generateRegistrationCode() {
    setGenerateState({ ...generateState, loading: true });
    AxiosInstance.get("/user/generate_registration_code").then((result) => {
      formik.setFieldValue("registration_code", result.data.registration_code);
      setGenerateState({ loading: false, disabled: true });
    });
  }

  function handleShowReportingTo(user_id){
    OpenReportingTo(user_id)
    setReportingTos([]);
    AxiosInstance.post("/user/reporting_to_list", {user_id: user_id})
      .then((result) => {
        setReportingTos((reportingTos) => [
          ...result.data.map((element) => ({
            user_id: element.user_id,
            name: element.fullname,
            role: element.user_type,
            selected: false
          })),
        ]);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function handleUpdateReportingTo(user_id) {
    const no_selection = reportingTos.every(reportingTo => reportingTo.selected === false);
    if(!no_selection){
      AxiosInstance.post("user/update_reporting_to", {reportingTos: reportingTos.filter(reportingTo => reportingTo.selected === true), user_id : user_id})
      .then((response)=>{
        if(response.data.status === "SUCCESS"){
          setAlert({
            open: true,
            icon: (<CheckIcon fontSize="inherit" />),
            message: response.data.message,
            severity: 'success'
          })
          setOpen({
            ...open,
            reportingTo: false
          });
        }else{
          console.log(response.data.message)
        }
      })
      .catch((error)=>{
        console.log(error)
      })
    }
  }

  return (
    <React.Fragment>
      <Toolbar />
      <Grid container direction="column" spacing={2}>
        <Grid item container justifyContent="space-between">
          <Typography variant="h6">MANAGE USERS</Typography>
          <Button
            variant="contained"
            color="secondary"
            onClick={OpenRegistrationCodes}
          >
            Registration Codes
          </Button>
          <Modal
            open={open.registrationCodes}
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
                      onClick={() => setOpen({
                        ...open,
                        registrationCodes: false
                      })}
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
                    size="small"
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
                    size="small"
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
        <Grid item>
        <Collapse in={alert.open}>
            <Alert
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => setAlert({...alert, open: false})}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
                sx={{ mb: 2 }}
                icon={alert.icon}
                severity={alert.severity}
            >
                {alert.message}
            </Alert>
        </Collapse>
        </Grid>
        <Grid item>
            <Paper>
                <Box 
                sx={{
                  width: window.innerWidth - 290,
                  overflowX: 'auto'
                }}>
               
                 <MaterialReactTable
                 enableColumnFilters={false}
                 enableColumnActions={false}
                 enableDensityToggle={false}
                 enableHiding={false}
                 enableGlobalFilter={true}
                 enableRowSelection={false}
                 positionGlobalFilter='left'
                 initialState={{
                  density: 'compact',
                  isLoading: loading,
                  columnPinning: { left: ['locked','quotation_number', 'status'] },
                  showGlobalFilter: true,
                 }}
                 state={{
                  isLoading: loading
                 }}
                 muiTableHeadCellProps={{
                  sx:{
                    backgroundColor: theme.palette.primary.main,
                    color: 'white'
                  }
                 }}
                 muiSearchTextFieldProps={{
                  placeholder: 'Search Keyword...',
                  sx: { minWidth: '18rem'},
                  variant: 'outlined',
                }}
                 muiPaginationProps={{
                  rowsPerPageOptions: [10, 20],
                  variant: 'outlined',
                 }}
                paginationDisplayMode='pages'
                 columns={columns} data={users} />
                
                 </Box>
           </Paper>

           <Modal
            open={open.reportingTo}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            >
              <Box sx={style}>
              <Grid container direction="column" spacing={2}>
                <Grid item>
                    <Typography variant="subtitle1">
                      REPORTING TO
                    </Typography>
                </Grid>
                <Grid item>
                  {reportingTos.length > 0 ? (
                    <Demo>
                      <List
                        style={{ maxHeight: "300px", overflow: "auto" }}
                      >
                        {reportingTos.map((reportingTo, key) => {
                          return (
                            <React.Fragment>
                            <ListItem
                              key={key}
                              secondaryAction={
                                <Checkbox  
                                onClick={() => {
                                  setReportingTos((reportingTos) =>
                                    reportingTos.map((to, index) =>
                                      index === key ? { ...to, selected: !to.selected } : to
                                    )
                                  );
                                }} checked={reportingTo.selected} />
                              }
                            >
                              <ListItemAvatar>
                                <Avatar>
                                  <PersonIcon />
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  reportingTo.name
                                }
                                secondary={reportingTo.role}
                              />
                            </ListItem>
                            <Divider />
                            </React.Fragment>
                          );
                        })}

                      </List>
                    </Demo>
                  ) : (
                    <Typography variant="subtitle1">Loading...</Typography>
                  )}
                </Grid>
                <Grid item>
                  <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Button onClick={() => setOpen({
                        ...open,
                        reportingTo: false
                      })}  >Cancel</Button>
                  <Button variant="contained" color="success" onClick={()=>handleUpdateReportingTo(selectedUser)}>Update</Button>
                  </Stack>
                </Grid>
              </Grid>
              </Box>
            </Modal>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

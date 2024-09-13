import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: ['"Dosis"', "Open Sans"].join(","),
  },
  palette: {
    mode: "light",
    primary: {
      main: "#4C4A48",
    },
    secondary: {
      main: "#0078D7",
    },
    info: {
      main: "#8764B8",
    },
    success: {
      main: "#388E3C",
    },
    warning: {
      main: "#FFB900",
    },
    error: {
      main: "#E74856",
    },

  },
});

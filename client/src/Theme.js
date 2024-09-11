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
      main: "#1877F2",
    },
    info: {
      main: "#744DA9",
    },
    success: {
      main: "#018574",
    },
    warning: {
      main: "#F57D00",
    },
    error: {
      main: "#E4405F",
    },

  },
});

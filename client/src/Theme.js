import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: ['"LXGW WenKai Mono TC"', "monospace"].join(","),
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
      main: "#744DA9",
    },
    success: {
      main: "#10893E",
    },
    warning: {
      main: "#F7630C",
    },
    error: {
      main: "#E74856",
    },

  },
});

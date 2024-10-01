import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  typography: {
    fontFamily: ['"Nunito"', "sans-serif"].join(","),
  },
  palette: {
    mode: "light",
    primary: {
      main: '#4C4A48',
    },
    secondary: {
      main: '#0078D7',
    },
    error: {
      main: '#E74856',
    },
    warning: {
      main: '#F7630C',
    },
    info: {
      main: '#744DA9',
    },
    success: {
      main: '#10893E',
    },
    common: {
      white: '#fff'
    }
  },
});

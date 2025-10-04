// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#004d40', // A deep, professional teal/green
    },
    secondary: {
      main: '#ffab40', // An accent orange
    },
  },
  typography: {
    fontFamily: [
      'Poppins',
      'sans-serif',
    ].join(','),
    h4: {
        fontWeight: 600,
    },
    h5: {
        fontWeight: 600,
    },
  },
});

export default theme;
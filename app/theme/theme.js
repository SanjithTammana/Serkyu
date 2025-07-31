import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c2c2c', // Deep charcoal gray for interactive elements
    },
    secondary: {
      main: '#aab0e5', // Soft pastel periwinkle blue
    },
    background: {
      default: '#aab0e5', // Primary background - periwinkle blue
      paper: '#ffffff', // White for cards and papers
    },
    text: {
      primary: '#2c2c2c', // Deep charcoal gray for primary text
      secondary: '#000000', // Pure black for headers and navigation
    },
    info: {
      main: '#fff3e6', // Warm cream for accents
    },
    // Custom navigation colors
    nav: {
      main: '#000000', // Pure black for navigation
      contrastText: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'sans-serif, Georgia, serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#000000', // Black for headers
      '@media (max-width:600px)': {
        fontSize: '2rem',
      },
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#000000', // Black for headers
      '@media (max-width:600px)': {
        fontSize: '1.5rem',
      },
    },
    h6: {
      fontWeight: 700,
      color: '#ffffff', // White for navigation
    },
    body1: {
      fontSize: '1rem',
      color: '#2c2c2c', // Charcoal gray for body text
    },
    body2: {
      fontSize: '0.9rem',
      color: '#2c2c2c', // Charcoal gray for smaller text
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '10px 20px',
          transition: 'transform 0.3s ease, background-color 0.3s ease, box-shadow 0.3s ease',
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          textTransform: 'none',
          fontWeight: 'bold',
          '&:hover': {
            transform: 'scale(1.02)',
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'box-shadow 0.3s ease, transform 0.3s ease',
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          '&:hover': {
            boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000', // Pure black for app bar
          color: '#ffffff',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          paddingLeft: '32px',
          paddingRight: '32px',
          '@media (max-width: 960px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
  },
});

export default theme;
import { extendTheme } from '@mui/material/styles';

export const createTheme = () => {
  return extendTheme({
    colorSchemes: {
      light: {
        palette: {
          secondary: {
            main: 'rgb(245, 245, 245)',
          },
          primary: {
            main: '#2094FF',
          },
        },
      },
    },

    typography: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
      h1: { fontWeight: 600 },
      h2: { fontWeight: 600 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },

    components: {
      MuiButton: {
        styleOverrides: {
          sizeLarge: 'padding: 12px 18px;',
        },
      },

      MuiIconButton: {
        styleOverrides: {
          root: 'border-radius: 4px',
        },
      },

      MuiModal: {
        styleOverrides: {
          root: 'display: flex;justify-content: center;align-items:center',
        },
      },

      MuiFormHelperText: {
        styleOverrides: {
          root: 'margin-left: 0;margin-right: 0;',
        },
      },
    },
  });
};

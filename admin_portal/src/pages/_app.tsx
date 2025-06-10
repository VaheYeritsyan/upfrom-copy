import { CacheProvider, EmotionCache } from '@emotion/react';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers-pro/AdapterDayjs';
import { AppProps } from 'next/app';
import { Inter } from 'next/font/google';
import { SnackbarProvider } from 'notistack';
import { FC } from 'react';
import { AuthContextProvider } from '~/contexts/authContext';
import { GraphqlContextProvider } from '~/contexts/graphqlContext';
import { createEmotionCache } from '~/util/styles/cache';
import { createTheme } from '~/util/styles/theme';

export type Props = AppProps & {
  emotionCache?: EmotionCache;
};

const clientSideEmotionCache = createEmotionCache();
const theme = createTheme();

export const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const App: FC<Props> = ({ Component, pageProps, emotionCache = clientSideEmotionCache }) => {
  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={emotionCache}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <GlobalStyles styles={{ fontFamily: 'Inter, sans-serif' }} />
          <SnackbarProvider maxSnack={2} autoHideDuration={3000}>
            <AuthContextProvider>
              <GraphqlContextProvider>
                <style jsx global>{`
                  html {
                    font-family: ${inter.style.fontFamily};
                  }
                `}</style>

                <Component {...pageProps} />
              </GraphqlContextProvider>
            </AuthContextProvider>
          </SnackbarProvider>
        </LocalizationProvider>
      </CacheProvider>
    </ThemeProvider>
  );
};

export default App;

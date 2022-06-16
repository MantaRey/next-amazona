import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { SnackbarProvider } from 'notistack';
import '../styles/globals.css';
import { StoreProvider } from '../utils/store';

function MyApp({ Component, pageProps }) {
  return (
    <SnackbarProvider anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <StoreProvider>
        <PayPalScriptProvider deferLoading={true}>
          <Component {...pageProps} />
        </PayPalScriptProvider>
      </StoreProvider>
    </SnackbarProvider>
  );
}

export default MyApp;

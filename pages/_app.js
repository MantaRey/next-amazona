import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { SnackbarProvider } from 'notistack';
import '../styles/globals.css';
import { StoreProvider } from '../utils/store';

function MyApp({ Component, pageProps }) {
  //Use Effect is fix the issue with the rendering of server side Material UI elements
  //Originally, when you refresh the page, the Material UI styling will be reverted back to default
  // useEffect(() => {
  //   const jssStyles = document.querySelector('#jss-server-side');
  //   if (jssStyles) {
  //     jssStyles.parent.removeChild(jssStyles);
  //   }
  // }, []);
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

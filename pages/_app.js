import { useEffect } from 'react';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  //Use Effect is fix the issue with the rendering of server side Material UI elements
  //Originally, when you refresh the page, the Material UI styling will be reverted back to default
  // useEffect(() => {
  //   const jssStyles = document.querySelector('#jss-server-side');
  //   if (jssStyles) {
  //     jssStyles.parent.removeChild(jssStyles);
  //   }
  // }, []);
  return <Component {...pageProps} />;
}

export default MyApp;

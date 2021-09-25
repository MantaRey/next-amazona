import { makeStyles } from '@material-ui/core';
/*
Changes CSS for Material-UI Components
Similar format as normal CSS except this uses camelCase
Ex: Css -> background-color         Material-ui -> backgroundColor
*/

const useStyles = makeStyles({
  navbar: {
    background: '#203040',
    color: '#fffff',
    '& a': {
      color: '#ffffff',
      marginLeft: 10,
      //10 will be converted automatically to 10px
    },
  },
  main: {
    minHeight: '80vh',
  },
  footer: {
    textAlign: 'center',
  },
});

export default useStyles;

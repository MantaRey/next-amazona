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
  brand: {
    fontWeight: 'bold',
    fontSize: '1.5rem',
  },
  grow: {
    flexGrow: 1,
  },
  main: {
    minHeight: '80vh',
  },
  footer: {
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    marginTop: 10,
    marginBottom: 10,
  },
  form: {
    width: '100%',
    maxWidth: 800,
    margin: '0 auto',
  },
  navbarButton: {
    color: '#ffffff',
    textTranform: 'initial',
  },
  transparentBackground: {
    backgroundColor: 'transparent',
  },
  error: {
    color: '#f04040',
  },
  fullWidth: {
    width: '100%',
  },
  reviewForm: {
    maxWidth: 800,
    width: '100%',
  },
  reviewItem: {
    marginRight: '1rem',
    borderRight: '1px #808080 solid',
    paddingRight: '1rem',
  },
});

export default useStyles;

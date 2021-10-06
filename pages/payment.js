import {
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@material-ui/core';
import { FormControl, List, ListItem } from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import CheckoutWizard from '../components/CheckoutWizard';
import Layout from '../components/Layout';
import { Store } from '../utils/store';
import useStyles from '../utils/styles';

const Payment = () => {
  const classes = useStyles();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [paymentMethod, setPaymentMethod] = useState('');
  const { cart } = state;

  useEffect(() => {
    if (!cart.shippingAddress) {
      router.push('/shipping');
    } else {
      setPaymentMethod(cart.paymentMethod || '');
    }
  }, [router, cart.shippingAddress, cart.paymentMethod]);

  const submitHandler = (e) => {
    closeSnackbar();
    e.preventDefault();
    if (!paymentMethod) {
      enqueueSnackbar('Payment method is required', { variant: 'error' });
    } else {
      dispatch({ type: 'SAVE_PAYMENT_METHOD', payload: paymentMethod });
      router.push('/placeorder');
    }
  };

  return (
    <Layout title="Payment Method">
      <CheckoutWizard activeStep={2}></CheckoutWizard>
      <form className={classes.form} onSubmit={submitHandler}>
        <Typography component="h1" variant="h1">
          Payment Method
        </Typography>
        <List>
          <ListItem>
            <FormControl component="fieldset">
              <RadioGroup
                aria-label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  label="PayPal"
                  value="PayPal"
                  control={<Radio />}
                ></FormControlLabel>
                <FormControlLabel
                  label="Stripe"
                  value="Stripe"
                  control={<Radio />}
                ></FormControlLabel>
                <FormControlLabel
                  label="Cash"
                  value="Cash"
                  control={<Radio />}
                ></FormControlLabel>
              </RadioGroup>
            </FormControl>
          </ListItem>
          <ListItem>
            <Button fullWidth type="submit" variant="contained" color="primary">
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              type="button"
              variant="contained"
              onClick={() => router.push('/shipping')}
            >
              Back
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
};

export default Payment;

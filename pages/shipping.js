import {
  Button,
  InputAdornment,
  List,
  ListItem,
  TextField,
  Typography,
} from '@material-ui/core';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LandscapeIcon from '@mui/icons-material/Landscape';
import NumbersIcon from '@mui/icons-material/Numbers';
import PublicIcon from '@mui/icons-material/Public';
import React, { useContext, useEffect } from 'react';
import Layout from '../components/Layout';
import useStyles from '../utils/styles';
import { Store } from '../utils/store';
import { useRouter } from 'next/router';
import { Controller, useForm } from 'react-hook-form';
import CheckoutWizard from '../components/CheckoutWizard';

const Shipping = () => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress, cartItems },
  } = state;
  const { location } = shippingAddress;
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();
  useEffect(() => {
    if (!userInfo) {
      router.push('/login?redirect=/shipping');
    } else if (cartItems.length === 0) {
      router.push('/cart');
    } else {
      setValue('fullName', shippingAddress.fullName);
      setValue('address', shippingAddress.address);
      setValue('city', shippingAddress.city);
      setValue('state', shippingAddress.state);
      setValue('postalCode', shippingAddress.postalCode);
      setValue('country', shippingAddress.country);
    }
  }, [
    router,
    userInfo,
    setValue,
    shippingAddress.fullName,
    shippingAddress.address,
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.postalCode,
    shippingAddress.country,
    location,
    cartItems,
  ]);

  const classes = useStyles();

  const submitHandler = ({
    fullName,
    address,
    city,
    state,
    postalCode,
    country,
  }) => {
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        state,
        postalCode,
        country,
        location,
      },
    });
    router.push('/payment');
  };

  const chooseLocationHandler = () => {
    const fullName = getValues('fullName');
    const address = getValues('address');
    const city = getValues('city');
    const state = getValues('state');
    const postalCode = getValues('postalCode');
    const country = getValues('country');
    dispatch({
      type: 'SAVE_SHIPPING_ADDRESS',
      payload: {
        fullName,
        address,
        city,
        state,
        postalCode,
        country,
        location,
      },
    });
    router.push('/map');
  };

  return (
    <Layout title="Shipping Address">
      <CheckoutWizard activeStep={1} />
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
        <Typography componet="h1" variant="h1">
          Shipping Address
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  inputProps={{ type: 'fullName' }}
                  error={Boolean(errors.fullName)}
                  helperText={
                    errors.fullName
                      ? errors.fullName.type === 'minLength'
                        ? 'Full Name length must be more than 1 character'
                        : 'Full Name is Required'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <AccountCircleIcon sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Button
              variant="contained"
              type="button"
              color="secondary"
              onClick={chooseLocationHandler}
            >
              Choose on Map
            </Button>
            <Typography>
              &nbsp;{location && `${location.lat}, ${location.lng}`}
            </Typography>
          </ListItem>

          <ListItem>
            <Controller
              name="address"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 7,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="address"
                  label="Address"
                  inputProps={{ type: 'address' }}
                  error={Boolean(errors.address)}
                  helperText={
                    errors.address
                      ? errors.address.type === 'minLength'
                        ? 'Address length must be more than 6 characters'
                        : 'Address is Required'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <HomeIcon sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="city"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="city"
                  label="City"
                  inputProps={{ type: 'city' }}
                  error={Boolean(errors.city)}
                  helperText={
                    errors.city
                      ? errors.city.type === 'minLength'
                        ? 'City length must be more than 1 character'
                        : 'City is Required'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <LocationCityIcon sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="state"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
                maxLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="state"
                  label="State"
                  inputProps={{ type: 'state' }}
                  error={Boolean(errors.state)}
                  helperText={
                    errors.state
                      ? errors.state.type === 'minLength' ||
                        errors.state.type === 'maxLength'
                        ? 'Must use 2 letter State abbreviation'
                        : 'State is Required'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <LandscapeIcon sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="postalCode"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 4,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="postalCode"
                  label="Postal Code"
                  inputProps={{ type: 'postalCode' }}
                  error={Boolean(errors.postalCode)}
                  helperText={
                    errors.postalCode
                      ? errors.postalCode.type === 'minLength'
                        ? 'Postal Code length must be more than 3 character'
                        : 'Postal Code is Required'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <NumbersIcon sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Controller
              name="country"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="country"
                  label="Country"
                  inputProps={{ type: 'country' }}
                  error={Boolean(errors.country)}
                  helperText={
                    errors.country
                      ? errors.country.type === 'minLength'
                        ? 'Country length must be more than 1 character'
                        : 'Country is Required'
                      : ''
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <PublicIcon sx={{ mr: 1 }} />
                      </InputAdornment>
                    ),
                  }}
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>

          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              Continue
            </Button>
          </ListItem>
          <ListItem>
            <Button
              fullWidth
              type="button"
              variant="contained"
              onClick={() => router.push('/cart')}
            >
              Back
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
};

export default Shipping;

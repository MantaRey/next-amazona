import {
  Button,
  Card,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PasswordIcon from '@mui/icons-material/Password';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import { Store } from '../utils/store';
import useStyles from '../utils/styles';

const Profile = () => {
  const { state, dispatch } = useContext(Store);
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const router = useRouter();
  const { userInfo } = state;
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }
    setValue('name', userInfo.name);
    setValue('email', userInfo.email);
  }, [userInfo, setValue, router]);

  const submitHandler = async ({ name, email, password, confirmPassword }) => {
    closeSnackbar();
    if (password !== confirmPassword) {
      enqueueSnackbar('The Passwords provided do not match one another', {
        variant: 'error',
      });
      return;
    }
    try {
      const { data } = await axios.put(
        '/api/users/profile',
        {
          name,
          email,
          password,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'USER_LOGIN', payload: data });
      enqueueSnackbar('Profile Successfully Updated', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  return (
    <Layout title="Profile">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <List>
            <NextLink href="/profile" passHref>
              <ListItem selected button component="a">
                <ListItemText primary="User Profile"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/order-history" passHref>
              <ListItem button component="a">
                <ListItemText primary="Order History"></ListItemText>
              </ListItem>
            </NextLink>
          </List>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  &nbsp; Profile &nbsp;
                </Typography>
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                          minLength: 2,
                        }}
                        render={({ field }) => (
                          <>
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="name"
                              label="Name"
                              inputProps={{ type: 'name' }}
                              error={Boolean(errors.name)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <AccountCircleIcon
                                      // sx={{ color: 'action.active', mr: 1 }}
                                      sx={{ mr: 1 }}
                                    />
                                  </InputAdornment>
                                ),
                              }}
                              helperText={
                                errors.name
                                  ? errors.name.type === 'minLength'
                                    ? 'Name length must be more than 1 character'
                                    : 'Name is Required'
                                  : ''
                              }
                              // onChange={(e) => setName(e.target.value)}
                              {...field}
                            ></TextField>
                          </>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="email"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                          pattern: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
                        }}
                        render={({ field }) => (
                          <>
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="email"
                              label="Email"
                              inputProps={{ type: 'email' }}
                              error={Boolean(errors.email)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <EmailIcon sx={{ mr: 1 }} />
                                  </InputAdornment>
                                ),
                              }}
                              helperText={
                                errors.email
                                  ? errors.email.type === 'pattern'
                                    ? 'Email is not valid'
                                    : 'Email is Required'
                                  : ''
                              }
                              // onChange={(e) => setEmail(e.target.value)}
                              {...field}
                            ></TextField>
                          </>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="password"
                        control={control}
                        defaultValue=""
                        rules={{
                          validate: (value) =>
                            value !== '' ||
                            value.length > 5 ||
                            'Password length must be more than 5 characters',
                        }}
                        render={({ field }) => (
                          <>
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="password"
                              label="Password"
                              inputProps={{ type: 'password' }}
                              error={Boolean(errors.password)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <PasswordIcon sx={{ mr: 1 }} />
                                  </InputAdornment>
                                ),
                              }}
                              helperText={
                                errors.password
                                  ? 'Password length must be more than 5 characters'
                                  : ''
                              }
                              {...field}
                            ></TextField>
                          </>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Controller
                        name="confirmPassword"
                        control={control}
                        defaultValue=""
                        rules={{
                          validate: (value) =>
                            value !== '' ||
                            value.length > 5 ||
                            'Confirm Password length must be more than 5 characters',
                        }}
                        render={({ field }) => (
                          <>
                            <TextField
                              variant="outlined"
                              fullWidth
                              id="confirmPassword"
                              label="Confirm Password"
                              inputProps={{ type: 'password' }}
                              error={Boolean(errors.confirmPassword)}
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <PasswordIcon sx={{ mr: 1 }} />
                                  </InputAdornment>
                                ),
                              }}
                              helperText={
                                errors.confirmPassword
                                  ? 'Confirm Password length must be more than 5 characters'
                                  : ''
                              }
                              {...field}
                            ></TextField>
                          </>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        Update
                      </Button>
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

//Dynamic is used when we do not want something rendered on Server-Side
//Instead we want it on Client-Side where SEO does not matter, Profile does not need to be Indexed, it is personalized for each user
export default dynamic(() => Promise.resolve(Profile), { ssr: false });

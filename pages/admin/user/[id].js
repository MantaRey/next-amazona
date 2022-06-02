/*
  Admin Users Page -- /admin/user/[id]
  Admin can Edit the details of a specific User
*/

import {
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from '@material-ui/core';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useSnackbar } from 'notistack';
import React, { useContext, useEffect, useState } from 'react';
import { useReducer } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Layout from '../../../components/Layout';
import { getError } from '../../../utils/error';
import { Store } from '../../../utils/store';
import useStyles from '../../../utils/styles';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, user: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_REQUEST':
      return { ...state, loadingUpdate: true, errorUpdate: '' };
    case 'UPDATE_SUCCESS':
      return { ...state, loadingUpdate: false, errorUpdate: '' };
    case 'UPDATE_FAIL':
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    default:
      return state;
  }
}

const UserEdit = ({ params }) => {
  const userId = params.id;
  const { state } = useContext(Store);
  const [{ loading, user, error, loadingUpdate }, dispatch] = useReducer(
    reducer,
    {
      loading: true,
      user: {},
      error: '',
      loadingUpdate: false,
    }
  );
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm();
  const [isAdmin, setIsAdmin] = useState(false); //using state instead of react hook form
  const router = useRouter();
  const { userInfo } = state;
  const classes = useStyles();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (!userInfo) {
      return router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/users/${userId}`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        //AJAX request ^
        setIsAdmin(data.isAdmin);
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo, userId, router]);

  //If user is not empty (fetching data is successful), use contents from database to pre-fill form fields with original data
  useEffect(() => {
    if (user) {
      setValue('name', user.name ? user.name : '');
    }
  }, [setValue, user]);

  //Function used to initiate Admin request to Update an already existing User.
  const submitHandler = async ({ name }) => {
    closeSnackbar();
    try {
      dispatch({ type: 'UPDATE_REQUEST' });
      await axios.put(
        `/api/admin/users/${userId}`,
        {
          name,
          isAdmin,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: 'UPDATE_SUCCESS' });
      enqueueSnackbar('User Successfully Updated', { variant: 'success' });
      router.push('/admin/users');
    } catch (err) {
      dispatch({ type: 'UPDATE_FAIL', payload: getError(err) });
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  return (
    <Layout title={`Edit User ${userId}`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <List>
            <NextLink href="/admin/dashboard" passHref>
              <ListItem button component="a">
                <ListItemText primary="Admin Dashboard"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/orders" passHref>
              <ListItem button component="a">
                <ListItemText primary="Orders"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/products" passHref>
              <ListItem button component="a">
                <ListItemText primary="Products"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/users" passHref>
              <ListItem selected button component="a">
                <ListItemText primary="Users"></ListItemText>
              </ListItem>
            </NextLink>
          </List>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Edit User {userId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress></CircularProgress>}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
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
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="Name"
                            error={Boolean(errors.name)}
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <AccountCircleIcon
                                    sx={{ color: 'action.active', mr: 1 }}
                                  />
                                </InputAdornment>
                              ),
                            }}
                            helperText={errors.name ? 'Name is Required' : ''}
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <FormControlLabel
                        label="Grant Admin Privileges?"
                        control={
                          <Checkbox
                            onClick={(e) => setIsAdmin(e.target.checked)}
                            checked={isAdmin}
                            name="isAdmin"
                          ></Checkbox>
                        }
                      ></FormControlLabel>
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
                      {loadingUpdate && <CircularProgress></CircularProgress>}
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

export async function getServerSideProps({ params }) {
  return {
    props: { params },
  };
}
//Dynamic is used when we do not want something rendered on Server-Side
//Instead we want it on Client-Side where SEO does not matter, User Edit Page does not need to be Indexed, it is Admin only
export default dynamic(() => Promise.resolve(UserEdit), { ssr: false });

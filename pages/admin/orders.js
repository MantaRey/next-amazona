/*
  Admin Orders Page -- /admin/orders
  Admin can view all Order History and look at specific Order details
  Admin can click "Details" to go to it's specific Order Information Page
*/

import {
  Button,
  Card,
  CircularProgress,
  Grid,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@material-ui/core';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../../components/Layout';
import { getError } from '../../utils/error';
import { Store } from '../../utils/store';
import useStyles from '../../utils/styles';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        orders: action.payload.orders,
        error: '',
      };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

const AdminOrders = () => {
  const { state } = useContext(Store);
  const router = useRouter();
  const { userInfo } = state;
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });
  const classes = useStyles();

  //Formats a number to be diplayed as proper US currency (e.g. 11.5 -> $11.50)
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/admin/orders`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo, router]);
  return (
    <Layout title="Orders">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <List>
            <NextLink href="/admin/dashboard" passHref>
              <ListItem button component="a">
                <ListItemText primary="Admin Dashboard"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/orders" passHref>
              <ListItem selected button component="a">
                <ListItemText primary="Orders"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/products" passHref>
              <ListItem button component="a">
                <ListItemText primary="Products"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/admin/users" passHref>
              <ListItem button component="a">
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
                  Order History
                </Typography>
              </ListItem>
              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography className={classes.error}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ID</TableCell>
                          <TableCell>USER</TableCell>
                          <TableCell>DATE</TableCell>
                          <TableCell>TOTAL</TableCell>
                          <TableCell>PAID</TableCell>
                          <TableCell>DELIVERED</TableCell>
                          <TableCell>ACTION</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order._id.substring(20, 24)}</TableCell>
                            <TableCell>
                              {order.user ? order.user.name : 'DELETED USER'}
                            </TableCell>
                            <TableCell>{order.createdAt}</TableCell>
                            <TableCell>
                              {formatter.format(order.totalPrice)}
                            </TableCell>
                            <TableCell>
                              {order.isPaid
                                ? `Paid on ${order.paidAt}`
                                : 'Not Paid'}
                            </TableCell>
                            <TableCell>
                              {order.isDelivered
                                ? `Delivered on ${order.paidAt}`
                                : 'Not Delivered'}
                            </TableCell>
                            <TableCell>
                              <NextLink href={`/order/${order._id}`} passHref>
                                <Button
                                  variant="contained"
                                  color="secondary"
                                  disableElevation
                                >
                                  Details
                                </Button>
                              </NextLink>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
};

//Dynamic is used when we do not want something rendered on Server-Side
//Instead we want it on Client-Side where SEO does not matter, List of Orders does not need to be Indexed, it is only for Admin
export default dynamic(() => Promise.resolve(AdminOrders), { ssr: false });

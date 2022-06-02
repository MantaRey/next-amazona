import {
  Card,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  ListItemText,
  TableCell,
  TableContainer,
  Typography,
} from '@material-ui/core';
import { Button, Table, TableBody, TableHead, TableRow } from '@mui/material';
import axios from 'axios';
import dynamic from 'next/dynamic';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useContext, useEffect, useReducer } from 'react';
import Layout from '../components/Layout';
import { getError } from '../utils/error';
import { Store } from '../utils/store';
import useStyles from '../utils/styles';

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, orders: action.payload, error: '' };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

//Formats a number to be diplayed as proper US currency (e.g. 11.5 -> $11.50)
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const OrderHistory = () => {
  const { state } = useContext(Store);
  const router = useRouter();
  const { userInfo } = state;
  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: '',
  });
  const classes = useStyles();

  useEffect(() => {
    if (!userInfo) {
      router.push('/login');
    }
    const fetchOrders = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });
        const { data } = await axios.get(`/api/orders/history`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchOrders();
  }, [userInfo, router]);

  return (
    <Layout title="Order History">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          {/* <Card className={classes.section}> */}
          <List>
            <NextLink href="/profile" passHref>
              <ListItem button component="a">
                <ListItemText primary="User Profile"></ListItemText>
              </ListItem>
            </NextLink>
            <NextLink href="/order-history" passHref>
              <ListItem selected button component="a">
                <ListItemText primary="Order History"></ListItemText>
              </ListItem>
            </NextLink>
          </List>
          {/* </Card> */}
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  Orders
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
          {orders[0] ? (
            ''
          ) : (
            <div>
              Looks like you do not have any past orders. Let&apos;s go shopping
              and change that for you!{' '}
              <NextLink href="/" passHref>
                <Link>Go Shopping!</Link>
              </NextLink>
            </div>
          )}
        </Grid>
      </Grid>
    </Layout>
  );
};

//Dynamic is used when we do not want something rendered on Server-Side
//Instead we want it on Client-Side where SEO does not matter, OrderHistory does not need to be Indexed, it is personalized for each user
export default dynamic(() => Promise.resolve(OrderHistory), { ssr: false });

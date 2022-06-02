/*
  Product Page -- /product/[slug]
  Displays the specific Product's Details, along with User Reviews
  User can add the Product to their Cart, Write a Review, or Look at other User Reviews
*/

import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Image from 'next/image';
import {
  Link,
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  TextField,
  CircularProgress,
  MenuItem,
  Select,
} from '@material-ui/core';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Rating from '@material-ui/lab/Rating';
import useStyles from '../../utils/styles';
import db from '../../utils/db';
import Product from '../../models/Product';
import axios from 'axios';
import { Store } from '../../utils/store';
import { getError } from '../../utils/error';
import { useSnackbar } from 'notistack';

const ProductScreen = (props) => {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const { product } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  //Formats a number to be diplayed as proper US currency (e.g. 11.5 -> $11.50)
  var formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  //Initiates an AJAX request, sending the Review data to the backend. Upon success, review is saved and Product is updated.
  const submitHandler = async (e) => {
    e.preventDefault();
    if (rating == 0) {
      enqueueSnackbar('Rating must have at least 1 star', { variant: 'error' });
    } else if (comment == '') {
      enqueueSnackbar('Comment must not be left blank', { variant: 'error' });
    } else {
      try {
        setLoading(true);
        await axios.post(
          `/api/products/${product._id}/reviews`,
          {
            rating,
            comment,
          },
          {
            headers: { authorization: `Bearer ${userInfo.token}` },
          }
        );
        setLoading(false);
        setComment('');
        setRating(0);
        enqueueSnackbar('Review submitted successfully', {
          variant: 'success',
        });
        fetchReviews();
      } catch (err) {
        setLoading(false);
        enqueueSnackbar(getError(err), { variant: 'error' });
      }
    }
  };

  //Returns the Reviews for the current Product
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      //AJAX request to fetch existing reviews for a product (if there are any)
      setReviews(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: 'error' });
    }
  };

  //Fetches Reviews on 'start-up' and whenever a Review is submitted successfully.
  useEffect(() => {
    fetchReviews();
  }, []);
  /*
  Old way of getting slug from the router and finding the local instance of product
  const router = useRouter();
  const { slug } = router.query;
  const product = data.products.find((product) => product.slug === slug);
  */
  if (!product) {
    return <div>Produt Not Found</div>;
  }

  //Upon success, the current Product is added to the User's Cart.
  const addToCartHandler = async () => {
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock <= 0) {
      window.alert('Sorry, the Product is out of Stock.');
      return;
    }
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + selectedQuantity : 1;
    if (data.countInStock < quantity) {
      window.alert(
        `Sorry, there are not enough of this Product in Stock to add '` +
          selectedQuantity +
          `' more to your Cart.`
      );
      return;
    }
    dispatch({
      type: 'CART_ADD_ITEM',
      payload: { ...product, quantity },
    });
    router.push('/cart');
  };

  const goBackHandler = async () => {
    router.back();
  };

  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <Button
          size="small"
          color="secondary"
          startIcon={<ArrowBackIcon />}
          onClick={goBackHandler}
        >
          Back to Products
        </Button>
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <Image
            src={product.image}
            alt={product.name}
            width={640}
            height={640}
            // layout="responsive"
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>Category: {product.category}</Typography>
            </ListItem>
            <ListItem>
              <Typography>Brand: {product.brand}</Typography>
            </ListItem>
            <ListItem>
              <Rating value={product.rating} readOnly></Rating>
              <Link href="#reviews">
                <Typography>
                  {/* Rating: {product.rating} stars ({product.numReviews} reviews) */}
                  ({product.numReviews} reviews)
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Typography>Description: {product.description}</Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Price</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>{formatter.format(product.price)}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Status</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0 ? 'In Stock' : 'Unavailable'}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>Quantity</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Select
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(e.target.value)}
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <MenuItem key={x + 1} value={x + 1}>
                          {x + 1}
                        </MenuItem>
                      ))}
                    </Select>
                    {}
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addToCartHandler}
                >
                  Add to Cart
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <Typography name="reviews" id="reviews" variant="h2">
            Customer Reviews
          </Typography>
        </ListItem>
        {reviews.length === 0 && <ListItem>No reviews</ListItem>}
        {reviews.map((review) => (
          <ListItem key={review._id}>
            <Grid container>
              <Grid item className={classes.reviewItem}>
                <Typography>
                  <strong>{review.name}</strong>
                </Typography>
                <Typography>{review.createdAt.substring(0, 10)}</Typography>
              </Grid>
              <Grid item>
                <Rating value={review.rating} readOnly></Rating>
                <Typography>{review.comment}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
        <ListItem>
          {userInfo ? (
            <form onSubmit={submitHandler} className={classes.reviewForm}>
              <List>
                <ListItem>
                  <Typography variant="h2">Leave your Review</Typography>
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    variant="outlined"
                    fullWidth
                    name="review"
                    label="Enter comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="secondary"
                  >
                    Submit
                  </Button>
                  {loading && <CircularProgress></CircularProgress>}
                </ListItem>
              </List>
            </form>
          ) : (
            <Typography variant="h2">
              Please{' '}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                Login
              </Link>{' '}
              to write a review
            </Typography>
          )}
        </ListItem>
      </List>
    </Layout>
  );
};

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const product = await Product.findOne({ slug }, '-reviews').lean();
  await db.disconnect();
  return {
    props: {
      //this line converts the unserializable values in product to only primary data types that can be serialized to JSON
      product: db.convertDocToObj(product),
    },
  };
}

export default ProductScreen;

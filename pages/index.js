/*
This is Amazona's Home Page (Landing Page for the Website) -- /
Displays all the Products in the Inventory
User can Select a Product to view more Details, or Add Product to their Cart
User can log into or out of their Account, Access Account Details, View their Cart
User can toggle website theme
*/

/* eslint-disable @next/next/no-img-element */
import { Grid, Link, Typography } from '@material-ui/core';
import Layout from '../components/Layout';
import db from '../utils/db';
import Product from '../models/Product';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Store } from '../utils/store';
import NextLink from 'next/link';
import axios from 'axios';
import ProductItem from '../components/ProductItem';
import Carousel from 'react-material-ui-carousel';
import useStyles from '../utils/styles';

export default function Home(props) {
  const { topRatedProducts, featuredProducts } = props;
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const classes = useStyles();

  //Function adds Product to the User's Cart || Function adds to the quantity of the Product in the User's Cart
  const addToCartHandler = async (product) => {
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock <= 0) {
      window.alert('Sorry, the Product is out of Stock.');
      return;
    }
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    if (data.countInStock < quantity) {
      window.alert(
        'Sorry, there are not enough of this Product in Stock to add another to your Cart.'
      );
      return;
    }
    dispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    router.push('/cart');
  };
  return (
    <Layout>
      <Carousel
        className={classes.mt1}
        animation="slide"
        swipe="true"
        navButtonsProps={{
          style: {
            backgroundColor: 'cornflowerblue',
            color: 'white',
          },
        }}
        indicatorIconButtonProps={{ style: { padding: '0.625rem' } }}
        activeIndicatorIconButtonProps={{
          style: { color: 'cornflowerblue' },
        }}
      >
        {featuredProducts.map((product) => (
          <NextLink
            key={product._id}
            href={`/product/${product.slug}`}
            passHref
          >
            <Link>
              <img
                src={product.featuredImage}
                alt={product.name}
                className={classes.featuredImage}
              />
            </Link>
          </NextLink>
        ))}
      </Carousel>
      <Typography variant="h2">Popular Products</Typography>
      <Grid container spacing={3}>
        {topRatedProducts.map((product) => (
          <Grid item md={4} key={product.name}>
            <ProductItem
              product={product}
              addToCartHandler={addToCartHandler}
            />
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
}

//Mongoose queries return an instance of the Mongoose Document class
//lean function tells Mongoose to skip instantiating a full Mongoose document and just give you the POJO(Plain Object)
export async function getServerSideProps() {
  await db.connect();
  //Creates list of only featured Products
  const featuredProductsDocs = await Product.find(
    { isFeatured: true },
    '-reviews'
  )
    .lean()
    .limit(3);
  //Creates list of top 6 highest rated Products
  const topRatedProductsDocs = await Product.find({}, '-reviews')
    .lean()
    .sort({
      rating: -1,
    })
    .limit(6);
  await db.disconnect();
  return {
    props: {
      featuredProducts: featuredProductsDocs.map(db.convertDocToObj),
      topRatedProducts: topRatedProductsDocs.map(db.convertDocToObj),
      //this line converts the unserializable values in each item in products to only primary data types, so that they can be serialized to JSON
    },
  };
}

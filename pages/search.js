/*
  User Product Search Page -- /search/?{category}={_____}&{search}={_____}
  Users can apply different filters to the available Inventory to better find their desired results
*/

import React, { useContext } from 'react';
import {
  Box,
  Button,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Typography,
} from '@material-ui/core';
import CancelIcon from '@material-ui/icons/Cancel';
import Layout from '../components/Layout';
import useStyles from '../utils/styles';
import Product from '../models/Product';
import db from '../utils/db';
import { useRouter } from 'next/router';
import ProductItem from '../components/ProductItem';
import { Store } from '../utils/store';
import axios from 'axios';
import { Rating } from '@material-ui/lab';
import { Pagination } from '@mui/material';

const PAGE_SIZE = 3;

const prices = [
  {
    name: '$1 to $50',
    value: '1-50',
  },
  {
    name: '$51 to $100',
    value: '51-100',
  },
  {
    name: '$101 to $250',
    value: '101-250',
  },
  {
    name: '$251 to $500',
    value: '251-500',
  },
  {
    name: '$501 to $1000',
    value: '501-1000',
  },
];

const ratings = [1, 2, 3, 4, 5];

const Search = (props) => {
  const classes = useStyles();
  const router = useRouter();

  //Sets default values for filter parameters not found in the query, while overriding those found in the query with the User desired values
  const {
    query = 'all',
    category = 'all',
    brand = 'all',
    price = 'all',
    rating = 'all',
    sort = 'all',
  } = router.query;
  const { products, countProducts, categories, brands, pages } = props;

  //Function checks all the filter parameters, updates the url query as needed, and pushes the new updated url onto the router stack
  const filterSearch = ({
    page,
    category,
    brand,
    price,
    rating,
    sort,
    min,
    max,
    searchQuery,
  }) => {
    const path = router.pathname;
    const { query } = router;
    if (page) query.page = page;
    if (searchQuery) query.searchQuery = searchQuery;
    if (sort) query.sort = sort;
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (price) query.price = price;
    if (rating) query.rating = rating;
    if (min) query.min ? query.min : query.min === 0 ? 0 : min;
    if (max) query.max ? query.max : query.max === 0 ? 0 : max;

    router.push({
      pathname: path,
      query: query,
    });
  };

  //Function executes when a new Category is clicked by the User
  const categoryHandler = (e) => {
    filterSearch({ category: e.target.value });
  };

  const pageHandler = (e, page) => {
    filterSearch({ page });
  };

  const brandHandler = (e) => {
    filterSearch({ brand: e.target.value });
  };

  const sortHandler = (e) => {
    filterSearch({ sort: e.target.value });
  };

  const priceHandler = (e) => {
    filterSearch({ price: e.target.value });
  };

  const ratingHandler = (e) => {
    filterSearch({ rating: e.target.value });
  };

  const { state, dispatch } = useContext(Store);

  //Function adds Product to Cart as long as it is in stock and the order can be fulfilled
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
    <Layout title="Search">
      <Grid className={classes.mt1} container spacing={1}>
        <Grid item md={3}>
          <List>
            <ListItem>
              <Box className={classes.fullWidth}>
                <Typography>Categories</Typography>
                <Select fullWidth value={category} onChange={categoryHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {categories &&
                    categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box className={classes.fullWidth}>
                <Typography>Brands</Typography>
                <Select fullWidth value={brand} onChange={brandHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {brands &&
                    brands.map((brand) => (
                      <MenuItem key={brand} value={brand}>
                        {brand}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box className={classes.fullWidth}>
                <Typography>Prices</Typography>
                <Select fullWidth value={price} onChange={priceHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {prices &&
                    prices.map((price) => (
                      <MenuItem key={price.value} value={price.value}>
                        {price.name}
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
            <ListItem>
              <Box className={classes.fullWidth}>
                <Typography>Ratings</Typography>
                <Select fullWidth value={rating} onChange={ratingHandler}>
                  <MenuItem value="all">All</MenuItem>
                  {ratings &&
                    ratings.map((rating) => (
                      <MenuItem display="flex" key={rating} value={rating}>
                        <Rating value={rating} readOnly />
                        <Typography component="span">&amp; Up</Typography>
                      </MenuItem>
                    ))}
                </Select>
              </Box>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={9}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              {products.length === 0 ? 'No' : countProducts} Results
              {query !== 'all' && query !== '' && ' : ' + query}
              {category !== 'all' && ' : ' + category}
              {brand !== 'all' && ' : ' + brand}
              {price !== 'all' && ' : Price ' + price}
              {rating !== 'all' && ' : Rating ' + rating + ' & up'}
              {(query !== 'all' && query !== '') ||
              category !== 'all' ||
              brand !== 'all' ||
              rating !== 'all' ||
              price !== 'all' ? (
                <Button onClick={() => router.push('/search')}>
                  <CancelIcon />
                </Button>
              ) : null}
              {/* If there is AT LEAST 1 Filter -> Show the Remove Filter Button */}
            </Grid>
            <Grid item>
              <Typography component="span" className={classes.sort}>
                Sort by
              </Typography>
              <Select value={sort} onChange={sortHandler}>
                <MenuItem value="toprated">Ratings: High to Low</MenuItem>
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="lowest">Price: Low to High</MenuItem>
                <MenuItem value="highest">Price: High to Low</MenuItem>
                <MenuItem value="newest">Newest Arrivals</MenuItem>
                <MenuItem value="all"></MenuItem>
              </Select>
            </Grid>
          </Grid>
          <Grid className={classes.mt1} container spacing={3}>
            {products.map((product) => (
              <Grid item md={4} key={product.name}>
                <ProductItem
                  product={product}
                  addToCartHandler={addToCartHandler}
                />
              </Grid>
            ))}
          </Grid>
          <Pagination
            className={`${classes.mt1}`}
            defaultPage={parseInt(query.page || '1')}
            count={pages}
            variant="outlined"
            shape="rounded"
            color="primary"
            size="small"
            showFirstButton
            showLastButton
            onChange={pageHandler}
          ></Pagination>
        </Grid>
      </Grid>
    </Layout>
  );
};

export async function getServerSideProps({ query }) {
  await db.connect();
  const pageSize = query.pageSize || PAGE_SIZE;
  const page = query.page || 1;
  const category = query.category || '';
  const brand = query.brand || '';
  const price = query.price || '';
  const rating = query.rating || '';
  const sort = query.sort || '';
  const searchQuery = query.query || '';

  //Creating the Filters to be applied based on the Query
  const queryFilter =
    searchQuery && searchQuery !== 'all'
      ? {
          //filter to be used in the DB for Product Name
          name: { $regex: searchQuery, $options: 'i' },
          //$regex - check the names against the searchQuery, $options - 'i' means it isnt case sensitive
        }
      : {};
  const categoryFilter = category && category !== 'all' ? { category } : {};
  const brandFilter = brand && brand !== 'all' ? { brand } : {};
  const ratingFilter =
    rating && rating !== 'all'
      ? {
          //filter to be used in the DB for Product rating
          rating: { $gte: Number(rating) },
          //$gte - means (g)reater (t)han or (e)qual to, passes filter test if: rating of Product >= query rating
        }
      : {};
  // 10-50 format for filter
  const priceFilter =
    price && price !== 'all'
      ? {
          //filter to be used in the DB for Product price
          price: {
            $gte: Number(price.split('-')[0]),
            $lte: Number(price.split('-')[1]),
          },
          //$gte - (g)reater (t)han or (e)qual to, passes filter test if: price of Product >= query price
          //$lte - (l)ess (t)han or (e)qual to, passes filter test if: price of Product <= query price
        }
      : {};

  //The order in which the results should be displayed in
  const order =
    sort === 'featured'
      ? { isFeatured: -1 }
      : sort === 'lowest'
      ? { price: 1 }
      : sort === 'highest'
      ? { price: -1 }
      : sort === 'toprated'
      ? { rating: -1 }
      : sort === 'newest'
      ? { createdAt: -1 }
      : { _id: -1 };

  //
  const categories = await Product.find().distinct('category');
  const brands = await Product.find().distinct('brand');

  //Function that finds the Products based on the Filters applied
  const productDocs = await Product.find(
    {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...brandFilter,
      ...ratingFilter,
    },
    '-reviews'
  )
    .sort(order)
    .skip(pageSize * (page - 1))
    .limit(pageSize)
    .lean(); //Converts to Pure JavaScript Object

  //Function that finds how many Products are in the Results after applying the Filters
  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...categoryFilter,
    ...priceFilter,
    ...brandFilter,
    ...ratingFilter,
  });

  await db.disconnect();

  //The Results after the Filters have been applied
  const products = productDocs.map(db.convertDocToObj); //converts the unserializable values in the products to only primary data types, so that they can be serialized to JSON

  return {
    props: {
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
      categories,
      brands,
    },
  };
}

export default Search;

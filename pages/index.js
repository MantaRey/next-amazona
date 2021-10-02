import {
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from '@material-ui/core';
import NextLink from 'next/link';
// import data from '../utils/data';
import Layout from '../components/Layout';
import db from '../utils/db';
import Product from '../models/Product';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { Store } from '../utils/store';
import axios from 'axios';

export default function Home(props) {
  const { products } = props;
  const router = useRouter();
  const { state, dispatch } = useContext(Store);

  const addToCartHandler = async (product) => {
    const { data } = await axios.get(
      `http://localhost:3000/api/products/${product._id}`
    );
    // console.log(data);
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
      <div>
        <h1>Products</h1>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item md={4} key={product.name}>
              <Card>
                <NextLink href={`/product/${product.slug}`} passHref>
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      image={product.image}
                      title={product.name}
                    ></CardMedia>
                    <CardContent>
                      <Typography>{product.name}</Typography>
                    </CardContent>
                  </CardActionArea>
                </NextLink>
                <CardActions>
                  <Typography>${product.price}</Typography>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => addToCartHandler(product)}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </Layout>
  );
}

//Mongoose queries return an instance of the Mongoose Document class
//lean function tells Mongoose to skip instantiating a full Mongoose document and just give you the POJO(Plain Object)
export async function getServerSideProps() {
  await db.connect();
  const products = await Product.find({}).lean();
  await db.disconnect();
  //this line converts the unserializable values in each item in products to only primary data types, so that they can be serialized to JSON
  products.map((product) => db.convertDocToObj(product));
  return {
    props: {
      products,
    },
  };
}

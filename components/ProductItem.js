import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from '@material-ui/core';
import React from 'react';
import NextLink from 'next/link';
import Rating from '@material-ui/lab/Rating';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

//Formats a number to be diplayed as proper US currency (e.g. 11.5 -> $11.50)
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const ProductItem = ({ product, addToCartHandler }) => {
  return (
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
            <Rating value={product.rating} readOnly></Rating>
          </CardContent>
        </CardActionArea>
      </NextLink>
      <CardActions>
        <Typography>{formatter.format(product.price)}</Typography>
        <Button
          size="small"
          color="secondary"
          variant="contained"
          disableElevation
          onClick={() => addToCartHandler(product)}
          endIcon={<AddShoppingCartIcon />}
        >
          Cart
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductItem;

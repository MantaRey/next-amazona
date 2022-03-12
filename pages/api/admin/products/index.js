/*
  Admin Products API -- /api/admin/products
*/

import nc from 'next-connect';
import { isAdmin, isAuth } from '../../../../utils/auth';
import Product from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

//Returns all Products from the DB. Application - Admin Products Page
handler.get(async (req, res) => {
  await db.connect();
  const products = await Product.find({}); //Empty parameter -> get all Products
  await db.disconnect();
  res.send({ products });
});

//Creates a new Product in DB with default values to be updated by Admin. Application - Admin Products Page
handler.post(async (req, res) => {
  await db.connect();
  const newProduct = new Product({
    name: 'sample name',
    slug: 'sample-slug-' + Math.random(),
    image: '/images/shirt1.jpg',
    price: 0,
    category: 'sample category',
    brand: 'sample brand',
    countInStock: 0,
    description: 'sample description',
    rating: 0,
    numReview: 0,
  });

  const product = await newProduct.save();
  await db.disconnect();
  res.send({ message: 'Product Created', product });
});

export default handler;

/*
  Users API -- /api/products
*/

import nextConnect from 'next-connect';
import Product from '../../../models/Product';
import db from '../../../utils/db';

const handler = nextConnect();

//Returns all Products from the DB. Application - Home Page
handler.get(async (req, res) => {
  await db.connect();
  const products = await Product.find({}); //Empty parameter -> get all Products
  await db.disconnect();
  res.send(products);
});

export default handler;

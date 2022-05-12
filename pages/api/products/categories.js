/*
  Users API -- /api/products/categories
*/

import nextConnect from 'next-connect';
import Product from '../../../models/Product';
import db from '../../../utils/db';

const handler = nextConnect();

//Returns all Category types from the Product Collection. Application - Navigation Bar (Sidebar)
handler.get(async (req, res) => {
  await db.connect();
  const categories = await Product.find().distinct('category'); //Finds distinct values in the 'category' field from Products
  await db.disconnect();
  res.send(categories);
});

export default handler;

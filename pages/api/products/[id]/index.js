/*
  Users API -- /api/products/[id]
*/

import nextConnect from 'next-connect';
import Product from '../../../../models/Product';
import db from '../../../../utils/db';

const handler = nextConnect();

//Returns a Product from the DB based on id. Used to get a single Product's details. Application - Product Page
handler.get(async (req, res) => {
  await db.connect();
  const product = await Product.findById(req.query.id);
  await db.disconnect();
  res.send(product);
});

export default handler;

import nextConnect from 'next-connect';
import Product from '../../../models/Product';
import db from '../../../utils/db';

const handler = nextConnect();

handler.get(async (req, res) => {
  console.log('Retrieving Product');
  await db.connect();
  const products = await Product.find({});
  await db.disconnect();
  res.send(products);
});

export default handler;

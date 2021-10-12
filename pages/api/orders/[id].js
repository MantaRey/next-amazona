import nextConnect from 'next-connect';
import Order from '../../../models/Order';
import db from '../../../utils/db';
import { isAuth } from '../../../utils/auth';

const handler = nextConnect();
//This isAuth check makes sure that only an Authorized and Autheticated User can access their Order info
//Similar to submitting an order, only an Authorized and Authenticated User can make an Order request to the backend
handler.use(isAuth);

handler.get(async (req, res) => {
  await db.connect();
  const order = await Order.findById(req.query.id);
  console.log(order);
  await db.disconnect();
  res.send(order);
});

export default handler;

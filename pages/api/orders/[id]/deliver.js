import nextConnect from 'next-connect';
import Order from '../../../../models/Order';
import db from '../../../../utils/db';
import { onError } from '../../../../utils/db';
import { isAuth } from '../../../../utils/auth';

const handler = nextConnect({
  onError,
});
//This isAuth check makes sure that only an Authorized and Autheticated User can access their Order info
//Similar to submitting an order, only an Authorized and Authenticated User can make an Order request to the backend
handler.use(isAuth);

handler.put(async (req, res) => {
  await db.connect();
  const order = await Order.findById(req.query.id);
  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
    const deliveredOrder = await order.save();
    await db.disconnect();
    res.send({ message: 'order delivered', order: deliveredOrder });
  } else {
    await db.disconnect();
    res.status(404).send({ message: 'Order NOT Found' });
  }
});

export default handler;

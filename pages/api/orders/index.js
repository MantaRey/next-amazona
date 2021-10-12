import nextConnect from 'next-connect';
import Order from '../../../models/Order';
import { isAuth } from '../../../utils/auth';
import db from '../../../utils/db';
import { onError } from '../../../utils/error';

const handler = nextConnect({ onError });

handler.use(isAuth);

handler.post(async (req, res) => {
  await db.connect();
  const newOrder = new Order({ ...req.body, user: req.user._id });
  try {
    const order = await newOrder.save();
    await db.disconnect();
    res.status(201).send(order);
  } catch (err) {
    await db.disconnect();
    res
      .status(401)
      .send({
        message:
          'Your Order could not be processed at this time. Try again later.',
      });
  }
});

export default handler;

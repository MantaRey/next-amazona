import nextConnect from 'next-connect';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/User';
import { isAuth } from '../../../utils/auth';
import db from '../../../utils/db';
import { onError } from '../../../utils/error';

const handler = nextConnect({ onError });

handler.use(isAuth);

handler.get(async (req, res) => {
  await db.connect();
  const ordersCount = await Order.countDocuments(); // .countDocuments() is a Mongoose function that returns the number of records in the Collection
  const productsCount = await Product.countDocuments();
  const usersCount = await User.countDocuments();
  const ordersPriceGroup = await Order.aggregate([
    {
      $group: {
        _id: null,
        sales: { $sum: '$totalPrice' },
      },
    },
  ]);
  await db.disconnect();
  const ordersPrice =
    ordersPriceGroup.length > 0 ? ordersPriceGroup[0].sales : 0;
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        totalSales: { $sum: '$totalPrice' },
      },
    },
  ]);
  // _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
  res.send({ ordersCount, productsCount, usersCount, ordersPrice, salesData });
});

export default handler;

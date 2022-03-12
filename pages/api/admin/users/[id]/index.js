/*
  Admin Users API -- /api/admin/users/[id]
*/

import nc from 'next-connect';
import { isAdmin, isAuth } from '../../../../../utils/auth';
import User from '../../../../../models/User';
import db from '../../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

//Returns a User from the DB based on id. Used to get a single User's details. Application - User Details Page & User Edit Form
handler.get(async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  await db.disconnect();
  res.send(user);
});

//Saves edited User details to the DB. Used to update a single User's details. Application - User Edit Form
handler.put(async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  if (user) {
    user.name = req.body.name;
    user.slug = req.body.slug;
    user.price = req.body.price;
    user.category = req.body.category;
    user.image = req.body.image;
    user.brand = req.body.brand;
    user.countInStock = req.body.countInStock;
    user.description = req.body.description;
    await user.save();
    await db.disconnect();
    res.send({ message: 'User Updated Successfully' });
  } else {
    await db.disconnect();
    res.statusCode(404).send({ message: 'User Not Found' });
  }
});

//Deletes a User from the DB based on id. Used to delete a single User. Application - Admin Users Page
handler.delete(async (req, res) => {
  await db.connect();
  const user = await User.findById(req.query.id);
  if (user) {
    await user.remove();
    await db.disconnect();
    res.send({ message: 'User Deleted' });
  } else {
    await db.disconnect();
    res.statusCode(404).send({ message: 'User Not Found' });
  }
});

export default handler;

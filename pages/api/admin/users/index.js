/*
  Admin Users API -- /api/admin/users
*/

import nc from 'next-connect';
import { isAdmin, isAuth } from '../../../../utils/auth';
import User from '../../../../models/User';
import db from '../../../../utils/db';

const handler = nc();
handler.use(isAuth, isAdmin);

//Returns all Users from the DB. Application - Admin Users Page
handler.get(async (req, res) => {
  await db.connect();
  const users = await User.find({}); //Empty parameter -> get all Users
  await db.disconnect();
  res.send({ users });
});

export default handler;

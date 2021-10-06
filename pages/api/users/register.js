import nextConnect from 'next-connect';
import bcrypt from 'bcryptjs';
import User from '../../../models/User';
import db from '../../../utils/db';
import { signToken } from '../../../utils/auth';

const handler = nextConnect();

handler.post(async (req, res) => {
  await db.connect();
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password),
    isAdmin: false,
  });
  let user;
  try {
    user = await newUser.save();
    await db.disconnect();
  } catch (err) {
    await db.disconnect();
    if (err.code === 11000) {
      res.status(401).send({
        message:
          'The Email provided is already tied to an Account. Please try another or Reset your password.',
      });
    }
  }
  const token = signToken(user);
  res.send({
    token,
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  });
});

export default handler;

import nextConnect from 'next-connect';
import { isAuth } from '../../../utils/auth';

const handler = nextConnect();
handler.use(isAuth);

handler.get(async (req, res) => {
  // res.send(process.env.GOOGLE_API_KEY || 'nokey');
  res.send(process.env.GOOGLE_API_KEY);
});

export default handler;

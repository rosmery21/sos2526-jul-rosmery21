import express from 'express';
import { getOpenAQData } from './openaq.js'
const router = express.Router();

router.get('/openaq', async (req, res) => {
  const data = await getOpenAQData();
  res.send(data);
});

export default router;
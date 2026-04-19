import express from 'express';
import { getOpenAQData } from './openaq.js';
const router = express.Router();

router.get('/openaq', async (req, res) => {
    try {
        const countryCode = req.query.countryCode;
        const data = await getOpenAQData(countryCode);
        res.send(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
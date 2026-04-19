import express from 'express';
import { getOpenAQData } from './openaq.js';
import { countriesCodes } from '../../../utils/countriesCodes/countriesCodes.js';

const router = express.Router();

router.get('/openaq', async (req, res) => {
    try {
        const country = req.query.country;
        const countryCode = countriesCodes[country];
        const data = await getOpenAQData(countryCode);
        res.send(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
import express from 'express';
import { getAQapiData } from './aqapi.js';
import { countriesCodes } from '../../../utils/countriesCodes/countriesCodes.js';

const router = express.Router();

router.get('/aqapi', async (req, res) => {
    try {
        const country = req.query.country;
        const countryCode = countriesCodes[country.toLowerCase()];
        const data = await getAQapiData(countryCode);
        res.send(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
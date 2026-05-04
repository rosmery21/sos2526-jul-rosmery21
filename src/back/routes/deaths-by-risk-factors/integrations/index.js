import express from 'express';
import { getAQapiData } from './aqapi.js';
import { getDietCost } from './cost-of-healthy-diet.js';
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

router.get('/cost-of-healthy-diet', async (req, res) => {
    try{
        const data = await getDietCost();
        res.send(data);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.get('/happiness-indices', async (req, res) => {
    try{
        const data = await getHappinessIndices();
        res.send(data);
    }catch (err){
        res.status(500).json({error: err.message});
    }
})

export default router;
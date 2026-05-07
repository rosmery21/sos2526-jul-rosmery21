import express from 'express';
import { getLiteracyRates } from './literacy-rates.js';
import { getPopulationDensities } from './population-densities.js';
import { getWorldbankGDP } from './worldbank-gdp.js';
import { getWorldbankLifeExpectancy } from './worldbank-life-expectancy.js';
import { getWorldbankPoverty } from './worldbank-poverty.js';

const router = express.Router();

// Proxy → SOS2526-11 (literacy-rates) — API de compañero SOS
router.get('/literacy-rates', async (req, res) => {
    try {
        const data = await getLiteracyRates();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Proxy → SOS2526-15 (population-densities) — API de compañero SOS
router.get('/population-densities', async (req, res) => {
    try {
        const data = await getPopulationDensities();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Proxy → World Bank GDP per capita — API externa
router.get('/worldbank-gdp', async (req, res) => {
    try {
        const data = await getWorldbankGDP();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Proxy → World Bank Life Expectancy — API externa
router.get('/worldbank-life-expectancy', async (req, res) => {
    try {
        const data = await getWorldbankLifeExpectancy();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Proxy → World Bank Poverty — API externa
router.get('/worldbank-poverty', async (req, res) => {
    try {
        const data = await getWorldbankPoverty();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

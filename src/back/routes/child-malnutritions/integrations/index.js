import express from 'express';
import { getLiteracyRates } from './literacy-rates.js';
import { getPopulationDensities } from './population-densities.js';
import { getWorldbankGDP } from './worldbank-gdp.js';
import { getWorldbankLifeExpectancy } from './worldbank-life-expectancy.js';
import { getWorldbankPoverty } from './worldbank-poverty.js';

const router = express.Router();

const EDU_API_URL = "https://api.worldbank.org/v2/country/all/indicator/SE.XPD.TOTL.GD.ZS?format=json&per_page=1000&mrv=10";

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

// Proxy → World Bank Education Expenditure — API externa
router.get('/education-expenditure', async (req, res) => {
    try {
        const response = await fetch(EDU_API_URL);
        if (!response.ok) throw new Error(`World Bank Education error: ${response.status}`);
        const data = await response.json();
        res.json(data); // manda [metadata, [records...]] — el frontend hace eduData[1]
    } catch (err) {
        console.error("Error in Education Proxy:", err);
        res.status(500).json({ error: "Error al conectar con World Bank" });
    }
});

export default router;
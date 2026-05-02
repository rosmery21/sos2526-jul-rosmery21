import express from 'express';
import { getPopulationData } from './population.js'; 
import { getUniversitiesData } from './universities.js'; 

const router = express.Router();

router.get('/population', async (req, res) => {
    try {
        const country = req.query.country || 'Spain';
        // Llamamos a la función
        const data = await getPopulationData(country);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "proxy ha fallado" });
    }
});

router.get('/universities', async (req, res) => {
    try {
        const country = req.query.country || 'Spain';
        const data = await getUniversitiesData(country);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Proxy ha fallado" });
    }
});

export default router;
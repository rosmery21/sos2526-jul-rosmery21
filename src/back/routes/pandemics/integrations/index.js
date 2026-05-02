import express from 'express';
import { getPopulationData } from './population.js'; 
import { getUniversitiesData } from './universities.js'; 
import { getCovidData } from './covid.js';

const router = express.Router();

router.get('/population', async (req, res) => {
    try {
        const country = req.query.country || 'Spain';
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

router.get('/covid', async (req, res) => {
    try {
        const country = req.query.country;
        
        if (!country) {
            return res.status(400).json({ error: "Debes especificar un país" });
        }

        const data = await getCovidData(country);

        if (data.error) {
            return res.status(200).json(data); 
        }

        res.json(data);

    } catch (err) {
        console.error("Error en el router de COVID:", err);
        res.status(500).json({ error: "Error interno en el servidor proxy" });
    }
});

export default router;
import express from "express";
import fs from "fs";

const router = express.Router();

let childMalnutritions = [];

// ===== GET ALL =====
router.get("/child-malnutritions", (req, res) => {
    let { limit, offset, country, region, from, to } = req.query;

    let filtered = [...childMalnutritions];

    if (country) filtered = filtered.filter(d => d.country.toLowerCase().includes(country.toLowerCase()));
    if (region) filtered = filtered.filter(d => d.region.toLowerCase().includes(region.toLowerCase()));
    if (from) filtered = filtered.filter(d => d.year >= parseInt(from));
    if (to) filtered = filtered.filter(d => d.year <= parseInt(to));

    const L = Math.min(parseInt(limit) || 10, 10);
    const O = parseInt(offset) || 0;

    const result = filtered.slice(O, O + L);

    if (result.length === 0) return res.status(404).send("Data not found");

    res.status(200).json(result);
});


// ===== LOAD INITIAL DATA =====
router.get("/child-malnutritions/loadInitialData", (req, res) => {
    if (childMalnutritions.length > 0)
        return res.status(200).send("Data already loaded");

    try {
        const content = fs.readFileSync("./database/child-malnutritions.csv", "utf-8");
        const lines = content.split("\n").slice(1);

        lines.forEach(line => {
            const col = line.split(",");
            if (col.length >= 7) {
                childMalnutritions.push({
                    year: parseInt(col[0]),
                    country: col[1].trim(),
                    region: col[2].trim(),
                    stunting_rate: parseFloat(col[3]) || 0,
                    wasting_rate: parseFloat(col[4]) || 0,
                    overweight_rate: parseFloat(col[5]) || 0,
                    underweight_rate: parseFloat(col[6]) || 0
                });
            }
        });

        return res.status(200).send("Data loaded");
    } catch (e) {
        childMalnutritions = [
            { year: 2015, country: "Peru", region: "South America", stunting_rate: 13.2, wasting_rate: 1.8, overweight_rate: 7.5, underweight_rate: 4.1 },
            { year: 2016, country: "Peru", region: "South America", stunting_rate: 12.9, wasting_rate: 1.7, overweight_rate: 7.8, underweight_rate: 3.9 },
            { year: 2017, country: "Peru", region: "South America", stunting_rate: 12.3, wasting_rate: 1.6, overweight_rate: 8.0, underweight_rate: 3.7 },
            { year: 2018, country: "Bolivia", region: "South America", stunting_rate: 16.5, wasting_rate: 2.2, overweight_rate: 6.1, underweight_rate: 5.0 },
            { year: 2019, country: "Bolivia", region: "South America", stunting_rate: 16.1, wasting_rate: 2.1, overweight_rate: 6.3, underweight_rate: 4.8 },
            { year: 2020, country: "Bolivia", region: "South America", stunting_rate: 15.8, wasting_rate: 2.0, overweight_rate: 6.5, underweight_rate: 4.6 }
        ];
        return res.status(200).send("Sample data loaded");
    }
});


// ===== GET ONE =====
router.get("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);

    const data = childMalnutritions.find(d =>
        d.country.toLowerCase() === country && d.year === year
    );

    if (!data) return res.status(404).json({ error: `No existe dato para ${req.params.country} (${req.params.year})` });

    res.status(200).json(data);
});


// ===== POST =====
router.post("/child-malnutritions", (req, res) => {
    const {
        year, country, region,
        stunting_rate = 0,
        wasting_rate = 0,
        overweight_rate = 0,
        underweight_rate = 0
    } = req.body;

    if (!year || !country || !region)
        return res.status(400).send("Faltan campos obligatorios: year, country, region");

    if (parseInt(year) < 0)
        return res.status(400).send("El año no puede ser negativo");

    if ([stunting_rate, wasting_rate, overweight_rate, underweight_rate].some(v => parseFloat(v) < 0))
        return res.status(400).send("No se permiten valores negativos");

    const exists = childMalnutritions.find(d =>
        d.country.toLowerCase() === country.toLowerCase() &&
        d.year === parseInt(year)
    );

    if (exists) return res.status(409).send(`Ya existe un dato para ${country} (${year})`);

    childMalnutritions.push({
        year: parseInt(year),
        country,
        region,
        stunting_rate: parseFloat(stunting_rate) || 0,
        wasting_rate: parseFloat(wasting_rate) || 0,
        overweight_rate: parseFloat(overweight_rate) || 0,
        underweight_rate: parseFloat(underweight_rate) || 0
    });

    res.status(201).send("Created");
});


// ===== DELETE ALL =====
router.delete("/child-malnutritions", (req, res) => {
    childMalnutritions = [];
    res.status(200).send("Deleted all");
});


// ===== DELETE ONE =====
router.delete("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);

    const index = childMalnutritions.findIndex(d =>
        d.country.toLowerCase() === country && d.year === year
    );

    if (index !== -1) childMalnutritions.splice(index, 1);

    res.status(204).send();
});


// ===== PUT =====
router.put("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);

    const {
        year: y, country: c, region,
        stunting_rate = 0,
        wasting_rate = 0,
        overweight_rate = 0,
        underweight_rate = 0
    } = req.body;

    if (!y || !c || !region)
        return res.status(400).send("Faltan campos obligatorios: year, country, region");

    if ([stunting_rate, wasting_rate, overweight_rate, underweight_rate].some(v => parseFloat(v) < 0))
        return res.status(400).send("No se permiten valores negativos");

    if (c.toLowerCase() !== country || parseInt(y) !== year)
        return res.status(400).send("El país y año no coinciden con la URL");

    const index = childMalnutritions.findIndex(d =>
        d.country.toLowerCase() === country && d.year === year
    );

    if (index === -1) return res.status(404).send(`No existe dato para ${req.params.country} (${req.params.year})`);

    childMalnutritions[index] = {
        year: parseInt(y),
        country: c,
        region,
        stunting_rate: parseFloat(stunting_rate) || 0,
        wasting_rate: parseFloat(wasting_rate) || 0,
        overweight_rate: parseFloat(overweight_rate) || 0,
        underweight_rate: parseFloat(underweight_rate) || 0
    };

    res.status(200).send("Updated");
});

export default router;
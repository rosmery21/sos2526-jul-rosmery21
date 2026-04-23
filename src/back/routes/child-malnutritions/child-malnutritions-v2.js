console.log("V2 CHILD MALNUTRITIONS LOADED");

import express from "express";
import fs from "fs";

const router = express.Router();

let childMalnutritions = [];

router.get("/child-malnutritions/loadInitialData", (req, res) => {
    childMalnutritions = [];

    try {
        const content = fs.readFileSync("./database/child-malnutritions.csv", "utf-8");
        const lines = content.split("\n").slice(1);

        lines.forEach(line => {
            const col = line.split(",");

            if (col.length >= 7) {
                childMalnutritions.push({
                    year: Number(col[0]),
                    country: col[1].trim(),
                    region: col[2].trim(),
                    stunting_rate: Number(col[3]) || 0,
                    wasting_rate: Number(col[4]) || 0,
                    overweight_rate: Number(col[5]) || 0,
                    underweight_rate: Number(col[6]) || 0
                });
            }
        });

        return res.status(200).send("Data loaded");
    } catch (err) {
        childMalnutritions = [
            { year: 2019, country: "Peru", region: "South America", stunting_rate: 12, wasting_rate: 2, overweight_rate: 3, underweight_rate: 1 },
            { year: 2020, country: "Japan", region: "Asia", stunting_rate: 8, wasting_rate: 1, overweight_rate: 4, underweight_rate: 2 },
            { year: 2022, country: "Ecuador", region: "South America", stunting_rate: 14, wasting_rate: 3, overweight_rate: 4, underweight_rate: 2 }
        ];

        return res.status(200).send("Sample data loaded");
    }
});

router.get("/child-malnutritions", (req, res) => {
    let { limit, offset, country, region, from, to } = req.query;

    let data = [...childMalnutritions];

    if (country) {
        data = data.filter(d =>
            d.country.toLowerCase().includes(country.toLowerCase())
        );
    }

    if (region) {
        data = data.filter(d =>
            d.region.toLowerCase().includes(region.toLowerCase())
        );
    }

    if (from) data = data.filter(d => d.year >= Number(from));
    if (to) data = data.filter(d => d.year <= Number(to));

    const L = limit ? Number(limit) : data.length;
    const O = offset ? Number(offset) : 0;

    return res.status(200).json(data.slice(O, O + L));
});

router.get("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = Number(req.params.year);

    const result = childMalnutritions.find(
        d => d.country.toLowerCase() === country && d.year === year
    );

    if (!result) {
        return res.status(404).json({ error: "Not found" });
    }

    return res.status(200).json(result);
});

router.post("/child-malnutritions", (req, res) => {
    const { year, country, region } = req.body;

    if (!year || !country || !region) {
        return res.status(400).send("Bad request");
    }

    const exists = childMalnutritions.find(
        d =>
            d.country.toLowerCase() === country.toLowerCase() &&
            d.year === Number(year)
    );

    if (exists) {
        return res.status(409).send("Conflict");
    }

    childMalnutritions.push({
        year: Number(year),
        country,
        region,
        stunting_rate: req.body.stunting_rate || 0,
        wasting_rate: req.body.wasting_rate || 0,
        overweight_rate: req.body.overweight_rate || 0,
        underweight_rate: req.body.underweight_rate || 0
    });

    return res.status(201).send("Created");
});

router.delete("/child-malnutritions", (req, res) => {
    childMalnutritions = [];
    return res.status(200).send("Deleted all");
});

router.delete("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = Number(req.params.year);

    const index = childMalnutritions.findIndex(
        d => d.country.toLowerCase() === country && d.year === year
    );

    if (index === -1) {
        return res.status(404).send("Not found");
    }

    childMalnutritions.splice(index, 1);

    return res.status(204).send();
});

router.put("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = Number(req.params.year);

    const index = childMalnutritions.findIndex(
        d => d.country.toLowerCase() === country && d.year === year
    );

    if (index === -1) {
        return res.status(404).send("Not found");
    }

    const body = req.body;

    if (
        !body.country ||
        !body.year ||
        body.country.toLowerCase() !== country ||
        Number(body.year) !== year
    ) {
        return res.status(400).send("ID mismatch");
    }

    childMalnutritions[index] = {
        year,
        country: body.country,
        region: body.region,
        stunting_rate: body.stunting_rate,
        wasting_rate: body.wasting_rate,
        overweight_rate: body.overweight_rate,
        underweight_rate: body.underweight_rate
    };

    return res.status(200).send("Updated");
});

export default router;
import express from "express";
const router = express.Router();

let childMalnutritions = [];

// GET all data
router.get("/child-malnutritions", (req, res) => {
    res.send(childMalnutritions);
});

// GET single data
router.get("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);

    const data = childMalnutritions.find(
        d => d.country.toLowerCase() === country && d.year === year
    );

    if (!data) {
        return res.status(404).json({ error: "Not found" });
    }

    res.send(data);
});

// LOAD INITIAL DATA
router.get("/child-malnutritions/loadInitialData", (req, res) => {
    if (childMalnutritions.length === 0) {
        childMalnutritions.push(
            { year: 2015, country: "Peru", region: "South America", stunting_rate: 13.2 },
            { year: 2016, country: "Peru", region: "South America", stunting_rate: 12.9 },
            { year: 2017, country: "Peru", region: "South America", stunting_rate: 12.3 },
            { year: 2018, country: "Bolivia", region: "South America", stunting_rate: 16.5 },
            { year: 2019, country: "Bolivia", region: "South America", stunting_rate: 16.1 },
            { year: 2020, country: "Bolivia", region: "South America", stunting_rate: 15.8 },
            { year: 2021, country: "Ecuador", region: "South America", stunting_rate: 14.2 },
            { year: 2022, country: "Ecuador", region: "South America", stunting_rate: 13.9 },
            { year: 2023, country: "Peru", region: "South America", stunting_rate: 11.8 },
            { year: 2024, country: "Peru", region: "South America", stunting_rate: 11.5 }
        );

        return res.status(201).send("Initial data loaded");
    }

    res.status(409).send("Data already loaded");
});

// POST
router.post("/child-malnutritions", (req, res) => {
    const newData = req.body;

    if (!newData.country || !newData.year || !newData.region || newData.stunting_rate == null) {
        return res.status(400).send("Missing fields");
    }

    const exists = childMalnutritions.find(d =>
        d.country.toLowerCase() === newData.country.toLowerCase() &&
        d.year === parseInt(newData.year)
    );

    if (exists) {
        return res.status(409).send("Data already exists");
    }

    childMalnutritions.push({
        ...newData,
        year: parseInt(newData.year)
    });

    res.status(201).send(newData);
});

// DELETE ALL
router.delete("/child-malnutritions", (req, res) => {
    childMalnutritions = [];
    res.status(200).send("All data deleted");
});

// DELETE ONE
router.delete("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);

    const index = childMalnutritions.findIndex(
        d => d.country.toLowerCase() === country && d.year === year
    );

    if (index === -1) {
        return res.status(404).json({ error: "Not found" });
    }

    childMalnutritions.splice(index, 1);
    res.status(200).json({ message: "Deleted" });
});

// PUT
router.put("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);
    const updatedData = req.body;

    // missing fields
    if (!updatedData.country || !updatedData.year || !updatedData.region || updatedData.stunting_rate == null) {
        return res.status(400).send("Missing fields");
    }

    // ID mismatch
    if (
        updatedData.country.toLowerCase() !== country ||
        parseInt(updatedData.year) !== year
    ) {
        return res.status(400).send("Bad request - ID mismatch");
    }

    const index = childMalnutritions.findIndex(
        d => d.country.toLowerCase() === country && d.year === year
    );

    if (index === -1) {
        return res.status(404).send("Not found");
    }

    // EXACT fields check (clave para el test)
    const allowedFields = ["country", "year", "region", "stunting_rate"];
    const bodyFields = Object.keys(updatedData);

    if (
        bodyFields.length !== allowedFields.length ||
        !allowedFields.every(f => bodyFields.includes(f))
    ) {
        return res.status(400).send("Invalid fields");
    }

    childMalnutritions[index] = {
        ...updatedData,
        year: parseInt(updatedData.year)
    };

    res.status(200).send(updatedData);
});

export default router;
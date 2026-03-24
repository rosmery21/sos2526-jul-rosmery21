import express from "express";
import fs from "fs"; // Serve per leggere il file
const router = express.Router();

let childMalnutritions = [];


// GET all data 
router.get("/child-malnutritions", (req, res) => {
    let { limit, offset, country, year, region } = req.query;
    
    // 1. Partiamo da tutti i dati
    let filteredData = [...childMalnutritions];

    // 2. Applichiamo i FILTRI (se presenti nella URL)
    if (country) {
        filteredData = filteredData.filter(d => d.country.toLowerCase() === country.toLowerCase());
    }
    if (year) {
        filteredData = filteredData.filter(d => d.year === parseInt(year));
    }
    if (region) {
        filteredData = filteredData.filter(d => d.region.toLowerCase() === region.toLowerCase());
    }

    // 3. Applichiamo la PAGINAZIONE (limit e offset)
    const L = parseInt(limit) || 10; // Quanti dati mostrare (default 10)
    const O = parseInt(offset) || 0; // Da dove iniziare (default 0)

    const paginatedData = filteredData.slice(O, O + L);

    // 4. Inviamo il risultato "tagliato"
    res.json(paginatedData);
});

// LOAD INITIAL DATA (Corretto: legge il CSV e aggiunge i 10 campioni se il CSV fallisce)
router.get("/child-malnutritions/loadInitialData", (req, res) => {
    if (childMalnutritions.length > 0) {
        return res.status(409).send("Data already loaded");
    }

    try {
        // Proviamo a leggere il file CSV
        const content = fs.readFileSync('./database/child-malnutritions.csv', 'utf-8');
        const lines = content.split('\n').slice(1); // Salta l'intestazione
        
        lines.forEach(line => {
            const col = line.split(',');
            if (col.length >= 4) {
                childMalnutritions.push({
                    year: parseInt(col[0]),
                    country: col[1],
                    region: col[2],
                    stunting_rate: parseFloat(col[3])
                });
            }
        });
        res.status(201).send("Data loaded from CSV");
    } catch (e) {
        // Se il file non esiste, carichiamo i 10 dati di test per non restare a secco
        childMalnutritions = [
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
        ];
        res.status(201).send("CSV not found, loaded samples instead");
    }
});

// GET single data
router.get("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);
    const data = childMalnutritions.find(d => d.country.toLowerCase() === country && d.year === year);
    if (!data) return res.status(404).json({ error: "Not found" });
    res.json(data);
});

// POST
router.post("/child-malnutritions", (req, res) => {
    const newData = req.body;
    if (!newData.country || !newData.year || !newData.region || newData.stunting_rate == null) {
        return res.status(400).send("Missing fields");
    }
    const exists = childMalnutritions.find(d => d.country.toLowerCase() === newData.country.toLowerCase() && d.year === parseInt(newData.year));
    if (exists) return res.status(409).send("Data already exists");
    
    childMalnutritions.push({ ...newData, year: parseInt(newData.year) });
    res.status(201).send("Created");
});

// DELETE ALL
router.delete("/child-malnutritions", (req, res) => {
    childMalnutritions = [];
    res.status(200).send("Deleted all");
});

// DELETE ONE
router.delete("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);
    const index = childMalnutritions.findIndex(d => d.country.toLowerCase() === country && d.year === year);
    if (index === -1) return res.status(404).json({ error: "Not found" });
    childMalnutritions.splice(index, 1);
    res.status(200).json({ message: "Deleted" });
});

// PUT
router.put("/child-malnutritions/:country/:year", (req, res) => {
    const country = req.params.country.toLowerCase();
    const year = parseInt(req.params.year);
    const updatedData = req.body;
    if (!updatedData.country || !updatedData.year || !updatedData.region || updatedData.stunting_rate == null) return res.status(400).send("Missing fields");
    if (updatedData.country.toLowerCase() !== country || parseInt(updatedData.year) !== year) return res.status(400).send("ID mismatch");

    const index = childMalnutritions.findIndex(d => d.country.toLowerCase() === country && d.year === year);
    if (index === -1) return res.status(404).send("Not found");

    childMalnutritions[index] = { ...updatedData, year: parseInt(updatedData.year) };
    res.status(200).send("Updated");
});

export default router;
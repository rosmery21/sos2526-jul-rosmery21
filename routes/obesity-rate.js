const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// Percorso CSV
const DATA_FILE = path.join(__dirname, '../data/obesity-rate.csv');

// GET: restituisce tutti i dati
router.get('/api/v1/obesity-rate', (req, res) => {
  const results = [];
  fs.createReadStream(DATA_FILE)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => res.json(results))
    .on('error', (err) => res.status(500).json({ error: 'Errore nella lettura del CSV', details: err }));
});

// GET: /loadInitialData per inizializzare dati in memoria (simulazione)
router.get('/api/v1/obesity-rate/loadInitialData', (req, res) => {
  res.json({ message: 'Dati inizializzati correttamente (simulazione)' });
});

module.exports = router;
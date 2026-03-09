const express = require('express');
const router = express.Router();
const fileReader = require('../../utils/readFile.js');

const store = require('../data/store.js');

// Loads the data from the file and stores it in memory for the route
router.get('/protests/loadInitialData', (req, res) => {
  if (store.protests.length === 0) {
    store.protests = fileReader.readFile('protests.csv').slice(0, 10);
  }
  res.status(200).json([]);
});

// Returns the data stored in memory for the route
router.get('/protests', (req, res) => {
  res.status(200).json(store.protests);
});

// Creates a new entry in the data stored in memory for the route
router.post('/protests', (req, res) => {
  const newData = req.body;

  // Required fields
  const requiredFields = [
    "id","country","year","region","protest","protesterviolence",
    "protesterdemand","stateresponse","electoral_ecore","liberal_score",
    "participatory_score","deliberative_score","egalitarian_score",
    "hdi_score","violence_status","predicted_prob"
  ];

  // Verify that all required fields are present
  const missingFields = requiredFields.filter(field => !(field in newData));

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios",
      missing: missingFields
    });
  }

  // Verify that the ID is unique
  const exists = store.protests.some(protest => protest.id === newData.id);

  if (exists) {
    return res.status(409).json({
      error: "Ya existe un elemento con ese id"
    });
  }

  // Add if no errors
  store.protests.push(newData);
  res.status(201).json(newData);
});


// Method not allowed for the route, since we don't want to update all the data at once
router.put('/protests', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Deletes all the data stored in memory for the route
router.delete('/protests', (req, res) => {
  store.protests = [];
  res.status(204).send("All data deleted");
});

// Returns the data stored in memory for a specific country
router.get('/protests/:country', (req, res) => {
  const country = req.params.country.toLowerCase();
  const data = store.protests.filter(item => item.country.toLowerCase() === country);

  if (data.length > 0) {
    res.status(200).json(data);
  } else {
    res.status(404).send('Data not found for country: ' + country);
  }
});

// Method not allowed for the route, since we don't want to create a new country with a specific country
router.post('/protests/:country', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Updates the data stored in memory for a specific country
router.put('/protests/:protestID', (req, res) => {
  const protestID = Number(req.params.protestID);
  const index = store.protests.findIndex(item => item.id === protestID);

  if (index === -1) {
    return res.status(404).send('Data not found for protest ID: ' + protestID);
  }

  // Body ID must match URL ID
  if (req.body.id !== protestID) {
    return res.status(400).send('ID in body must match ID in URL');
  }

  store.protests[index] = req.body;

  res.status(200).json(store.protests[index]);
});

// Deletes the data stored in memory for a specific country
router.delete('/protests/:protestID', (req, res) => {
  const protestID = req.params.protestID;
  const index = store.protests.findIndex(item => item.id === protestID);

  if (index === -1) {
    return res.status(404).send('Data not found for protest ID: ' + protestID);
  }

  store.protests.splice(index, 1);
  res.status(204).end();
});

module.exports = router;
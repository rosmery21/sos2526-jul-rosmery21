const express = require('express');
const router = express.Router();
const fileReader = require('../../utils/readFile.js');

const store = require('../data/store.js');

// Loads the data from the file and stores it in memory for the route
router.get('/deaths-by-risk-factors/loadInitialData', (req, res) => {
  if (store.deathsByRiskFactors.length === 0) {
    let data = fileReader.readFile('number-of-deaths-by-risk-factor.csv');
    let filteredData = data.map(item => ({
      Entity: item.Entity,
      Year: item.Year,
      'High systolic blood pressure': item['High systolic blood pressure'],
      'Air pollution': item['Air pollution'],
      'Child wasting': item['Child wasting'],
      'Household air pollution from solid fuels': item['Household air pollution from solid fuels'],
      'High fasting plasma glucose': item['High fasting plasma glucose']
    })
    );
    store.deathsByRiskFactors = filteredData.slice(0, 10);
    return res.status(200).json(store.deathsByRiskFactors);
  }else {
    return res.status(409).send('Conflict: Data already loaded');
  }
});

// Returns the data stored in memory for the route
router.get('/deaths-by-risk-factors', (req, res) => {
  res.status(200).json(store.deathsByRiskFactors);
});

// Creates a new entry in the data stored in memory for the route
router.post('/deaths-by-risk-factors', (req, res) => {
  const newData = req.body;
  if (!newData) {
    return res.status(400).send('Bad request: No data provided');
  }
  if (newData.Entity === undefined || newData.Year === undefined || newData['High systolic blood pressure'] === undefined ||
    newData['Air pollution'] === undefined || newData['Child wasting'] === undefined ||
    newData['Household air pollution from solid fuels'] === undefined ||
    newData['High fasting plasma glucose'] === undefined) {
    return res.status(400).send('Bad request: Incomplete data provided');
  }
  if (store.deathsByRiskFactors.some(item => item.Entity.toLowerCase() === newData.Entity.toLowerCase() && item.Year === newData.Year)) {
    return res.status(409).send('Conflict: Data for country already exists');
  }
  store.deathsByRiskFactors.push(newData);
  res.status(201).json(newData);
});

// Method not allowed for the route, since we don't want to update all the data at once
router.put('/deaths-by-risk-factors', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Deletes all the data stored in memory for the route
router.delete('/deaths-by-risk-factors', (req, res) => {
  store.deathsByRiskFactors = [];
  res.status(204).send("All data deleted");
});

// Returns the data stored in memory for a specific country
router.get('/deaths-by-risk-factors/:country', (req, res) => {
  const country = req.params.country;
  const data = store.deathsByRiskFactors.filter(item => item.Entity.toLowerCase() === country.toLowerCase());
  if (data.length > 0) {
    res.status(200).json(data);
  } else {
    res.status(404).send('Data not found for country: ' + country);
  }
});

// Method not allowed for the route, since we don't want to create a new country with a specific country
router.post('/deaths-by-risk-factors/:country', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Updates the data stored in memory for a specific country
router.put('/deaths-by-risk-factors/:country', (req, res) => {
  const country = req.params.country.toLowerCase();

  if (!req.body) {
    return res.status(400).send('Bad request: No data provided');
  }
  if (req.body.Entity === undefined || req.body.Year === undefined || req.body['High systolic blood pressure'] === undefined ||
    req.body['Air pollution'] === undefined || req.body['Child wasting'] === undefined ||
    req.body['Household air pollution from solid fuels'] === undefined ||
    req.body['High fasting plasma glucose'] === undefined) {
    return res.status(400).send('Bad request: Incomplete data provided');
  }
  if (req.body.Entity.toLowerCase() !== country) {
    return res.status(400).send('Bad request: Country in the body does not match the country in the URL');
  }

  const index = store.deathsByRiskFactors.findIndex(item => item.Entity.toLowerCase() === country);

  if (index === -1) {
    return res.status(404).send('Data not found for country: ' + country);
  }

  store.deathsByRiskFactors[index] = req.body;

  res.status(200).json(store.deathsByRiskFactors[index]);
});

// Deletes the data stored in memory for a specific country
router.delete('/deaths-by-risk-factors/:country', (req, res) => {
  const country = req.params.country.toLowerCase();

  const index = store.deathsByRiskFactors.findIndex(item => item.Entity.toLowerCase() === country);

  if (index === -1) {
    return res.status(404).send('Data not found for country: ' + country);
  }

  store.deathsByRiskFactors.splice(index, 1);
  res.status(204).end();
});

module.exports = router;
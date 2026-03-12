import express from 'express';
import { readFile } from '../../utils/readFile.js';
import dataStore from "nedb"

const router = express.Router();

const store = new dataStore();

const data = [];

store.insert(data);

const DOCUMENTATION_URL = "https://documenter.getpostman.com/view/52276011/2sBXcLfcbP";

router.get('/deaths-by-risk-factors/docs', (req, res) => {
  res.redirect(DOCUMENTATION_URL);
});

// Loads the data from the file and stores it in memory for the route
router.get('/deaths-by-risk-factors/loadInitialData', (req, res) => {
  store.count({}, (err, count) => {
    if (count > 0) {
      return res.status(409).send("Conflict: Data already loaded");
    }
    let data = readFile('number-of-deaths-by-risk-factor.csv');
    let filteredData = data.map(item => ({
      Entity: item.Entity,
      Year: item.Year,
      'High systolic blood pressure': item['High systolic blood pressure'],
      'Air pollution': item['Air pollution'],
      'Child wasting': item['Child wasting'],
      'Household air pollution from solid fuels': item['Household air pollution from solid fuels'],
      'High fasting plasma glucose': item['High fasting plasma glucose']
    }));
    store.insert(filteredData.slice(0, 10), (err, docs) => {
      docs.forEach(d => delete d._id);
      res.status(201).json(docs);
    });
  });
});

// Returns the data stored in memory for the route
router.get('/deaths-by-risk-factors', (req, res) => {
  store.find({}, (err, data) => {
    let jsonData = data.map((c) => {
      delete c._id;
      return c;
    });
    res.status(200).json(jsonData);
  });
});

// Creates a new entry in the data stored in memory for the route
router.post('/deaths-by-risk-factors', (req, res) => {
  const newData = req.body;
  store.findOne(
    { Entity: newData.Entity, Year: newData.Year },
    (err, doc) => {
      if (doc)
        return res.status(409).send("Conflict: Data already exists");
      store.insert(newData, (err, inserted) => {
        delete inserted._id;
        res.status(201).json(inserted);
      });
    }
  );
});

// Method not allowed for the route, since we don't want to update all the data at once
router.put('/deaths-by-risk-factors', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Deletes all the data stored in memory for the route
router.delete('/deaths-by-risk-factors', (req, res) => {
  store.remove({}, { multi: true }, (err, numRemoved) => {
    res.status(204).send();
  });
});

// Returns the data stored in memory for a specific country
router.get('/deaths-by-risk-factors/:country', (req, res) => {
  const country = req.params.country;
  store.find({ Entity: new RegExp(`^${country}$`, "i") }, (err, data) => {
    if (data.length === 0)
      return res.status(404).send("Data not found");
    data.forEach(d => delete d._id);
    res.status(200).json(data);
  });
});

router.get('/deaths-by-risk-factors/:year', (req, res) => {
  const year = req.params.year;
  store.find({ Year: parseInt(year) }, (err, data) => {
    if (data.length === 0)
      return res.status(404).send("Data not found");
    data.forEach(d => delete d._id);
    res.status(200).json(data);
  });
});


// Returns the data stored in memory for a specific country and year
router.get('/deaths-by-risk-factors/:country/:year', (req, res) => {
  const country = req.params.country;
  const year = req.params.year;
  store.find({ Entity: new RegExp(`^${country}$`, "i"), Year: parseInt(year) }, (err, data) => {
    if (data.length === 0)
      return res.status(404).send("Data not found");
    data.forEach(d => delete d._id);
    res.status(200).json(data);
  });
});

// Method not allowed for the route, since we don't want to create a new country with a specific country
router.post('/deaths-by-risk-factors/:country', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Updates the data stored in memory for a specific country
router.put('/deaths-by-risk-factors/:country', (req, res) => {
  const country = req.params.country;
  if (req.body.Entity.toLowerCase() !== country.toLowerCase())
    return res.status(400).send("Country mismatch");
  store.update(
    { Entity: country },
    req.body,
    {},
    (err, numUpdated) => {
      if (numUpdated === 0)
        return res.status(404).send("Data not found");
      res.status(200).json(req.body);
    }
  );
});

// Deletes the data stored in memory for a specific country
router.delete('/deaths-by-risk-factors/:country', (req, res) => {
  const country = req.params.country;
  store.remove({ Entity: country }, {}, (err, numRemoved) => {
    if (numRemoved === 0)
      return res.status(404).send("Data not found");
    res.status(204).send();
  });
});

export default router;
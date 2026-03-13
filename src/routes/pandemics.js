import express from 'express';
import { readFile } from '../../utils/readFile.js';
import dataStore from 'nedb';

const router = express.Router();

const store = new dataStore();

const data = [];

store.insert(data);

const DOCUMENTATION_URL = "https://documenter.getpostman.com/view/52276047/2sBXigLDEC";

router.get('/pandemics/docs', (req, res) => {
  res.redirect(DOCUMENTATION_URL);
});

// Loads the data from the file and stores it in memory for the route
router.get('/pandemics/loadInitialData', (req, res) => {
  store.count({}, (err, count) => {
    if (count > 0) {
      return res.status(409).send("Conflict: Data already loaded");
    }
    let data = readFile('pandemics.csv');
    let filteredData = data.map(item => ({
      entity: item.Entity,
      code: item.Code,
      year: item.Year,
      yaws: item['Yaws'],
      polio: item['Polio'],
      guinea_worm: item['Guinea_worm'],
      rabies: item['Rabies'],
      malaria: item['Malaria'],
      hiv_aids: item['Hiv/aids'],
      tuberculosis: item['Tuberculosis'],
      smallpox: item['Smallpox'],
      cholera: item['Cholera']
    }));
    store.insert(filteredData.slice(0, 10), (err, docs) => {
      docs.forEach(d => delete d._id);
      res.status(201).json(docs);
    });
  });
});

// Returns the data stored in memory for the route
router.get('/pandemics', (req, res) => {
  const query = {}

  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  const country = req.query.country;
  const code = req.query.code;
  const year = req.query.year;
  const yaws = req.query.yaws;
  const polio = req.query.polio;
  const guinea_worm = req.query.guinea_worm;
  const rabies = req.query.rabies;
  const malaria = req.query.malaria;
  const hiv_aids = req.query.hiv_aids;
  const tuberculosis = req.query.tuberculosis;
  const smallpox = req.query.smallpox;
  const cholera = req.query.cholera;

  if (country) query.entity = new RegExp(`^${country}$`, "i");
  if (code) query.code = new RegExp(`^${code}$`, "i");
  if (year) query.year = parseInt(year);
  if (yaws) query.yaws = { $gt: parseFloat(yaws) };
  if (polio) query.polio = { $gt: parseFloat(polio) };
  if (guinea_worm) query.guinea_worm = { $gt: parseFloat(guinea_worm) };
  if (rabies) query.rabies = { $gt: parseFloat(rabies) };
  if (malaria) query.malaria = { $gt: parseFloat(malaria) };
  if (hiv_aids) query.hiv_aids = { $gt: parseFloat(hiv_aids) };
  if (tuberculosis) query.tuberculosis = { $gt: parseFloat(tuberculosis) };
  if (smallpox) query.smallpox = { $gt: parseFloat(smallpox) };
  if (cholera) query.cholera = { $gt: parseFloat(cholera) };

  store.find(query)
    .skip(offset)
    .limit(limit)
    .exec((err, data) => {
    if (data.length === 0)
      return res.status(404).send("Data not found");
    data.forEach(d => delete d._id);
    if (data.length === 1)
      data = data[0];
    res.status(200).json(data);
  });
});

// Creates a new entry in the data stored in memory for the route
router.post('/pandemics', (req, res) => {
  const newData = req.body;
  if(!newData || !newData.entity || !newData.code || !newData.year || !newData.yaws || !newData.polio || !newData.guinea_worm || !newData.rabies || !newData.malaria || !newData.hiv_aids || !newData.tuberculosis || !newData.smallpox || !newData.cholera ){
    return res.status(400).send("Bad request: Missing required fields");
  }
  store.findOne(
    { entity: newData.entity, year: newData.year },
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
router.put('/pandemics', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Deletes all the data stored in memory for the route
router.delete('/pandemics', (req, res) => {
  store.remove({}, { multi: true }, (err, numRemoved) => {
    res.status(204).send();
  });
});

// Returns the data stored in memory for a specific country
router.get('/pandemics/:country/:year', (req, res) => {
  const country = req.params.country;
  const year = parseInt(req.params.year);
  store.find({ entity: new RegExp(`^${country}$`, "i"), year: year }, (err, data) => {
    if (data.length === 0)
      return res.status(404).send("Data not found");
    data.forEach(d => delete d._id);
    res.status(200).json(data);
  });
});


// Method not allowed for the route, since we don't want to create a new country with a specific country
router.post('/pandemics/:country', (req, res) => {
    res.status(405).send('Method not allowed');
});

// Updates the data stored in memory for a specific country
router.put('/pandemics/:country/:year', (req, res) => {
  const country = req.params.country;
  const year = parseInt(req.params.year);
  const newData = req.body;
  if(!newData || !newData.entity || !newData.code || !newData.year || !newData.yaws || !newData.polio || !newData.guinea_worm || !newData.rabies || !newData.malaria || !newData.hiv_aids || !newData.tuberculosis || !newData.smallpox || !newData.cholera){
  }
  if (newData.entity.toLowerCase() !== country.toLowerCase())
    return res.status(400).send("Country mismatch");
  store.update(
    { entity: new RegExp(`^${country}$`, "i"), year: year },
    newData,
    {},
    (err, numUpdated) => {
      if (numUpdated === 0)
        return res.status(404).send("Data not found");
      res.status(200).json(newData);
    }
  );
});

// Deletes the data stored in memory for a specific country
router.delete('/pandemics/:country/:year', (req, res) => {
  const country = req.params.country;
  const year = parseInt(req.params.year);
  store.remove({ entity: new RegExp(`^${country}$`, "i"), year: year }, {}, (err, numRemoved) => {
    if (numRemoved === 0)
      return res.status(404).send("Data not found");
    res.status(204).send();
  });
});

export default router;
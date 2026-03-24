import express from 'express';
import { readFile } from '../utils/readFile.js';
import dataStore from 'nedb';

const router = express.Router();

const store = new dataStore({filename: './data/storage/pandemics-2.db', autoload: true});

const data = [];
const requiredFields = ['entity', 'code', 'year', 'yaws', 'polio', 'guinea_worm', 'rabies', 'malaria', 'hiv_aids', 'tuberculosis', 'smallpox', 'cholera'];

const DOCUMENTATION_URL = "https://documenter.getpostman.com/view/52276047/2sBXijKsCU";

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
      yaws: item.Yaws || 0,
      polio: item.Polio || 0,
      guinea_worm: item.Guinea_worm || 0,
      rabies: item.Rabies || 0,
      malaria: item.Malaria || 0,
      hiv_aids: item['Hiv_aids'] || 0,
      tuberculosis: item.Tuberculosis || 0,
      smallpox: item.Smallpox || 0,
      cholera: item.Cholera || 0
    }));
    store.insert(filteredData.slice(0, 10), (err, docs) => {
      docs.forEach(d => delete d._id);
      res.status(201).json(docs);
    });
  });
});

router.get('/pandemics', (req, res) => {
  const query = {}

  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 10;

  const { entity, code, year, from, to, yaws, polio, guinea_worm, rabies, malaria, hiv_aids, tuberculosis, smallpox, cholera } = req.query;

  if (entity) query.entity = new RegExp(entity, "i"); 
  if (code) query.code = new RegExp(code, "i");

  if (year) {
      query.year = parseInt(year);
  } else if (from || to) {
      query.year = {};
      if (from) query.year.$gte = parseInt(from); 
      if (to)   query.year.$lte = parseInt(to);   
  }

  if (yaws) query.yaws = parseFloat(yaws) ;
  if (polio) query.polio = parseFloat(polio);
  if (guinea_worm) query.guinea_worm = parseFloat(guinea_worm);
  if (rabies) query.rabies = parseFloat(rabies);
  if (malaria) query.malaria = parseFloat(malaria);
  if (hiv_aids) query.hiv_aids = parseFloat(hiv_aids);
  if (tuberculosis) query.tuberculosis = parseFloat(tuberculosis);
  if (smallpox) query.smallpox = parseFloat(smallpox);
  if (cholera) query.cholera = parseFloat(cholera);

  store.find(query)
    .skip(offset)
    .limit(limit)
    .exec((err, data) => {
    if (err) return res.status(500).send("Internal Server Error");
    data.forEach(d => delete d._id);
    res.status(200).json(data);
  });
});

// Creates a new entry
router.post('/pandemics', (req, res) => {
  const newData = req.body;
  const isMissingFields = requiredFields.some(field => 
    newData[field] === undefined || newData[field] === "" || newData[field] === null
  );
  if (isMissingFields) {
    return res.status(400).send("Bad request: Missing required fields");
  }
  const hasExtraFields = Object.keys(newData).some(key => !requiredFields.includes(key));
  if (hasExtraFields) {
    return res.status(400).send("Bad request: Extra fields provided");
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

router.put('/pandemics', (req, res) => {
  res.status(405).send('Method not allowed');
});

router.delete('/pandemics', (req, res) => {
  store.remove({}, { multi: true }, (err, numRemoved) => {
    res.status(204).send();
  });
});

router.get('/pandemics/:entity/:year', (req, res) => {
  const entity = req.params.entity;
  const year = parseInt(req.params.year);
  
  store.findOne({ entity: new RegExp(`^${entity}$`, "i"), year: year }, (err, data) => {
    if (err) return res.status(500).send("Internal Server Error");
    if (!data) return res.status(404).send("Data not found");
    delete data._id;
    res.status(200).json(data);
  });
});

router.post('/pandemics/:entity', (req, res) => {
    res.status(405).send('Method not allowed');
});

router.put('/pandemics/:entity/:year', (req, res) => {
  const entity = req.params.entity;
  const year = parseInt(req.params.year);
  const newData = req.body;
  const isMissingFields = requiredFields.some(field => !newData[field]);
  if (isMissingFields) {
    return res.status(400).send("Bad request: Missing required fields");
  }
  const hasExtraFields = Object.keys(newData).some(key => !requiredFields.includes(key));
  if (hasExtraFields) {
    return res.status(400).send("Bad request: Extra fields provided");
  }
  if (newData.entity.toLowerCase() !== entity.toLowerCase())
    return res.status(400).send("entity mismatch");
  store.update(
    { entity: new RegExp(`^${entity}$`, "i"), year: year },
    newData,
    {},
    (err, numUpdated) => {
      if (numUpdated === 0)
        return res.status(404).send("Data not found");
      res.status(200).json(newData);
    }
  );
});

router.delete('/pandemics/:entity/:year', (req, res) => {
  const entity = req.params.entity;
  const year = parseInt(req.params.year);
  store.remove({ entity: new RegExp(`^${entity}$`, "i"), year: year }, {}, (err, numRemoved) => {
    if (numRemoved === 0)
      return res.status(404).send("Data not found");
    res.status(204).send();
  });
});

export default router;
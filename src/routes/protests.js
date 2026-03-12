import express from 'express';
const router = express.Router();
import { readFile } from '../../utils/readFile.js';
import DataStore from "nedb";

const DOCUMENTATION_URL = "https://documenter.getpostman.com/view/52275979/2sBXiesEPb";
router.get('/protests/docs', (req, res) => {
  res.redirect(DOCUMENTATION_URL);
});

// Required fields for creating or updating a protest entry
const requiredFields = [
  "id", "country", "year", "region", "protest", "protesterviolence",
  "protesterdemand", "stateresponse", "electoral_ecore", "liberal_score",
  "participatory_score", "deliberative_score", "egalitarian_score",
  "hdi_score", "violence_status", "predicted_prob"
];

let db = new DataStore();

// Helper function to handle errors
let handleServerError = (err, res) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
}


let removeIdField = (data) => {
  return data.map(({ _id, ...rest }) => rest);
}


/*
==============================================================

METHODS FOR COLLECTIONS

==============================================================
*/

// Loads the data from the file and stores it in memory for the route
router.get('/protests/loadInitialData', (req, res) => {
  db.find({}, (err, data) => {
    if (err) return handleServerError(err, res);
    // If theres no data load it
    if (data.length === 0) {
      let newData = readFile('protests.csv').splice(0, 10); // Load only the first 10 entries!!!!!!!!!!!!!!!!!!!!!!!!!!!!

      // Insert the new data
      db.insert(newData, (err, newDocs) => {
        if (err) return handleServerError(err, res);
        res.status(200).json('Data loaded successfully');
      });
    }

    // if there is data return conflict
    else {
      res.status(409).json('Data already loaded');
    }
  });
});

// Returns the data stored in memory for the route
router.get('/protests', (req, res) => {
  db.find({}, (err, data) => {
    if (err) return handleServerError(err, res);
    const mappedData = removeIdField(data);
    res.status(200).json(mappedData);
  });
});

// Creates a new entry in the data stored in memory for the route
router.post('/protests', (req, res) => {
  const newData = req.body;

  // Verify that all required fields are present
  const missingFields = requiredFields.filter(field => !(field in newData));

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Faltan campos obligatorios",
      missing: missingFields
    });
  }


  // Verify that there are no extra fields
  if (Object.keys(newData).length !== requiredFields.length) {
    return res.status(400).json({
      error: "Missing or extra fields in request body",
      expected: requiredFields,
      received: Object.keys(newData)
    });
  }


  // Verify that the ID is unique
  db.findOne({ id: newData.id }, (err, doc) => {
    if (err) return handleServerError(err, res);
    if (doc) {
      return res.status(409).json({
        error: "ID already exists"
      });
    }

    // Add if no errors
    db.insert(newData, (err, _) => {
      if (err) return handleServerError(err, res);
      res.status(201).json(newData);
    });
  });

});


// Method not allowed for the route, since we don't want to update all the data at once
router.put('/protests', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Deletes all the data stored in memory for the route
router.delete('/protests', (req, res) => {
  db.remove({}, { multi: true }, (err, _) => {
    if (err) return handleServerError(err, res);
    res.status(204).send();
  });
});


/*
==============================================================

METHODS FOR RESOURCES

==============================================================
*/

// Returns the data stored in memory for a specific protest
router.get('/protests/:id', (req, res) => {
  const id = Number(req.params.id);

  // Validate that the ID is a number
  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID must be a number' });
  }

  // Find the protest with the specified ID and return it
  db.findOne({ id: id }, (err, data) => {
    if (err) return handleServerError(err, res);

    // If the protest exists, return it; otherwise, return a 404 error
    if (data) {
      const mappedData = removeIdField([data])[0];
      res.status(200).json(mappedData);
    } else {
      res.status(404).send('Data not found for protest ID: ' + id);
    }
  });
});

// Method not allowed for the route
router.post('/protests/:countryID', (req, res) => {
  res.status(405).send('Method not allowed');
});

// Updates the data stored in memory for a specific country
router.put('/protests/:protestID', (req, res) => {
  const protestID = Number(req.params.protestID);

  // Check NaN
  if (isNaN(protestID)) {
    return res.status(400).json({ error: 'ID must be a number' });
  }

  // Body ID must match URL ID
  if (req.body.id !== protestID) {
    return res.status(400).send('ID in body must match ID in URL');
  }

  // Verify fields
  const missingFields = requiredFields.filter(field => !(field in req.body));

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: "Missing required fields in request body",
      missing: missingFields
    });
  }

  if (Object.keys(req.body).length !== requiredFields.length) {
    return res.status(400).json({
      error: "Missing or extra fields in request body",
      expected: requiredFields,
      received: Object.keys(req.body)
    });
  }

  db.update({ id: protestID }, req.body, {}, (err, numReplaced) => {
    if (err) return handleServerError(err, res);
    if (numReplaced === 0) {
      return res.status(404).json({ error: 'Data not found for protest ID: ' + protestID });
    }

    res.status(200).json(req.body);
  });
});

// Deletes the data stored in memory for a specific country
router.delete('/protests/:protestID', (req, res) => {
  const protestID = Number(req.params.protestID);
  // Check NaN
  if (isNaN(protestID)) {
    return res.status(400).json({ error: 'ID must be a number' });
  }

  // Remove the protest with the specified ID
  db.remove({ id: protestID }, (err, numRemoved) => {
    if (err) return handleServerError(err, res);
    if (numRemoved === 0) {
      return res.status(404).json({ error: 'Data not found for protest ID: ' + protestID });
    }
    else {
      res.status(204).send();
    }

  });
})

export default router;
import express from "express";
import NeDB from "nedb";
import { readFile } from "../../utils/readFile.js"; // if you have a CSV with initial data

const router = express.Router();
const db = new NeDB({ filename: "./data/storage/child-malnutritions-v2.db", autoload: true });

const DOCUMENTATION_URL = "https://documenter.getpostman.com/view/your-doc-id"; // replace with your documentation URL
router.get("/child-malnutritions/docs", (req, res) => {
  res.redirect(DOCUMENTATION_URL);
});

// Required fields for each record
const requiredFields = [
  "country", "year", "stunting_rate", "wasting_rate", "underweight_rate", "population"
];

// Helper function for server errors
const handleServerError = (err, res) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
};

// Remove _id field from DB documents before sending response
const removeIdField = (data) => {
  return data.map(({ _id, ...rest }) => rest);
};

/* ===========================================
   COLLECTION METHODS
=========================================== */

// Load initial data from CSV if DB is empty
router.get("/child-malnutritions/loadInitialData", (req, res) => {
  db.find({}, (err, data) => {
    if (err) return handleServerError(err, res);

    if (data.length === 0) {
      const initialData = readFile("child-malnutritions.csv"); // CSV with initial data
      db.insert(initialData, (err, newDocs) => {
        if (err) return handleServerError(err, res);
        res.status(201).json("Data loaded successfully");
      });
    } else {
      res.status(200).json("Data already loaded");
    }
  });
});

// GET all records with optional filters, offset and limit
router.get("/child-malnutritions", (req, res) => {
  const query = {};
  const offset = parseInt(req.query.offset) || 0;
  const limit = parseInt(req.query.limit) || 0;

  const country = req.query.country;
  const year = req.query.year;
  if (country) query.country = new RegExp(country, "i");
  if (year) query.year = parseInt(year);

  db.find(query).skip(offset).limit(limit).exec((err, data) => {
    if (err) return handleServerError(err, res);
    if (data.length === 0) return res.status(404).send("Data not found");
    res.status(200).json(removeIdField(data));
  });
});

// POST a new record
router.post("/child-malnutritions", (req, res) => {
  const newData = req.body;

  // Check for required fields
  const missingFields = requiredFields.filter(f => !(f in newData));
  if (missingFields.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing: missingFields });
  }

  // Check for extra fields
  if (Object.keys(newData).length !== requiredFields.length) {
    return res.status(400).json({ error: "Extra fields in request body", expected: requiredFields, received: Object.keys(newData) });
  }

  // Check uniqueness by country + year
  db.findOne({ country: newData.country, year: newData.year }, (err, doc) => {
    if (err) return handleServerError(err, res);
    if (doc) return res.status(409).json({ error: "Record already exists" });

    db.insert(newData, (err, newDoc) => {
      if (err) return handleServerError(err, res);
      res.status(201).json(removeIdField([newDoc])[0]);
    });
  });
});

// PUT is not allowed on the collection
router.put("/child-malnutritions", (req, res) => {
  res.status(405).send("Method not allowed");
});

// DELETE all records
router.delete("/child-malnutritions", (req, res) => {
  db.remove({}, { multi: true }, (err, _) => {
    if (err) return handleServerError(err, res);
    res.status(204).send();
  });
});

/* ===========================================
   RESOURCE METHODS (single record)
=========================================== */

// GET a specific record by country + year
router.get("/child-malnutritions/:country/:year", (req, res) => {
  const { country, year } = req.params;
  const numericYear = parseInt(year);

  if (isNaN(numericYear)) return res.status(400).json({ error: "Year must be a number" });

  db.findOne({ country: country, year: numericYear }, (err, doc) => {
    if (err) return handleServerError(err, res);
    if (!doc) return res.status(404).json({ error: "Data not found" });
    res.status(200).json(removeIdField([doc])[0]);
  });
});

// POST is not allowed on a single record
router.post("/child-malnutritions/:country/:year", (req, res) => {
  res.status(405).send("Method not allowed");
});

// PUT to update a specific record
router.put("/child-malnutritions/:country/:year", (req, res) => {
  const { country, year } = req.params;
  const numericYear = parseInt(year);

  if (isNaN(numericYear)) return res.status(400).json({ error: "Year must be a number" });
  if (req.body.country !== country || req.body.year !== numericYear) return res.status(400).json({ error: "Country/Year in body must match URL" });

  // Check required fields
  const missingFields = requiredFields.filter(f => !(f in req.body));
  if (missingFields.length > 0) return res.status(400).json({ error: "Missing required fields", missing: missingFields });

  if (Object.keys(req.body).length !== requiredFields.length) return res.status(400).json({ error: "Extra fields in request body" });

  db.update({ country: country, year: numericYear }, req.body, {}, (err, numReplaced) => {
    if (err) return handleServerError(err, res);
    if (numReplaced === 0) return res.status(404).json({ error: "Data not found" });
    res.status(200).json(req.body);
  });
});

// DELETE a specific record
router.delete("/child-malnutritions/:country/:year", (req, res) => {
  const { country, year } = req.params;
  const numericYear = parseInt(year);

  if (isNaN(numericYear)) return res.status(400).json({ error: "Year must be a number" });

  db.remove({ country: country, year: numericYear }, {}, (err, numRemoved) => {
    if (err) return handleServerError(err, res);
    if (numRemoved === 0) return res.status(404).json({ error: "Data not found" });
    res.status(204).send();
  });
});

export default router;